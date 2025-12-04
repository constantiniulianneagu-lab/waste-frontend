// src/components/Sidebar.jsx
/**
 * ============================================================================
 * SIDEBAR MODERN - APPLE/SAMSUNG STYLE 2026 (FIXED)
 * ============================================================================
 * 
 * 🔧 FIXES:
 * ✅ User profile cu separator
 * ✅ Footer actions aliniate cu separator
 * ✅ Font SAMD mai mare
 * ✅ Subtitle cu majusculă corectă
 * ✅ Tooltip complet pentru "Tratare Mecano-Biologică"
 * ✅ Content resize corect (fără overlap)
 * 
 * ============================================================================
 */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "./dashboard/ThemeToggle";
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

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col z-50
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* HEADER - LOGO */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                SAMD
              </span>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight tracking-wide">
                Sistem avansat de
                <br />
                monitorizare deșeuri
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

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
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

                {/* Tooltip (collapsed) */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        
        {/* USER PROFILE */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS - THEME + LOGOUT + COLLAPSE */}
        <div className="p-2 space-y-1">
          
          {/* Theme Toggle */}
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
            {!isCollapsed && (
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Temă
              </span>
            )}
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />

          {/* Logout */}
          <button
            onClick={logout}
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
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

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Ieșire
              </div>
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
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

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Extinde
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;