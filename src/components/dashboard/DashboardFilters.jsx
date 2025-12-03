// src/components/dashboard/DashboardFilters.jsx
/**
 * ============================================================================
 * DASHBOARD FILTERS - FINAL VERSION (ANI DINAMICI + DATE PICKER FIX)
 * ============================================================================
 * 
 * 🎨 DESIGN:
 * - Date picker nativ FUNCȚIONAL (iconițe vizibile)
 * - Ani dinamici din backend (2025, 2024, etc.)
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
  // ANI DISPONIBILI (DIN BACKEND)
  // ========================================================================

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    
    // Dacă backend returnează ani, folosim ăia
    if (availableYears && availableYears.length > 0) {
      return availableYears.sort((a, b) => b - a); // Descrescător (2025, 2024, 2023...)
    }
    
    // Fallback: ultimii 3 ani
    return [currentYear, currentYear - 1, currentYear - 2];
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
        
        {/* 1. ANUL - DINAMIC DIN BACKEND */}
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

        {/* 2. DATA ÎNCEPUT - DATE PICKER NATIV FUNCȚIONAL */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Data început
          </label>
          <input
            type="date"
            value={localFilters.from}
            onChange={(e) => {
              console.log('📅 Date from changed:', e.target.value);
              setLocalFilters({ ...localFilters, from: e.target.value });
            }}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
            disabled={loading}
          />
        </div>

        {/* 3. DATA SFÂRȘIT - DATE PICKER NATIV FUNCȚIONAL */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Data sfârșit
          </label>
          <input
            type="date"
            value={localFilters.to}
            onChange={(e) => {
              console.log('📅 Date to changed:', e.target.value);
              setLocalFilters({ ...localFilters, to: e.target.value });
            }}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
            disabled={loading}
          />
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