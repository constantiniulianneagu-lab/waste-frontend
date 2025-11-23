// src/components/dashboard/DashboardFilters.jsx
import { useState, useEffect } from "react";
import { Calendar, MapPin, RotateCcw } from "lucide-react";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

const DashboardFilters = ({
  filters,
  onFilterChange,
  sectors = [],
  loading,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // sincronizează localFilters dacă se schimbă din exterior
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      from: getYearStart(),
      to: getTodayDate(),
      sector_id: "",
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Row inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Perioada / Year */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            Perioada
          </label>
          <select
            value={localFilters.year}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                year: parseInt(e.target.value, 10),
              })
            }
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={new Date().getFullYear()}>
              {new Date().getFullYear()}
            </option>
            <option value={new Date().getFullYear() - 1}>
              {new Date().getFullYear() - 1}
            </option>
            <option value={new Date().getFullYear() - 2}>
              {new Date().getFullYear() - 2}
            </option>
          </select>
        </div>

        {/* Data început */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            Data început
          </label>
          <input
            type="date"
            value={localFilters.from}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, from: e.target.value })
            }
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Data sfârșit */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            Data sfârșit
          </label>
          <input
            type="date"
            value={localFilters.to}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, to: e.target.value })
            }
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Locație */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            Locație
          </label>
          <select
            value={localFilters.sector_id}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              sector_id: parseInt(e.target.value, 10) || ""
            })
            
            }
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">București (Toate sectoarele)</option>
            {sectors.map((sector) => (
              <option key={sector.sector_id} value={sector.sector_number}>
                Sector {sector.sector_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center gap-2 px-0 md:px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Resetează
        </button>

        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          <Calendar className="w-4 h-4" />
          Aplică filtre
        </button>
      </div>

      {/* Text cu filtre aplicate */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          Afișare date pentru{" "}
          <span className="font-bold">{localFilters.year}</span> • Perioada:{" "}
          <span className="font-bold">{localFilters.from}</span> -{" "}
          <span className="font-bold">{localFilters.to}</span>
          {localFilters.sector_id &&
            (() => {
              const s = sectors.find(
                (sec) => String(sec.sector_id) === String(localFilters.sector_id)
              );
              return s ? (
                <>
                  {" "}
                  • Locație: <span className="font-bold">Sector {s.sector_number}</span>
                </>
              ) : null;
            })()}
        </p>
      </div>
    </div>
  );
};

export default DashboardFilters;
