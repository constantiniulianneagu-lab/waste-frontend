// src/components/dashboard/DashboardFilters.jsx
/**
 * ============================================================================
 * DASHBOARD FILTERS - dd/mm/yyyy FORMAT + AUTO-UPDATE
 * ============================================================================
 * 
 * 🎨 DESIGN:
 * - Format afișare: dd/mm/yyyy (românesc)
 * - Date picker nativ funcțional
 * - Grid 6 coloane proporționale
 * 
 * 🔧 FUNCȚIONAL:
 * - Schimbare an → auto-update date început/sfârșit
 * - An curent → sfârșit = data curentă
 * - Ani anteriori → sfârșit = 31/12/[anul]
 * - Aplică filtre → schimbă dashboard
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Check, Calendar, MapPin, RotateCcw } from "lucide-react";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

const DashboardFilters = ({
  filters,
  onFilterChange,
  sectors = [],
  availableYears = [],
  loading,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sincronizează localFilters când se schimbă din exterior
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // ========================================================================
  // CONVERSIE DATE: YYYY-MM-DD ↔ DD/MM/YYYY
  // ========================================================================

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    try {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // ========================================================================
  // ANI DISPONIBILI
  // ========================================================================

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    if (availableYears && availableYears.length > 0) {
      return availableYears.sort((a, b) => b - a);
    }
    return [currentYear];
  };

  const yearOptions = getYearOptions();

  // ========================================================================
  // HANDLE YEAR CHANGE - AUTO-UPDATE DATE
  // ========================================================================

  const handleYearChange = (selectedYear) => {
    const currentYear = new Date().getFullYear();
    const yearInt = parseInt(selectedYear, 10);

    let startDate, endDate;

    if (yearInt === currentYear) {
      // An curent: 01/01/[an] → data curentă
      startDate = `${yearInt}-01-01`;
      endDate = getTodayDate(); // Data curentă
    } else {
      // Ani anteriori: 01/01/[an] → 31/12/[an]
      startDate = `${yearInt}-01-01`;
      endDate = `${yearInt}-12-31`;
    }

    console.log(`📅 Year changed to ${yearInt}:`, { startDate, endDate });

    setLocalFilters({
      ...localFilters,
      year: yearInt,
      from: startDate,
      to: endDate,
    });
  };

  // ========================================================================
  // HANDLE APPLY
  // ========================================================================

  const handleApply = () => {
    const cleanFilters = {
      year: localFilters.year,
      from: localFilters.from,
      to: localFilters.to,
    };

    if (localFilters.sector_id && localFilters.sector_id >= 1 && localFilters.sector_id <= 6) {
      cleanFilters.sector_id = localFilters.sector_id;
    }

    console.log('🔄 Applying filters:', cleanFilters);
    onFilterChange(cleanFilters);
  };

  // ========================================================================
  // HANDLE RESET
  // ========================================================================

  const handleReset = () => {
    const currentYear = new Date().getFullYear();
    const defaultFilters = {
      year: currentYear,
      from: getYearStart(),
      to: getTodayDate(),
      sector_id: null,
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // ========================================================================
  // HANDLE SECTOR CHANGE
  // ========================================================================

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
  // SECTOARE ORDONATE
  // ========================================================================

  const sortedSectors = [...sectors].sort((a, b) => a.sector_number - b.sector_number);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      
      {/* GRID 6 COLOANE */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
        
        {/* 1. ANUL - AUTO-UPDATE DATE */}
        <div className="md:col-span-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Anul
          </label>
          <select
            value={localFilters.year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            disabled={loading}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* 2. DATA ÎNCEPUT - AFIȘARE dd/mm/yyyy */}
        <div className="md:col-span-1 relative">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Data început
          </label>
          
          {/* Input vizual (read-only) cu format românesc */}
          <div className="relative">
            <input
              type="text"
              value={formatDateDisplay(localFilters.from)}
              readOnly
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white cursor-pointer"
              onClick={() => document.getElementById('date-from-picker').showPicker()}
            />
            
            {/* Date picker ascuns (overlay) */}
            <input
              id="date-from-picker"
              type="date"
              value={localFilters.from}
              onChange={(e) => {
                console.log('📅 Date from changed:', e.target.value);
                setLocalFilters({ ...localFilters, from: e.target.value });
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={loading}
            />
          </div>
        </div>

        {/* 3. DATA SFÂRȘIT - AFIȘARE dd/mm/yyyy */}
        <div className="md:col-span-1 relative">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Data sfârșit
          </label>
          
          {/* Input vizual (read-only) cu format românesc */}
          <div className="relative">
            <input
              type="text"
              value={formatDateDisplay(localFilters.to)}
              readOnly
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white cursor-pointer"
              onClick={() => document.getElementById('date-to-picker').showPicker()}
            />
            
            {/* Date picker ascuns (overlay) */}
            <input
              id="date-to-picker"
              type="date"
              value={localFilters.to}
              onChange={(e) => {
                console.log('📅 Date to changed:', e.target.value);
                setLocalFilters({ ...localFilters, to: e.target.value });
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={loading}
            />
          </div>
        </div>

        {/* 4. LOCAȚIE */}
        <div className="md:col-span-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Locație
          </label>
          <select
            value={localFilters.sector_id || ""}
            onChange={handleSectorChange}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            disabled={loading}
          >
            <option value="">București</option>
            {sortedSectors.map((sector) => (
              <option key={sector.sector_id} value={sector.sector_number}>
                Sector {sector.sector_number}
              </option>
            ))}
          </select>
        </div>

        {/* 5. BUTON APLICĂ */}
        <div className="md:col-span-1">
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Aplică
          </button>
        </div>

        {/* 6. BUTON RESETEAZĂ */}
        <div className="md:col-span-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Resetează
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;