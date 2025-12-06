// src/components/dashboard/DashboardHeader.jsx
/**
 * ============================================================================
 * DASHBOARD HEADER - UNIVERSAL (DEPOZITARE + TMB + RAPOARTE)
 * ============================================================================
 * 
 * 🎨 FEATURES:
 * ✅ Titlu dinamic prin prop "title"
 * ✅ Default: "Dashboard Depozitarea deșeurilor"
 * ✅ Poate fi schimbat pentru TMB, Rapoarte, etc.
 * ✅ Click pe profil → navighează la /profile
 * 
 * ============================================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADĂUGAT
import { Search, Bell } from "lucide-react";
import { useAuth } from "../../AuthContext";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

const DashboardHeader = ({ 
  notificationCount = 0, 
  onSearchChange,
  title = "Dashboard Depozitarea deșeurilor"  // ✅ Titlu dinamic
}) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate(); // ✅ ADĂUGAT
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
      INSTITUTION_ADMIN: "Administrator Instituție",
      OPERATOR_ADMIN: "Administrator Operator",
      OPERATOR_USER: "Utilizator Operator",
      VIEWER: "Vizualizator",
      PLATFORM_ADMIN: "Administrator Platformă", // ✅ ADĂUGAT
      ADMIN_INSTITUTION: "Administrator Instituție", // ✅ ADĂUGAT
      EDITOR_INSTITUTION: "Editor Instituție", // ✅ ADĂUGAT
      REGULATOR_VIEWER: "Vizualizator", // ✅ ADĂUGAT
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
  // RENDER
  // ========================================================================

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* STÂNGA: Titlu Dashboard (DINAMIC) */}
          <div className="flex-shrink-0">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
          </div>

          {/* DREAPTA: Search + Notificări + Theme + Profil */}
          <div className="flex items-center gap-2 lg:gap-3">
            
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 min-w-[240px] lg:min-w-[280px] transition-all hover:bg-gray-150 dark:hover:bg-gray-800 focus-within:ring-2 focus-within:ring-emerald-500/50">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Caută..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
              />
            </div>

            {/* Search Icon (Mobile) */}
            <button
              type="button"
              className="md:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all"
              aria-label="Căutare"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notificări cu badge */}
            <button
              type="button"
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all group"
              aria-label="Notificări"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1.5 shadow-lg animate-pulse">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Theme Toggle - COMPACT */}
            <ThemeToggle />

            {/* Separator subtil */}
            <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-gray-700/50" />

            {/* Profil utilizator - ✅ CLICK → /profile */}
            <button
              type="button"
              onClick={() => navigate('/profile')} // ✅ ADĂUGAT
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all group cursor-pointer"
              title="Profil utilizator"
            >
              {/* Avatar cu inițiale gradient ECO */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white text-sm font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                {/* Status indicator green (online) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
              </div>

              {/* Info user (hidden pe tablet/mobile) */}
              <div className="hidden xl:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                  {user?.firstName || user?.first_name || ""} {user?.lastName || user?.last_name || ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRole(user?.role)}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;