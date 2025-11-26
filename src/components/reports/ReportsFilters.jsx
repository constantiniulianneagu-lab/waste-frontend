/**
 * ============================================================================
 * REPORTS FILTERS COMPONENT - VERSIUNE ACTUALIZATĂ
 * ============================================================================
 * - Butoane inline cu inputurile (nu separat)
 * - Dropdown sectoare (fără "București" în text)
 * - Design consistent cu Dashboard
 * ============================================================================
 */

import React from 'react';

const ReportsFilters = ({ filters, setFilters, sectors, onApply, onReset }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-end gap-3">
        {/* An */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            An
          </label>
          <select
            value={filters.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Data început */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Data început
          </label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleChange('from', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          />
        </div>

        {/* Data sfârșit */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Data sfârșit
          </label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleChange('to', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          />
        </div>

        {/* Locație */}
        <div className="flex-[1.5]">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Locație
          </label>
          <select
            value={filters.sector_id}
            onChange={(e) => handleChange('sector_id', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          >
            <option value="">București</option>
            {sectors
              .sort((a, b) => a.sector_number - b.sector_number)
              .map(sector => (
                <option key={sector.id} value={sector.id}>
                  Sector {sector.sector_number}
                </option>
              ))
            }
          </select>
        </div>

        {/* Buton Filtrează */}
        <button
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-indigo-500 to-indigo-600 
                   text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 
                   transition-all duration-200 shadow-md flex items-center gap-1.5 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtrează
        </button>

        {/* Buton Reset */}
        <button
          onClick={onReset}
          title="Reset filtre"
          className="px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 
                   transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ReportsFilters;