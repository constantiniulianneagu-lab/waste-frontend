// src/components/dashboard/DashboardHeader.jsx
/**
 * ============================================================================
 * DASHBOARD HEADER - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * Modern glassmorphism header with perfect light/dark mode
 * 
 * 🎨 FEATURES:
 * ✅ Titlu dinamic prin prop "title"
 * ✅ Default: "Dashboard Depozitarea deșeurilor"
 * ✅ Poate fi schimbat pentru TMB, Rapoarte, etc.
 * ✅ Click pe profil → navighează la /profile
 * ✅ Samsung One UI 7.0 rounded corners
 * ✅ Apple iOS 18 glassmorphism
 * 
 * ============================================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../../AuthContext";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

const DashboardHeader = ({ 
  notificationCount = 0, 
  onSearchChange,
  title = "Dashboard Depozitarea deșeurilor"
}) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // ========================================================================
  // GENERARE INIȚIALE USER
  // ========================================================================

  const getUserInitials = () => {
    if (!user) return "?";
    
    const firstName = user.firstName || user.first_name || "";
    const lastName = user.lastName || user.last_name || "";
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return `${firstInitial}${lastInitial}` || "U";
  };

  // ========================================================================
  // FORMAT ROLE ROMÂNESC
  // ========================================================================

  const formatRole = (role) => {
    const roleMap = {
      SUPER_ADMIN: "Super Administrator",
      ADMIN_INSTITUTION: "Administrator Instituție",
      OPERATOR_ADMIN: "Administrator Operator",
      OPERATOR_USER: "Utilizator Operator",
      VIEWER: "Vizualizator",
      PLATFORM_ADMIN: "Administrator Platformă",
      ADMIN_INSTITUTION: "Administrator Instituție",
      EDITOR_INSTITUTION: "Editor Instituție",
      REGULATOR_VIEWER: "Vizualizator",
    };
    return roleMap[role] || role || "Utilizator";
  };

  // ========================================================================
  // SEARCH HANDLER
  // ========================================================================

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // ========================================================================
  // RENDER - MODERN STYLE
  // ========================================================================

  return (
    <header className="sticky top-0 z-50 
                     backdrop-blur-xl 
                     bg-white/80 dark:bg-gray-900/80 
                     border-b border-gray-200/50 dark:border-gray-700/50 
                     shadow-sm dark:shadow-none">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* STÂNGA: Titlu Dashboard (DINAMIC) */}
          <div className="flex-shrink-0">
            <h1 className="text-xl lg:text-2xl font-bold 
                         bg-gradient-to-r from-emerald-600 to-teal-600 
                         dark:from-emerald-400 dark:to-teal-400 
                         bg-clip-text text-transparent 
                         tracking-tight">
              {title}
            </h1>
          </div>

          {/* DREAPTA: Search + Notificări + Theme + Profil */}
          <div className="flex items-center gap-2 lg:gap-3">
            
            {/* Search Bar (Desktop) - Samsung rounded style */}
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
                placeholder="Caută..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none 
                         text-sm text-gray-700 dark:text-gray-200 
                         placeholder-gray-400 w-full"
              />
            </div>

            {/* Search Icon (Mobile) - Samsung rounded button */}
            <button
              type="button"
              className="md:hidden 
                       p-2.5 rounded-[14px] 
                       bg-gray-100 dark:bg-gray-800/50 
                       hover:bg-gray-200 dark:hover:bg-gray-700 
                       text-gray-600 dark:text-gray-300 
                       transition-all duration-300
                       active:scale-95"
              aria-label="Căutare"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notificări cu badge - Premium style */}
            <button
              type="button"
              className="relative 
                       p-2.5 rounded-[14px] 
                       bg-gray-100 dark:bg-gray-800/50 
                       hover:bg-gray-200 dark:hover:bg-gray-700 
                       text-gray-600 dark:text-gray-300 
                       transition-all duration-300
                       active:scale-95
                       group"
              aria-label="Notificări"
            >
              <Bell className="w-5 h-5 
                             group-hover:scale-110 
                             transition-transform duration-300" />
              {notificationCount > 0 && (
                <>
                  {/* Badge with pulse animation */}
                  <span className="absolute -top-1 -right-1 
                                 min-w-[20px] h-5 
                                 bg-gradient-to-r from-red-500 to-rose-600 
                                 rounded-full 
                                 flex items-center justify-center 
                                 text-white text-[10px] font-bold 
                                 px-1.5 shadow-lg">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                  {/* Pulse ring */}
                  <span className="absolute -top-1 -right-1 
                                 w-5 h-5 
                                 bg-red-500 
                                 rounded-full 
                                 animate-ping 
                                 opacity-40" />
                </>
              )}
            </button>

            {/* Theme Toggle - COMPACT */}
            <ThemeToggle />

            {/* Separator subtil */}
            <div className="hidden lg:block 
                          w-px h-10 
                          bg-gray-200 dark:bg-gray-700/50" />

            {/* Profil utilizator - Premium card style */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 
                       px-3 py-2 rounded-[16px] 
                       hover:bg-gray-100 dark:hover:bg-gray-800/50 
                       transition-all duration-300
                       active:scale-98
                       group cursor-pointer"
              title="Profil utilizator"
            >
              {/* Avatar cu inițiale gradient ECO - Samsung style */}
              <div className="relative">
                <div className="w-10 h-10 rounded-[14px] 
                              bg-gradient-to-br from-emerald-500 to-teal-600 
                              flex items-center justify-center 
                              shadow-lg 
                              group-hover:shadow-xl 
                              group-hover:scale-105
                              transition-all duration-300">
                  <span className="text-white text-sm font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                
                {/* Status indicator green (online) - with pulse */}
                <div className="absolute bottom-0 right-0">
                  <div className="relative">
                    {/* Static dot */}
                    <div className="w-3 h-3 bg-emerald-400 rounded-full 
                                  border-2 border-white dark:border-gray-900" />
                    {/* Pulse ring */}
                    <div className="absolute inset-0 w-3 h-3 
                                  bg-emerald-400 rounded-full 
                                  animate-ping opacity-40" />
                  </div>
                </div>
              </div>

              {/* Info user (hidden pe tablet/mobile) */}
              <div className="hidden xl:block text-left">
                <p className="text-sm font-semibold 
                           text-gray-900 dark:text-white 
                           leading-tight
                           group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                           transition-colors">
                  {user?.firstName || user?.first_name || ""} {user?.lastName || user?.last_name || ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRole(user?.role)}
                </p>
              </div>

              {/* Chevron indicator (subtle) */}
              <div className="hidden xl:block">
                <svg 
                  className="w-4 h-4 text-gray-400 
                           group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                           group-hover:translate-x-0.5
                           transition-all" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
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