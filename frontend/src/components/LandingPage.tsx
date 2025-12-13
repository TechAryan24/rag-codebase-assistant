import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UploadCloud,
  Search,
  GitBranch,
  Terminal,
  Loader2,
  AlertCircle,
  Sparkles,
  Code2,
  User,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// --- IMPORT YOUR LOGO ---
import logo from "../assets/logoai.png";

/**
 * FEATURE CARD COMPONENT
 */
interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const FeatureCard: React.FC<FeatureProps> = ({
  title,
  description,
  icon,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-zinc-900/80 transition-all group backdrop-blur-sm"
  >
    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-zinc-100 mb-2">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
  </motion.div>
);

/**
 * MAIN LANDING PAGE COMPONENT
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [repoPath, setRepoPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleIngest = async () => {
    if (!repoPath.trim()) {
      setError("Please enter a valid path or URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.ingest(repoPath);
      let effectivePath = repoPath;

      if (repoPath.startsWith("http") || repoPath.startsWith("git@")) {
        effectivePath = "temp_cloned_repo";
      }

      localStorage.setItem("repoPath", effectivePath);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        "Failed to connect to backend. Ensure the server is running on port 8000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleIngest();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col">
      {/* --- BACKGROUND PATTERN --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* --- UPDATED LOGO SECTION (NAVBAR) --- */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="CodeMind" 
              className="h-10 w-auto object-contain" 
            />
            {/* Added -ml-3 to pull text closer to the image */}
            <span className="text-xl font-bold tracking-tight text-white uppercase -ml-3">
              CODEMIND
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-mono text-zinc-500 px-2 py-1 bg-zinc-900 rounded border border-white/5">
              v2.0 Beta
            </span>

            <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

            {session ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-500/40">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
                  {session.user?.user_metadata?.username ||
                    session.user?.email?.split("@")[0]}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signin"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex-grow max-w-6xl mx-auto px-6 pt-24 pb-32 w-full">
        {/* HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8 shadow-inner shadow-indigo-500/10">
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Local Code Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.1]">
            Chat with your <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Codebase
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Transform your repository into an interactive knowledge base. Debug,
            refactor, and understand complex logic instantly.
          </p>
        </motion.div>

        {/* INPUT ACTION CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto mb-24 relative z-20"
        >
          {/* Outer Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-gradient-xy"></div>

          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 flex flex-col sm:flex-row items-center gap-2">
            
            {/* Input Icon */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-950/50 text-zinc-500">
              <Search className="w-5 h-5" />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste local path or GitHub URL..."
              className="w-full sm:flex-1 bg-transparent border-none text-white placeholder:text-zinc-600 focus:ring-0 focus:outline-none h-12 px-4 text-base font-mono"
            />

            {/* Action Button */}
            <button
              onClick={handleIngest}
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[160px] h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/90" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Analyze Code</span>
                </>
              )}
            </button>
          </div>

          {/* Inline Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 -bottom-12 flex justify-center"
            >
              <div className="flex items-center gap-2 text-red-400 text-xs px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 backdrop-blur-md">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {error}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            delay={0.3}
            icon={<Search className="w-5 h-5" />}
            title="Semantic Search"
            description="Find logic scattered across files using natural language."
          />
          <FeatureCard
            delay={0.4}
            icon={<Terminal className="w-5 h-5" />}
            title="Context Aware"
            description="Understand folder structure, imports, and dependencies."
          />
          <FeatureCard
            delay={0.5}
            icon={<Code2 className="w-5 h-5" />}
            title="Code Explanation"
            description="Highlight any snippet to get a line-by-line breakdown."
          />
          <FeatureCard
            delay={0.6}
            icon={<GitBranch className="w-5 h-5" />}
            title="Local & Git"
            description="Works with local file paths or public Git repositories."
          />
        </div>
      </main>

      {/* --- PROPER FOOTER --- */}
      <footer className="bg-zinc-900 border-t border-white/5 pt-16 pb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-1">
              
              {/* --- UPDATED LOGO SECTION (FOOTER) --- */}
              <div className="flex items-center mb-4">
                 <img 
                    src={logo} 
                    alt="CodeMind" 
                    className="h-9 w-auto object-contain"
                  />
                  {/* Added -ml-3 here as well */}
                   <span className="text-xl font-bold tracking-tight text-white uppercase -ml-3">
                    CODEMIND
                  </span>
              </div>

              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                Empowering developers with local, secure, and intelligent code analysis.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-sm">
              © 2024 CodeMind AI Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-zinc-600 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;