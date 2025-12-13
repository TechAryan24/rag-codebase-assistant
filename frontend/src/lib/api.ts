// src/lib/api.ts
// const API_URL = 'http://localhost:8000'; 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  // 1. Health Check
  checkHealth: async () => {
    const res = await fetch(`${API_URL}/`);
    return res.json();
  },

  // 2. Chat with RAG (Updated for History)
  chat: async (
    message: string, 
    filterPath?: string | null, 
    sessionId?: string | null, 
    userId?: string
  ) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        filter_path: filterPath,
        session_id: sessionId,
        user_id: userId
      }),
    });
    return res.json();
  },

  // 3. Trigger Ingestion (Waits for backend)
  ingest: async (path: string) => {
    const res = await fetch(`${API_URL}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    
    if (!res.ok) {
        throw new Error("Ingestion failed on backend");
    }
    return res.json();
  },

  // 4. Get File Tree
  getFiles: async (path: string) => {
    const res = await fetch(`${API_URL}/files?path=${encodeURIComponent(path)}`);
    return res.json();
  },

  // 5. Get Chat History (Sidebar List)
  getHistory: async (userId: string) => {
    const res = await fetch(`${API_URL}/history/${userId}`);
    return res.json();
  },

  // 6. Get Messages for a Specific Session
  getSessionMessages: async (sessionId: string) => {
    const res = await fetch(`${API_URL}/history/messages/${sessionId}`);
    return res.json();
  }
};