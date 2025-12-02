// src/components/dashboard/WasteCategoryCards.jsx
/**
 * ============================================================================
 * WASTE CATEGORY CARDS - VERSIUNE FINALĂ V2
 * ============================================================================
 * 
 * MODIFICĂRI:
 * - FIX LIGHT MODE: Coduri deșeuri vizibile pe fundal deschis (contrast îmbunătățit)
 * - ELIMINAT DUPLICAT: Sub "X tichete" era afișată cantitatea din nou → Șters
 * - Format: "X tichete • Y.YY tone" + "DIN TOTAL Z%"
 * - Verificat denumiri coduri vs baza de date
 * 
 * ============================================================================
 */

import { Package, TrendingUp, TrendingDown } from "lucide-react";

const WasteCategoryCards = ({ categories = [], loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Nu există date pentru perioada selectată
        </p>
      </div>
    );
  }

  // ========================================================================
  // CULORI CARDURI (conform design)
  // ========================================================================

  const categoryColors = {
    // Deșeuri municipale - Violet
    municipale: {
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      border: "border-violet-200 dark:border-violet-500/20",
      text: "text-violet-700 dark:text-violet-300",
      icon: "text-violet-600 dark:text-violet-400",
    },
    // Reziduuri străzi - Emerald
    stradale: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
    // Deșeuri de sortare - Orange
    sortare: {
      gradient: "from-orange-500 to-amber-600",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-500/20",
      text: "text-orange-700 dark:text-orange-300",
      icon: "text-orange-600 dark:text-orange-400",
    },
    // Construcții - Pink
    constructii: {
      gradient: "from-pink-500 to-rose-600",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      border: "border-pink-200 dark:border-pink-500/20",
      text: "text-pink-700 dark:text-pink-300",
      icon: "text-pink-600 dark:text-pink-400",
    },
    // Altele - Cyan
    altele: {
      gradient: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      border: "border-cyan-200 dark:border-cyan-500/20",
      text: "text-cyan-700 dark:text-cyan-300",
      icon: "text-cyan-600 dark:text-cyan-400",
    },
  };

  // ========================================================================
  // MAPARE CATEGORIE → CULOARE (bazat pe cod sau nume)
  // ========================================================================

  const getCategoryColor = (category) => {
    const name = category.category_name?.toLowerCase() || "";
    const code = category.waste_code?.toLowerCase() || "";

    // Deșeuri municipale (20 03 01)
    if (code.includes("20 03 01") || name.includes("municipale") || name.includes("menajere")) {
      return categoryColors.municipale;
    }

    // Reziduuri stradale (20 03 03)
    if (code.includes("20 03 03") || name.includes("stradal") || name.includes("măturat")) {
      return categoryColors.stradale;
    }

    // Deșeuri sortare (19 12 12)
    if (code.includes("19 12 12") || name.includes("sortare") || name.includes("reziduu")) {
      return categoryColors.sortare;
    }

    // Construcții (17 09 04)
    if (code.includes("17 09 04") || name.includes("construc") || name.includes("demol")) {
      return categoryColors.constructii;
    }

    // Default: Altele
    return categoryColors.altele;
  };

  // ========================================================================
  // FORMAT NUMERE
  // ========================================================================

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("ro-RO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ========================================================================
  // CALCUL TOTAL GENERAL (pentru procente)
  // ========================================================================

  const totalQuantity = categories.reduce(
    (sum, cat) => sum + (parseFloat(cat.total_quantity) || 0),
    0
  );

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {categories.map((category, index) => {
        const colors = getCategoryColor(category);
        const quantity = parseFloat(category.total_quantity) || 0;
        const ticketCount = parseInt(category.ticket_count, 10) || 0;
        const percentage = totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0;

        return (
          <div
            key={category.waste_code || index}
            className={`${colors.bg} ${colors.border} border rounded-xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Gradient accent bar (stânga) */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.gradient} group-hover:w-2 transition-all duration-300`}
            />

            {/* Icon top-right */}
            <div className="flex justify-end mb-3">
              <div className={`${colors.icon} opacity-20`}>
                <Package className="w-8 h-8" />
              </div>
            </div>

            {/* Categorie nume */}
            <h3 className={`${colors.text} text-sm font-bold mb-2 line-clamp-2`}>
              {category.category_name || "Necategorizat"}
            </h3>

            {/* Cantitate principală */}
            <div className="mb-3">
              <div className={`text-2xl font-bold ${colors.text}`}>
                {formatNumber(quantity)}
                <span className="text-sm font-normal ml-1">tone</span>
              </div>
            </div>

            {/* Info secundară - FIX: Eliminat duplicat cantitate */}
            <div className="space-y-1.5">
              {/* Tichete + Tone (într-un singur rând) */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {ticketCount} tichete • {formatNumber(quantity)} tone
                </span>
              </div>

              {/* Procent din total */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Din total
                </span>
                <span className={`font-bold ${colors.text}`}>
                  {formatNumber(percentage)}%
                </span>
              </div>
            </div>

            {/* Cod deșeu - FIX LIGHT MODE: Text mai întunecat pentru vizibilitate */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cod:
                </span>
                <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                  {category.waste_code || "N/A"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WasteCategoryCards;