// src/components/contracts/ContractFilters.jsx
/**
 * ============================================================================
 * CONTRACT FILTERS - MODERN DESIGN MATCHING INSTITUTIONS PAGE
 * ============================================================================
 * Left: Tip Contract, U.A.T., Status
 * Right: Search, Reset, Add
 * ============================================================================
 */

import { Filter, X, Search, RefreshCw, Plus } from 'lucide-react';

const CONTRACT_TYPE_OPTIONS = [
  { value: 'DISPOSAL', label: 'Depozitare' },
  { value: 'TMB', label: 'TMB' },
  { value: 'WASTE_COLLECTOR', label: 'Colectare' },
];

const ContractFilters = ({
  contractType,
  onContractTypeChange,
  sectorId,
  onSectorChange,
  status,
  onStatusChange,
  sectors = [],
  searchQuery = '',
  onSearchChange,
  onReset,
  hasActiveFilters = false,
  onAdd,
  onRefresh,
  loading = false,
  canCreate = false,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left - Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter icon */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtre:</span>
          </div>

          {/* 1. Tip Contract */}
          <select
            value={contractType}
            onChange={(e) => onContractTypeChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[140px]"
          >
            {CONTRACT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* 2. U.A.T. (Sector) */}
          <select
            value={sectorId}
            onChange={(e) => onSectorChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[140px]"
          >
            <option value="">Toate sectoarele</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>Sectorul {s.sector_number}</option>
            ))}
          </select>

          {/* 3. Status */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[120px]"
          >
            <option value="">Toate</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Right - Search, Reset, Refresh, Add */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută contract..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Resetează filtrele"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Resetează</span>
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            title="Reîncarcă"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Button */}
          {canCreate && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-teal-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă contract</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractFilters;