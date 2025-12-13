import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Settings, 
  FolderOpen, 
  LogOut, 
  Plus, 
  Moon, 
  Sun, 
  ChevronDown, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import FileExplorer from './FileExplorer';
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';

interface SidebarProps {
  fileTree: any[];
  userName: string;
  userId: string;
}

const Sidebar = ({ fileTree, userName, userId }: SidebarProps) => {
  const navigate = useNavigate();
  
  // Zustand Store
  const { 
    sessions, 
    loadHistory, 
    loadSession, 
    resetChat, 
    currentSessionId 
  } = useChatStore();

  // Local UI State
  const [showHistory, setShowHistory] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize toggle state based on localStorage or actual document class
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return true; 
  });

  // 1. Load History on Mount
  useEffect(() => {
    if (userId) {
      loadHistory(userId);
    }
  }, [userId, loadHistory]);

  // 2. Handle Logout
  const logoutUser = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userName");
    navigate("/signin");
  };

  // 3. Handle Theme Toggle
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Toggle Tailwind 'dark' class on HTML element
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    // MAIN CONTAINER
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#111] border-r border-gray-200 dark:border-zinc-800 relative transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2">
         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            {userName.charAt(0).toUpperCase()}
         </div>
         <div>
            <p className="text-gray-900 dark:text-white text-sm font-semibold transition-colors">{userName}</p>
            <p className="text-gray-500 dark:text-zinc-500 text-xs">Free Plan</p>
         </div>
      </div>

      {/* --- NAVIGATION --- */}
      <div className="p-3 space-y-1 border-b border-gray-200 dark:border-zinc-800">
        
        {/* New Chat Button */}
        <button 
          onClick={resetChat}
          className="w-full flex items-center justify-center px-2 py-2 mb-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </button>

        <p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 px-2 uppercase tracking-widest mb-1">
          Menu
        </p>

        {/* Recent Chats Accordion */}
        <div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition ${
                showHistory 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3" />
                Recent Chats
            </div>
            {showHistory ? <ChevronDown className="w-3 h-3"/> : <ChevronRight className="w-3 h-3"/>}
          </button>

          {/* History List */}
          {showHistory && (
            <div className="ml-2 pl-2 border-l border-gray-300 dark:border-zinc-800 space-y-0.5 mt-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
              {sessions.length === 0 ? (
                <span className="text-xs text-gray-500 dark:text-zinc-600 px-2 py-1 block italic">No history yet</span>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`w-full flex items-center gap-2 text-left truncate text-xs py-1.5 px-3 rounded-md transition ${
                      currentSessionId === session.id 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-medium' 
                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <MessageSquare size={12} className="shrink-0 opacity-70" />
                    <span className="truncate">{session.title || "Untitled Chat"}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md transition"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </button>
          
          {/* Settings Popover */}
          {showSettings && (
            <>
              {/* Invisible backdrop to close on click outside */}
              <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)}></div>
              
              <div className="absolute left-full top-0 ml-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 z-50">
                <p className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 mb-2 uppercase tracking-wider">Appearance</p>
                
                {/* THEME TOGGLE SWITCH */}
                <button 
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full text-sm text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition"
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? <Moon size={14} /> : <Sun size={14} />}
                    {darkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                  
                  {/* Switch UI */}
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${darkMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: darkMode ? '1.1rem' : '0.15rem' }}></div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- FILE EXPLORER --- */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-zinc-500 mb-3 px-1 uppercase tracking-wider">
          <FolderOpen className="w-3 h-3" />
          File Explorer
        </div>
        <FileExplorer files={fileTree} />
      </div>

      {/* --- FOOTER --- */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          onClick={logoutUser}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;