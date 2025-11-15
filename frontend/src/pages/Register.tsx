import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, User, UserPlus } from 'lucide-react';
import { authApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setError } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(formData.email, formData.name);
      
      if (response.success && response.data) {
        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        navigate('/');
      } else {
        setError(response.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Extract error message from axios response
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to register. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Brain className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">StrategyEvolve</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Register Form */}
        <div className="card shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your account will be created and linked to Fastino for behavioral learning
          </p>
        </div>
      </div>
    </div>
  );
};

