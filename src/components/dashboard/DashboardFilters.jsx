/**
 * ============================================================================
 * DASHBOARD FILTERS COMPONENT
 * ============================================================================
 * 
 * Filters for dashboard: Year, Date Range, Sector Location
 * 
 * Props:
 * - filters: Current filter values
 * - onFilterChange: Callback when filters change
 * - sectors: List of available sectors
 * - loading: Loading state
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React, { useState } from 'react';
import { Calendar, MapPin, RotateCcw } from 'lucide-react';
import { getTodayDate, getYearStart } from '../../utils/dashboardUtils.js';

const DashboardFilters = ({ filters, onFilterChange, sectors = [], loading = false }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  /**
   * Handle filter change
   */
  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  /**
   * Apply filters
   */
  const handleApply = () => {
    onFilterChange(localFilters);
  };

  /**
   * Reset filters to defaults
   */
  const handleReset = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      from: getYearStart(),
      to: getTodayDate(),
      sector_id: '',
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  /**
   * Get available years (current year and 2 years back)
   */
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Perioada
          </label>
          <select
            value={localFilters.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Date Start */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data început
          </label>
          <input
            type="date"
            value={localFilters.from}
            onChange={(e) => handleChange('from', e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          />
        </div>

        {/* Date End */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data sfârșit
          </label>
          <input
            type="date"
            value={localFilters.to}
            onChange={(e) => handleChange('to', e.target.value)}
            disabled={loading}
            max={getTodayDate()}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          />
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Locație
          </label>
          <select
            value={localFilters.sector_id}
            onChange={(e) => handleChange('sector_id', e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            <option value="">București (Toate sectoarele)</option>
            {sectors.map((sector) => (
              <option key={sector.sector_id} value={sector.sector_id}>
                {sector.sector_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700
                   rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Resetează
        </button>

        <button
          onClick={handleApply}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 
                   dark:bg-emerald-500 dark:hover:bg-emerald-600
                   text-white font-medium rounded-lg transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Se încarcă...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Aplică filtre
            </>
          )}
        </button>
      </div>

      {/* Active Filters Info */}
      {Object.values(localFilters).some(v => v && v !== '') && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            <span className="font-medium">Afișare date pentru:</span>{' '}
            {localFilters.year} • Perioada: {localFilters.from} - {localFilters.to}
            {localFilters.sector_id && ` • Locație: ${sectors.find(s => s.sector_id === localFilters.sector_id)?.sector_name || 'Sector selectat'}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;