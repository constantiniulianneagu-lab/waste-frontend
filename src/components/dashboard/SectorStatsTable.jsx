// src/components/dashboard/SectorStatsTable.jsx
/**
 * ============================================================================
 * SECTOR STATS TABLE - VERSIUNE FINALĂ V2
 * ============================================================================
 * 
 * MODIFICĂRI:
 * - ORDONARE: Sector 1 → Sector 6 (nu random)
 * - Badge sector cu gradient specific fiecare sector
 * - Bară accent colorată stânga
 * - Cantitate formatată românesc + Variație (↑/↓ X%)
 * - Footer: Total general
 * 
 * ============================================================================
 */

import { TrendingUp, TrendingDown, MapPin } from "lucide-react";

const SectorStatsTable = ({ data = [], loading }) => {
  // ========================================================================
  // CULORI SECTOARE
  // ========================================================================

  const sectorColors = {
    1: {
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50 dark:bg-violet-500/10",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-500",
      accent: "bg-violet-500",
    },
    2: {
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500",
      accent: "bg-emerald-500",
    },
    3: {
      gradient: "from-orange-500 to-amber-600",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-500",
      accent: "bg-orange-500",
    },
    4: {
      gradient: "from-pink-500 to-rose-600",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-500",
      accent: "bg-pink-500",
    },
    5: {
      gradient: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-500",
      accent: "bg-cyan-500",
    },
    6: {
      gradient: "from-indigo-500 to-blue-600",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-500",
      accent: "bg-indigo-500",
    },
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
  // SORTARE DATE: Sector 1 → 6
  // ========================================================================

  const sortedData = [...data].sort((a, b) => {
    const sectorA = parseInt(a.sector_number, 10) || 0;
    const sectorB = parseInt(b.sector_number, 10) || 0;
    return sectorA - sectorB;
  });

  // ========================================================================
  // CALCUL TOTAL
  // ========================================================================

  const totalQuantity = sortedData.reduce(
    (sum, item) => sum + (parseFloat(item.total_quantity) || 0),
    0
  );

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nu există date pe sectoare pentru perioada selectată
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Cantități per sector
        </h3>
        <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-600" />
      </div>

      {/* Lista sectoare */}
      <div className="space-y-3">
        {sortedData.map((sector) => {
          const sectorNum = parseInt(sector.sector_number, 10);
          const colors = sectorColors[sectorNum] || sectorColors[1];
          const quantity = parseFloat(sector.total_quantity) || 0;
          const variation = parseFloat(sector.variation) || 0;

          return (
            <div
              key={sector.sector_id || sectorNum}
              className="relative bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 group overflow-hidden"
            >
              {/* Bară accent stânga */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${colors.accent} group-hover:w-2 transition-all duration-300`}
              />

              <div className="flex items-center justify-between pl-3">
                {/* Badge Sector */}
                <div className="flex items-center gap-3">
                  <div
                    className={`${colors.bg} ${colors.border} border-2 rounded-lg px-3 py-1.5 min-w-[80px] text-center`}
                  >
                    <span className={`text-sm font-bold ${colors.text}`}>
                      Sector {sectorNum}
                    </span>
                  </div>

                  {/* Cantitate */}
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(quantity)}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                        tone
                      </span>
                    </p>
                  </div>
                </div>

                {/* Variație */}
                {variation !== 0 && (
                  <div className="flex items-center gap-1.5">
                    {variation > 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        variation > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {variation > 0 ? "↑" : "↓"} {Math.abs(variation).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Total general */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Total general
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(totalQuantity)}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              tone
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SectorStatsTable;