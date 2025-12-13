import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Bot, User, Sparkles, FileCode } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useChatStore } from "../store/chatStore";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const ChatInterface = () => {
  const [input, setInput] = useState("");

  const { 
    messages, 
    addMessage, 
    isLoading, 
    setLoading, 
    setContexts, 
    sendMessage,
    currentSessionId 
  } = useChatStore();

  const { session } = useAuth();
  const userId = session?.user?.id;

  const bottomRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Auto-scroll logic
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial Ingestion Logic
  useEffect(() => {
    const initRepo = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      const repoPath = localStorage.getItem("repoPath");
      if (repoPath && messages.length === 0) {
           addMessage({
             role: "assistant",
             content: `🚀 **Processing Repository...**\n\nI am analyzing the files in \`${repoPath}\`. This will take a moment.`,
           });
           setLoading(true);
           try {
             await api.ingest(repoPath);
             addMessage({
               role: "assistant",
               content: `✅ **Ingestion Complete**\n\nI have processed the codebase. You can now ask questions.`,
             });
           } catch (error) {
             addMessage({
               role: "assistant",
               content: `❌ **Ingestion Failed**\nMake sure the backend is running and the path is correct.`,
             });
           } finally {
             setLoading(false);
           }
      }
    };
    initRepo();
  }, [addMessage, setLoading, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!userId) return console.error("Missing userId");

    const text = input;
    setInput("");
    await sendMessage(text, userId, currentSessionId);
  };

  // Deduplicate sources helper
  const getUniqueSources = (context: any[] = [], sources: string[] = []) => {
    const map = new Map();
    context?.forEach((item) => {
      if (!map.has(item.file)) map.set(item.file, item);
    });
    sources?.forEach((s) => {
      if (!map.has(s)) map.set(s, { file: s, lines: null });
    });
    return Array.from(map.values());
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#111] transition-colors duration-300">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">

        {/* Empty State */}
        {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
                <Bot className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-zinc-400">
                    How can I help with your code?
                </h3>
            </div>
        )}

        {/* Message Mapping */}
        {messages.map((msg, idx) => {
          const uniqueSources = getUniqueSources(msg.context, msg.sources);

          return (
            <div
              key={idx}
              className={`flex gap-4 ${
                msg.role === "assistant" ? "" : "flex-row-reverse"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                  ${
                    msg.role === "assistant"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                      : "bg-gray-800 text-white dark:bg-zinc-700"
                  }`}
              >
                {msg.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Content Wrapper */}
              <div className={`flex flex-col max-w-[85%] gap-2`}>
                
                {/* 1. TEXT BUBBLE (NOW FIRST) */}
                <div
                  className={`rounded-xl p-4 shadow-sm transition-colors duration-200
                    ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-transparent text-gray-900 dark:text-zinc-100"
                    }
                  `}
                >
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <div className="rounded-md overflow-hidden my-3 border border-gray-200 dark:border-zinc-700">
                            <div className="bg-gray-100 dark:bg-zinc-900 px-3 py-1 text-xs text-gray-600 dark:text-zinc-500 border-b border-gray-200 dark:border-zinc-800 flex justify-between">
                              <span>{match[1]}</span>
                              <span>Copy</span>
                            </div>
                            <SyntaxHighlighter
                              {...props}
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, background: "#1e1e1e" }}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code
                            {...props}
                            className="bg-gray-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-300"
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* 2. SOURCES / CONTEXT (NOW BELOW TEXT) */}
                {msg.role === "assistant" && uniqueSources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {uniqueSources.map((item: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setContexts([item])}
                        className="flex items-center gap-2 px-3 py-1.5
                          bg-gray-100 dark:bg-[#1e1e1e] 
                          border border-gray-300 dark:border-zinc-700
                          rounded-md text-xs font-mono text-gray-600 dark:text-gray-300
                          hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 
                          dark:hover:bg-blue-900/20 dark:hover:border-blue-500 dark:hover:text-blue-300
                          transition-all duration-200"
                      >
                        <FileCode className="w-3.5 h-3.5 opacity-70" />
                        <span>
                          {item.file.split(/[/\\]/).pop()} 
                          {item.lines && <span className="opacity-50 ml-1">:{item.lines}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex items-center gap-1 h-10">
              <div className="w-2 h-2 bg-gray-400 dark:bg-zinc-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-gray-400 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#111]">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask something about your codebase..."
            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 
              text-gray-900 dark:text-white rounded-xl pl-4 pr-24 py-4 
              focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-zinc-600 mt-2">
          AI may produce incorrect information.
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;