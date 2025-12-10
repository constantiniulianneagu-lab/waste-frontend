// src/components/dashboard/TopOperatorsTable.jsx
/**
 * ============================================================================
 * TOP OPERATORS TABLE - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * 🎨 DESIGN PHILOSOPHY:
 * - Samsung One UI 7.0 card design with smooth scrolling
 * - Apple-style sector badges with vibrant colors
 * - Perfect light/dark mode with adaptive gradients
 * - Elegant progress bars without percentage labels
 * - Premium hover effects & micro-interactions
 * 
 * 🌓 LIGHT/DARK MODE:
 * - Light: Clean whites, soft shadows, vibrant sector badges
 * - Dark: Deep backgrounds, glowing accents, muted borders
 * - Smooth color transitions throughout
 * 
 * 📊 FEATURES:
 * - Multi-sector badge support (max 3 visible + overflow)
 * - Smooth progress bars with gradient colors
 * - Scrollable list with custom scrollbar
 * - Romanian number formatting
 * - Hover effects with accent lines
 * 
 * ============================================================================
 */

import React from "react";
import { Building2, TrendingUp } from "lucide-react";

/**
 * Sector color themes - adaptive for light/dark mode
 * Vibrant and recognizable across both themes
 */
const sectorColorThemes = {
  1: {
    badge: "bg-gradient-to-br from-violet-500 to-purple-600",
    badgeLight: "bg-violet-100 dark:bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    progress: "bg-gradient-to-r from-violet-500 to-purple-500",
    glow: "shadow-violet-500/20 dark:shadow-violet-400/20",
  },
  2: {
    badge: "bg-gradient-to-br from-slate-400 to-gray-500",
    badgeLight: "bg-slate-100 dark:bg-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    progress: "bg-gradient-to-r from-slate-400 to-gray-500",
    glow: "shadow-slate-500/20 dark:shadow-slate-400/20",
  },
  3: {
    badge: "bg-gradient-to-br from-emerald-500 to-teal-600",
    badgeLight: "bg-emerald-100 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    progress: "bg-gradient-to-r from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/20 dark:shadow-emerald-400/20",
  },
  4: {
    badge: "bg-gradient-to-br from-amber-500 to-orange-600",
    badgeLight: "bg-amber-100 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    progress: "bg-gradient-to-r from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20 dark:shadow-amber-400/20",
  },
  5: {
    badge: "bg-gradient-to-br from-pink-500 to-rose-600",
    badgeLight: "bg-pink-100 dark:bg-pink-500/20",
    text: "text-pink-600 dark:text-pink-400",
    progress: "bg-gradient-to-r from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20 dark:shadow-pink-400/20",
  },
  6: {
    badge: "bg-gradient-to-br from-cyan-500 to-blue-600",
    badgeLight: "bg-cyan-100 dark:bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    progress: "bg-gradient-to-r from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/20 dark:shadow-cyan-400/20",
  },
};

