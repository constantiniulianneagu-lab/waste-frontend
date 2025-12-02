// src/components/dashboard/DashboardFilters.jsx
/**
 * ============================================================================
 * DASHBOARD FILTERS - VERSIUNE FINALĂ V2
 * ============================================================================
 * 
 * MODIFICĂRI:
 * - An dropdown: Doar ani cu date (nu hardcoded)
 * - Data început/sfârșit: Format românesc ZZ.LL.AAAA
 * - Locație: Ordonată (București, Sector 1-6)
 * - Clean validation pentru sector_id
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Calendar, MapPin, RotateCcw } from "lucide-react";

const DashboardFilters = ({
  filters,
  onFilterChange,
  sectors = [],
  loading,
  availableYears = [], // 🆕 Array cu anii pentru care avem date
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sincronizează localFilters dacă se schimbă din exterior
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // ========================================================================
  // CONVERSIE DATE: YYYY-MM-DD ↔ ZZ.LL.AAAA
  // ========================================================================

  const formatDateRO = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const parseRoDate = (roDate) => {
    if (!roDate || roDate.length !== 10) return '';
    const [day, month, year] = roDate.split('.');
    return `${year}-${month}-${day}`;
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleApply = () => {
    // Clean filters: elimină sector_id dacă e null/undefined/empty
    const cleanFilters = {
      year: localFilters.year,
      from: localFilters.from,
      to: localFilters.to,
    };

    // Doar includem sector_id dacă e un număr valid (1-6)
    if (localFilters.sector_id && localFilters.sector_id >= 1 && localFilters.sector_id <= 6) {
      cleanFilters.sector_id = localFilters.sector_id;
    }

    console.log('🔄 Applying filters:', cleanFilters);
    onFilterChange(cleanFilters);
  };

  const handleReset = () => {
    const currentYear = new Date().getFullYear();
    const defaultFilters = {
      year: currentYear,
      from: `${currentYear}-01-01`,
      to: new Date().toISOString().split('T')[0],
      sector_id: null,
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleSectorChange = (e) => {
    const value = e.target.value;

    if (value === "" || value === "all") {
      setLocalFilters({
        ...localFilters,
        sector_id: null,
      });
      return;
    }

    const sectorId = parseInt(value, 10);

    if (!isNaN(sectorId) && sectorId >= 1 && sectorId <= 6) {
      console.log('✅ Valid sector selected:', sectorId);
      setLocalFilters({
        ...localFilters,
        sector_id: sectorId,
      });
    } else {
      console.warn('⚠️ Invalid sector value:', value);
    }
  };

  // ========================================================================
  // GENEREAZA ANI DISPONIBILI
  // ========================================================================

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();

    // Dacă avem ani disponibili din API, folosim ăia
    if (availableYears && availableYears.length > 0) {
      return availableYears;
    }

    // Altfel, default: anul curent + 2 anteriori
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  const yearOptions = getYearOptions();

  // ========================================================================
  // SECTOR CURENT SELECTAT (pentru display)
  // ========================================================================

  const getSelectedSectorName = () => {
    if (!localFilters.sector_id) return 'București';
    
    const sector = sectors.find(
      (s) => s.sector_number === localFilters.sector_id
    );
    
    return sector ? `Sector ${sector.sector_number}` : 'București';
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      
      {/* Row inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        
        {/* AN */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            An
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
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* DATA ÎNCEPUT - Format Românesc */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            Data început
          </label>
          <input
            type="text"
            placeholder="ZZ.LL.AAAA"
            value={formatDateRO(localFilters.from)}
            onChange={(e) => {
              const roDate = e.target.value;
              // Permite doar cifre și puncte
              if (/^[\d.]*$/.test(roDate)) {
                // Dacă are 10 caractere (ZZ.LL.AAAA), convertește
                if (roDate.length === 10) {
                  const isoDate = parseRoDate(roDate);
                  setLocalFilters({ ...localFilters, from: isoDate });
                }
              }
            }}
            onBlur={(e) => {
              // La blur, convertește și setează
              const isoDate = parseRoDate(e.target.value);
              if (isoDate) {
                setLocalFilters({ ...localFilters, from: isoDate });
              }
            }}
            maxLength={10}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Format: ZZ.LL.AAAA
          </p>
        </div>

        {/* DATA SFÂRȘIT - Format Românesc */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            Data sfârșit
          </label>
          <input
            type="text"
            placeholder="ZZ.LL.AAAA"
            value={formatDateRO(localFilters.to)}
            onChange={(e) => {
              const roDate = e.target.value;
              if (/^[\d.]*$/.test(roDate)) {
                if (roDate.length === 10) {
                  const isoDate = parseRoDate(roDate);
                  setLocalFilters({ ...localFilters, to: isoDate });
                }
              }
            }}
            onBlur={(e) => {
              const isoDate = parseRoDate(e.target.value);
              if (isoDate) {
                setLocalFilters({ ...localFilters, to: isoDate });
              }
            }}
            maxLength={10}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Format: ZZ.LL.AAAA
          </p>
        </div>

        {/* LOCAȚIE - Ordonată București, Sector 1-6 */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            Locație
          </label>
          <select
            value={localFilters.sector_id || ""}
            onChange={handleSectorChange}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1a1f2e] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
          >
            {/* București (toate sectoarele) */}
            <option value="">București</option>
            
            {/* Sectoare 1-6 sortate */}
            {sectors
              .sort((a, b) => a.sector_number - b.sector_number)
              .map((sector) => (
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
          <span className="font-bold">{formatDateRO(localFilters.from)}</span> -{" "}
          <span className="font-bold">{formatDateRO(localFilters.to)}</span>
          {localFilters.sector_id && (
            <>
              {" "}• Locație: <span className="font-bold">{getSelectedSectorName()}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default DashboardFilters;