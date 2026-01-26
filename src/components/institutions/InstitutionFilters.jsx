// src/components/institutions/InstitutionFilters.jsx
/**
 * ============================================================================
 * INSTITUTION FILTERS - COMPACT DROPDOWNS
 * ============================================================================
 */

import { Filter, X } from 'lucide-react';

const InstitutionFilters = ({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedSector,
  onSectorChange,
  sectors = [],
  onReset,
  institutionTypes = {},
}) => {
  const hasActiveFilters = selectedType || selectedStatus || selectedSector;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter icon */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtre:</span>
        </div>

        {/* Type Dropdown */}
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[160px]"
        >
          <option value="">Toate tipurile</option>
          {Object.entries(institutionTypes).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[120px]"
        >
          <option value="">Toate</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Sector Dropdown */}
        <select
          value={selectedSector}
          onChange={(e) => onSectorChange(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[140px]"
        >
          <option value="">Toate sectoarele</option>
          {sectors.map(s => (
            <option key={s.id} value={s.id}>Sector {s.sector_number}</option>
          ))}
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Resetează
          </button>
        )}
      </div>
    </div>
  );
};

export default InstitutionFilters;