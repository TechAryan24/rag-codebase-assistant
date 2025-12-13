# session.py
from sqlmodel import create_engine, SQLModel, Session
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# ==========================================
# 1. SQLITE SETUP (Existing Logic Preserved)
# ==========================================

# This creates 'assistant.db' in the backend root folder
sqlite_file_name = "assistant.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url)

def init_db():
    SQLModel.metadata.create_all(engine)

# ==========================================
# 2. SUPABASE SETUP (New Addition)
# ==========================================

load_dotenv()  # Load variables from .env file

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully.")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
else:
    print("⚠️ Warning: SUPABASE_URL or SUPABASE_KEY not found in .env. Chat history features will be disabled.")