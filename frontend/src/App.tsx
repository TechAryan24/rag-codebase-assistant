import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import { AuthProvider, useAuth } from './context/AuthContext';

// 1. Guard: Protects routes that require a user (Dashboard)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex items-center justify-center">Loading...</div>;
  
  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

// 2. Guard: Protects routes that represent "Public" state (Login, Landing)
// If user is ALREADY logged in, send them straight to Dashboard
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  // --- THEME INITIALIZATION LOGIC ---
  useEffect(() => {
    // Check local storage or system preference on initial load
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes (Redirect to Dashboard if logged in) */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signin" 
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } 
          />

          {/* Protected Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;