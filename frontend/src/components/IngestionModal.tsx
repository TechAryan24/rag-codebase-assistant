import { useState, useRef } from "react";
import { X, Terminal, CheckCircle2, ArrowRight } from "lucide-react";
import { useChatStore } from "../store/chatStore";

interface LogEntry {
  file: string;
  status: "pending" | "processing" | "done";
}

const IngestionModal = () => {
  const { closeIngestionModal, addMessage } = useChatStore();
  const [path, setPath] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Terminal State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStatus, setCurrentStatus] = useState("Ready to process");
  const [progress, setProgress] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);

  const startIngestion = () => {
    if (!path.trim()) return;
    setIsProcessing(true);
    setLogs([]);
    setProgress(0);

    // 🔥 FIX: Dynamic WebSocket URL generation
    // 1. Get the HTTP URL from environment (or default to localhost)
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    
    // 2. Convert 'http' -> 'ws' and 'https' -> 'wss'
    const wsUrl = apiUrl.replace(/^http/, "ws");
    
    // 3. Connect using the correct URL
    console.log(`🔌 Connecting to WebSocket: ${wsUrl}/ws/ingest`);
    const ws = new WebSocket(`${wsUrl}/ws/ingest`);
    
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Connected!");
      ws.send(JSON.stringify({ path }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "info") {
        setCurrentStatus(data.message);
      } else if (data.status === "scanning") {
        setCurrentStatus("Initializing repository scanner...");
      } else if (data.status === "processing_file") {
        // Add file to log
        setLogs((prev) => {
          const newEntry: LogEntry = { file: data.file, status: "done" };
          const newLogs = [...prev, newEntry];

          // Keep only last 8 items to prevent overflow visual clutter
          return newLogs.slice(-8);
        });
        setProgress(data.progress);
        setCurrentStatus(`Processing ${data.file}...`);
      } else if (data.status === "complete") {
        setIsComplete(true);
        setProgress(100);
        setCurrentStatus("Repository indexed successfully!");
        localStorage.setItem("repoPath", path);

        addMessage({
          role: "assistant",
          content: `✅ **Ingestion Successful!**\n\nI have finished scanning \`${path}\`. You can now ask questions about this codebase.`,
        });
      } else if (data.status === "error") {
        setCurrentStatus(`Error: ${data.message}`);
        ws.close();
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
      setCurrentStatus("Connection Error: Could not reach server.");
    };
    
    ws.onclose = () => {
        console.log("🔌 WebSocket Disconnected");
    };
  };

  const handleClose = () => {
    if (socketRef.current) socketRef.current.close();
    closeIngestionModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0F1117] rounded-xl shadow-2xl border border-gray-800 overflow-hidden font-mono text-sm">
        {/* Terminal Header */}
        <div className="bg-[#1a1b26] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-gray-400 flex items-center gap-2">
              <Terminal size={14} />
              {isProcessing ? "Processing Repository" : "New Session"}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[300px] flex flex-col relative">
          {!isProcessing ? (
            // 1. INPUT STATE
            <div className="flex flex-col justify-center items-center flex-1 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-white">
                  Ingest Codebase
                </h3>
                <p className="text-gray-400">
                  Enter the local path to your repository
                </p>
              </div>

              <div className="w-full max-w-md space-y-4">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/Users/dev/project"
                  className="w-full bg-[#1a1b26] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                />
                <button
                  onClick={startIngestion}
                  disabled={!path.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Start Indexing <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            // 2. PROCESSING STATE
            <div className="flex-1 flex flex-col">
              <div className="text-blue-400 mb-4 font-bold flex items-center gap-2">
                <span>$ codebase-ai index {path.split(/[/\\]/).pop()}</span>
              </div>

              {/* Status Message */}
              <div className="text-gray-400 mb-4 flex items-center gap-2">
                {!isComplete && <span className="animate-pulse">→</span>}
                <span>{currentStatus}</span>
              </div>

              {/* Logs List */}
              <div className="flex-1 space-y-2 mb-6 overflow-hidden">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-gray-300 animate-in fade-in slide-in-from-left-4 duration-300"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-green-500 shrink-0"
                    />
                    <span className="opacity-90">{log.file}</span>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-auto space-y-3">
                <div className="flex justify-between text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <span>Processing complete!</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Success Action */}
              {isComplete && (
                <div className="mt-6 flex justify-end animate-in fade-in slide-in-from-bottom-4">
                  <button
                    onClick={handleClose}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngestionModal;