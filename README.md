# 🧠 CodeMind AI

**CodeMind AI** is an intelligent, RAG-powered developer assistant that transforms your codebase into an interactive knowledge base.

Unlike generic RAG tools that treat code as plain text, CodeMind leverages **AST (Abstract Syntax Tree) parsing**, **Git history analysis**, and **Dependency Graphing** to deeply understand the logic, structure, and evolution of your software.

![Project Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20|%20React%20|%20Pinecone%20|%20Gemini-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

---

## ✨ Key Features

### 🔍 **Smart Ingestion Engine**
* **AST-Based Parsing:** Uses `tree-sitter` to parse Python files by function/class definitions, ensuring the AI reads logical blocks of code rather than arbitrary text chunks.
* **Universal Chunking:** Robust fallback mechanisms for JavaScript, TypeScript, React, and other file types to maintain context.
* **Git History Integration:** Ingests commit logs to answer questions like *"Who changed the auth logic last?"* or *"Why was this variable added?"*.
* **Real-Time Feedback:** WebSocket-powered terminal UI shows live ingestion progress.

### 🧠 **Advanced Reasoning & Retrieval**
* **Context Expansion:** Automatically detects imports in retrieved code (e.g., `import { api } from '../lib/api'`) and fetches the relevant dependency files to provide the LLM with full context.
* **Hybrid Search & Re-Ranking:** Combines vector search (Pinecone) with a Cross-Encoder Re-Ranker (**FlashRank**) to surface the most relevant code snippets.
* **LLM Integration:** Powered by **Google Gemini 1.5 Flash** for high-speed, cost-effective code reasoning.

### 💻 **Modern Developer Experience**
* **Interactive Chat UI:** Built with React, Vite, and Tailwind CSS.
* **File Explorer:** Navigate your ingested repository structure directly in the sidebar.
* **Persistent History:** Chat sessions and history are saved via **Supabase**.
* **Syntax Highlighting:** Beautiful code rendering with PrismJS.

---

## 🛠️ Tech Stack

### **Backend**
* **Framework:** FastAPI (Python)
* **Database:** Supabase (PostgreSQL), SQLite (Local fallback)
* **Vector Store:** Pinecone (Serverless)
* **LLM:** Google Gemini
* **ML/RAG:** FastEmbed, FlashRank, Tree-Sitter, GitPython

### **Frontend**
* **Framework:** React + Vite
* **Styling:** Tailwind CSS, Lucide Icons
* **State Management:** Zustand
* **Routing:** React Router DOM

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+
* Git
* API Keys for: **Google Gemini**, **Pinecone**, and **Supabase**.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/codemind-ai.git](https://github.com/yourusername/codemind-ai.git)
cd codemind-ai