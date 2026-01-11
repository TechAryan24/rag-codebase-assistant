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
* **LLM Integration:** Powered by **Google Gemini 2.5 Flash** for high-speed, cost-effective code reasoning.

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

###🖥️ Application Screenshots

* **Visual overview of CodeMind AI user experience**

##🏠 Homepage
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/af26d866-5f8d-410b-8e9d-15f1f1b3346d" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/a2fbcfe8-6b34-4fc3-bc65-a9304b29961f" />

##🔐 Sign Up
![Image](https://github.com/user-attachments/assets/54d1b48e-109f-482d-b994-29d43ea55d1a)

##🔑 Sign In
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/4fa67ae9-4689-47c3-990c-d87f9aeeec4e" />

##📂 Repository Ingestion
![Image](https://github.com/user-attachments/assets/d9cec5e4-62cd-4803-9e79-10fc6629c692)
![Image](https://github.com/user-attachments/assets/0703f128-0988-47ff-9cf4-ac6672fedd7b)

##💬 Chat Interface
![Image](https://github.com/user-attachments/assets/42a244f9-e3ae-4275-9ec0-802944da93d1)


### 1. Clone the Repository
```bash
git clone [https://github.com/TechAryan24/rag-codebase-assistant.git](https://github.com/TechAryan24/rag-codebase-assistant.git)
cd rag-codebase-assistant
