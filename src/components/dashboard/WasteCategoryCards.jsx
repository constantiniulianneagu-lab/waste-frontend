// src/components/dashboard/WasteCategoryCards.jsx
/**
 * ============================================================================
 * WASTE CATEGORY CARDS - FINAL VERSION (LIGHT MODE FIX)
 * ============================================================================
 * 
 * 🎨 DESIGN:
 * - Dark mode: glassmorphism dark (PERFECT - păstrat)
 * - Light mode: fundal mai deschis, mai subtil
 * - Format RO complet: 1.234,56
 * - Tichete sub cantitate
 * 
 * 🔧 FUNCȚIONAL:
 * - Denumire din waste_codes (Supabase)
 * 
 * ============================================================================
 */

import React from "react";
import { Home, TreePine, Recycle, Building2, Package } from "lucide-react";

const WasteCategoryCards = ({ categories = [], loading = false }) => {
  
  // ========================================================================
  // FORMAT NUMERE ROMÂNESC COMPLET
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
  // ICONIȚE SUGESTIVE
  // ========================================================================

  const getWasteIcon = (wasteCode) => {
    if (wasteCode?.includes("20 03 01")) return <Home className="w-5 h-5" />;
    if (wasteCode?.includes("20 03 03")) return <TreePine className="w-5 h-5" />;
    if (wasteCode?.startsWith("19")) return <Recycle className="w-5 h-5" />;
    if (wasteCode?.startsWith("17")) return <Building2 className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  // ========================================================================
  // CULORI GRADIENT PER CATEGORIE
  // ========================================================================

  const getColorConfig = (index) => {
    const colors = [
      {
        gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
        iconBg: "from-violet-500 to-purple-600",
        text: "text-violet-600 dark:text-violet-300",
        bar: "from-violet-500 to-purple-600",
      },
      {
        gradient: "from-emerald-500 via-teal-500 to-cyan-600",
        iconBg: "from-emerald-500 to-teal-600",
        text: "text-emerald-600 dark:text-emerald-300",
        bar: "from-emerald-500 to-teal-600",
      },
      {
        gradient: "from-orange-500 via-amber-500 to-yellow-600",
        iconBg: "from-orange-500 to-amber-600",
        text: "text-orange-600 dark:text-orange-300",
        bar: "from-orange-500 to-amber-600",
      },
      {
        gradient: "from-pink-500 via-rose-500 to-red-600",
        iconBg: "from-pink-500 to-rose-600",
        text: "text-pink-600 dark:text-pink-300",
        bar: "from-pink-500 to-rose-600",
      },
      {
        gradient: "from-cyan-500 via-blue-500 to-indigo-600",
        iconBg: "from-cyan-500 to-blue-600",
        text: "text-cyan-600 dark:text-cyan-300",
        bar: "from-cyan-500 to-blue-600",
      },
    ];

    return colors[index % colors.length];
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-52 bg-gray-100 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl animate-pulse border border-gray-200 dark:border-gray-700/50"
          />
        ))}
      </div>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700/50 p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nu există date pentru perioada selectată
        </p>
      </div>
    );
  }

  // ========================================================================
  // RENDER CARDS - ADAPTIVE LIGHT/DARK
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
            className="relative bg-gray-50/80 dark:bg-gradient-to-br dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/50 p-6 hover:border-gray-300 dark:hover:border-gray-600/70 hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 group overflow-hidden"
          >
            {/* Gradient glow effect (subtle) - doar pe dark */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 dark:opacity-[0.03] group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity duration-500`} />

            {/* Content wrapper */}
            <div className="relative z-10">
              
              {/* Header: Badge cod (top-left) + Icon (top-right) */}
              <div className="flex items-start justify-between mb-4">
                {/* Badge cod deșeu */}
                <div className="bg-white/80 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-gray-300/50 dark:border-gray-600/30 shadow-sm">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wider">
                    {category.waste_code}
                  </span>
                </div>

                {/* Icon gradient */}
                <div className={`bg-gradient-to-br ${colors.iconBg} rounded-2xl p-2.5 shadow-lg`}>
                  <div className="text-white">
                    {getWasteIcon(category.waste_code)}
                  </div>
                </div>
              </div>

              {/* Denumire deșeu (din waste_codes Supabase) */}
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[40px]">
                {category.waste_description || category.category_name || "Necategorizat"}
              </h3>

              {/* Cantitate MARE - FORMAT RO COMPLET */}
              <div className="mb-1">
                <div className={`text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent leading-tight`}>
                  {formatNumberRO(totalTons)}
                </div>
              </div>

              {/* Tichete SUB cantitate */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {ticketCount} {ticketCount === 1 ? "tichet" : "tichete"}
                </div>
              </div>

              {/* Progress bar + Procent */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Din Total
                  </span>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {formatPercent(percentage)}%
                  </span>
                </div>

                {/* Progress bar cu gradient */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700/50">
                  <div
                    className={`h-full bg-gradient-to-r ${colors.bar} transition-all duration-1000 ease-out rounded-full shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dot indicator */}
            <div className={`absolute top-3 left-3 w-2 h-2 bg-gradient-to-br ${colors.gradient} rounded-full opacity-40 dark:opacity-60 animate-pulse`} />
          </div>
        );
      })}
    </div>
  );
};

export default WasteCategoryCards;