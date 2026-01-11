<div align="center">

  # 🧠 CodeMind AI
  
  **Chat with your Codebase. Understand Logic. Track Evolution.**

  [![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=git)](https://github.com/yourusername/codemind-ai)
  [![Stack](https://img.shields.io/badge/Stack-FastAPI_|_React_|_Pinecone-blue?style=for-the-badge&logo=python)](https://fastapi.tiangolo.com/)
  

  <p align="center">
    <b>CodeMind AI</b> goes beyond simple text search. It uses <b>AST parsing</b>, <b>Git history analysis</b>, and <b>Dependency Graphing</b> to create a developer assistant that truly understands the structure and history of your software.
  </p>

  [Features](#-key-features) • [Tech Stack](#-tech-stack) • [Screenshots](#-application-screenshots) • [Getting Started](#-getting-started)

</div>

---

## 📸 Application Screenshots

### 🏠 Homepage
<p align="center">
  <img src="https://github.com/user-attachments/assets/af26d866-5f8d-410b-8e9d-15f1f1b3346d" alt="Homepage 1" width="45%"/>
  <img src="https://github.com/user-attachments/assets/4fb3b5db-37a2-4f07-a4c1-7cb0fb0bf27d" alt="Homepage 2" width="45%"/>
</p>

### 🔐 Authentication
<p align="center">
  <img src="https://github.com/user-attachments/assets/e9416f39-052c-464f-a747-191e6db54b65" alt="Sign Up" width="45%"/>
  <img src="https://github.com/user-attachments/assets/49fe04bb-919a-4819-863a-17d9a8b6b3d5" alt="Sign In" width="45%"/>
</p>

### 📂 Ingestion & Chat
<p align="center">
  <img src="https://github.com/user-attachments/assets/7712129c-ca04-4421-a4d6-d470cad4ca09" alt="Repository Ingestion" width="45%"/>
  <img src="https://github.com/user-attachments/assets/a983d7a5-a108-4d7d-b04b-328e2efbe94b" alt="Chat Interface" width="45%"/>
</p>

---

## ✨ Key Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| **🔍 Ingestion** | **AST Parsing** | Uses `tree-sitter` to parse code by logical blocks (functions/classes) rather than arbitrary text chunks. |
| | **Git Integration** | Ingests commit history to answer questions like *"Who changed the auth logic?"* or *"Why was this added?"*. |
| | **Universal Chunking** | Smart fallback strategies for JS, TS, React, and other languages to preserve context. |
| **🧠 Reasoning** | **Context Expansion** | Automatically detects imports (e.g., `import { api }...`) and fetches dependency files for full context. |
| | **Hybrid Search** | Combines Vector Search (Pinecone) with Cross-Encoder Re-Ranking (**FlashRank**) for precision. |
| **💻 Experience** | **Live Feedback** | WebSocket-powered terminal UI shows real-time ingestion logs. |
| | **Modern UI** | Interactive interface built with React, Vite, Tailwind, and Syntax Highlighting. |

---

## 🛠️ Tech Stack

<div align="center">

| **Backend (Python)** | **Frontend (TypeScript)** | **AI & Data** |
| :--- | :--- | :--- |
| ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | ![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=googlebard&logoColor=white) |
| **GitPython** (History) | **Vite** (Build Tool) | **Pinecone** (Vector DB) |
| **Tree-Sitter** (Parsing) | **Zustand** (State) | **FastEmbed** (Embeddings) |
| **Supabase** (Postgres) | **TailwindCSS** (Styling) | **FlashRank** (Re-Ranking) |

</div>

---

## 🚀 Getting Started

Follow these steps to set up CodeMind AI locally.

### Prerequisites
* Python 3.10+
* Node.js 18+
* Git

### 📥 1. Clone Repository
```bash
git clone [https://github.com/TechAryan24/rag-codebase-assistant.git](https://github.com/TechAryan24/rag-codebase-assistant.git)
cd rag-codebase-assistant
