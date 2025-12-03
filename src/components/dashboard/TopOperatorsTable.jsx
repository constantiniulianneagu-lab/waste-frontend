// src/components/dashboard/TopOperatorsTable.jsx
/**
 * ============================================================================
 * TOP OPERATORS TABLE - MODERN ELEGANT (ARMONIZAT CU RECENT TICKETS)
 * ============================================================================
 * 
 * 🎨 DESIGN:
 * - Compact, elegant, profesional
 * - Badge separat pentru fiecare sector
 * - Progress bar subtil (fără procent scris)
 * - Armonizat cu RecentTicketsTable
 * 
 * ============================================================================
 */

import React from "react";

const TopOperatorsTable = ({ data = [], loading = false }) => {
  
  // ========================================================================
  // CULORI SECTOARE (ECO PALETTE)
  // ========================================================================
  
  const sectorColors = {
    1: { 
      bg: "bg-violet-500", 
      text: "text-violet-500",
      progress: "bg-violet-500"
    },
    2: { 
      bg: "bg-gray-400", 
      text: "text-gray-400",
      progress: "bg-gray-400"
    },
    3: { 
      bg: "bg-emerald-500", 
      text: "text-emerald-500",
      progress: "bg-emerald-500"
    },
    4: { 
      bg: "bg-amber-500", 
      text: "text-amber-500",
      progress: "bg-amber-500"
    },
    5: { 
      bg: "bg-pink-500", 
      text: "text-pink-500",
      progress: "bg-pink-500"
    },
    6: { 
      bg: "bg-cyan-500", 
      text: "text-cyan-500",
      progress: "bg-cyan-500"
    },
  };

  const getColorConfig = (sectorNum) =>
    sectorColors[sectorNum] || sectorColors[1];

  // ========================================================================
  // LOADING SKELETON
  // ========================================================================
  
  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="mb-6">
          <div className="h-5 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-gray-100 dark:bg-gray-600" />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // CALCULATE TOTAL (pentru progress bar)
  // ========================================================================
  
  const totalTons = data.reduce((sum, op) => sum + (op.total_tons || 0), 0);

  // ========================================================================
  // RENDER MAIN
  // ========================================================================

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      
      {/* HEADER */}
      <div className="mb-5 flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Top operatori salubrizare
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Cantități depozitate în perioada selectată
        </p>
      </div>

      {/* LISTĂ CU SCROLL - CARDS ELEGANTE */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2 max-h-[470px]">
        {data.map((operator, idx) => {
          // Sectors array
          const sectors = operator.sector_numbers || operator.sectors || [1];
          const firstSectorNum = sectors[0] || 1;
          const colorConfig = getColorConfig(firstSectorNum);

          // Progress bar percentage
          const percentage = totalTons > 0 
            ? ((operator.total_tons || 0) / totalTons) * 100 
            : 0;

          return (
            <div
              key={operator.institution_id || idx}
              className="group relative flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 transition-all duration-200 hover:shadow-sm hover:border-emerald-500/40 dark:hover:border-emerald-500/30"
            >
              
              {/* ROW 1: BADGE-URI + OPERATOR + CANTITATE */}
              <div className="flex items-center gap-3">
                
                {/* BADGE-URI SECTOARE (separate) */}
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  {sectors.slice(0, 3).map((sectorNum, i) => {
                    const cfg = getColorConfig(sectorNum);
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-center w-7 h-7 rounded-lg ${cfg.bg} shadow-sm`}
                      >
                        <span className="text-xs font-bold text-white">
                          {sectorNum}
                        </span>
                      </div>
                    );
                  })}
                  {sectors.length > 3 && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        +{sectors.length - 3}
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO OPERATOR */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
                    {operator.institution_name}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Sector {operator.sector_numbers_display || sectors.join(", ")}
                  </p>
                </div>

                {/* CANTITATE */}
                <div className="flex-shrink-0 text-right">
                  <p className={`text-base font-bold ${colorConfig.text} leading-tight`}>
                    {operator.total_tons_formatted ||
                      operator.total_tons?.toLocaleString("ro-RO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal ml-1">t</span>
                  </p>
                </div>
              </div>

              {/* ROW 2: PROGRESS BAR (fără procent scris) */}
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colorConfig.progress} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Accent line subtil (hover) */}
              <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg bg-gradient-to-b from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {data.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Nu există operatori pentru perioada selectată.
          </div>
        )}
      </div>

      {/* FOOTER */}
      {data.length > 0 && (
        <div className="mt-4 flex-shrink-0 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Total{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {data.length}
          </span>{" "}
          operatori afișați
        </div>
      )}
    </div>
  );
};

export default TopOperatorsTable;