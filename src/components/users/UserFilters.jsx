// src/components/users/UserFilters.jsx
/**
 * ============================================================================
 * USER FILTERS - COMPACT BAR WITH SEARCH, RESET, ADD
 * ============================================================================
 */

import { Filter, X, Search, RefreshCw, Plus } from 'lucide-react';

const UserFilters = ({
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  selectedInstitution,
  onInstitutionChange,
  institutions = [],
  loadingInstitutions = false,
  searchQuery = '',
  onSearchChange,
  onReset,
  hasActiveFilters = false,
  onAdd,
  onRefresh,
  loading = false,
  canCreate = false,
  isPlatformAdmin = false,
  roleTypes = {},
  roleOrder = [],
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

          {/* Role Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[180px]"
          >
            <option value="">Toate rolurile</option>
            {roleOrder.map(roleKey => {
              const roleInfo = roleTypes[roleKey];
              if (!roleInfo) return null;
              return (
                <option key={roleKey} value={roleKey}>{roleInfo.label}</option>
              );
            })}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[120px]"
          >
            <option value="">Toate</option>
            <option value="active">Activ</option>
            <option value="inactive">Inactiv</option>
          </select>

          {/* Institution Dropdown - Only for Platform Admin */}
          {isPlatformAdmin && (
            <select
              value={selectedInstitution}
              onChange={(e) => onInstitutionChange(e.target.value)}
              disabled={loadingInstitutions}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[180px] disabled:opacity-50"
            >
              <option value="">Toate instituțiile</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.short_name || inst.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right - Search, Reset, Refresh, Add */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută utilizator..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
