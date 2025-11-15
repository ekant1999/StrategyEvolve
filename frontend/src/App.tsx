import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, History, Settings, Brain, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Trades } from './pages/Trades';
import { Strategies } from './pages/Strategies';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAppStore } from './store/useAppStore';
import { useAutoLogin } from './hooks/useAutoLogin';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Logout Button Component
const LogoutButton = () => {
  const { setUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
      title="Logout"
    >
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  );
};

function App() {
  const { user, error, setError } = useAppStore();
  
  // Check localStorage for saved user
  useAutoLogin();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Brain className="text-primary" size={32} />
                <span className="ml-2 text-xl font-bold text-gray-900">StrategyEvolve</span>
              </div>
              
              <div className="flex items-center gap-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{user.name}</span>
                    </div>
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Home size={20} />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/trades" 
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <History size={20} />
                      <span>Trades</span>
                    </Link>
                    <Link 
                      to="/strategies" 
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <TrendingUp size={20} />
                      <span>Strategies</span>
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Settings size={20} />
                      <span>Settings</span>
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <LogIn size={20} />
                      <span>Login</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <UserPlus size={20} />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Error Banner */}
        {error && (
          <div className="bg-danger text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trades" 
              element={
                <ProtectedRoute>
                  <Trades />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/strategies" 
              element={
                <ProtectedRoute>
                  <Strategies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <div className="card"><h2 className="text-2xl font-bold">Settings Page (Coming Soon)</h2></div>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>Built for Self-Evolving Agents Hackathon | Powered by Raindrop, Fastino & LinkUp</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
