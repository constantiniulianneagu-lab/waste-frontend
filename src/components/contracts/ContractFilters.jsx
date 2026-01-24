// src/components/contracts/ContractFilters.jsx
/**
 * ============================================================================
 * CONTRACT FILTERS - Updated with TMB support
 * ============================================================================
 */

import { FileText, MapPin, CheckCircle } from 'lucide-react';

const CONTRACT_TYPES = [
  { value: 'DISPOSAL', label: 'Depozitare', color: 'slate' },
  { value: 'WASTE_COLLECTOR', label: 'Colectare', color: 'emerald' },
  { value: 'TMB', label: 'TMB', color: 'cyan' },
];

const ContractFilters = ({
  contractType,
  onContractTypeChange,
  sectorId,
  onSectorChange,
  status,
  onStatusChange,
  sectors = [],
}) => {
  const getTypeButtonClass = (type, isActive) => {
    if (isActive) {
      const colorMap = {
        'DISPOSAL': 'bg-slate-500 text-white shadow-slate-500/30',
        'WASTE_COLLECTOR': 'bg-emerald-500 text-white shadow-emerald-500/30',
        'TMB': 'bg-cyan-500 text-white shadow-cyan-500/30',
      };
      return `${colorMap[type]} shadow-lg`;
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 shadow-sm space-y-4">
      
      {/* Contract Type Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Tip Contract
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTRACT_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => onContractTypeChange(type.value)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${getTypeButtonClass(type.value, contractType === type.value)}`}
            >
              <FileText className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Other Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        {/* Sector Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            <MapPin className="w-3 h-3 inline mr-1" />
            U.A.T. (Sector)
          </label>
          <select
            value={sectorId}
            onChange={(e) => onSectorChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="">Toate sectoarele</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id}>
                Sector {sector.sector_number} - {sector.sector_name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="">Toate</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ContractFilters;