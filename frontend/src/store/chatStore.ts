import { create } from 'zustand';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

export interface ContextItem {
  file: string;
  path: string;
  lines: string;
  score: string;
  code: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[]; 
  context?: ContextItem[]; 
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatState {
  // State
  messages: Message[];
  isLoading: boolean;
  retrievedContexts: ContextItem[];
  currentSessionId: string | null;
  sessions: ChatSession[];
  
  // NEW: Modal State
  isIngestionModalOpen: boolean;
  
  // Actions
  addMessage: (msg: Message) => void;
  setLoading: (loading: boolean) => void;
  setContexts: (contexts: ContextItem[]) => void;
  
  // NEW: Modal Actions
  openIngestionModal: () => void;
  closeIngestionModal: () => void;
  
  // Chat Logic
  resetChat: () => void; 
  loadHistory: (userId: string) => Promise<void>; 
  loadSession: (sessionId: string) => Promise<void>; 
  sendMessage: (text: string, userId: string, sessionId: string | null) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  retrievedContexts: [], 
  currentSessionId: null,
  sessions: [],
  
  // NEW: Default modal state
  isIngestionModalOpen: false,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setContexts: (contexts) => set({ retrievedContexts: contexts }),

  // NEW: Modal Actions
  openIngestionModal: () => set({ isIngestionModalOpen: true }),
  closeIngestionModal: () => set({ isIngestionModalOpen: false }),

  // UPDATED: resetChat now opens the modal
  resetChat: () => set({ 
    messages: [], 
    retrievedContexts: [], 
    currentSessionId: null,
    isIngestionModalOpen: true // <--- Trigger Modal on New Chat
  }),

  loadHistory: async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); 

    if (error) console.error("Error loading history:", error);
    else if (data) set({ sessions: data });
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, currentSessionId: sessionId, messages: [] }); 
    
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error loading chat messages:", error);
    } else if (data) {
        const formattedMessages: Message[] = data.map(row => ({
            role: row.role as 'user' | 'assistant',
            content: row.content,
            sources: undefined 
        }));
        set({ messages: formattedMessages });
    }
    set({ isLoading: false });
  },

  sendMessage: async (text: string, userId: string, sessionId: string | null) => {
    if (!text.trim()) return;

    const { addMessage, setLoading, setContexts, loadHistory } = get();
    
    addMessage({ role: 'user', content: text });
    setLoading(true);

    try {
      const response = await api.chat(text, null, sessionId, userId);
      
      if (!sessionId && response.session_id) {
          set({ currentSessionId: response.session_id });
          await loadHistory(userId);
      }

      let aiContent = typeof response === 'string' ? response : (response.answer || response.message);
      if (!aiContent) aiContent = "⚠️ No text returned from backend";
      if (typeof aiContent === 'object') aiContent = JSON.stringify(aiContent);
      aiContent = String(aiContent);

      const aiMsg: Message = {
        role: 'assistant',
        content: aiContent,
        sources: response.sources,
        context: response.context,
      };
      
      addMessage(aiMsg);

      if (response.context) setContexts(response.context);

    } catch (error) {
      console.error(error);
      addMessage({ role: 'assistant', content: "⚠️ Error connecting to backend." });
    } finally {
      setLoading(false);
    }
  }
}));