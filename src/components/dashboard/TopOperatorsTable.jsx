// src/components/dashboard/TopOperatorsTable.jsx
import React from "react";

const TopOperatorsTable = ({ data = [], loading = false }) => {
  // Culori uniforme pe sectoare (la fel ca în restul dashboard-ului)
  const sectorColors = {
    1: {
      gradient: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/40",
    },
    2: {
      gradient: "from-slate-200 to-slate-300",
      shadow: "shadow-slate-400/40",
    },
    3: {
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/40",
    },
    4: {
      gradient: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/40",
    },
    5: {
      gradient: "from-pink-500 to-rose-500",
      shadow: "shadow-pink-500/40",
    },
    6: {
      gradient: "from-cyan-500 to-sky-500",
      shadow: "shadow-cyan-500/40",
    },
  };

  const getColorConfig = (sectorNum) =>
    sectorColors[sectorNum] || sectorColors[1];

  /* LOADING SKELETON */
  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
        <div className="mb-6">
          <div className="h-5 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
      {/* HEADER */}
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top operatori salubrizare
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cantități depozitate în perioada selectată
        </p>
      </div>

      {/* LISTĂ CU SCROLL */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1 max-h-[420px]">
        {data.map((operator, idx) => {
          const firstSectorNum =
            operator.sector_numbers?.[0] ||
            operator.sectors?.[0] ||
            1;

          const colorConfig = getColorConfig(firstSectorNum);

          const sectors =
            operator.sector_numbers ||
            operator.sectors ||
            [firstSectorNum];

          const displaySectors = sectors.slice(0, 3);
          const extraCount =
            sectors.length > 3 ? sectors.length - 3 : 0;

          return (
            <div
              key={operator.institution_id || idx}
              className="group relative flex flex-shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm shadow-xs transition-all duration-300 hover:-translate-x-1 hover:border-gray-200 hover:bg-white hover:shadow-lg dark:border-gray-800 dark:bg-[#0f1419] dark:hover:border-gray-700 dark:hover:bg-[#101623]"
            >
              {/* Bară colorată stânga */}
              <div
                className={`absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b ${colorConfig.gradient}`}
              />

              {/* Badge-uri de sector */}
              <div className="ml-3 flex flex-shrink-0 items-center gap-1.5">
                {displaySectors.map((sectorNum, i) => {
                  const cfg = getColorConfig(sectorNum);
                  return (
                    <div
                      key={i}
                      className={`
                        flex h-9 w-9 items-center justify-center rounded-xl 
                        bg-gradient-to-br ${cfg.gradient}
                        text-xs font-semibold text-white shadow-md
                      `}
                    >
                      {sectorNum}
                    </div>
                  );
                })}
                {extraCount > 0 && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-gray-400/40 text-[11px] font-semibold text-gray-500 dark:border-gray-600 dark:text-gray-300">
                    +{extraCount}
                  </div>
                )}
              </div>

              {/* Info operator */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">
                  {operator.institution_name}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Sector{" "}
                  {operator.sector_numbers_display ||
                    sectors.join(", ")}
                </p>
              </div>

              {/* Cantitate totală */}
              <div className="flex flex-shrink-0 flex-col items-end">
                <p
                  className={`
                    bg-gradient-to-r ${colorConfig.gradient}
                    bg-clip-text text-base font-bold text-transparent
                  `}
                >
                  {operator.total_tons_formatted ||
                    operator.total_tons?.toLocaleString("ro-RO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  tone
                </p>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Nu există operatori pentru perioada selectată.
          </div>
        )}
      </div>

      {/* FOOTER */}
      {data.length > 0 && (
        <div className="mt-4 flex-shrink-0 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-[#0f1419] dark:text-gray-400">
          Total{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {data.length}
          </span>{" "}
          operatori afișați
        </div>
      )}
    </div>
  );
};

export default TopOperatorsTable;