const TopOperatorsTable = ({ data = [], loading = false }) => {
  
  // Helper to get color config for sector
  const getColorConfig = (sectorNum) =>
    sectorColorThemes[sectorNum] || sectorColorThemes[1];

  // ========================================================================
  // LOADING STATE - SAMSUNG SKELETON STYLE
  // ========================================================================
  
  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-[28px] 
                    border border-gray-200 dark:border-gray-700/50 
                    bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                    p-6 shadow-sm dark:shadow-none">
        
        {/* Header skeleton */}
        <div className="mb-6 flex-shrink-0 space-y-2">
          <div className="h-5 w-52 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700/50" />
          <div className="h-3 w-72 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/30" />
        </div>

        {/* List skeleton */}
        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[20px] bg-gray-100 dark:bg-gray-700/30"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // CALCULATE TOTAL (for progress bars)
  // ========================================================================
  
  const totalTons = data.reduce((sum, op) => sum + (op.total_tons || 0), 0);

  // ========================================================================
  // MAIN RENDER - 2026 PREMIUM DESIGN
  // ========================================================================

  return (
    <div className="flex h-[600px] flex-col rounded-[28px] 
                  border border-gray-200 dark:border-gray-700/50 
                  bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                  p-6 shadow-sm dark:shadow-none">
      
      {/* ====================================================================
          HEADER SECTION
      ==================================================================== */}
      <div className="mb-5 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Top operatori salubrizare
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Cantități depozitate în perioada selectată
            </p>
          </div>
          
          {/* Stats badge */}
          {data.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full px-3 py-1.5 
                          border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {data.length} {data.length === 1 ? "operator" : "operatori"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          SCROLLABLE LIST - CUSTOM SCROLLBAR
      ==================================================================== */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden 
                    pr-2 max-h-[470px] custom-scrollbar">
        
        {data.map((operator, idx) => {
          // Extract sectors
          const sectors = operator.sector_numbers || operator.sectors || [1];
          const firstSectorNum = sectors[0] || 1;
          const colorConfig = getColorConfig(firstSectorNum);

          // Calculate progress percentage
          const percentage = totalTons > 0 
            ? ((operator.total_tons || 0) / totalTons) * 100 
            : 0;

          return (
            <div
              key={operator.institution_id || idx}
              className="group relative"
            >
              {/* Card Container - Samsung One UI style */}
              <div className="relative flex flex-col gap-2.5 rounded-[20px] 
                          border border-gray-200 dark:border-gray-700/50 
                          bg-gray-50 dark:bg-gray-900/30 
                          px-4 py-3.5 
                          hover:bg-white dark:hover:bg-gray-900/50
                          hover:border-gray-300 dark:hover:border-gray-600
                          hover:shadow-md dark:hover:shadow-lg
                          transition-all duration-300 ease-out
                          hover:-translate-y-0.5">
                
                {/* Accent Line - Left edge (appears on hover) */}
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-[20px] 
                            bg-gradient-to-b from-emerald-500 to-teal-500 
                            opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300" />

                {/* ============================================================
                    ROW 1: SECTOR BADGES + OPERATOR INFO + AMOUNT
                ============================================================ */}
                <div className="flex items-center gap-3 pl-1">
                  
                  {/* Sector Badges Container */}
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {sectors.slice(0, 3).map((sectorNum, i) => {
                      const cfg = getColorConfig(sectorNum);
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-center 
                                    w-8 h-8 rounded-[12px] ${cfg.badge} 
                                    shadow-sm ${cfg.glow}
                                    group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-xs font-bold text-white">
                            {sectorNum}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Overflow indicator */}
                    {sectors.length > 3 && (
                      <div className="flex items-center justify-center 
                                    w-8 h-8 rounded-[12px] 
                                    border-2 border-dashed border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-800/50">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          +{sectors.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Operator Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white 
                                truncate leading-tight mb-0.5">
                      {operator.institution_name}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 
                                flex items-center gap-1">
                      <span className="opacity-50">Sector</span>
                      <span className="font-semibold">
                        {operator.sector_numbers_display || sectors.join(", ")}
                      </span>
                    </p>
                  </div>

                  {/* Amount Display */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${colorConfig.text} leading-tight`}>
                      {operator.total_tons_formatted ||
                        operator.total_tons?.toLocaleString("ro-RO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                      tone
                    </div>
                  </div>
                </div>

                {/* ============================================================
                    ROW 2: PROGRESS BAR (no percentage label)
                ============================================================ */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 
                            rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorConfig.progress} rounded-full 
                              shadow-sm ${colorConfig.glow}
                              transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${percentage}%`,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>

                {/* Performance indicator (subtle badge) */}
                {idx < 3 && (
                  <div className="absolute top-3 right-3 
                              bg-gradient-to-br from-amber-400 to-orange-500 
                              rounded-full w-6 h-6 flex items-center justify-center
                              shadow-md shadow-amber-500/30">
                    <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ================================================================
            EMPTY STATE
        ================================================================ */}
        {data.length === 0 && (
          <div className="flex flex-1 items-center justify-center flex-col gap-3 
                        py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 
                          flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Nu există operatori pentru perioada selectată
            </p>
          </div>
        )}
      </div>

      {/* ====================================================================
          FOOTER SUMMARY
      ==================================================================== */}
      {data.length > 0 && (
        <div className="mt-4 flex-shrink-0 rounded-[20px] 
                      border border-gray-200 dark:border-gray-700/50 
                      bg-gradient-to-br from-gray-50 to-gray-100 
                      dark:from-gray-900/30 dark:to-gray-900/50 
                      px-4 py-3 
                      flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] 
                          bg-gradient-to-br from-indigo-500 to-purple-600 
                          flex items-center justify-center shadow-md">
              <span className="text-xs font-bold text-white">Σ</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                Total operatori
              </p>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                în perioada selectată
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 
                        bg-clip-text text-transparent">
              {data.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopOperatorsTable;

// ============================================================================
// CUSTOM SCROLLBAR STYLES (add to global CSS or Tailwind)
// ============================================================================
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
*/