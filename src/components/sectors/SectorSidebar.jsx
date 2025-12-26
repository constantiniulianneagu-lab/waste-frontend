// src/components/sectors/SectorSidebar.jsx
import { X, Save, Layers, MapPin, Users, Building2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

const SectorSidebar = ({
  mode = 'view',
  sector = null,
  institutions = [],
  onClose,
  onUpdateSector,
  onUpdateInstitutions
}) => {
  const [formData, setFormData] = useState({
    sector_name: '',
    description: '',
    area_km2: '',
    population: ''
  });

  const [selectedInstitutions, setSelectedInstitutions] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'institutions'

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // Initialize form data
  useEffect(() => {
    if (sector) {
      setFormData({
        sector_name: sector.sector_name || '',
        description: sector.description || '',
        area_km2: sector.area_km2 || '',
        population: sector.population || ''
      });
      setSelectedInstitutions(sector.institutions?.map(i => i.id) || []);
    }
  }, [sector]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'info') {
      onUpdateSector(sector.id, formData);
    } else {
      onUpdateInstitutions(sector.id, selectedInstitutions);
    }
  };

  const toggleInstitution = (instId) => {
    setSelectedInstitutions(prev => {
      if (prev.includes(instId)) {
        return prev.filter(id => id !== instId);
      } else {
        return [...prev, instId];
      }
    });
  };

  const getInstitutionsByType = (type) => {
    return institutions.filter(i => i.type === type);
  };

  const institutionTypes = [
    { type: 'MUNICIPALITY', label: 'Primării', icon: '🏛️', color: 'blue' },
    { type: 'WASTE_COLLECTOR', label: 'Colectare Deșeuri', icon: '🚛', color: 'emerald' },
    { type: 'TMB_OPERATOR', label: 'TMB', icon: '♻️', color: 'lime' },
    { type: 'SORTING_OPERATOR', label: 'Sortare', icon: '📦', color: 'cyan' },
    { type: 'LANDFILL', label: 'Depozit', icon: '🏗️', color: 'amber' },
    { type: 'REGULATOR', label: 'Regulator', icon: '⚖️', color: 'purple' },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[800px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-[12px] shadow-sm">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isViewMode && 'Detalii Sector'}
                {isEditMode && 'Editare Sector'}
              </h2>
              {sector && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sector {sector.sector_number} - {sector.sector_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-[10px] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {!isViewMode && (
          <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Informații Generale
            </button>
            <button
              onClick={() => setActiveTab('institutions')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'institutions'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Instituții ({selectedInstitutions.length})
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isViewMode ? (
            // ========== VIEW MODE ==========
            <div className="space-y-6">
              {/* General Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Informații Generale
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nume Sector</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{sector?.sector_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Oraș</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{sector?.city || 'București'}</dd>
                  </div>
                  {sector?.description && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descriere</dt>
                      <dd className="text-sm text-gray-700 dark:text-gray-300">{sector.description}</dd>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Populație</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {sector?.population?.toLocaleString('ro-RO') || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Suprafață</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {sector?.area_km2 ? sector.area_km2 + ' km²' : '-'}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</dt>
                    <dd>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-bold ${
                        sector?.is_active 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                      }`}>
                        {sector?.is_active ? 'Activ' : 'Inactiv'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Creat la</dt>
                    <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(sector?.created_at)}
                    </dd>
                  </div>
                  {sector?.updated_at && sector.updated_at !== sector.created_at && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ultima modificare</dt>
                      <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(sector?.updated_at)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Institutions */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Instituții Asociate ({sector?.institutions?.length || 0})
                </h3>
                {sector?.institutions && sector.institutions.length > 0 ? (
                  <div className="space-y-2">
                    {sector.institutions.map((inst) => (
                      <div
                        key={inst.id}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-[12px] border border-gray-200 dark:border-gray-700"
                      >
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{inst.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{inst.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nicio instituție asociată</p>
                )}
              </div>
            </div>
          ) : activeTab === 'info' ? (
            // ========== EDIT INFO ==========
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Număr Sector
                </label>
                <input
                  type="text"
                  value={sector?.sector_number}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Nume Sector *
                </label>
                <input
                  type="text"
                  value={formData.sector_name}
                  onChange={(e) => setFormData({ ...formData, sector_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Descriere
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                  placeholder="Descriere sector..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Populație
                  </label>
                  <input
                    type="number"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    placeholder="380000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Suprafață (km²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.area_km2}
                    onChange={(e) => setFormData({ ...formData, area_km2: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    placeholder="31.8"
                  />
                </div>
              </div>
            </form>
          ) : (
            // ========== EDIT INSTITUTIONS ==========
            <div className="space-y-6">
              <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-[14px] p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Tip:</strong> Bifează instituțiile care operează în acest sector. Modificările vor fi salvate când apeși butonul "Salvează Instituții".
                </p>
              </div>

              {institutionTypes.map(({ type, label, icon, color }) => {
                const typeInstitutions = getInstitutionsByType(type);
                if (typeInstitutions.length === 0) return null;

                return (
                  <div key={type} className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span>{icon}</span>
                      {label} ({typeInstitutions.length})
                    </h4>
                    <div className="space-y-2">
                      {typeInstitutions.map((inst) => (
                        <label
                          key={inst.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-[12px] hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedInstitutions.includes(inst.id)}
                            onChange={() => toggleInstitution(inst.id)}
                            className={`w-4 h-4 text-${color}-600 border-gray-300 dark:border-gray-600 rounded focus:ring-${color}-500 focus:ring-2`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{inst.name}</div>
                            {inst.short_name && inst.short_name !== inst.name && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{inst.short_name}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            {isViewMode ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-[14px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-98"
              >
                Închide
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-[14px] transition-all active:scale-98 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {activeTab === 'info' ? 'Salvează Info' : 'Salvează Instituții'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-[14px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-98"
                >
                  Anulează
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SectorSidebar;