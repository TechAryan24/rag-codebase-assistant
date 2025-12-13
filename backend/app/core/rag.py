import re
from typing import List, Optional, Set
from flashrank import Ranker, RerankRequest
from sqlmodel import Session, select, col
from app.core.embedder import embedder
from app.core.vector_store import vector_db
from app.core.llm import llm_client
from app.db.session import engine
from app.db.models import Chunk
import math

# ---------------------------------------------------------
# HELPER: Context Expansion Logic (Feature 2)
# ---------------------------------------------------------
def _extract_imports(code_snippets: List[str]) -> Set[str]:
    """
    Scans code snippets for 'import X' or 'from X import Y'.
    Returns a set of likely filenames (e.g., 'embedder.py', 'utils.py').
    """
    potential_files = set()
    
    # Regex to catch:
    # 1. from app.core.embedder import...  -> captures 'embedder'
    # 2. import app.core.rag               -> captures 'rag'
    # 3. from .utils import...             -> captures 'utils'
    import_pattern = re.compile(r'(?:from|import)\s+(?:[\w\.]+\.)?(\w+)\b')

    for snippet in code_snippets:
        matches = import_pattern.findall(snippet)
        for match in matches:
            # Filter out standard libraries or common noise to save DB calls
            if match not in ["typing", "os", "sys", "json", "datetime", "re", "math", "react", "git", "numpy", "pandas"]:
                potential_files.add(f"{match}.py")
                potential_files.add(f"{match}.ts")
                potential_files.add(f"{match}.tsx")
                potential_files.add(f"{match}.js")   # <--- Added
                potential_files.add(f"{match}.jsx")
    
    return potential_files

# ---------------------------------------------------------
# EXISTING LOGIC
# ---------------------------------------------------------

# Sigmoid normalization for raw model scores
def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))

def normalize_score(raw_score: float) -> float:
    """
    Convert raw AI logits/scores into normalized 0-1 scale.
    """
    return sigmoid(raw_score)

# 1. Initialize Reranker
ranker = Ranker(model_name="ms-marco-MiniLM-L-12-v2", cache_dir="/opt")

def generate_rag_response(question: str, file_path_filter: Optional[str] = None) -> dict:
    # --- PHASE 1: Broad Retrieval (FAISS) ---
    query_vector = embedder.embed_text(question)

    # Get 50 candidates
    distances, indices = vector_db.search(query_vector, k=50)
    valid_indices = [int(idx) for idx in indices[0] if idx != -1]

    if not valid_indices:
        return {"answer": "I found no relevant code to analyze.", "context": []}

    # --- PHASE 2: Metadata Filtering ---
    with Session(engine) as session:
        statement = select(Chunk).where(Chunk.id.in_(valid_indices))
        if file_path_filter:
            statement = statement.where(col(Chunk.file_path).contains(file_path_filter))

        candidate_chunks = session.exec(statement).all()

    if not candidate_chunks:
        return {"answer": f"No code found matching filter: '{file_path_filter}'", "context": []}

    # --- PHASE 3: Re-Ranking ---
    passages = [
        {
            "id": c.id,
            "text": c.content,
            "meta": {
                "file_name": c.file_name,
                "file_path": c.file_path,
                "start_line": c.start_line,
                "end_line": c.end_line,
                "type": getattr(c, "chunk_type", "code") # Safe access
            },
        }
        for c in candidate_chunks
    ]

    rerank_request = RerankRequest(query=question, passages=passages)
    ranked_results = ranker.rerank(rerank_request)

    # Pick Top 5
    top_results = ranked_results[:5]

    # =========================================================
    # 🔥 FEATURE 2: MULTI-FILE REASONING (Context Expansion) 🔥
    # =========================================================
    # 1. Extract potential filenames from the top 5 chunks
    current_code_texts = [res["text"] for res in top_results]
    detected_files = _extract_imports(current_code_texts)
    
    # 2. Filter out files we already have in top_results
    existing_files = {res["meta"]["file_name"] for res in top_results}
    files_to_fetch = detected_files - existing_files

    expanded_context_items = []

    if files_to_fetch:
        # print(f"🔍 Multi-File Reasoning: Detected dependencies {files_to_fetch}. Fetching...")
        with Session(engine) as session:
            # Fetch up to 1 chunk per detected file (to keep context small but relevant)
            expansion_query = select(Chunk).where(
                col(Chunk.file_name).in_(files_to_fetch)
            )
            # Limit to avoid token overflow, e.g., max 3 extra files
            extra_chunks = session.exec(expansion_query).all()
            
            # Simple deduplication: take the first chunk found for each file
            seen_extras = set()
            for chunk in extra_chunks:
                if chunk.file_name not in seen_extras and len(expanded_context_items) < 3:
                    seen_extras.add(chunk.file_name)
                    
                    expanded_context_items.append({
                        "file": chunk.file_name,
                        "path": chunk.file_path,
                        "lines": "Dependency", # Mark as dependency
                        "score": "Linked",     # Mark as linked
                        "code": chunk.content
                    })
    # =========================================================

    # --- PHASE 4: Build Rich Context for Frontend ---
    context_data = []
    context_text_for_llm = ""

    # 4a. Add Primary Results (Includes Feature 1: Git Logic)
    for res in top_results:
        meta = res["meta"]
        raw_score = res["score"]
        normalized = normalize_score(raw_score)
        match_percent = f"{int(normalized * 100)}%"

        # Handle Line Numbers gracefully (Feature 1 Compatibility)
        if meta.get("start_line") is not None:
            lines_display = f"{meta['start_line']}-{meta['end_line']}"
            file_display = meta["file_name"]
        else:
            lines_display = "History"
            file_display = "GIT COMMIT"

        context_item = {
            "file": file_display,
            "path": meta["file_path"],
            "lines": lines_display,
            "score": match_percent,
            "code": res["text"],
        }
        context_data.append(context_item)

        context_text_for_llm += (
            f"\n--- Source: {file_display} (Lines {lines_display}) ---\n"
            f"{res['text']}\n"
        )

    # 4b. Add Expanded (Dependency) Results (Feature 2 Logic)
    if expanded_context_items:
        context_text_for_llm += "\n\n--- RELATED DEPENDENCIES DETECTED ---\n"
        for item in expanded_context_items:
            # Add to sidebar so user sees it too
            context_data.append(item) 
            
            # Add to LLM Prompt
            context_text_for_llm += (
                f"\n--- Dependency: {item['file']} ---\n"
                f"{item['code']}\n"
            )

    # --- PHASE 5: Generation ---
    answer = llm_client.generate_answer(context_text_for_llm, question)

    return {
        "answer": answer,
        "context": context_data,  # Sending rich data to frontend
    }