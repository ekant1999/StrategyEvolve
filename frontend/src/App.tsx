import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, TrendingUp, History, Settings, Brain } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Trades } from './pages/Trades';
import { useAppStore } from './store/useAppStore';
import { useAutoLogin } from './hooks/useAutoLogin';

function App() {
  const { user, error, setError } = useAppStore();
  
  // Auto-login demo user for hackathon demo
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
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{user.name}</span>
                  </div>
                )}
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/strategies" element={<div className="card"><h2 className="text-2xl font-bold">Strategies Page (Coming Soon)</h2></div>} />
            <Route path="/settings" element={<div className="card"><h2 className="text-2xl font-bold">Settings Page (Coming Soon)</h2></div>} />
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
