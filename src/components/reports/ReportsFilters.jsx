// src/components/reports/ReportsFilters.jsx
/**
 * ============================================================================
 * REPORTS FILTERS - UNIFICAT CU DASHBOARD
 * ============================================================================
 * 
 * ✅ Ani din API (available_years)
 * ✅ Sectoare din API (all_sectors)
 * ✅ Auto-update date când schimbi anul
 * ✅ Design consistent cu Dashboard
 * ✅ București + Sector 1-6
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Check, Calendar, MapPin, RotateCcw } from "lucide-react";

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getYearStart = (year) => `${year || new Date().getFullYear()}-01-01`;

const ReportsFilters = ({
  filters,
  onFilterChange,
  sectors = [],
  availableYears = [],
  loading,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // ========================================================================
  // ANI DISPONIBILI
  // ========================================================================

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    if (availableYears && availableYears.length > 0) {
      return availableYears.sort((a, b) => b - a);
    }
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  const yearOptions = getYearOptions();

  // ========================================================================
  // ✅ HANDLE YEAR CHANGE - AUTO-APPLY
  // ========================================================================

  const handleYearChange = (selectedYear) => {
    const currentYear = new Date().getFullYear();
    const yearInt = parseInt(selectedYear, 10);

    let startDate, endDate;

    if (yearInt === currentYear) {
      startDate = `${yearInt}-01-01`;
      endDate = getTodayDate();
    } else {
      startDate = `${yearInt}-01-01`;
      endDate = `${yearInt}-12-31`;
    }

    console.log(`📅 Year changed to ${yearInt}:`, { startDate, endDate });

    const newFilters = {
      ...localFilters,
      year: yearInt,
      from: startDate,
      to: endDate,
    };
    
    setLocalFilters(newFilters);
    
    // ✅ AUTO-APPLY: Aplică filtrele imediat
    onFilterChange(newFilters);
  };

  // ========================================================================
  // HANDLE APPLY
  // ========================================================================

  const handleApply = () => {
    const cleanFilters = {
      year: localFilters.year,
      from: localFilters.from,
      to: localFilters.to,
      sector_id: localFilters.sector_id || null,
      page: 1, // ✅ Reset la prima pagină
      per_page: localFilters.per_page || 10,
    };
  
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
      from: getYearStart(currentYear),
      to: getTodayDate(),
      sector_id: null,
      page: 1,
      per_page: 10,
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // ========================================================================
  // HANDLE SECTOR CHANGE
  // ========================================================================

  const handleSectorChange = (e) => {
    const value = e.target.value;
    console.log('🔵 ReportsFilters - handleSectorChange:', {
      rawValue: value,
      selectedSector: sectors.find(s => (s.sector_id || s.id) === value)
    });
    
    const newFilters = {
      ...localFilters,
      sector_id: value === "" ? null : value, // UUID sau null
    };
  
    setLocalFilters(newFilters);
    onFilterChange(newFilters); // ✅ auto-apply
  };
  

  // ========================================================================
  // SECTOARE ORDONATE
  // ========================================================================

  const sortedSectors = [...sectors].sort((a, b) => a.sector_number - b.sector_number);
  
  console.log('🔵 ReportsFilters - sectors received:', sectors);
  console.log('🔵 ReportsFilters - sortedSectors:', sortedSectors);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      
      {/* GRID 6 COLOANE */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
        
        {/* 1. ANUL */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Anul
          </label>
          <select
            value={localFilters.year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            disabled={loading}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* 2. DATA ÎNCEPUT */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Data început
          </label>
          <input
            type="date"
            value={localFilters.from}
            onChange={(e) => {
              setLocalFilters({ ...localFilters, from: e.target.value });
            }}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:saturate-[500%] [&::-webkit-calendar-picker-indicator]:hue-rotate-[120deg]"
            disabled={loading}
          />
        </div>

        {/* 3. DATA SFÂRȘIT */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Data sfârșit
          </label>
          <input
            type="date"
            value={localFilters.to}
            onChange={(e) => {
              setLocalFilters({ ...localFilters, to: e.target.value });
            }}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:saturate-[500%] [&::-webkit-calendar-picker-indicator]:hue-rotate-[120deg]"
            disabled={loading}
          />
        </div>

        {/* 4. LOCAȚIE */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Locație
          </label>
          <select
            value={localFilters.sector_id || ""}
            onChange={handleSectorChange}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
            disabled={loading}
          >
            <option value="">București</option>
            {sortedSectors.map((sector, idx) => {
              console.log(`🔵 Sector ${idx}:`, {
                sector_id: sector.sector_id,
                id: sector.id,
                sector_number: sector.sector_number,
                using_value: sector.sector_id || sector.id
              });
              return (
                <option key={sector.sector_id} value={sector.sector_id}>
                  Sector {sector.sector_number}
                </option>
              );
            })}
          </select>
        </div>

        {/* 5. BUTON APLICĂ */}
        <div>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="w-full h-[42px] inline-flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Aplică
          </button>
        </div>

        {/* 6. BUTON RESETEAZĂ */}
        <div>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full h-[42px] inline-flex items-center justify-center gap-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Resetează
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;