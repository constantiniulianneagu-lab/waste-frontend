import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'from-emerald-500 to-emerald-600',
  error: 'from-rose-500 to-rose-600',
  info: 'from-sky-500 to-sky-600',
  warning: 'from-amber-500 to-amber-600',
};

const Toast = ({ message, type = 'info', onClose, durationMs = 3500 }) => {
  useEffect(() => {
    if (!durationMs) return;
    const t = setTimeout(() => onClose?.(), durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  const Icon = ICONS[type] || Info;
  const gradient = STYLES[type] || STYLES.info;

  return (
    <div className="fixed bottom-4 right-4 z-[130] max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mt-1 -mr-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            aria-label="Închide notificarea"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
