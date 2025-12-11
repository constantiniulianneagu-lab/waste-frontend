// src/components/reports/ReportsFilters.jsx
/**
 * ============================================================================
 * REPORTS FILTERS - 2026 SAMSUNG/APPLE STYLE (CLEAN)
 * ============================================================================
 * 
 * ✅ Available years din API (doar funcționalitate, fără afișare)
 * ✅ Auto-update date când schimbi anul
 * ✅ Samsung One UI 7.0 rounded corners (14px)
 * ✅ Perfect light/dark mode
 * ✅ FĂRĂ info footer
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { Check, Calendar, MapPin, RotateCcw } from "lucide-react";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

const ReportsFilters = ({
  filters,
  setFilters,
  sectors = [],
  availableYears = [],
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // ========================================================================
  // ANI DISPONIBILI (cu fallback)
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
  // HANDLE YEAR CHANGE - AUTO-UPDATE DATES
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
    if (onApply) {
      onApply();
    }
  };

  // ========================================================================
  // HANDLE RESET
  // ========================================================================

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  // ========================================================================
  // HANDLE SECTOR CHANGE
  // ========================================================================

  const handleSectorChange = (e) => {
    const value = e.target.value;

    if (value === "" || value === "all") {
      setLocalFilters({
        ...localFilters,
        sector_id: "",
      });
      return;
    }

    // ✅ Convertim la integer pentru sector_number
    const sectorNumber = parseInt(value, 10);
    
    if (!isNaN(sectorNumber) && sectorNumber >= 1 && sectorNumber <= 6) {
      console.log('✅ Sector selected:', sectorNumber);
      
      // Găsim UUID-ul sectorului pe baza sector_number
      const selectedSector = sectors.find(s => s.sector_number === sectorNumber);
      
      if (selectedSector) {
        console.log('✅ Sector ID (UUID):', selectedSector.id);
        setLocalFilters({
          ...localFilters,
          sector_id: selectedSector.id, // ✅ Trimitem UUID-ul la backend
        });
      }
    } else {
      console.warn('⚠️ Invalid sector value:', value);
    }
  };

  // ========================================================================
  // SECTOARE ORDONATE
  // ========================================================================

  const sortedSectors = [...sectors]
    .filter(sector => {
      // Exclude sector_number 0 (București) pentru că avem hardcoded
      return sector.sector_number && 
             sector.sector_number >= 1 && 
             sector.sector_number <= 6;
    })
    .sort((a, b) => a.sector_number - b.sector_number);

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
              console.log('📅 Date from changed:', e.target.value);
              setLocalFilters({ ...localFilters, from: e.target.value });
            }}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:saturate-[500%] [&::-webkit-calendar-picker-indicator]:hue-rotate-[120deg]"
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
              console.log('📅 Date to changed:', e.target.value);
              setLocalFilters({ ...localFilters, to: e.target.value });
            }}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:saturate-[500%] [&::-webkit-calendar-picker-indicator]:hue-rotate-[120deg]"
          />
        </div>

        {/* 4. LOCAȚIE */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Locație
          </label>
          <select
            value={
              localFilters.sector_id 
                ? sectors.find(s => s.id === localFilters.sector_id)?.sector_number || ""
                : ""
            }
            onChange={handleSectorChange}
            className="w-full h-[42px] px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">București</option>
            {sortedSectors.map((sector) => (
              <option key={sector.id} value={sector.sector_number}>
                {sector.name || `Sector ${sector.sector_number}`}
              </option>
            ))}
          </select>
        </div>

        {/* 5. BUTON APLICĂ */}
        <div>
          <button
            type="button"
            onClick={handleApply}
            className="w-full h-[42px] inline-flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
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
            className="w-full h-[42px] inline-flex items-center justify-center gap-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-all"
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