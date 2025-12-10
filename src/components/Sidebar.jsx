// src/components/Sidebar.jsx
/**
 * ============================================================================
 * SIDEBAR - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * Modern glassmorphism sidebar with perfect tooltips
 * 
 * ✅ Samsung One UI 7.0 rounded corners (14-20px)
 * ✅ Apple iOS 18 glassmorphism effects
 * ✅ Perfect tooltip positioning (fixed, z-index 9999)
 * ✅ Premium gradients and micro-interactions
 * ✅ Perfect light/dark mode adaptive colors
 * ✅ Smooth animations (300ms)
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
      gradient: "from-emerald-500 to-teal-600",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
    },
    {
      title: "Tratare Mecano-Biologică",
      icon: Recycle,
      path: "/dashboard/tmb",
      gradient: "from-lime-500 to-emerald-600",
      iconColor: "text-lime-500 dark:text-lime-400",
      hoverBg: "hover:bg-lime-50 dark:hover:bg-lime-500/10",
    },
    {
      title: "Rapoarte",
      icon: FileText,
      path: "/reports",
      gradient: "from-cyan-500 to-blue-600",
      iconColor: "text-cyan-500 dark:text-cyan-400",
      hoverBg: "hover:bg-cyan-50 dark:hover:bg-cyan-500/10",
    },
    {
      title: "Utilizatori",
      icon: Users,
      path: "/users",
      gradient: "from-violet-500 to-purple-600",
      iconColor: "text-violet-500 dark:text-violet-400",
      hoverBg: "hover:bg-violet-50 dark:hover:bg-violet-500/10",
    },
    {
      title: "Instituții",
      icon: Building2,
      path: "/institutions",
      gradient: "from-amber-500 to-orange-600",
      iconColor: "text-amber-500 dark:text-amber-400",
      hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-500/10",
    },
  ];

  const isActive = (path) => 
    location.pathname === path || 
    location.pathname.startsWith(path + '/');

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border-r border-gray-200/50 dark:border-gray-800/50
        transition-all duration-300 ease-in-out
        flex flex-col z-40
        shadow-sm dark:shadow-none
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* HEADER - LOGO - Premium Samsung style */}
      <div className="h-[89px] flex items-center justify-between px-4 
                    border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            {/* Logo Icon - Gradient badge */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 
                            rounded-[14px] blur-lg opacity-0 group-hover:opacity-30 
                            transition-opacity duration-500" />
              
              {/* Logo container */}
              <div className="relative w-11 h-11 rounded-[14px] 
                            bg-gradient-to-br from-emerald-500 to-teal-600 
                            flex items-center justify-center 
                            shadow-lg
                            group-hover:scale-105
                            transition-transform duration-300">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
            </div>
            
            {/* Logo Text */}
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold 
                           bg-gradient-to-r from-emerald-600 to-teal-600 
                           dark:from-emerald-400 dark:to-teal-400
                           bg-clip-text text-transparent
                           leading-tight">
                SAMD
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 
                           font-medium leading-tight tracking-wide whitespace-nowrap">
                Sistem Avansat de Monitorizare Deșeuri
              </span>
            </div>
          </div>
        ) : (
          // Collapsed Logo - Center aligned
          <div className="relative group mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 
                          rounded-[14px] blur-lg opacity-0 group-hover:opacity-30 
                          transition-opacity duration-500" />
            <div className="relative w-11 h-11 rounded-[14px] 
                          bg-gradient-to-br from-emerald-500 to-teal-600 
                          flex items-center justify-center 
                          shadow-lg
                          group-hover:scale-105
                          transition-transform duration-300">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION - OVERFLOW VISIBLE PENTRU TOOLTIPS */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-visible">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group relative flex items-center gap-3 px-3 py-3 
                  rounded-[14px]
                  transition-all duration-300
                  ${isCollapsed ? "justify-center" : ""}
                  ${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `text-gray-700 dark:text-gray-300 ${item.hoverBg}`
                  }
                `}
              >
                {/* Active indicator bar */}
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 
                                w-1 h-8 bg-white rounded-r-full" />
                )}

                {/* Icon container */}
                <div className={`
                  flex-shrink-0 
                  ${!active && 'group-hover:scale-110 transition-transform duration-300'}
                `}>
                  <Icon
                    className={`
                      w-5 h-5
                      ${active ? "text-white" : item.iconColor}
                    `}
                  />
                </div>

                {/* Label */}
                {!isCollapsed && (
                  <span className="text-sm font-semibold truncate">
                    {item.title}
                  </span>
                )}

                {/* Active glow effect */}
                {active && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} 
                                 rounded-[14px] opacity-0 group-hover:opacity-20 
                                 transition-opacity duration-300 -z-10`} />
                )}

                {/* Tooltip - FIXED POSITION, Z-INDEX 9999 */}
                {isCollapsed && (
                  <div 
                    className="fixed left-[calc(80px+0.75rem)] 
                             px-3 py-2 
                             bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl
                             text-white text-xs font-bold 
                             rounded-[12px] 
                             opacity-0 group-hover:opacity-100 
                             pointer-events-none 
                             transition-opacity duration-300
                             whitespace-nowrap 
                             shadow-2xl
                             border border-gray-700/50"
                    style={{ 
                      zIndex: 9999,
                    }}
                    onMouseEnter={(e) => {
                      const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
                      e.currentTarget.style.top = `${parentRect.top + parentRect.height / 2 - 20}px`;
                    }}
                  >
                    {item.title}
                    {/* Tooltip arrow */}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                                  w-2 h-2 rotate-45 
                                  bg-gray-900/95 dark:bg-gray-800/95 
                                  border-l border-b border-gray-700/50" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FOOTER - Logout & Collapse */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 
                    p-3 space-y-1.5 overflow-visible">
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className={`
            group relative w-full flex items-center gap-3 px-3 py-3 
            rounded-[14px]
            text-gray-700 dark:text-gray-300
            hover:bg-red-50 dark:hover:bg-red-500/10
            hover:text-red-600 dark:hover:text-red-400
            transition-all duration-300
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <LogOut className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold">Ieșire</span>
          )}

          {/* Tooltip - FIXED POSITION */}
          {isCollapsed && (
            <div 
              className="fixed left-[calc(80px+0.75rem)] 
                       px-3 py-2 
                       bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl
                       text-white text-xs font-bold 
                       rounded-[12px] 
                       opacity-0 group-hover:opacity-100 
                       pointer-events-none 
                       transition-opacity duration-300
                       whitespace-nowrap 
                       shadow-2xl
                       border border-gray-700/50"
              style={{ zIndex: 9999 }}
              onMouseEnter={(e) => {
                const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
                e.currentTarget.style.top = `${parentRect.top + parentRect.height / 2 - 20}px`;
              }}
            >
              Ieșire
              {/* Tooltip arrow */}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                            w-2 h-2 rotate-45 
                            bg-gray-900/95 dark:bg-gray-800/95 
                            border-l border-b border-gray-700/50" />
            </div>
          )}
        </button>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            group relative w-full flex items-center gap-3 px-3 py-3 
            rounded-[14px]
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-300
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold">Restrânge</span>
          )}

          {/* Tooltip - FIXED POSITION */}
          {isCollapsed && (
            <div 
              className="fixed left-[calc(80px+0.75rem)] 
                       px-3 py-2 
                       bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl
                       text-white text-xs font-bold 
                       rounded-[12px] 
                       opacity-0 group-hover:opacity-100 
                       pointer-events-none 
                       transition-opacity duration-300
                       whitespace-nowrap 
                       shadow-2xl
                       border border-gray-700/50"
              style={{ zIndex: 9999 }}
              onMouseEnter={(e) => {
                const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
                e.currentTarget.style.top = `${parentRect.top + parentRect.height / 2 - 20}px`;
              }}
            >
              Extinde
              {/* Tooltip arrow */}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                            w-2 h-2 rotate-45 
                            bg-gray-900/95 dark:bg-gray-800/95 
                            border-l border-b border-gray-700/50" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;