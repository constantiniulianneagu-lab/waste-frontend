// src/components/contracts/ContractFilters.jsx
/**
 * ============================================================================
 * CONTRACT FILTERS - ALL BUTTONS ON SAME ROW
 * ============================================================================
 */

import { X, Search, RefreshCw, Plus, Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react';
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
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const sectorDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target)) {
        setIsSectorDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
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

  const handleSectorSelect = (sector) => {
    setIsSectorDropdownOpen(false);
    onSectorChange(sector);
  };

  const handleStatusSelect = (newStatus) => {
    setIsStatusDropdownOpen(false);
    onStatusChange(newStatus);
  };

  const exportOptions = [
    { format: 'pdf', label: 'Export PDF', icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-500/10', hoverColor: 'hover:bg-red-100 dark:hover:bg-red-500/20' },
    { format: 'xlsx', label: 'Export Excel', icon: FileSpreadsheet, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-500/10', hoverColor: 'hover:bg-green-100 dark:hover:bg-green-500/20' },
    { format: 'csv', label: 'Export CSV', icon: File, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-500/10', hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-500/20' },
  ];

  const selectedType = CONTRACT_TYPE_OPTIONS.find(t => t.value === contractType);
  const selectedCount = contractCounts[contractType] || 0;
  const selectedSector = sectors.find(s => s.id === sectorId);
  const statusLabel = status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Toate';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Contract Type Dropdown */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all min-w-[220px]"
          >
            <span className="text-xl">{selectedType?.icon}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold">{selectedType?.label}</div>
              <div className="text-xs opacity-90">{selectedCount} contracte</div>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTypeDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-[280px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
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
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sector Dropdown */}
        <div className="relative" ref={sectorDropdownRef}>
          <button
            onClick={() => setIsSectorDropdownOpen(!isSectorDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-w-[160px]"
          >
            <span className="flex-1 text-left font-medium">
              {selectedSector ? `Sectorul ${selectedSector.sector_number}` : 'Toate sectoarele'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSectorDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-[200px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden max-h-[300px] overflow-y-auto">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleSectorSelect('')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    !sectorId
                      ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Toate sectoarele
                </button>
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => handleSectorSelect(sector.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      sectorId === sector.id
                        ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Sectorul {sector.sector_number}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={statusDropdownRef}>
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-w-[120px]"
          >
            <span className="flex-1 text-left font-medium">{statusLabel}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isStatusDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-[160px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleStatusSelect('')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    !status
                      ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Toate
                </button>
                <button
                  onClick={() => handleStatusSelect('active')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    status === 'active'
                      ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusSelect('inactive')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    status === 'inactive'
                      ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-[20px]" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Caută contract..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-56 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Resetează filtrele"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          title="Reîncarcă"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Add */}
        {canCreate && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adaugă contract</span>
          </button>
        )}

        {/* Export */}
        {onExport && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'Se exportă...' : 'Export'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && !exporting && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden">
                {exportOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.format}
                      onClick={() => handleExportClick(option.format)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${option.hoverColor}`}
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
  );
};

export default ContractFilters;