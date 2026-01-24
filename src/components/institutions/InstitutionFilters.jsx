// src/components/institutions/InstitutionFilters.jsx
/**
 * ============================================================================
 * INSTITUTION FILTERS - TYPE FILTER CHIPS
 * ============================================================================
 * Design: Green/Teal theme
 * Updated: 2025-01-24
 * ============================================================================
 */

import { 
  Building2, 
  Building, 
  Truck, 
  Factory, 
  PackageSearch,
  Wind,
  Flame,
  Mountain, 
  Recycle, 
  Zap, 
  Shield,
  X
} from 'lucide-react';
import { 
  INSTITUTION_TYPES, 
  getInstitutionTypeLabel,
  INSTITUTION_TYPE_COLORS
} from '../../constants/institutionTypes';

// Icon mapping
const TYPE_ICONS = {
  [INSTITUTION_TYPES.ASSOCIATION]: Building2,
  [INSTITUTION_TYPES.MUNICIPALITY]: Building,
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: Truck,
  [INSTITUTION_TYPES.TMB_OPERATOR]: Factory,
  [INSTITUTION_TYPES.SORTING_OPERATOR]: PackageSearch,
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: Wind,
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: Flame,
  [INSTITUTION_TYPES.LANDFILL]: Mountain,
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: Mountain,
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: Recycle,
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: Zap,
  [INSTITUTION_TYPES.REGULATOR]: Shield,
};

const InstitutionFilters = ({
  searchQuery,
  onSearchChange,
  activeTypeFilter,
  onTypeFilterChange,
  stats = {},
}) => {
  // Get count for a type from stats
  const getTypeCount = (type) => {
    const typeMap = {
      [INSTITUTION_TYPES.ASSOCIATION]: stats.byType?.ASSOCIATION || 0,
      [INSTITUTION_TYPES.MUNICIPALITY]: stats.byType?.MUNICIPALITY || 0,
      [INSTITUTION_TYPES.WASTE_COLLECTOR]: stats.byType?.WASTE_COLLECTOR || 0,
      [INSTITUTION_TYPES.TMB_OPERATOR]: stats.byType?.TMB_OPERATOR || 0,
      [INSTITUTION_TYPES.SORTING_OPERATOR]: stats.byType?.SORTING_OPERATOR || 0,
      [INSTITUTION_TYPES.AEROBIC_OPERATOR]: stats.byType?.AEROBIC_OPERATOR || 0,
      [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: stats.byType?.ANAEROBIC_OPERATOR || 0,
      [INSTITUTION_TYPES.LANDFILL]: (stats.byType?.LANDFILL || 0) + (stats.byType?.DISPOSAL_CLIENT || 0),
      [INSTITUTION_TYPES.DISPOSAL_CLIENT]: (stats.byType?.LANDFILL || 0) + (stats.byType?.DISPOSAL_CLIENT || 0),
      [INSTITUTION_TYPES.RECYCLING_CLIENT]: stats.byType?.RECYCLING_CLIENT || 0,
      [INSTITUTION_TYPES.RECOVERY_CLIENT]: stats.byType?.RECOVERY_CLIENT || 0,
      [INSTITUTION_TYPES.REGULATOR]: stats.byType?.REGULATOR || 0,
    };
    return typeMap[type] || 0;
  };

  // Filter chip colors based on type
  const getChipColors = (type, isActive) => {
    if (isActive) {
      const colorMap = {
        [INSTITUTION_TYPES.ASSOCIATION]: 'bg-teal-500 text-white shadow-teal-500/30',
        [INSTITUTION_TYPES.MUNICIPALITY]: 'bg-blue-500 text-white shadow-blue-500/30',
        [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'bg-emerald-500 text-white shadow-emerald-500/30',
        [INSTITUTION_TYPES.TMB_OPERATOR]: 'bg-cyan-500 text-white shadow-cyan-500/30',
        [INSTITUTION_TYPES.SORTING_OPERATOR]: 'bg-violet-500 text-white shadow-violet-500/30',
        [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'bg-lime-500 text-white shadow-lime-500/30',
        [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'bg-orange-500 text-white shadow-orange-500/30',
        [INSTITUTION_TYPES.LANDFILL]: 'bg-slate-500 text-white shadow-slate-500/30',
        [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'bg-slate-500 text-white shadow-slate-500/30',
        [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'bg-green-500 text-white shadow-green-500/30',
        [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'bg-amber-500 text-white shadow-amber-500/30',
        [INSTITUTION_TYPES.REGULATOR]: 'bg-indigo-500 text-white shadow-indigo-500/30',
      };
      return colorMap[type] || 'bg-gray-500 text-white';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
  };

  // Types to show (exclude duplicates like DISPOSAL_CLIENT which is same as LANDFILL)
  const visibleTypes = [
    INSTITUTION_TYPES.ASSOCIATION,
    INSTITUTION_TYPES.MUNICIPALITY,
    INSTITUTION_TYPES.WASTE_COLLECTOR,
    INSTITUTION_TYPES.TMB_OPERATOR,
    INSTITUTION_TYPES.SORTING_OPERATOR,
    INSTITUTION_TYPES.AEROBIC_OPERATOR,
    INSTITUTION_TYPES.ANAEROBIC_OPERATOR,
    INSTITUTION_TYPES.LANDFILL, // Shows combined count with DISPOSAL_CLIENT
    INSTITUTION_TYPES.RECYCLING_CLIENT,
    INSTITUTION_TYPES.RECOVERY_CLIENT,
    INSTITUTION_TYPES.REGULATOR,
  ];

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  border border-gray-200 dark:border-gray-700/50
                  rounded-2xl p-4 shadow-sm">
      
      {/* Active filter indicator */}
      {activeTypeFilter && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Filtru activ:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium
                           ${getChipColors(activeTypeFilter, true)} shadow-lg`}>
              {(() => {
                const Icon = TYPE_ICONS[activeTypeFilter];
                return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
              })()}
              {getInstitutionTypeLabel(activeTypeFilter)}
            </span>
          </div>
          <button
            onClick={() => onTypeFilterChange(null)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                     dark:hover:bg-gray-700 transition-colors"
            title="Șterge filtrul"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {visibleTypes.map(type => {
          const Icon = TYPE_ICONS[type];
          const count = getTypeCount(type);
          const isActive = activeTypeFilter === type;
          
          // Skip types with 0 count unless it's the active filter
          if (count === 0 && !isActive) return null;
          
          return (
            <button
              key={type}
              onClick={() => onTypeFilterChange(isActive ? null : type)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                text-xs font-semibold transition-all duration-200
                ${getChipColors(type, isActive)}
                ${isActive ? 'shadow-lg' : ''}
              `}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{getInstitutionTypeLabel(type)}</span>
              <span className={`
                ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold
                ${isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InstitutionFilters;
