// src/components/Sidebar.jsx
/**
 * ============================================================================
 * SIDEBAR PERFECT - FIX TOOLTIP OVERFLOW
 * ============================================================================
 * 
 * 🔧 FIX TOOLTIP:
 * ✅ overflow-visible pe nav (nu mai taie tooltips)
 * ✅ z-index 9999 pe tooltips (deasupra content)
 * ✅ Portal-style positioning
 * 
 * ============================================================================
 */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  BarChart3,
  Users,
  Building2,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Recycle,
} from "lucide-react";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Nu afișăm sidebar pe login sau dacă nu e user
  if (!user || location.pathname === "/login") return null;

  // ========================================================================
  // MENU ITEMS
  // ========================================================================

  const menuItems = [
    {
      title: "Depozitare",
      icon: BarChart3,
      path: "/dashboard/landfill",
      color: "emerald",
    },
    {
      title: "Tratare Mecano-Biologică",
      icon: Recycle,
      path: "/dashboard/tmb",
      color: "lime",
    },
    {
      title: "Rapoarte",
      icon: FileText,
      path: "/reports",
      color: "cyan",
    },
    {
      title: "Utilizatori",
      icon: Users,
      path: "/users",
      color: "violet",
    },
    {
      title: "Instituții",
      icon: Building2,
      path: "/institutions",
      color: "amber",
    },
  ];

  const colorClasses = {
    emerald: "text-emerald-500 dark:text-emerald-400",
    lime: "text-lime-500 dark:text-lime-400",
    cyan: "text-cyan-500 dark:text-cyan-400",
    violet: "text-violet-500 dark:text-violet-400",
    amber: "text-amber-500 dark:text-amber-400",
  };

  const isActive = (path) => 
    location.pathname === path || 
    location.pathname.startsWith(path + '/');

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col z-40
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* HEADER - LOGO */}
      <div className="h-[73px] flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            {/* Logo Text */}
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                SAMD
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight tracking-wide whitespace-nowrap">
                Sistem Avansat de Monitorizare Deșeuri
              </span>
            </div>
          </div>
        ) : (
          /* Collapsed Logo */
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mx-auto">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
        )}
      </div>

      {/* NAVIGATION - OVERFLOW VISIBLE PENTRU TOOLTIPS */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto overflow-x-visible">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                {/* Active indicator */}
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}

                {/* Icon */}
                <Icon
                  className={`
                    w-5 h-5 flex-shrink-0
                    ${active ? "text-white" : colorClasses[item.color]}
                  `}
                />

                {/* Label */}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.title}
                  </span>
                )}

                {/* Tooltip - Z-INDEX MARE + FIXED POSITION */}
                {isCollapsed && (
                  <div 
                    className="fixed left-[calc(80px+0.5rem)] px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl"
                    style={{ 
                      zIndex: 9999,
                      top: 'var(--tooltip-top, 0)',
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.parentElement.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--tooltip-top', `${rect.top + rect.height / 2 - 16}px`);
                    }}
                  >
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-2 space-y-1 overflow-visible">
        
        {/* Logout */}
        <button
          onClick={logout}
          className={`
            group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-700 dark:text-gray-300
            hover:bg-red-50 dark:hover:bg-red-900/20
            hover:text-red-600 dark:hover:text-red-400
            transition-all duration-200
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Ieșire</span>
          )}

          {/* Tooltip - FIXED POSITION */}
          {isCollapsed && (
            <div 
              className="fixed left-[calc(80px+0.5rem)] px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl"
              style={{ zIndex: 9999 }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                e.currentTarget.style.top = `${rect.top + rect.height / 2 - 16}px`;
              }}
            >
              Ieșire
            </div>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-200
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Restrânge</span>
            </>
          )}

          {/* Tooltip - FIXED POSITION */}
          {isCollapsed && (
            <div 
              className="fixed left-[calc(80px+0.5rem)] px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl"
              style={{ zIndex: 9999 }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.parentElement.getBoundingClientRect();
                e.currentTarget.style.top = `${rect.top + rect.height / 2 - 16}px`;
              }}
            >
              Extinde
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;