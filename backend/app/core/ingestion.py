import os
import shutil
import git
from datetime import datetime
from sqlmodel import Session, delete, SQLModel
from app.core.scanner import scan_directory
from app.core.parser import extract_functions
from app.core.embedder import embedder
from app.core.vector_store import vector_db
from app.db.session import engine
from app.db.models import Chunk
import numpy as np

TEMP_REPO_DIR = os.path.join(os.getcwd(), "temp_cloned_repo")

# ----------------------------
# 1. GIT HISTORY PROCESSING
# ----------------------------
def process_git_history(repo_path: str, start_id: int, limit: int = 50):
    # This logic remains largely the same, but we won't yield specific commits 
    # to the UI to keep the UI clean, or we could add a yield here if desired.
    # For now, we'll keep it silent/internal.
    print("⏳ Processing Git Commit History...")
    current_id = start_id
    
    try:
        repo = git.Repo(repo_path)
    except git.exc.InvalidGitRepositoryError:
        print("⚠ Not a valid git repository. Skipping history.")
        return current_id

    vectors_buffer = []
    chunks_buffer = []
    metadata_buffer = []
    
    for commit in repo.iter_commits(max_count=limit):
        try:
            commit_date = datetime.fromtimestamp(commit.committed_date).strftime('%Y-%m-%d')
            content_text = f"COMMIT: {commit.hexsha}\nMSG: {commit.message.strip()}"

            vector = embedder.embed_text(content_text)
            vectors_buffer.append(vector)
            
            meta = {
                "file_name": "GIT_LOG",
                "chunk_type": "commit",
                "content": content_text[:1000]
            }
            metadata_buffer.append(meta)

            chunk = Chunk(
                id=current_id,
                chunk_hash=str(hash(content_text)),
                chunk_type="commit",
                file_name="GIT_HISTORY",
                file_path="GIT_LOG",
                content=content_text
            )
            chunks_buffer.append(chunk)
            current_id += 1
            
        except Exception:
            continue

    if vectors_buffer:
        _flush_buffers(vectors_buffer, chunks_buffer, metadata_buffer)
        print(f"✅ Ingested {len(chunks_buffer)} git commits.")

    return current_id

# ----------------------------
# CHUNK FALLBACK
# ----------------------------
def chunk_fallback(text: str, max_chars: int = 800):
    chunks = []
    start = 0
    length = len(text)
    while start < length:
        end = min(start + max_chars, length)
        chunks.append(text[start:end])
        start = end
    return chunks

# ----------------------------
# MAIN INGESTION (GENERATOR)
# ----------------------------
def ingest_codebase_generator(input_path: str):
    """
    Generator function that yields status updates during ingestion.
    """
    target_path = input_path

    # 1. Clone Logic
    if input_path.startswith("http") or input_path.startswith("git@"):
        yield {"status": "cloning", "message": "Cloning repository..."}
        if os.path.exists(TEMP_REPO_DIR):
            def on_rm_error(func, path, exc_info):
                os.chmod(path, 0o777)
                func(path)
            shutil.rmtree(TEMP_REPO_DIR, onerror=on_rm_error)
        try:
            git.Repo.clone_from(input_path, TEMP_REPO_DIR)
            target_path = TEMP_REPO_DIR
        except Exception as e:
            yield {"status": "error", "message": f"Clone Failed: {e}"}
            return

    if not os.path.exists(target_path):
        yield {"status": "error", "message": "Path does not exist"}
        return

    yield {"status": "scanning", "message": f"Scanning files in {target_path}..."}
    
    # Database Prep
    SQLModel.metadata.create_all(engine)
    vector_db.reset()
    with Session(engine) as session:
        session.exec(delete(Chunk))
        session.commit()

    global_id_counter = 0
    
    # Process Git
    yield {"status": "processing_git", "message": "Indexing Git History..."}
    global_id_counter = process_git_history(target_path, start_id=global_id_counter)

    processed_count = 0
    vectors_buffer = []
    chunks_buffer = []
    metadata_buffer = []

    # Get total file count for progress bar
    all_files = list(scan_directory(target_path))
    total_files = len(all_files)
    
    yield {"status": "info", "total_files": total_files, "message": f"Found {total_files} files to process"}

    for i, file_path in enumerate(all_files):
        try:
            file_name = os.path.basename(file_path)
            
            # Yield update to frontend
            yield {
                "status": "processing_file", 
                "file": file_name, 
                "progress": int((i / total_files) * 100)
            }

            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            display_path = str(file_path).replace(TEMP_REPO_DIR, "") if target_path == TEMP_REPO_DIR else str(file_path)
            functions = extract_functions(content, str(file_path))

            def add_chunk(text, start_line=None, end_line=None):
                nonlocal global_id_counter
                vector = embedder.embed_text(text)
                vectors_buffer.append(vector)
                
                meta = {
                    "file_name": os.path.basename(file_path),
                    "file_path": display_path,
                    "chunk_type": "code",
                    "start_line": str(start_line) if start_line else "",
                    "content": text[:1000]
                }
                metadata_buffer.append(meta)
                
                chunk = Chunk(
                    id=global_id_counter,
                    chunk_hash=str(hash(text)),
                    chunk_type="code",
                    file_name=os.path.basename(file_path),
                    file_path=display_path,
                    start_line=start_line,
                    end_line=end_line,
                    content=text
                )
                chunks_buffer.append(chunk)
                global_id_counter += 1

            if not functions:
                for chunk_text in chunk_fallback(content):
                    add_chunk(chunk_text)
            else:
                for func in functions:
                    add_chunk(func["code"], func["start_line"], func["end_line"])

            processed_count += 1

            if len(vectors_buffer) > 0 and processed_count % 10 == 0:
                _flush_buffers(vectors_buffer, chunks_buffer, metadata_buffer)
                vectors_buffer = []
                chunks_buffer = []
                metadata_buffer = []

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")

    if vectors_buffer:
        _flush_buffers(vectors_buffer, chunks_buffer, metadata_buffer)

    # ✅ PRINT FINAL FILE COUNT HERE
    print(f"✅ Total files processed: {processed_count}")

    yield {"status": "complete", "message": "Ingestion Complete!", "progress": 100}


# ----------------------------
# WRAPPER FOR BACKWARD COMPATIBILITY
# ----------------------------
def ingest_codebase(input_path: str):
    """
    Consumes the generator purely for blocking calls (old API support).
    """
    for update in ingest_codebase_generator(input_path):
        print(f"INTERNAL LOG: {update}")

def _flush_buffers(vectors, chunks, metadatas):
    if not vectors:
        return
    vector_batch = np.vstack(vectors)
    vector_db.add_vectors(vector_batch, metadatas) 
    vector_db.save()
    with Session(engine) as session:
        for chunk in chunks:
            session.add(chunk)
        session.commit()