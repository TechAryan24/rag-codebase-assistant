import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ChatInterface from "./ChatInterface";
import ContextPanel from "./ContextPanel";
import IngestionModal from "./IngestionModal"; // 1. Import Modal
import { Menu } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useChatStore } from "../store/chatStore"; // 2. Import Store

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [fileTree, setFileTree] = useState([]);

  // 3. Get Modal State
  const { isIngestionModalOpen } = useChatStore();

  const { session } = useAuth();
  const userId = session?.user?.id || "";
  const userName =
    session?.user?.user_metadata?.full_name ||
    localStorage.getItem("userName") ||
    "User";

  // 4. Local state for repoPath to ensure UI updates immediately after ingestion
  const [repoPath, setRepoPath] = useState(
    localStorage.getItem("repoPath") || ""
  );

  useEffect(() => {
    // Re-read path from storage (Modal might have updated it)
    const currentPath = localStorage.getItem("repoPath") || "";
    setRepoPath(currentPath);

    if (currentPath) {
      api
        .getFiles(currentPath)
        .then((data) => setFileTree(data))
        .catch((err) => console.error("Failed to load files:", err));
    }
  }, [isIngestionModalOpen]); // 5. Reload when modal closes

  const repoName = repoPath
    ? repoPath.split(/[/\\]/).pop()
    : "No Repository Selected";

  return (
    // MAIN CONTAINER
    <div className="flex h-screen bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-300 relative">
      {/* LEFT SIDEBAR WRAPPER */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#111] relative`}
      >
        <Sidebar fileTree={fileTree} userName={userName} userId={userId} />
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TOP HEADER */}
        <div className="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center px-4 justify-between bg-white/80 dark:bg-[#111]/80 backdrop-blur transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="font-semibold text-blue-600 dark:text-primary">
              CodeMind AI
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>

            <span
              className="text-sm text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-[200px]"
              title={repoPath}
            >
              {repoName}
            </span>
          </div>

          <button
            onClick={() => setIsContextOpen(!isContextOpen)}
            className="text-xs font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            {isContextOpen ? "Hide Context" : "Show Context"}
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-hidden relative">
          <ChatInterface />
        </div>
      </div>

      {/* CONTEXT PANEL (RIGHT SIDEBAR) */}
      <div
        className={`${
          isContextOpen ? "w-80" : "w-0"
        } transition-all duration-300 border-l border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#111] overflow-hidden`}
      >
        <ContextPanel />
      </div>

      {/* 6. MODAL OVERLAY */}
      {isIngestionModalOpen && <IngestionModal />}
    </div>
  );
};

export default Dashboard;
