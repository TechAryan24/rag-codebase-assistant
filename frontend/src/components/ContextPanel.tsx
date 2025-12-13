import React from 'react';
import { FileCode, Database, X, Terminal, GitCommit, FlaskConical } from 'lucide-react'; 
import { useChatStore } from '../store/chatStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext'; 

const ContextPanel = () => {
  // Pull sendMessage and currentSessionId from the store
  const { retrievedContexts, sendMessage, currentSessionId } = useChatStore();

  // Get the current User ID safely
  const { session } = useAuth();
  const userId = session?.user?.id;

  const handleGenerateTest = (code: string, filename: string) => {
    // Safety Check
    if (!userId) {
        console.error("Cannot generate test: User ID missing");
        return;
    }

    // ⚡ Trigger the AI with a specific prompt
    const prompt = `Generate a Jest/Python unit test case for the following code from ${filename}. \n\nCode:\n${code}\n\nOnly provide the test code.`;
    
    // Pass userId AND currentSessionId
    sendMessage(prompt, userId, currentSessionId);
  };

  return (
    // MAIN PANEL: Light Gray (Light Mode) / Dark Gray (Dark Mode)
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#111] border-l border-gray-200 dark:border-zinc-800 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
           <Database className="w-4 h-4 text-blue-600 dark:text-blue-500" />
           Context Viewer
        </div>
        <button className="text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white">
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-800">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
          <span>Retrieved Chunks</span>
          {retrievedContexts.length > 0 && <span className="text-blue-600 dark:text-blue-400">{retrievedContexts.length} chunks</span>}
        </div>

        {retrievedContexts.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-zinc-500 mt-10 text-sm">
             <Terminal className="w-8 h-8 mx-auto mb-2 opacity-20" />
             No context loaded yet.
          </div>
        ) : (
          retrievedContexts.map((ctx: any, idx: number) => {
            const isGit = ctx.file === "GIT COMMIT";

            return (
                // CARD CONTAINER: White (Light Mode) / Black (Dark Mode)
                <div key={idx} className={`bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-sm ${isGit ? 'border-l-4 border-l-orange-500' : ''}`}>
                    
                   {/* CARD HEADER */}
                   <div className="bg-gray-100 dark:bg-zinc-900 px-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800">
                      <div className={`flex items-center gap-2 text-xs font-mono truncate max-w-[60%] ${isGit ? 'text-orange-600 dark:text-orange-300' : 'text-blue-600 dark:text-blue-300'}`}>
                          {isGit ? <GitCommit className="w-3 h-3 flex-shrink-0" /> : <FileCode className="w-3 h-3 flex-shrink-0" />}
                          <span title={ctx.path}>{ctx.file}</span> 
                          {!isGit && <span className="text-gray-500 dark:text-zinc-500">:{ctx.lines}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* TEST BUTTON */}
                        {!isGit && (
                            <button 
                                onClick={() => handleGenerateTest(ctx.code, ctx.file)}
                                className="flex items-center gap-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded transition-colors group"
                                title="Generate Unit Test"
                            >
                                <FlaskConical className="w-3 h-3" />
                                <span>Test</span>
                            </button>
                        )}
                        
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded font-mono">
                            {ctx.score}
                        </span>
                      </div>
                   </div>

                   {/* CODE BODY */}
                   <div className="text-[10px]">
                      <SyntaxHighlighter 
                        language={isGit ? "yaml" : "typescript"} 
                        style={vscDarkPlus} 
                        customStyle={{ margin: 0, padding: '10px', background: '#1e1e1e' }} 
                        wrapLongLines={true}
                     >
                        {ctx.code}
                      </SyntaxHighlighter>
                   </div>
                </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContextPanel;