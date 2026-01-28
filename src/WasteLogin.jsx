// src/WasteLogin.jsx
/**
 * ============================================================================
 * WASTE LOGIN - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * Modern glassmorphism login with animated background
 * 
 * ✅ Samsung One UI 7.0 rounded corners
 * ✅ Apple iOS 18 glassmorphism
 * ✅ Animated gradient background with floating elements
 * ✅ Perfect light/dark mode
 * ✅ Premium micro-interactions
 * 
 * ============================================================================
 */

import { useState } from 'react';
import { Trash2, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, Recycle, TreePine, Leaf } from 'lucide-react';
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

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      
      {/* ANIMATED BACKGROUND - Suggestive waste management theme */}
      <div className="absolute inset-0 bg-gradient-to-br 
                    from-emerald-50 via-teal-50 to-cyan-50 
                    dark:from-gray-900 dark:via-gray-950 dark:to-black 
                    transition-colors duration-500">
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/30 dark:bg-emerald-500/20 
                      rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/30 dark:bg-teal-500/20 
                      rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400/30 dark:bg-cyan-500/20 
                      rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* Floating eco icons */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Recycle icons */}
          <div className="absolute top-[10%] left-[10%] animate-float">
            <Recycle className="w-12 h-12 text-emerald-400/20 dark:text-emerald-500/10" />
          </div>
          <div className="absolute top-[20%] right-[15%] animate-float animation-delay-1000">
            <Recycle className="w-16 h-16 text-teal-400/15 dark:text-teal-500/8" />
          </div>
          <div className="absolute bottom-[30%] left-[20%] animate-float animation-delay-2000">
            <Recycle className="w-14 h-14 text-cyan-400/20 dark:text-cyan-500/10" />
          </div>
          
          {/* Tree icons */}
          <div className="absolute top-[40%] right-[10%] animate-float animation-delay-1500">
            <TreePine className="w-20 h-20 text-emerald-400/15 dark:text-emerald-500/8" />
          </div>
          <div className="absolute bottom-[20%] right-[25%] animate-float animation-delay-3000">
            <TreePine className="w-16 h-16 text-teal-400/20 dark:text-teal-500/10" />
          </div>
          
          {/* Leaf icons */}
          <div className="absolute top-[60%] left-[15%] animate-float animation-delay-500">
            <Leaf className="w-10 h-10 text-emerald-400/25 dark:text-emerald-500/12" />
          </div>
          <div className="absolute bottom-[40%] right-[30%] animate-float animation-delay-2500">
            <Leaf className="w-12 h-12 text-cyan-400/20 dark:text-cyan-500/10" />
          </div>
          <div className="absolute top-[30%] left-[40%] animate-float animation-delay-1800">
            <Leaf className="w-14 h-14 text-teal-400/18 dark:text-teal-500/9" />
          </div>
          
          {/* Sparkle icons for eco-friendly feeling */}
          <div className="absolute top-[15%] left-[30%] animate-pulse">
            <Sparkles className="w-8 h-8 text-emerald-400/30 dark:text-emerald-500/15" />
          </div>
          <div className="absolute bottom-[25%] left-[60%] animate-pulse animation-delay-1000">
            <Sparkles className="w-6 h-6 text-teal-400/25 dark:text-teal-500/12" />
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo + Title Section */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Logo with premium gradient */}
          <div className="inline-flex items-center justify-center mb-4 group">
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 
                            rounded-[28px] blur-2xl opacity-50 group-hover:opacity-70 
                            transition-opacity duration-500" />
              
              {/* Logo container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 
                            rounded-[28px] shadow-2xl 
                            flex items-center justify-center
                            group-hover:scale-110 group-hover:rotate-3
                            transition-all duration-500">
                <Trash2 className="w-12 h-12 text-white" />
              </div>

              {/* Animated ring */}
              <div className="absolute inset-0 rounded-[28px] border-2 border-emerald-400/50 
                            animate-ping-slow" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-3 
                       bg-gradient-to-r from-emerald-600 to-teal-600 
                       dark:from-emerald-400 dark:to-teal-400
                       bg-clip-text text-transparent">
            SAMD
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Sistem Avansat de Monitorizare Deșeuri
          </p>
        </div>

        {/* Login Card - Premium glassmorphism */}
        <div className="relative group animate-fade-in animation-delay-200">
          {/* Glow effect behind card */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 
                        rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 
                        transition-opacity duration-500" />
          
          {/* Card container */}
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl 
                        rounded-[32px] shadow-2xl p-8 
                        border border-gray-200/50 dark:border-gray-700/50 
                        transition-all duration-500">
            
            {/* Theme toggle in corner */}
            <div className="absolute top-5 right-5">
              <ThemeToggle />
            </div>

            {/* Welcome text */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Bine ai venit! 👋
            </h2>

            {/* Error message */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/30 
                            border border-red-200 dark:border-red-800/50 
                            rounded-[16px] 
                            flex items-center gap-3 
                            animate-shake">
                <div className="w-10 h-10 rounded-[12px] bg-red-500/10 dark:bg-red-500/20 
                              flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </span>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 
                                 w-5 h-5 text-gray-400 dark:text-gray-500 
                                 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-emerald-400
                                 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 
                             border border-gray-200 dark:border-gray-700 
                             rounded-[16px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white 
                             placeholder-gray-400 dark:placeholder-gray-500 
                             focus:outline-none 
                             focus:ring-2 focus:ring-emerald-500/30 
                             focus:border-emerald-500 
                             transition-all duration-300"
                    placeholder="nume@exemplu.ro"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                uppercase tracking-wider mb-2">
                  Parolă
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 
                                 w-5 h-5 text-gray-400 dark:text-gray-500 
                                 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-emerald-400
                                 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-14 py-3.5 
                             border border-gray-200 dark:border-gray-700 
                             rounded-[16px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white 
                             placeholder-gray-400 dark:placeholder-gray-500 
                             focus:outline-none 
                             focus:ring-2 focus:ring-emerald-500/30 
                             focus:border-emerald-500 
                             transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 
                             p-2 rounded-[10px]
                             text-gray-400 dark:text-gray-500 
                             hover:text-gray-600 dark:hover:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-800
                             transition-all duration-300
                             active:scale-95"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4 
                         bg-gradient-to-r from-emerald-600 to-teal-600 
                         hover:from-emerald-700 hover:to-teal-700 
                         text-white font-bold rounded-[16px] 
                         focus:outline-none 
                         focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 
                         focus:ring-offset-white dark:focus:ring-offset-gray-800 
                         transition-all duration-300 
                         shadow-xl shadow-emerald-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-98
                         overflow-hidden
                         group"
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                              transition-transform duration-1000 
                              bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                    rounded-full animate-spin" />
                      Conectare...
                    </span>
                  ) : (
                    'Conectează-te'
                  )}
                </span>
              </button>
            </form>

            {/* Footer text */}
            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
              SAMD © 2025 - Sistem Avansat de Monitorizare Deșeuri
            </p>
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.1); opacity: 0; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.4s ease-out;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-1500 {
          animation-delay: 1500ms;
        }
        
        .animation-delay-1800 {
          animation-delay: 1800ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .animation-delay-2500 {
          animation-delay: 2500ms;
        }
        
        .animation-delay-3000 {
          animation-delay: 3000ms;
        }
        
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default WasteLogin;