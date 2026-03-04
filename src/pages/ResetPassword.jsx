// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { Trash2, Lock, Eye, EyeOff, AlertCircle, CheckCircle, XCircle, Recycle, TreePine, Leaf, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ThemeToggle from '../components/dashboard/ThemeToggle';

const API_URL = 'https://waste-backend-3u9c.onrender.com';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [tokenValid, setTokenValid] = useState(null); // null = loading, true/false
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validare token la încărcare
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();
        setTokenValid(data.valid === true);
      } catch {
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Eroare la resetarea parolei');
      }
    } catch {
      setError('Nu s-a putut conecta la server. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return { label: 'Prea scurtă', color: 'bg-red-500', width: 'w-1/4' };
    if (newPassword.length < 10) return { label: 'Slabă', color: 'bg-orange-500', width: 'w-2/4' };
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return { label: 'Medie', color: 'bg-yellow-500', width: 'w-3/4' };
    return { label: 'Puternică', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = passwordStrength();

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">

      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-500">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/30 dark:bg-emerald-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/30 dark:bg-teal-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400/30 dark:bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[10%] animate-float"><Recycle className="w-12 h-12 text-emerald-400/20 dark:text-emerald-500/10" /></div>
          <div className="absolute top-[40%] right-[10%] animate-float animation-delay-1500"><TreePine className="w-20 h-20 text-emerald-400/15 dark:text-emerald-500/8" /></div>
          <div className="absolute top-[60%] left-[15%] animate-float animation-delay-500"><Leaf className="w-10 h-10 text-emerald-400/25 dark:text-emerald-500/12" /></div>
          <div className="absolute top-[15%] left-[30%] animate-pulse"><Sparkles className="w-8 h-8 text-emerald-400/30 dark:text-emerald-500/15" /></div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[28px] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[28px] shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Trash2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 rounded-[28px] border-2 border-emerald-400/50 animate-ping-slow" />
            </div>
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">SAMD</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Sistem Avansat de Monitorizare Deșeuri</p>
        </div>

        {/* Card */}
        <div className="relative group animate-fade-in animation-delay-200">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500">

            <div className="absolute top-5 right-5"><ThemeToggle /></div>

            {/* Loading token validation */}
            {tokenValid === null && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Se verifică link-ul...</p>
              </div>
            )}

            {/* Token invalid */}
            {tokenValid === false && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Link invalid</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  Link-ul de resetare este invalid sau a expirat. Link-urile sunt valabile <strong>1 oră</strong> de la trimitere.
                </p>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-[16px] transition-all duration-300 shadow-xl shadow-emerald-500/30 mb-3"
                >
                  Solicită un link nou
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-[16px] hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                >
                  Înapoi la login
                </button>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Parolă resetată!</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  Parola ta a fost schimbată cu succes. Te poți autentifica acum cu noua parolă.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-[16px] transition-all duration-300 shadow-xl shadow-emerald-500/30"
                >
                  Mergi la login
                </button>
              </div>
            )}

            {/* Formular resetare */}
            {tokenValid === true && !success && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parolă nouă 🔐</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Alege o parolă sigură de minim 8 caractere.</p>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-[16px] flex items-center gap-3 animate-shake">
                    <div className="w-10 h-10 rounded-[12px] bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Parolă nouă */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Parolă nouă</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-emerald-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-14 py-3.5 border border-gray-200 dark:border-gray-700 rounded-[16px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Indicator putere parolă */}
                    {strength && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                        </div>
                        <p className={`text-xs mt-1 font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmare parolă */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Confirmă parola</label>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-emerald-400 transition-colors" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-14 py-3.5 border border-gray-200 dark:border-gray-700 rounded-[16px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">Parolele nu coincid</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && (
                      <p className="text-xs text-emerald-500 mt-1 font-medium">✓ Parolele coincid</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-[16px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Se salvează...
                        </span>
                      ) : 'Salvează parola nouă'}
                    </span>
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
              SAMD © 2026 - Sistem Avansat de Monitorizare Deșeuri
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes ping-slow { 75%, 100% { transform: scale(1.1); opacity: 0; } }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-out; }
        .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
        .animation-delay-4000 { animation-delay: 4000ms; }
        .bg-grid-pattern { background-image: linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px); background-size: 40px 40px; }
      `}</style>
    </div>
  );
};

export default ResetPassword;