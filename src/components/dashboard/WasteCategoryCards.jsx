// src/components/dashboard/WasteCategoryCards.jsx
/**
 * ============================================================================
 * WASTE CATEGORY CARDS - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * 🎨 DESIGN PHILOSOPHY:
 * - Samsung One UI 7.0 inspired rounded corners & spacing
 * - Apple-style subtle shadows & frosted glass
 * - Perfect light/dark mode with system-aware colors
 * - Adaptive gradients that work in both themes
 * - Fluid animations & micro-interactions
 * 
 * 🌓 LIGHT/DARK MODE:
 * - Light: Soft whites, subtle grays, vibrant accents
 * - Dark: Deep blacks, muted grays, glowing accents
 * - Auto-adjusting opacity & contrast
 * 
 * 📊 FORMAT:
 * - Romanian number format: 1.234,56
 * - Badge + Icon → Description → Amount → Tickets → Progress
 * 
 * ============================================================================
 */

import React from "react";
import { Home, TreePine, Recycle, Building2, Package, TrendingUp } from "lucide-react";

const WasteCategoryCards = ({ categories = [], loading = false }) => {
  
  // ========================================================================
  // NUMBER FORMATTING - ROMANIAN STYLE
  // ========================================================================

  const formatNumberRO = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercent = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("ro-RO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(num);
  };

  // ========================================================================
  // WASTE ICONS - CONTEXTUAL & RECOGNIZABLE
  // ========================================================================

  const getWasteIcon = (wasteCode) => {
    if (wasteCode?.includes("20 03 01")) return <Home className="w-5 h-5" />;
    if (wasteCode?.includes("20 03 03")) return <TreePine className="w-5 h-5" />;
    if (wasteCode?.startsWith("19")) return <Recycle className="w-5 h-5" />;
    if (wasteCode?.startsWith("17")) return <Building2 className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  // ========================================================================
  // COLOR THEMES - SAMSUNG/APPLE INSPIRED
  // ========================================================================
  // Each category gets adaptive colors that work perfectly in both modes

  const getColorConfig = (index) => {
    const themes = [
      {
        // Purple/Violet - Samsung-inspired
        light: {
          gradient: "from-purple-500 via-violet-500 to-purple-600",
          iconBg: "bg-purple-100 dark:bg-purple-500/20",
          iconColor: "text-purple-600 dark:text-purple-400",
          badge: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30",
          badgeText: "text-purple-700 dark:text-purple-300",
          amount: "text-purple-600 dark:text-purple-400",
          bar: "bg-purple-500 dark:bg-purple-400",
          barBg: "bg-purple-100 dark:bg-purple-500/20",
          glow: "shadow-purple-500/20 dark:shadow-purple-400/20",
        }
      },
      {
        // Teal/Emerald - Apple-inspired
        light: {
          gradient: "from-teal-500 via-emerald-500 to-teal-600",
          iconBg: "bg-teal-100 dark:bg-teal-500/20",
          iconColor: "text-teal-600 dark:text-teal-400",
          badge: "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30",
          badgeText: "text-teal-700 dark:text-teal-300",
          amount: "text-teal-600 dark:text-teal-400",
          bar: "bg-teal-500 dark:bg-teal-400",
          barBg: "bg-teal-100 dark:bg-teal-500/20",
          glow: "shadow-teal-500/20 dark:shadow-teal-400/20",
        }
      },
      {
        // Orange/Amber - Warm & Energetic
        light: {
          gradient: "from-orange-500 via-amber-500 to-orange-600",
          iconBg: "bg-orange-100 dark:bg-orange-500/20",
          iconColor: "text-orange-600 dark:text-orange-400",
          badge: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30",
          badgeText: "text-orange-700 dark:text-orange-300",
          amount: "text-orange-600 dark:text-orange-400",
          bar: "bg-orange-500 dark:bg-orange-400",
          barBg: "bg-orange-100 dark:bg-orange-500/20",
          glow: "shadow-orange-500/20 dark:shadow-orange-400/20",
        }
      },
      {
        // Rose/Pink - Soft & Modern
        light: {
          gradient: "from-rose-500 via-pink-500 to-rose-600",
          iconBg: "bg-rose-100 dark:bg-rose-500/20",
          iconColor: "text-rose-600 dark:text-rose-400",
          badge: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30",
          badgeText: "text-rose-700 dark:text-rose-300",
          amount: "text-rose-600 dark:text-rose-400",
          bar: "bg-rose-500 dark:bg-rose-400",
          barBg: "bg-rose-100 dark:bg-rose-500/20",
          glow: "shadow-rose-500/20 dark:shadow-rose-400/20",
        }
      },
      {
        // Blue/Indigo - Professional & Trustworthy
        light: {
          gradient: "from-blue-500 via-indigo-500 to-blue-600",
          iconBg: "bg-blue-100 dark:bg-blue-500/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30",
          badgeText: "text-blue-700 dark:text-blue-300",
          amount: "text-blue-600 dark:text-blue-400",
          bar: "bg-blue-500 dark:bg-blue-400",
          barBg: "bg-blue-100 dark:bg-blue-500/20",
          glow: "shadow-blue-500/20 dark:shadow-blue-400/20",
        }
      },
    ];

    return themes[index % themes.length].light;
  };

  // ========================================================================
  // LOADING STATE - SAMSUNG SKELETON STYLE
  // ========================================================================

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-56 bg-gray-100 dark:bg-gray-800/50 rounded-[28px] animate-pulse 
                     border border-gray-200 dark:border-gray-700/50"
          />
        ))}
      </div>
    );
  }

  // ========================================================================
  // EMPTY STATE - MINIMAL & ELEGANT
  // ========================================================================

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] 
                    border border-gray-200 dark:border-gray-700/50 p-12 text-center
                    shadow-sm dark:shadow-none">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-700/50 
                      flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Nu există date pentru perioada selectată
        </p>
      </div>
    );
  }

  // ========================================================================
  // MAIN CARDS - 2026 PREMIUM DESIGN
  // ========================================================================

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.slice(0, 5).map((category, index) => {
        const colors = getColorConfig(index);
        const percentage = Math.min(Number(category.percentage_of_total || 0), 100);
        const totalTons = parseFloat(category.total_tons || 0);
        const ticketCount = parseInt(category.ticket_count, 10) || 0;

        return (
          <div
            key={category.waste_code || index}
            className="group relative"
          >
            {/* Card Container - Samsung One UI inspired radius */}
            <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                          rounded-[28px] border border-gray-200 dark:border-gray-700/50 
                          p-6 overflow-hidden
                          shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-xl
                          hover:border-gray-300 dark:hover:border-gray-600
                          transition-all duration-500 ease-out
                          hover:-translate-y-1 hover:scale-[1.02]">
              
              {/* Subtle gradient overlay - barely visible in light, soft glow in dark */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} 
                            opacity-[0.02] dark:opacity-[0.04] 
                            group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] 
                            transition-opacity duration-500`} />

              {/* Content wrapper */}
              <div className="relative z-10 h-full flex flex-col">
                
                {/* Header: Badge + Icon */}
                <div className="flex items-start justify-between mb-5">
                  
                  {/* Waste Code Badge - Apple-style subtle pill */}
                  <div className={`${colors.badge} rounded-full px-3 py-1.5 border`}>
                    <span className={`text-xs font-semibold ${colors.badgeText} tracking-wide`}>
                      {category.waste_code}
                    </span>
                  </div>

                  {/* Icon Container - Samsung One UI soft circles */}
                  <div className={`${colors.iconBg} rounded-[20px] p-2.5 
                                 backdrop-blur-sm transition-transform duration-300
                                 group-hover:scale-110`}>
                    <div className={colors.iconColor}>
                      {getWasteIcon(category.waste_code)}
                    </div>
                  </div>
                </div>

                {/* Waste Description - Clear hierarchy */}
                <div className="mb-5 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 
                               leading-snug line-clamp-2 min-h-[40px]">
                    {category.waste_description || category.category_name || "Necategorizat"}
                  </h3>
                </div>

                {/* Spacer to push metrics to bottom */}
                <div className="flex-grow" />

                {/* Metrics Section */}
                <div className="space-y-4">
                  
                  {/* Amount - Large & Prominent */}
                  <div>
                    <div className={`text-3xl font-bold ${colors.amount} tracking-tight`}>
                      {formatNumberRO(totalTons)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        tone
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        •
                      </span>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {ticketCount} {ticketCount === 1 ? "tichet" : "tichete"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div>
                    {/* Label + Percentage */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 
                                     uppercase tracking-widest">
                        Din Total
                      </span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-3 h-3 ${colors.iconColor}`} />
                        <span className={`text-sm font-bold ${colors.amount}`}>
                          {formatPercent(percentage)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar - iOS style smooth */}
                    <div className={`h-2 w-full overflow-hidden rounded-full ${colors.barBg}`}>
                      <div
                        className={`h-full ${colors.bar} rounded-full 
                                  transition-all duration-1000 ease-out
                                  shadow-sm ${colors.glow}`}
                        style={{ 
                          width: `${percentage}%`,
                          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator Dot - Samsung style */}
              <div className={`absolute top-4 left-4 w-1.5 h-1.5 rounded-full 
                            bg-gradient-to-br ${colors.gradient} 
                            opacity-40 dark:opacity-60 animate-pulse`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WasteCategoryCards;