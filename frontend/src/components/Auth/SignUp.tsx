import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
// Removed Code2 import as it is replaced by the image logo
// import { Code2 } from 'lucide-react';

// --- IMPORT YOUR LOGO ---
import logo from '../../assets/logoai.png';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please check your email.');
      navigate('/signin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' } }} />

      {/* --- BACKGROUND PATTERN (Matches Landing Page & SignIn) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* --- SIGN UP CARD --- */}
      <div className="w-full max-w-md bg-zinc-900/80 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
            {/* --- UPDATED LOGO FORMAT --- */}
            <div className="flex items-center mb-2">
               <img 
                  src={logo} 
                  alt="CodeMind" 
                  className="h-10 w-auto object-contain" 
                />
                 <span className="text-xl font-bold tracking-tight text-white uppercase -ml-3">
                  CODEMIND
                </span>
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100">Create an account</h2>
            <p className="text-zinc-400 text-sm mt-1">Start analyzing your codebase today</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating Profile...' : 'Get Started'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>

       {/* Version Tag */}
       <div className="absolute top-6 right-6 px-3 py-1 bg-zinc-900 border border-white/5 rounded-full text-xs font-mono text-zinc-500">
        v2.0 Beta
      </div>
    </div>
  );
}