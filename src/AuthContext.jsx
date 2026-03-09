// src/AuthContext.jsx
import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';

const AuthContext = createContext(null);

// ============================================================
// CONFIGURARE — modifică doar această valoare
// ============================================================
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minute
const WARNING_BEFORE_MS = 60 * 1000;           // avertisment cu 1 minut înainte

// Evenimentele care resetează timerul de inactivitate
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = useCallback(async (reason = 'manual') => {
    // Oprește timere
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    setShowInactivityWarning(false);

    // Încearcă să anunțe backend-ul (best effort)
    try {
      const refreshToken = localStorage.getItem('wasteRefreshToken');
      if (refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignorăm erori de rețea la logout — curățăm oricum local
    }

    localStorage.removeItem('wasteUser');
    localStorage.removeItem('wasteAccessToken');
    localStorage.removeItem('wasteRefreshToken');
    setUser(null);

    if (reason === 'inactivity') {
      // Setăm un flag ca pagina de login să afișeze mesaj
      sessionStorage.setItem('logoutReason', 'inactivity');
    }
  }, []);

  // ============================================================
  // RESET TIMER — apelat la fiecare eveniment de activitate
  // ============================================================
  const resetInactivityTimer = useCallback(() => {
    if (!user) return; // Nu pornim timer dacă nu e nimeni logat

    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    setShowInactivityWarning(false);

    // Timer pentru avertisment (la 14 minute)
    warningTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Timer pentru logout automat (la 15 minute)
    inactivityTimerRef.current = setTimeout(() => {
      logout('inactivity');
    }, INACTIVITY_TIMEOUT_MS);
  }, [user, logout]);

  // ============================================================
  // PORNIRE / OPRIRE LISTENERS DE ACTIVITATE
  // ============================================================
  useEffect(() => {
    if (!user) {
      // Dacă nu e logat, oprim timere și scoatem listeneri
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
      return;
    }

    // Pornim timerul imediat după login
    resetInactivityTimer();

    // Adăugăm listeneri pentru activitate în faza de CAPTURE
    // (capture: true = evenimentele sunt interceptate înainte de stopPropagation din modals)
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer, { passive: true, capture: true })
    );

    return () => {
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer, { capture: true })
      );
    };
  }, [user, resetInactivityTimer]);

  // ============================================================
  // RESTAURARE SESIUNE LA RELOAD
  // ============================================================
  useEffect(() => {
    const storedUser = localStorage.getItem('wasteUser');
    const token = localStorage.getItem('wasteAccessToken');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================
  const login = useCallback((userData, accessToken, refreshToken) => {
    localStorage.setItem('wasteUser', JSON.stringify(userData));
    localStorage.setItem('wasteAccessToken', accessToken);
    localStorage.setItem('wasteRefreshToken', refreshToken);
    sessionStorage.removeItem('logoutReason');
    setUser(userData);
  }, []);

  // ============================================================
  // EXTINDE SESIUNEA — apelat din bannerul de avertisment
  // ============================================================
  const extendSession = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      showInactivityWarning,
      extendSession,
    }}>
      {/* Banner de avertisment inactivitate */}
      {showInactivityWarning && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: '#1e293b',
          color: '#f8fafc',
          padding: '16px 24px',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '14px',
          maxWidth: '480px',
          width: 'calc(100% - 48px)',
        }}>
          <span>⚠️</span>
          <span style={{ flex: 1 }}>
            Sesiunea va expira în <strong>1 minut</strong> din cauza inactivității.
          </span>
          <button
            onClick={extendSession}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            Rămân conectat
          </button>
        </div>
      )}

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};