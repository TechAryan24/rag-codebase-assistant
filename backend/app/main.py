from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.db.session import init_db  # <--- Import the DB init function

app = FastAPI(title="Codebase Assistant API")

# --- CORS IS CRITICAL FOR LINKING FRONTEND & BACKEND ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://codemind-lovat.vercel.app",
    "https://codemind-f5wyhklv7-aryanbhekare05-gmailcoms-projects.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
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