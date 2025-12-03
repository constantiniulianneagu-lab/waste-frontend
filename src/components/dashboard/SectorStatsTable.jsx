// src/components/dashboard/SectorStatsTable.jsx
import { TrendingUp, TrendingDown } from "lucide-react";

const sectorGradientMap = {
  1: "from-violet-500 to-violet-600",
  2: "from-slate-300 to-slate-400",
  3: "from-emerald-500 to-emerald-600",
  4: "from-amber-500 to-amber-600",
  5: "from-pink-500 to-pink-600",
  6: "from-cyan-500 to-cyan-600",
};

const SectorStatsTable = ({ data = [], loading = false }) => {
  const total = data.reduce(
    (sum, s) => sum + (Number(s.total_tons) || 0),
    0
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col h-full">
        <div className="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-3 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col h-full">
    {/* Header */}
    <div className="mb-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        Cantități per sector
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Distribuția cantităților pe sectoare (tone)
      </p>
    </div>

    {/* Table header */}
    <div className="grid grid-cols-[2fr,1.2fr,1fr] gap-3 pb-2 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
      <span>Sector</span>
      <span className="text-right">Cantitate (t)</span>
      <span className="text-right">Variație</span>
    </div>

      {/* Rows – maxim 6, fără scroll */}
      <div className="mt-3 space-y-2 flex-1">
        {data.map((sector) => {
          const grad =
            sectorGradientMap[sector.sector_number] ||
            "from-gray-300 to-gray-400";
          const positive = (sector.variation_percent || 0) >= 0;

          return (
            <div
              key={sector.sector_id}
              className="relative grid grid-cols-[2fr,1.2fr,1fr] gap-3 items-center px-3 py-3 rounded-xl bg-gray-50/80 dark:bg-[#0f172a] border border-gray-200/70 dark:border-gray-800 hover:border-emerald-500/70 transition-all"
            >
              {/* Accent bar left */}
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-emerald-400 to-emerald-600" />

              {/* Sector badge + text */}
              <div className="flex items-center gap-3 pl-1">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${grad} flex items-center justify-center text-xs font-bold text-white shadow-sm`}
                >
                  {sector.sector_number}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sector {sector.sector_number}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {sector.city || "București"}
                  </p>
                </div>
              </div>

              {/* Cantitate */}
              <div className="text-right">
                <p className="text-sm font-semibold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  {sector.total_tons_formatted ??
                    Number(sector.total_tons || 0).toLocaleString("ro-RO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
              </div>

              {/* Variație */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center justify-end gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    positive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(Number(sector.variation_percent || 0)).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer total */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 grid grid-cols-[2fr,1.2fr,1fr] gap-3 items-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Total
        </p>
        <p className="text-right text-base font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
          {total.toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-right text-[11px] text-gray-500 dark:text-gray-400">
          tone
        </p>
      </div>
    </div>
  );
};

export default SectorStatsTable;
