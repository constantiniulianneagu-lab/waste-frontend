// src/components/users/InstitutionMultiSelect.jsx
import { useState, useMemo } from 'react';
import { Search, X, Building2, MapPin } from 'lucide-react';

const InstitutionMultiSelect = ({ 
  institutions = [], 
  selectedIds = [], 
  onChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter institutions based on search
  const filteredInstitutions = useMemo(() => {
    if (!searchTerm) return institutions;
    
    const term = searchTerm.toLowerCase();
    return institutions.filter(inst => 
      inst.name.toLowerCase().includes(term) ||
      inst.type?.toLowerCase().includes(term)
    );
  }, [institutions, searchTerm]);

  // Get selected institutions objects
  const selectedInstitutions = useMemo(() => {
    return institutions.filter(inst => selectedIds.includes(inst.id));
  }, [institutions, selectedIds]);

  // Get unique sectors from selected institutions
  const uniqueSectors = useMemo(() => {
    const sectorsMap = new Map();
    
    selectedInstitutions.forEach(inst => {
      if (inst.sectors && Array.isArray(inst.sectors)) {
        inst.sectors.forEach(sector => {
          if (!sectorsMap.has(sector.id)) {
            sectorsMap.set(sector.id, sector);
          }
        });
      }
    });
    
    return Array.from(sectorsMap.values()).sort((a, b) => 
      a.sector_number - b.sector_number
    );
  }, [selectedInstitutions]);

  const handleToggle = (instId) => {
    if (selectedIds.includes(instId)) {
      onChange(selectedIds.filter(id => id !== instId));
    } else {
      onChange([...selectedIds, instId]);
    }
  };

  const handleRemove = (instId) => {
    onChange(selectedIds.filter(id => id !== instId));
  };

  const getInstitutionTypeLabel = (type) => {
    const labels = {
      'WASTE_COLLECTOR': 'Operator Colectare',
      'TMB_OPERATOR': 'Operator TMB',
      'SORTING_OPERATOR': 'Operator Sortare',
      'LANDFILL': 'Depozit'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-3">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Caută instituție..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 
                   border border-gray-200 dark:border-gray-700 
                   rounded-[14px] 
                   bg-gray-50 dark:bg-gray-900/50 
                   text-gray-900 dark:text-white text-sm
                   placeholder:text-gray-400
                   focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                   transition-all duration-300"
        />
      </div>

      {/* Institutions List with Checkboxes */}
      <div className="max-h-60 overflow-y-auto 
                    border border-gray-200 dark:border-gray-700 
                    rounded-[14px] 
                    bg-gray-50/50 dark:bg-gray-900/30">
        {filteredInstitutions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm ? 'Nicio instituție găsită' : 'Nu există instituții'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInstitutions.map(inst => (
              <label
                key={inst.id}
                className="flex items-center gap-3 p-3 
                         hover:bg-gray-100 dark:hover:bg-gray-800/50 
                         cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(inst.id)}
                  onChange={() => handleToggle(inst.id)}
                  className="w-4 h-4 
                           text-emerald-600 
                           border-gray-300 dark:border-gray-600 
                           rounded 
                           focus:ring-2 focus:ring-emerald-500/30
                           cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm truncate
                                group-hover:text-emerald-600 dark:group-hover:text-emerald-400
                                transition-colors">
                    {inst.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {getInstitutionTypeLabel(inst.type)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Selected Institutions Pills */}
      {selectedInstitutions.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                          uppercase tracking-wider mb-2">
            Instituții Selectate ({selectedInstitutions.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedInstitutions.map(inst => (
              <span
                key={inst.id}
                className="inline-flex items-center gap-2 
                         px-3 py-1.5 
                         bg-emerald-500/10 dark:bg-emerald-500/20 
                         border border-emerald-500/20 dark:border-emerald-500/30
                         text-emerald-700 dark:text-emerald-400 
                         rounded-[10px] 
                         text-sm font-medium
                         transition-all duration-300
                         hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{inst.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(inst.id)}
                  className="p-0.5 
                           hover:bg-emerald-500/20 dark:hover:bg-emerald-500/40 
                           rounded 
                           transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sectors Info (Read-only, computed from selected institutions) */}
      {uniqueSectors.length > 0 && (
        <div className="p-4 
                      bg-blue-50/50 dark:bg-blue-500/10 
                      border border-blue-200 dark:border-blue-500/20 
                      rounded-[14px]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <label className="text-xs font-bold text-blue-700 dark:text-blue-400 
                            uppercase tracking-wider">
              Sectoare Asociate (prin instituții)
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueSectors.map(sector => (
              <span
                key={sector.id}
                className="inline-flex items-center gap-1.5 
                         px-2.5 py-1 
                         bg-blue-500/10 dark:bg-blue-500/20 
                         border border-blue-500/20 dark:border-blue-500/30
                         text-blue-700 dark:text-blue-400 
                         rounded-[8px] 
                         text-xs font-bold"
              >
                Sector {sector.sector_number}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionMultiSelect;
