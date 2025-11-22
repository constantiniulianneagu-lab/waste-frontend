// src/WasteLogin.jsx
import { useState } from 'react';
import { Trash2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import ThemeToggle from './components/dashboard/ThemeToggle';
import { useNavigate } from 'react-router-dom';
const API_URL = 'https://waste-backend-3u9c.onrender.com';
const WasteLogin = () => {
const { login } = useAuth();
const navigate = useNavigate();
const [formData, setFormData] = useState({
email: '',
password: ''
});
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setLoading(true);
try {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  });

  const data = await response.json();

  if (data.success) {
    const accessToken = data.data.tokens?.accessToken || data.data.accessToken;
    const refreshToken = data.data.tokens?.refreshToken || data.data.refreshToken;
    
    if (!accessToken || !refreshToken) {
      throw new Error('Tokens missing from response');
    }
    
    login(data.data.user, accessToken, refreshToken);
    navigate('/', { replace: true });
  } else {
    setError(data.message || 'Login failed');
  }
} catch (err) {
  console.error('Login error:', err);
  setError(err.message || 'Failed to connect to server');
} finally {
  setLoading(false);
}
};
const fillTestCredentials = () => {
setFormData({
email: 'admin@test.ro',
password: 'admin123'
});
};
return (
<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center p-4 transition-colors">
<div className="w-full max-w-md">
{/* Logo + titlu */}
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-4 shadow-2xl">
<Trash2 className="w-10 h-10 text-white" />
</div>
<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
SAMD
</h1>
<p className="text-gray-600 dark:text-gray-400 text-lg">
Sistem Avansat de Monitorizare Deșeuri
</p>
</div>
    {/* Card login */}
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-100 border border-gray-100 dark:border-gray-700 transition-colors">
      {/* Theme toggle în colț */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Bine ai revenit!
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={fillTestCredentials}
        className="w-full mb-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
      >
        🧪 Fill Test Credentials
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="nume@exemplu.ro"
            />
          </div>
        </div>

        {/* Parolă */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Parolă
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Conectare...' : 'Conectează-te'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        SAMD © 2024 - Sistem Avansat de Monitorizare Deșeuri
      </p>
    </div>
  </div>
</div>
);
};
export default WasteLogin;