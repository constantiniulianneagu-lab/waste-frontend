// src/components/contracts/ContractFilters.jsx
/**
 * ============================================================================
 * CONTRACT FILTERS - DROPDOWN SELECTOR (ALL 6 TYPES)
 * ============================================================================
 * Order: Colectare → Sortare → Aerobă → Anaerobă → TMB → Depozitare
 * ============================================================================
 */

import { Filter, X, Search, RefreshCw, Plus, Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const CONTRACT_TYPE_OPTIONS = [
  { value: 'WASTE_COLLECTOR', label: 'Colectare', icon: '🚛' },
  { value: 'SORTING', label: 'Sortare', icon: '🔄' },
  { value: 'AEROBIC', label: 'Aerobă', icon: '🌱' },
  { value: 'ANAEROBIC', label: 'Anaerobă', icon: '🔋' },
  { value: 'TMB', label: 'TMB', icon: '⚙️' },
  { value: 'DISPOSAL', label: 'Depozitare', icon: '📦' },
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
  onExport,
  exporting = false,
  contractCounts = {},
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = (format) => {
    setIsExportOpen(false);
    onExport(format);
  };

  const handleTypeSelect = (type) => {
    setIsTypeDropdownOpen(false);
    onContractTypeChange(type);
  };

  const exportOptions = [
    { format: 'pdf', label: 'Export PDF', icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-500/10', hoverColor: 'hover:bg-red-100 dark:hover:bg-red-500/20' },
    { format: 'xlsx', label: 'Export Excel', icon: FileSpreadsheet, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-500/10', hoverColor: 'hover:bg-green-100 dark:hover:bg-green-500/20' },
    { format: 'csv', label: 'Export CSV', icon: File, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-500/10', hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-500/20' },
  ];

  const selectedType = CONTRACT_TYPE_OPTIONS.find(t => t.value === contractType);
  const selectedCount = contractCounts[contractType] || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Top Row: Type Selector + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left - Contract Type Dropdown */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all min-w-[220px]"
          >
            <span className="text-xl">{selectedType?.icon}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold">{selectedType?.label}</div>
              <div className="text-xs opacity-90">{selectedCount} contracte</div>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isTypeDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-[280px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-hidden">
              <div className="p-2 space-y-1">
                {CONTRACT_TYPE_OPTIONS.map((option) => {
                  const count = contractCounts[option.value] || 0;
                  const isSelected = contractType === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleTypeSelect(option.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{option.label}</div>
                        <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                          {count} contracte
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 flex-wrap">
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

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            title="Reîncarcă"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-teal-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă</span>
            </button>
          )}

          {onExport && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
                <span>{exporting ? 'Se exportă...' : 'Export'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && !exporting && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.format}
                        onClick={() => handleExportClick(option.format)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${option.hoverColor} first:rounded-t-xl last:rounded-b-xl`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${option.color}`} />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Additional Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtre:</span>
        </div>

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

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-w-[120px]"
        >
          <option value="">Toate</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Resetează filtrele"
          >
            <X className="w-4 h-4" />
            <span>Resetează</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractFilters;