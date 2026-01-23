// src/components/institutions/InstitutionFilters.jsx
/**
 * ============================================================================
 * INSTITUTION FILTERS - TYPE CHIPS & SEARCH
 * ============================================================================
 * Design: Amber/Orange theme
 */

import { Search, X, Filter } from 'lucide-react';
import { INSTITUTION_TYPES, getInstitutionTypeLabel } from '../../constants/institutionTypes';

// Mapare pentru afișare în română - chips
const TYPE_CHIPS = [
  { key: 'ASSOCIATION', label: 'Asociație', color: 'rose' },
  { key: 'MUNICIPALITY', label: 'Municipii', color: 'blue' },
  { key: 'WASTE_COLLECTOR', label: 'Operatori', color: 'emerald' },
  { key: 'TMB_OPERATOR', label: 'TMB', color: 'cyan' },
  { key: 'SORTING_OPERATOR', label: 'Sortare', color: 'purple' },
  { key: 'DISPOSAL_CLIENT', label: 'Depozite', color: 'amber' },
  { key: 'RECYCLING_CLIENT', label: 'Reciclare', color: 'green' },
  { key: 'RECOVERY_CLIENT', label: 'Valorificare', color: 'orange' },
  { key: 'REGULATOR', label: 'Autorități', color: 'indigo' },
];

const getChipColors = (color, isActive) => {
  const colors = {
    rose: isActive 
      ? 'bg-rose-500 text-white border-rose-500' 
      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
    blue: isActive 
      ? 'bg-blue-500 text-white border-blue-500' 
      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
    emerald: isActive 
      ? 'bg-emerald-500 text-white border-emerald-500' 
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    cyan: isActive 
      ? 'bg-cyan-500 text-white border-cyan-500' 
      : 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30',
    purple: isActive 
      ? 'bg-purple-500 text-white border-purple-500' 
      : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
    amber: isActive 
      ? 'bg-amber-500 text-white border-amber-500' 
      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    green: isActive 
      ? 'bg-green-500 text-white border-green-500' 
      : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30',
    orange: isActive 
      ? 'bg-orange-500 text-white border-orange-500' 
      : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
    indigo: isActive 
      ? 'bg-indigo-500 text-white border-indigo-500' 
      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30',
  };
  return colors[color] || colors.amber;
};

const InstitutionFilters = ({
  searchQuery = '',
  onSearchChange,
  activeTypeFilter = null,
  onTypeFilterChange,
  stats = {}
}) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    border border-gray-200 dark:border-gray-700/50
                    rounded-[20px] p-5 shadow-sm dark:shadow-none">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 
                      flex items-center justify-center">
          <Filter className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Filtre
        </h3>
        {activeTypeFilter && (
          <button
            onClick={() => onTypeFilterChange(null)}
            className="ml-auto text-xs font-medium text-amber-600 dark:text-amber-400 
                     hover:text-amber-700 dark:hover:text-amber-300 
                     flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Resetează
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Caută instituție..."
          className="w-full pl-10 pr-4 py-2.5 
                   bg-gray-50 dark:bg-gray-900/50 
                   border border-gray-200 dark:border-gray-700
                   rounded-xl text-sm text-gray-900 dark:text-white
                   placeholder:text-gray-400
                   focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500
                   transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                     w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700
                     flex items-center justify-center
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Type Chips */}
      <div className="flex flex-wrap gap-2">
        {TYPE_CHIPS.map(({ key, label, color }) => {
          const isActive = activeTypeFilter === key;
          const count = stats.byType?.[key] || 0;
          
          return (
            <button
              key={key}
              onClick={() => onTypeFilterChange(isActive ? null : key)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5
                text-xs font-semibold rounded-full border
                transition-all duration-200
                ${getChipColors(color, isActive)}
              `}
            >
              {label}
              {count > 0 && (
                <span className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InstitutionFilters;