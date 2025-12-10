// src/components/dashboard/SectorStatsTable.jsx
/**
 * ============================================================================
 * SECTOR STATS TABLE - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * 🎨 DESIGN PHILOSOPHY:
 * - Samsung One UI 7.0 card design with rounded corners
 * - Apple-style subtle shadows & smooth animations
 * - Perfect light/dark mode with adaptive colors
 * - Compact table layout without scroll (max 6 sectors)
 * - Premium gradients & micro-interactions
 * 
 * 🌓 LIGHT/DARK MODE:
 * - Light: Clean whites, soft grays, vibrant badges
 * - Dark: Deep background, muted borders, glowing accents
 * - System-aware color transitions
 * 
 * 📊 FEATURES:
 * - Sector badges with gradient colors
 * - Trend indicators (up/down)
 * - Romanian number formatting
 * - Hover effects & animations
 * - Total summary footer
 * 
 * ============================================================================
 */

import { TrendingUp, TrendingDown, MapPin } from "lucide-react";

/**
 * Sector color themes - adaptive for light/dark mode
 * Each sector gets unique, recognizable colors
 */
const sectorColorThemes = {
  1: {
    gradient: "from-violet-500 to-purple-600",
    badge: "bg-violet-100 dark:bg-violet-500/20",
    badgeText: "text-violet-700 dark:text-violet-300",
    glow: "shadow-violet-500/20 dark:shadow-violet-400/20",
  },
  2: {
    gradient: "from-slate-400 to-gray-500",
    badge: "bg-slate-100 dark:bg-slate-500/20",
    badgeText: "text-slate-700 dark:text-slate-300",
    glow: "shadow-slate-500/20 dark:shadow-slate-400/20",
  },
  3: {
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-100 dark:bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    glow: "shadow-emerald-500/20 dark:shadow-emerald-400/20",
  },
  4: {
    gradient: "from-amber-500 to-orange-600",
    badge: "bg-amber-100 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    glow: "shadow-amber-500/20 dark:shadow-amber-400/20",
  },
  5: {
    gradient: "from-pink-500 to-rose-600",
    badge: "bg-pink-100 dark:bg-pink-500/20",
    badgeText: "text-pink-700 dark:text-pink-300",
    glow: "shadow-pink-500/20 dark:shadow-pink-400/20",
  },
  6: {
    gradient: "from-cyan-500 to-blue-600",
    badge: "bg-cyan-100 dark:bg-cyan-500/20",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    glow: "shadow-cyan-500/20 dark:shadow-cyan-400/20",
  },
};

const SectorStatsTable = ({ data = [], loading = false }) => {
  
  // Calculate total tons
  const total = data.reduce((sum, s) => sum + (Number(s.total_tons) || 0), 0);

  // ========================================================================
  // LOADING STATE - SAMSUNG SKELETON STYLE
  // ========================================================================

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] 
                    border border-gray-200 dark:border-gray-700/50 p-6 h-full
                    shadow-sm dark:shadow-none">
        
        {/* Header skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-5 w-48 rounded-lg bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
          <div className="h-3 w-64 rounded-lg bg-gray-100 dark:bg-gray-700/30 animate-pulse" />
        </div>

        {/* Table header skeleton */}
        <div className="grid grid-cols-[2fr,1.2fr,1fr] gap-3 pb-3 mb-3 border-b border-gray-200 dark:border-gray-700/50">
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700/50 animate-pulse ml-auto" />
          <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700/50 animate-pulse ml-auto" />
        </div>

        {/* Rows skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-[20px] bg-gray-100 dark:bg-gray-700/30 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // MAIN TABLE - 2026 PREMIUM DESIGN
  // ========================================================================

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] 
                  border border-gray-200 dark:border-gray-700/50 p-6 h-full flex flex-col
                  shadow-sm dark:shadow-none">
      
      {/* Header Section */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Cantități per sector
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Distribuția cantităților pe sectoare (tone)
            </p>
          </div>
        </div>
      </div>

      {/* Table Header - Minimalist */}
      <div className="grid grid-cols-[2fr,1.2fr,1fr] gap-3 pb-3 mb-3 
                    border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 
                       uppercase tracking-wider">
          Sector
        </span>
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 
                       uppercase tracking-wider text-right">
          Cantitate
        </span>
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 
                       uppercase tracking-wider text-right">
          Trend
        </span>
      </div>

      {/* Rows Container - No scroll, max 6 sectors */}
      <div className="space-y-2 flex-1 overflow-hidden">
        {data.slice(0, 6).map((sector, index) => {
          const theme = sectorColorThemes[sector.sector_number] || sectorColorThemes[1];
          const positive = (sector.variation_percent || 0) >= 0;
          const variation = Math.abs(Number(sector.variation_percent || 0));

          return (
            <div
              key={sector.sector_id || index}
              className="group relative"
            >
              {/* Row Container - Samsung One UI style */}
              <div className="relative grid grid-cols-[2fr,1.2fr,1fr] gap-3 items-center 
                          px-4 py-3.5 rounded-[20px] 
                          bg-gray-50 dark:bg-gray-900/30
                          border border-gray-200 dark:border-gray-700/50
                          hover:bg-gray-100 dark:hover:bg-gray-900/50
                          hover:border-gray-300 dark:hover:border-gray-600
                          hover:shadow-md dark:hover:shadow-lg
                          transition-all duration-300 ease-out
                          hover:-translate-y-0.5">
                
                {/* Accent Bar - Left edge indicator */}
                <div className={`absolute inset-y-0 left-0 w-1 rounded-l-[20px] 
                              bg-gradient-to-b ${theme.gradient} 
                              opacity-60 group-hover:opacity-100
                              transition-opacity duration-300`} />

                {/* Sector Badge + Info */}
                <div className="flex items-center gap-3 pl-1">
                  {/* Sector Number Badge - Samsung soft circles */}
                  <div className={`relative w-10 h-10 rounded-[16px] 
                                flex items-center justify-center
                                bg-gradient-to-br ${theme.gradient}
                                shadow-md ${theme.glow}
                                group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-sm font-bold text-white">
                      {sector.sector_number}
                    </span>
                  </div>

                  {/* Sector Details */}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Sector {sector.sector_number}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 
                                   flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sector.city || "București"}
                    </span>
                  </div>
                </div>

                {/* Quantity - Prominent display */}
                <div className="text-right">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {sector.total_tons_formatted ??
                      Number(sector.total_tons || 0).toLocaleString("ro-RO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </span>
                  <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                    tone
                  </div>
                </div>

                {/* Variation Badge - iOS style pills */}
                <div className="text-right">
                  <span
                    className={`inline-flex items-center justify-center gap-1 
                              px-3 py-1.5 rounded-full text-xs font-semibold
                              transition-all duration-300
                              ${
                                positive
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                                  : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                              }`}
                  >
                    {positive ? (
                      <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    {variation.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Total - Prominent summary */}
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0">
        <div className="grid grid-cols-[2fr,1.2fr,1fr] gap-3 items-center">
          
          {/* Total Label */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-[16px] 
                          bg-gradient-to-br from-indigo-500 to-purple-600
                          flex items-center justify-center shadow-md">
              <span className="text-xs font-bold text-white">Σ</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Total București
            </span>
          </div>

          {/* Total Amount - Extra prominent */}
          <div className="text-right">
            <div className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 
                          bg-clip-text text-transparent">
              {total.toLocaleString("ro-RO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
              tone totale
            </div>
          </div>

          {/* Empty cell for alignment */}
          <div />
        </div>
      </div>
    </div>
  );
};

export default SectorStatsTable;