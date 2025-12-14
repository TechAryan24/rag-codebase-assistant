from fastapi import APIRouter, HTTPException, WebSocket
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import uuid
import asyncio
from starlette.websockets import WebSocketDisconnect  # <--- Added Import

# --- Core Logic Imports ---
from app.core.scanner import scan_directory
from app.core.parser import extract_functions
# Import both the blocking wrapper and the generator
from app.core.ingestion import ingest_codebase, ingest_codebase_generator
from app.core.rag import generate_rag_response

# --- Database Import ---
try:
    from app.db.session import supabase
except ImportError:
    supabase = None
    print("⚠️ Warning: Supabase client not found in app.db.session. Chat history will not be saved.")

router = APIRouter()

# ==========================================
# 1. SCANNING & INGESTION
# ==========================================

class ScanRequest(BaseModel):
    path: str

@router.post("/scan/preview")
def preview_scan(request: ScanRequest):
    """
    Returns a list of files that WOULD be ingested.
    """
    try:
        files = []
        for file_path in scan_directory(request.path):
            files.append(str(file_path))

        return {
            "root": request.path,
            "file_count": len(files),
            "files": files[:100]  # Limit to 100
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class ParseRequest(BaseModel):
    filename: str
    content: str

@router.post("/scan/test-parser")
def test_parser(request: ParseRequest):
    try:
        functions = extract_functions(request.content, request.filename)
        return {"found_functions": functions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ingest")
def start_ingestion(request: ScanRequest):
    """
    Triggers the ingestion process synchronously (Blocking).
    Used by the landing page or direct API calls.
    """
    try:
        print(f"🔄 API: Starting blocking ingestion for {request.path}")
        
        # --- BLOCKING CALL ---
        ingest_codebase(request.path) 
        
        print("✅ API: Ingestion finished successfully")
        return {
            "status": "success", 
            "message": "Ingestion complete", 
            "target": request.path
        }
    except Exception as e:
        print(f"❌ API: Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 2. NEW: WEBSOCKET STREAMING INGESTION
# ==========================================
@router.websocket("/ws/ingest")
async def websocket_ingest(websocket: WebSocket):
    """
    Real-time websocket connection for the terminal UI.
    """
    await websocket.accept()
    try:
        # 1. Wait for client to send the path
        data = await websocket.receive_json()
        path = data.get("path")
        
        if not path:
            await websocket.send_json({"status": "error", "message": "No path provided"})
            await websocket.close()
            return

        # 2. Run Ingestion Generator and stream updates
        for update in ingest_codebase_generator(path):
            await websocket.send_json(update)
            # Small sleep to allow the event loop to handle other requests
            await asyncio.sleep(0.01) 
            
    except WebSocketDisconnect:
        # Client disconnected normally, just stop processing
        print("ℹ️ Client disconnected from ingestion stream.")
    except Exception as e:
        print(f"WS Error: {e}")
        # Only try to send error if connection is arguably still open
        try:
            await websocket.send_json({"status": "error", "message": str(e)})
        except RuntimeError:
            # Connection already closed, ignore
            pass
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            # Already closed
            pass

# ==========================================
# 3. CHAT & HISTORY
# ==========================================

class ChatRequest(BaseModel):
    message: str
    filter_path: Optional[str] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None

@router.post("/chat")
def chat_with_codebase(request: ChatRequest):
    try:
        # 1. Generate RAG Response (Core Logic)
        result = generate_rag_response(
            question=request.message, 
            file_path_filter=request.filter_path
        )
        
        # 2. Extract answer text
        if isinstance(result, dict):
            answer_text = result.get("answer", str(result))
        else:
            answer_text = str(result)

        # 3. Database Persistence
        session_id = request.session_id
        
        if supabase and request.user_id:
            # A. Create new session if needed
            if not session_id:
                session_id = str(uuid.uuid4())
                title = (request.message[:40] + '..') if len(request.message) > 40 else request.message
                
                supabase.table("chat_sessions").insert({
                    "id": session_id,
                    "user_id": request.user_id,
                    "title": title
                }).execute()

            # B. Save User Message
            supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": "user",
                "content": request.message
            }).execute()

            # C. Save Assistant Response
            supabase.table("chat_messages").insert({
                "session_id": session_id,
                "role": "assistant",
                "content": answer_text
            }).execute()

        # 4. Return response
        if isinstance(result, dict):
            result["session_id"] = session_id
            return result
        else:
            return {"answer": result, "session_id": session_id}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
def get_chat_history(user_id: str):
    if not supabase:
        return []
        
    try:
        response = supabase.table("chat_sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/messages/{session_id}")
def get_chat_messages(session_id: str):
    if not supabase:
        return []
        
    try:
        response = supabase.table("chat_messages")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=False)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 4. FILE SYSTEM
# ==========================================

# Ensure this matches the directory used in your ingestion.py
TEMP_REPO_DIR = os.path.join(os.getcwd(), "temp_cloned_repo")

@router.get("/files")
def get_file_structure(path: str):
    # ---------------------------------------------------------
    # 1. HANDLE GITHUB URLS
    # If the path is a URL, we look into the temp directory
    # where the repo was cloned, instead of looking for the URL on disk.
    # ---------------------------------------------------------
    if path.startswith("http") or path.startswith("git@"):
        target_path = TEMP_REPO_DIR
    else:
        target_path = path

    # 2. Check if the target path actually exists
    if not os.path.exists(target_path):
         return []

    # 3. Recursive function to build the tree
    def build_tree(dir_path):
        tree = []
        try:
            # Sort items to keep folders and files organized
            items = sorted(os.listdir(dir_path))
            for item in items:
                # Skip hidden files and standard ignore folders
                if item.startswith('.') or item in ["__pycache__", "node_modules", "venv", ".git"]:
                    continue
                    
                full_path = os.path.join(dir_path, item)
                is_dir = os.path.isdir(full_path)
                
                node = {
                    "name": item,
                    "type": "folder" if is_dir else "file",
                    # We send the full server path so the frontend can request file content later
                    "path": full_path 
                }
                
                if is_dir:
                    node["children"] = build_tree(full_path)
                    
                tree.append(node)
        except PermissionError:
            # Skip folders we don't have permission to access
            pass
        except Exception as e:
            print(f"Error scanning directory {dir_path}: {e}")
            
        return tree

    return build_tree(target_path)