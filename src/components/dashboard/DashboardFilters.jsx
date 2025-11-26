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

  // Sincronizează localFilters dacă se schimbă din exterior
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    // 🔧 FIX: Nu trimite sector_id dacă e empty string
    const cleanFilters = {
      ...localFilters,
      // Doar includem sector_id dacă e un număr valid
      ...(localFilters.sector_id && { sector_id: localFilters.sector_id })
    };
    
    // Dacă sector_id e "", îl eliminăm complet din obiect
    if (!cleanFilters.sector_id) {
      delete cleanFilters.sector_id;
    }
    
    console.log('🔍 Applying filters:', cleanFilters);
    onFilterChange(cleanFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      from: getYearStart(),
      to: getTodayDate(),
      sector_id: null, // 🔧 FIX: null în loc de ""
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // 🔧 FIX: Handler pentru sector cu validare
  const handleSectorChange = (e) => {
    const value = e.target.value;
    
    // Dacă e empty string, setăm null
    if (value === "" || value === "all") {
      setLocalFilters({
        ...localFilters,
        sector_id: null
      });
      return;
    }
    
    // Altfel, convertim la integer
    const sectorId = parseInt(value, 10);
    
    if (!isNaN(sectorId) && sectorId >= 1 && sectorId <= 6) {
      console.log('✅ Valid sector selected:', sectorId);
      setLocalFilters({
        ...localFilters,
        sector_id: sectorId
      });
    } else {
      console.warn('⚠️ Invalid sector value:', value);
    }
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
            value={localFilters.sector_id || ""} // 🔧 FIX: default la ""
            onChange={handleSectorChange} // 🔧 FIX: folosim handler-ul nou
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">București</option>
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
          {localFilters.sector_id && (() => {
            // 🔧 FIX: Căutăm după sector_number nu sector_id
            const s = sectors.find(
              (sec) => sec.sector_number === localFilters.sector_id
            );
            return s ? (
              <>
                {" "}• Locație: <span className="font-bold">Sector {s.sector_number}</span>
              </>
            ) : null;
          })()}
        </p>
      </div>
    </div>
  );
};

export default DashboardFilters;