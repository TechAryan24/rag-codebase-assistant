from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class Chunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    chunk_hash: str = Field(index=True)
    
    # "code" for actual files, "commit" for git history
    chunk_type: str = Field(default="code") 
    
    file_name: str
    file_path: str
    
    # Make these optional because Commits don't have line numbers
    start_line: Optional[int] = Field(default=None) 
    end_line: Optional[int] = Field(default=None)
    
    content: str 
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- NEW MODELS FOR CHAT HISTORY ---

class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_sessions"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(foreign_key="chat_sessions.id", index=True)
    role: str # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)