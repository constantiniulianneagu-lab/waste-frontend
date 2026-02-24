// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback(({ type = 'success', title, message, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, type, title, message, duration, removing: false }]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 350);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  }, []);

  // Shorthand helpers
  const toast = {
    success: (title, message, duration)  => addToast({ type: 'success', title, message, duration }),
    error:   (title, message, duration)  => addToast({ type: 'error',   title, message, duration: duration || 6000 }),
    warning: (title, message, duration)  => addToast({ type: 'warning', title, message, duration }),
    info:    (title, message, duration)  => addToast({ type: 'info',    title, message, duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================================================
// TOAST ITEM
// ============================================================================
const ToastItem = ({ toast, onRemove }) => {
  const configs = {
    success: {
      bar:   'bg-emerald-500',
      icon:  'bg-emerald-100 dark:bg-emerald-900/40',
      title: 'text-emerald-700 dark:text-emerald-400',
      svg: (
        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bar:   'bg-red-500',
      icon:  'bg-red-100 dark:bg-red-900/40',
      title: 'text-red-700 dark:text-red-400',
      svg: (
        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bar:   'bg-amber-500',
      icon:  'bg-amber-100 dark:bg-amber-900/40',
      title: 'text-amber-700 dark:text-amber-400',
      svg: (
        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
    },
    info: {
      bar:   'bg-blue-500',
      icon:  'bg-blue-100 dark:bg-blue-900/40',
      title: 'text-blue-700 dark:text-blue-400',
      svg: (
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const cfg = configs[toast.type] || configs.info;

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-[18px] shadow-2xl px-4 py-3.5
        overflow-hidden
        transition-all duration-350
        ${toast.removing
          ? 'opacity-0 translate-x-8 scale-95'
          : 'opacity-100 translate-x-0 scale-100'}
      `}
    >
      {/* Bara colorata stanga */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[18px] ${cfg.bar}`} />

      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-[10px] ${cfg.icon} flex items-center justify-center mt-0.5`}>
        {cfg.svg}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-bold leading-tight ${cfg.title}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight line-clamp-2">
            {toast.message}
          </p>
        )}
      </div>

      {/* Buton inchidere */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-[8px]
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                   transition-colors mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar durata */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full ${cfg.bar} opacity-60`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// TOAST CONTAINER - fixed dreapta jos
// ============================================================================
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
};

export default ToastProvider;