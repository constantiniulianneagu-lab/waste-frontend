// src/pages/ChangePassword.jsx
// Pagină afișată la primul login când must_change_password = true
// Userul NU poate accesa altceva până nu schimbă parola temporară

import { useState } from 'react';
import { Trash2, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Recycle, TreePine, Leaf, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/dashboard/ThemeToggle';

const API_URL = 'https://waste-backend-3u9c.onrender.com';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { accessToken, logout, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return { label: 'Prea scurtă', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' };
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return { label: 'Medie', color: 'bg-yellow-500', text: 'text-yellow-500', width: 'w-2/4' };
    if (newPassword.length < 12) return { label: 'Bună', color: 'bg-blue-500', text: 'text-blue-500', width: 'w-3/4' };
    return { label: 'Puternică', color: 'bg-emerald-500', text: 'text-emerald-500', width: 'w-full' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Parola nouă trebuie să aibă minim 8 caractere');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirecționează după 2 secunde
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        setError(data.message || 'Eroare la schimbarea parolei');
      }
    } catch {
      setError('Nu s-a putut conecta la server. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">

      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br 
                    from-emerald-50 via-teal-50 to-cyan-50 
                    dark:from-gray-900 dark:via-gray-950 dark:to-black 
                    transition-colors duration-500">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/30 dark:bg-emerald-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/30 dark:bg-teal-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400/30 dark:bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[10%] animate-float"><Recycle className="w-12 h-12 text-emerald-400/20 dark:text-emerald-500/10" /></div>
          <div className="absolute top-[20%] right-[15%] animate-float animation-delay-1000"><Recycle className="w-16 h-16 text-teal-400/15 dark:text-teal-500/8" /></div>
          <div className="absolute top-[40%] right-[10%] animate-float animation-delay-1500"><TreePine className="w-20 h-20 text-emerald-400/15 dark:text-emerald-500/8" /></div>
          <div className="absolute bottom-[20%] right-[25%] animate-float animation-delay-3000"><TreePine className="w-16 h-16 text-teal-400/20 dark:text-teal-500/10" /></div>
          <div className="absolute top-[60%] left-[15%] animate-float animation-delay-500"><Leaf className="w-10 h-10 text-emerald-400/25 dark:text-emerald-500/12" /></div>
          <div className="absolute top-[15%] left-[30%] animate-pulse"><Sparkles className="w-8 h-8 text-emerald-400/30 dark:text-emerald-500/15" /></div>
          <div className="absolute bottom-[25%] left-[60%] animate-pulse animation-delay-1000"><Sparkles className="w-6 h-6 text-teal-400/25 dark:text-teal-500/12" /></div>
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

          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">

            <div className="absolute top-5 right-5"><ThemeToggle /></div>

            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Parolă schimbată!</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Parola ta a fost actualizată cu succes.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Ești redirecționat automat...</p>
              </div>
            ) : (
              <>
                {/* Banner avertizare */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-[16px]">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    🔐 Acesta este primul tău login. Trebuie să îți schimbi parola temporară înainte să continui.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Setează parola ta
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Salut{user?.firstName ? `, ${user.firstName}` : ''}! Alege o parolă sigură de minim 8 caractere.
                </p>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-[16px] flex items-center gap-3 animate-shake">
                    <div className="w-10 h-10 rounded-[12px] bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Parolă temporară */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Parolă temporară (primită pe email)
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-emerald-400 transition-colors" />
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-12 pr-14 py-3.5 border border-gray-200 dark:border-gray-700 rounded-[16px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300"
                        placeholder="Parola din emailul primit"
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Parolă nouă */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Parolă nouă
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within/input:text-emerald-600 dark:group-focus-within/input:text-emerald-400 transition-colors" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-14 py-3.5 border border-gray-200 dark:border-gray-700 rounded-[16px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {strength && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                        </div>
                        <p className={`text-xs mt-1 font-medium ${strength.text}`}>{strength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmare parolă */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Confirmă parola nouă
                    </label>
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
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 font-medium">Parolele nu coincid</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
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
                      ) : 'Setează parola și continuă →'}
                    </span>
                  </button>

                  {/* Logout link */}
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-center text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Ieși din cont
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
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
        .animation-delay-3000 { animation-delay: 3000ms; }
        .animation-delay-4000 { animation-delay: 4000ms; }
        .bg-grid-pattern { background-image: linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px); background-size: 40px 40px; }
      `}</style>
    </div>
  );
};

export default ChangePassword;