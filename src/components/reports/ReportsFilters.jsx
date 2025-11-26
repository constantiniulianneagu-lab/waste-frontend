/**
 * ============================================================================
 * REPORTS FILTERS COMPONENT
 * ============================================================================
 * Filtre pentru rapoarte: An, Date, UAT (sector)
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
    <div className="bg-white dark:bg-[#242b3d] rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* An */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            An
          </label>
          <select
            value={filters.year || currentYear}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Data început */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data început
          </label>
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => handleChange('from', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          />
        </div>

        {/* Data sfârșit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data sfârșit
          </label>
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => handleChange('to', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          />
        </div>

        {/* U.A.T. (Sector) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            U.A.T. (Locație)
          </label>
          <select
            value={filters.sector_id || ''}
            onChange={(e) => handleChange('sector_id', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-colors"
          >
            <option value="">București (toate sectoarele)</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onApply}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg 
                   transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Filtrează
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                   text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ReportsFilters;