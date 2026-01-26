// src/components/institutions/InstitutionSidebar.jsx
/**
 * ============================================================================
 * INSTITUTION SIDEBAR - ADD/EDIT/DELETE FORM (REFINED)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import {
  X, Save, Trash2, Building2, AlertTriangle,
  User, ChevronDown, ChevronUp,
} from 'lucide-react';

// Types that need representative info
const OPERATOR_TYPES = [
  'WASTE_COLLECTOR', 'TMB_OPERATOR', 'AEROBIC_OPERATOR', 'ANAEROBIC_OPERATOR',
  'RECYCLING_OPERATOR', 'SORTING_OPERATOR', 'RECOVERY_OPERATOR', 
  'DISPOSAL_CLIENT', 'LANDFILL'
];

const InstitutionSidebar = ({
  isOpen,
  onClose,
  mode = 'add', // 'add' | 'edit' | 'delete'
  institution = null,
  onSave,
  onDelete,
  saving = false,
  sectors = [],
  institutionTypes = {},
}) => {
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    type: '',
    sector: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    website: '',
    fiscal_code: '',
    registration_no: '',
    is_active: true,
    representative_name: '',
    representative_position: '',
    representative_phone: '',
    representative_email: '',
  });

  const [errors, setErrors] = useState({});
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [showRepresentativeSection, setShowRepresentativeSection] = useState(false);

  const typeNeedsRepresentative = OPERATOR_TYPES.includes(formData.type);

  // Populate form when editing
  useEffect(() => {
    if (institution && (mode === 'edit' || mode === 'delete')) {
      setFormData({
        name: institution.name || '',
        short_name: institution.short_name || '',
        type: institution.type || '',
        sector: institution.sector || '',
        contact_email: institution.contact_email || institution.email || '',
        contact_phone: institution.contact_phone || institution.phone || '',
        address: institution.address || '',
        website: institution.website || '',
        fiscal_code: institution.fiscal_code || institution.cui || '',
        registration_no: institution.registration_no || '',
        is_active: institution.is_active ?? true,
        representative_name: institution.representative_name || '',
        representative_position: institution.representative_position || institution.representative_function || '',
        representative_phone: institution.representative_phone || '',
        representative_email: institution.representative_email || '',
      });

      // Parse sectors from string or array
      if (institution.sector) {
        const sectorNums = institution.sector.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        setSelectedSectors(sectorNums);
      } else if (institution.sectors && Array.isArray(institution.sectors)) {
        setSelectedSectors(institution.sectors.map(s => s.sector_number));
      } else {
        setSelectedSectors([]);
      }

      setShowRepresentativeSection(
        !!(institution.representative_name || institution.representative_position || 
           institution.representative_phone || institution.representative_email)
      );
    } else if (mode === 'add') {
      setFormData({
        name: '',
        short_name: '',
        type: '',
        sector: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        website: '',
        fiscal_code: '',
        registration_no: '',
        is_active: true,
        representative_name: '',
        representative_position: '',
        representative_phone: '',
        representative_email: '',
      });
      setSelectedSectors([]);
      setShowRepresentativeSection(false);
    }
    setErrors({});
  }, [institution, mode, isOpen]);

  // Auto-show representative section when type changes to operator
  useEffect(() => {
    if (typeNeedsRepresentative && !showRepresentativeSection) {
      setShowRepresentativeSection(true);
    }
  }, [formData.type, typeNeedsRepresentative]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSectorToggle = (sectorNumber) => {
    setSelectedSectors(prev => {
      const newSectors = prev.includes(sectorNumber)
        ? prev.filter(s => s !== sectorNumber)
        : [...prev, sectorNumber].sort((a, b) => a - b);
      
      setFormData(f => ({ ...f, sector: newSectors.join(',') }));
      return newSectors;
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Numele este obligatoriu';
    }
    
    if (!formData.type) {
      newErrors.type = 'Tipul este obligatoriu';
    }
    
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email invalid';
    }

    if (formData.representative_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.representative_email)) {
      newErrors.representative_email = 'Email invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    onSave({
      ...formData,
      sector: selectedSectors.join(',')
    });
  };

  const isReadOnly = mode === 'delete';

  const getTitle = () => {
    switch (mode) {
      case 'add': return 'Adaugă Instituție';
      case 'edit': return 'Editează Instituție';
      case 'delete': return 'Șterge Instituție';
      default: return 'Instituție';
    }
  };

  // Get sectors list - use props or fallback
  const availableSectors = sectors.length > 0 
    ? sectors.map(s => ({ number: s.sector_number, name: `Sector ${s.sector_number}` }))
    : [1, 2, 3, 4, 5, 6].map(n => ({ number: n, name: `Sector ${n}` }));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-full max-w-lg
        bg-white dark:bg-gray-900 shadow-2xl z-50
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              mode === 'delete' 
                ? 'bg-red-100 dark:bg-red-500/20' 
                : 'bg-gradient-to-br from-teal-500 to-emerald-600'
            }`}>
              {mode === 'delete' 
                ? <AlertTriangle className="w-4 h-4 text-red-600" />
                : <Building2 className="w-4 h-4 text-white" />
              }
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {getTitle()}
              </h2>
              {institution && mode !== 'add' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {institution.short_name || institution.name}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'delete' ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                Confirmare ștergere
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ștergeți instituția <strong>{institution?.name}</strong>?
              </p>
              <p className="text-xs text-gray-500">
                Această acțiune nu poate fi anulată.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Nume Complet */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Nume Complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder="Numele complet al instituției"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Nume Scurt */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Nume Scurt / Acronim
                </label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                  placeholder="Ex: ADIGDMB"
                />
              </div>

              {/* Tip Instituție */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Tip Instituție <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all ${
                    errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Selectează tipul...</option>
                  {Object.entries(institutionTypes).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
              </div>

              {/* Sectoare */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Sectoare (U.A.T.)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableSectors.map(sector => {
                    const isSelected = selectedSectors.includes(sector.number);
                    return (
                      <button
                        key={sector.number}
                        type="button"
                        onClick={() => !isReadOnly && handleSectorToggle(sector.number)}
                        disabled={isReadOnly}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:cursor-not-allowed ${
                          isSelected 
                            ? 'bg-teal-500 text-white shadow-sm' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        S{sector.number}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Selectează sectoarele în care operează
                </p>
              </div>

              {/* Contact - 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all ${
                      errors.contact_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                    placeholder="contact@email.ro"
                  />
                  {errors.contact_email && <p className="mt-1 text-xs text-red-600">{errors.contact_email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Telefon
                  </label>
                  <input
                    type="text"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                    placeholder="021 XXX XXXX"
                  />
                </div>
              </div>

              {/* Adresă */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Adresă
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                  placeholder="Adresa completă"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                  placeholder="https://www.institutie.ro"
                />
              </div>

              {/* Cod Fiscal & Nr. Înregistrare */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Cod Fiscal / CUI
                  </label>
                  <input
                    type="text"
                    name="fiscal_code"
                    value={formData.fiscal_code}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                    placeholder="RO12345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Nr. Înregistrare
                  </label>
                  <input
                    type="text"
                    name="registration_no"
                    value={formData.registration_no}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                    placeholder="J40/XXX/YYYY"
                  />
                </div>
              </div>

              {/* Representative Section - Collapsible */}
              {typeNeedsRepresentative && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowRepresentativeSection(!showRepresentativeSection)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Reprezentant Legal
                      </span>
                    </div>
                    {showRepresentativeSection 
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                  
                  {showRepresentativeSection && (
                    <div className="p-3 space-y-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Nume
                          </label>
                          <input
                            type="text"
                            name="representative_name"
                            value={formData.representative_name}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                            placeholder="Ion Popescu"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Funcție
                          </label>
                          <input
                            type="text"
                            name="representative_position"
                            value={formData.representative_position}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                            placeholder="Director"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Telefon
                          </label>
                          <input
                            type="text"
                            name="representative_phone"
                            value={formData.representative_phone}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all"
                            placeholder="07XX XXX XXX"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="representative_email"
                            value={formData.representative_email}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            className={`w-full px-2.5 py-1.5 bg-white dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 transition-all ${
                              errors.representative_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                            }`}
                            placeholder="email@email.ro"
                          />
                          {errors.representative_email && (
                            <p className="mt-0.5 text-xs text-red-600">{errors.representative_email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Activ */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 disabled:opacity-60"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instituție activă
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl transition-colors"
            >
              Anulează
            </button>
            
            {mode === 'delete' ? (
              <button
                onClick={() => onDelete(institution)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {saving ? 'Se șterge...' : 'Șterge'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Se salvează...' : mode === 'add' ? 'Adaugă' : 'Salvează'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InstitutionSidebar;