from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.db.session import init_db  # <--- Import the DB init function

app = FastAPI(title="Codebase Assistant API")

# --- CORS IS CRITICAL FOR LINKING FRONTEND & BACKEND ---
origins = [
    "http://localhost:5173",  # Vite Localhost
    "http://127.0.0.1:5173",  # IP variation
    "http://localhost:3000",  # React default (just in case)
    "https://codemind-lovat.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow POST, GET, OPTIONS
    allow_headers=["*"],
)
# -------------------------------------------------------

# 🔥 CRITICAL: Initialize Database on Startup
@app.on_event("startup")
def on_startup():
    init_db()

# Include the router containing all your endpoints (Chat, Ingest, WebSocket)
app.include_router(endpoints.router)

@app.get("/")
def read_root():
    return {"status": "online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)