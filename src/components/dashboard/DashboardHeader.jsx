// src/components/dashboard/DashboardHeader.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Download, X, AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import ThemeToggle from './ThemeToggle';

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================
const NotificationItem = ({ notif, onNavigate }) => {
  const severityConfig = {
    urgent:  { bg: 'bg-red-50 dark:bg-red-900/20',    border: 'border-red-200 dark:border-red-800',    dot: 'bg-red-500',    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,     label: 'text-red-600 dark:text-red-400' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500',  icon: <Clock className="w-4 h-4 text-amber-500" />,          label: 'text-amber-600 dark:text-amber-400' },
    info:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   dot: 'bg-blue-500',   icon: <Info className="w-4 h-4 text-blue-500" />,            label: 'text-blue-600 dark:text-blue-400' },
  };
  const cfg = severityConfig[notif.severity] || severityConfig.info;

  return (
    <div
      onClick={() => onNavigate(notif.link)}
      className={`flex items-start gap-3 px-4 py-3 rounded-[14px] border cursor-pointer
                  ${cfg.bg} ${cfg.border}
                  hover:brightness-95 dark:hover:brightness-110
                  transition-all duration-200 group`}
    >
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${cfg.label} leading-tight`}>{notif.title}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-tight line-clamp-2">
          {notif.message}
        </p>
      </div>
      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

// ============================================================================
// NOTIFICATIONS DROPDOWN
// ============================================================================
const NotificationsDropdown = ({ notifications, counts, loading, onClose, onNavigate }) => {
  const grouped = {
    urgent:  notifications.filter(n => n.severity === 'urgent'),
    warning: notifications.filter(n => n.severity === 'warning'),
    info:    notifications.filter(n => n.severity === 'info'),
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] z-50
                    bg-white dark:bg-gray-900
                    border border-gray-200 dark:border-gray-700
                    rounded-[20px] shadow-2xl
                    overflow-hidden">

      {/* Header dropdown */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Notificari
          </span>
          {counts.total > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {counts.total}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Badges sumar */}
      {counts.total > 0 && (
        <div className="flex gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          {counts.urgent > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 
                           text-red-700 dark:text-red-400 text-[10px] font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {counts.urgent} urgente
            </span>
          )}
          {counts.warning > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 
                           text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {counts.warning} atentionari
            </span>
          )}
          {counts.info > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 
                           text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {counts.info} informatii
            </span>
          )}
        </div>
      )}

      {/* Lista notificari */}
      <div className="overflow-y-auto max-h-[420px] p-3 space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && counts.total === 0 && (
          <div className="text-center py-8">
            <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Nicio notificare noua
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Toate contractele sunt in regula
            </p>
          </div>
        )}

        {/* Urgente */}
        {grouped.urgent.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider px-1 mb-1.5">
              Urgente — expira in mai putin de 30 zile
            </p>
            <div className="space-y-1.5">
              {grouped.urgent.map(n => (
                <NotificationItem key={n.id} notif={n} onNavigate={(link) => { onNavigate(link); onClose(); }} />
              ))}
            </div>
          </div>
        )}

        {/* Atentionari */}
        {grouped.warning.length > 0 && (
          <div className={grouped.urgent.length > 0 ? 'mt-3' : ''}>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider px-1 mb-1.5">
              Atentionari
            </p>
            <div className="space-y-1.5">
              {grouped.warning.map(n => (
                <NotificationItem key={n.id} notif={n} onNavigate={(link) => { onNavigate(link); onClose(); }} />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        {grouped.info.length > 0 && (
          <div className={(grouped.urgent.length > 0 || grouped.warning.length > 0) ? 'mt-3' : ''}>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider px-1 mb-1.5">
              Informatii
            </p>
            <div className="space-y-1.5">
              {grouped.info.map(n => (
                <NotificationItem key={n.id} notif={n} onNavigate={(link) => { onNavigate(link); onClose(); }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Actualizat automat la fiecare 5 minute
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD HEADER - MAIN COMPONENT
// ============================================================================
const DashboardHeader = ({
  onSearchChange,
  title = 'Dashboard Depozitarea deseurilor',
  onExport,
  exporting = false,
}) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { notifications, counts, loading } = useNotifications();

  // Inchide dropdown la click in afara
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getUserInitials = () => {
    if (!user) return '?';
    const f = (user.firstName || user.first_name || '').charAt(0).toUpperCase();
    const l = (user.lastName  || user.last_name  || '').charAt(0).toUpperCase();
    return `${f}${l}` || 'U';
  };

  const formatRole = (role) => ({
    PLATFORM_ADMIN:    'Administrator Platforma',
    ADMIN_INSTITUTION: 'Administrator Institutie',
    EDITOR_INSTITUTION:'Editor Institutie',
    REGULATOR_VIEWER:  'Autoritate publica',
  }[role] || role || 'Utilizator');

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchQuery(v);
    if (onSearchChange) onSearchChange(v);
  };

  // Badge color: rosu daca urgent > 0, altfel galben
  const badgeColor = counts.urgent > 0
    ? 'bg-gradient-to-r from-red-500 to-rose-600'
    : 'bg-gradient-to-r from-amber-400 to-orange-500';

  return (
    <header className="sticky top-0 z-50
                       backdrop-blur-xl
                       bg-white/80 dark:bg-gray-900/80
                       border-b border-gray-200/50 dark:border-gray-700/50
                       shadow-sm dark:shadow-none">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* STANGA: Titlu */}
          <div className="flex-shrink-0">
            <h1 className="text-xl lg:text-2xl font-bold
                           bg-gradient-to-r from-emerald-600 to-teal-600
                           dark:from-emerald-400 dark:to-teal-400
                           bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
          </div>

          {/* DREAPTA */}
          <div className="flex items-center gap-2 lg:gap-3">

            {/* Search Bar Desktop */}
            <div className="hidden md:flex items-center gap-2
                            bg-gray-100 dark:bg-gray-800/50
                            rounded-[16px] px-4 py-2.5
                            min-w-[240px] lg:min-w-[280px]
                            transition-all duration-300
                            hover:bg-gray-150 dark:hover:bg-gray-800
                            focus-within:ring-2 focus-within:ring-emerald-500/30
                            focus-within:bg-white dark:focus-within:bg-gray-800">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cauta..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none
                           text-sm text-gray-700 dark:text-gray-200
                           placeholder-gray-400 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); if (onSearchChange) onSearchChange(''); }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Icon Mobile */}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-[14px]
                         bg-gray-100 dark:bg-gray-800/50
                         hover:bg-gray-200 dark:hover:bg-gray-700
                         text-gray-600 dark:text-gray-300
                         transition-all duration-300 active:scale-95"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* NOTIFICARI cu dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(prev => !prev)}
                className={`relative p-2.5 rounded-[14px]
                           bg-gray-100 dark:bg-gray-800/50
                           hover:bg-gray-200 dark:hover:bg-gray-700
                           text-gray-600 dark:text-gray-300
                           transition-all duration-300 active:scale-95 group
                           ${notifOpen ? 'ring-2 ring-emerald-500/40' : ''}`}
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />

                {counts.total > 0 && (
                  <>
                    <span className={`absolute -top-1 -right-1
                                     min-w-[20px] h-5
                                     ${badgeColor}
                                     rounded-full flex items-center justify-center
                                     text-white text-[10px] font-bold px-1.5 shadow-lg`}>
                      {counts.total > 9 ? '9+' : counts.total}
                    </span>
                    {counts.urgent > 0 && (
                      <span className="absolute -top-1 -right-1
                                       w-5 h-5 bg-red-500 rounded-full
                                       animate-ping opacity-40" />
                    )}
                  </>
                )}
              </button>

              {notifOpen && (
                <NotificationsDropdown
                  notifications={notifications}
                  counts={counts}
                  loading={loading}
                  onClose={() => setNotifOpen(false)}
                  onNavigate={(link) => navigate(link)}
                />
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Export PDF */}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                disabled={exporting}
                className="relative p-2.5 rounded-[14px]
                           bg-gradient-to-r from-blue-500 to-cyan-600
                           hover:from-blue-600 hover:to-cyan-700
                           text-white transition-all duration-300
                           active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed
                           group shadow-lg shadow-blue-500/20"
                title={exporting ? 'Generare...' : 'Export PDF'}
              >
                <Download className={`w-5 h-5 group-hover:scale-110 transition-transform duration-300 ${exporting ? 'animate-bounce' : ''}`} />
              </button>
            )}

            {/* Separator */}
            <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-gray-700/50" />

            {/* Profil */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 px-3 py-2 rounded-[16px]
                         hover:bg-gray-100 dark:hover:bg-gray-800/50
                         transition-all duration-300 active:scale-98 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-[14px]
                                bg-gradient-to-br from-emerald-500 to-teal-600
                                flex items-center justify-center shadow-lg
                                group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <span className="text-white text-sm font-bold">{getUserInitials()}</span>
                </div>
                <div className="absolute bottom-0 right-0">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-40" />
                  </div>
                </div>
              </div>

              <div className="hidden xl:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight
                              group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {user?.firstName || user?.first_name || ''} {user?.lastName || user?.last_name || ''}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRole(user?.role)}
                </p>
              </div>

              <div className="hidden xl:block">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                               group-hover:translate-x-0.5 transition-all"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;