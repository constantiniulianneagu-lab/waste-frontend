// WasteOperatorContractModal.jsx
/**
 * ============================================================================
 * WASTE OPERATOR CONTRACT MODAL
 * ============================================================================
 * Form pentru adăugare/editare contracte operatori colectare
 * Include gestionare multiple coduri deșeuri cu tarife
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { apiGet, apiPost, apiPut } from './api/apiClient';

const WasteOperatorContractModal = ({ 
  isOpen, 
  onClose, 
  institutionId, 
  contract = null, // null pentru add, obiect pentru edit
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Available data
  const [wasteCodes, setWasteCodes] = useState([]);
  const [sectors, setSectors] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    contract_number: '',
    contract_date_start: '',
    contract_date_end: '',
    service_start_date: '',
    sector_id: '',
    notes: '',
    is_active: true,
    waste_codes: [] // { waste_code_id, tariff, unit, estimated_quantity }
  });
  
  const [errors, setErrors] = useState({});

  // ========================================================================
  // LOAD DATA
  // ========================================================================

  useEffect(() => {
    if (isOpen) {
      loadWasteCodes();
      loadSectors();
      
      if (contract) {
        // Edit mode
        setFormData({
          contract_number: contract.contract_number || '',
          contract_date_start: contract.contract_date_start || '',
          contract_date_end: contract.contract_date_end || '',
          service_start_date: contract.service_start_date || '',
          sector_id: contract.sector_id || '',
          notes: contract.notes || '',
          is_active: contract.is_active !== false,
          waste_codes: contract.waste_codes || []
        });
      } else {
        // Add mode
        resetForm();
      }
    }
  }, [isOpen, contract]);

  const loadWasteCodes = async () => {
    try {
      const response = await apiGet('/api/waste-codes');
      if (response.success) {
        setWasteCodes(response.data || []);
      }
    } catch (err) {
      console.error('Error loading waste codes:', err);
    }
  };

  const loadSectors = async () => {
    try {
      const response = await apiGet('/api/sectors');
      if (response.success) {
        setSectors(response.data || []);
      }
    } catch (err) {
      console.error('Error loading sectors:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      contract_number: '',
      contract_date_start: '',
      contract_date_end: '',
      service_start_date: '',
      sector_id: '',
      notes: '',
      is_active: true,
      waste_codes: []
    });
    setErrors({});
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddWasteCode = () => {
    setFormData(prev => ({
      ...prev,
      waste_codes: [
        ...prev.waste_codes,
        { waste_code_id: '', tariff: '', unit: 'tonă', estimated_quantity: '' }
      ]
    }));
  };

  const handleRemoveWasteCode = (index) => {
    setFormData(prev => ({
      ...prev,
      waste_codes: prev.waste_codes.filter((_, i) => i !== index)
    }));
  };

  const handleWasteCodeChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      waste_codes: prev.waste_codes.map((wc, i) => 
        i === index ? { ...wc, [field]: value } : wc
      )
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.contract_number.trim()) {
      newErrors.contract_number = 'Număr contract obligatoriu';
    }
    if (!formData.contract_date_start) {
      newErrors.contract_date_start = 'Data început obligatorie';
    }
    
    // Validate waste codes
    formData.waste_codes.forEach((wc, i) => {
      if (wc.waste_code_id && !wc.tariff) {
        newErrors[`waste_code_tariff_${i}`] = 'Tarif obligatoriu';
      }
      if (wc.waste_code_id && !wc.unit) {
        newErrors[`waste_code_unit_${i}`] = 'Unitate obligatorie';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    
    try {
      const payload = {
        institution_id: institutionId,
        ...formData,
        waste_codes: formData.waste_codes.filter(wc => wc.waste_code_id)
      };
      
      let response;
      if (contract) {
        // Update
        response = await apiPut(
          `/api/institutions/${institutionId}/waste-contracts/${contract.id}`,
          payload
        );
      } else {
        // Create
        response = await apiPost(
          `/api/institutions/${institutionId}/waste-contracts`,
          payload
        );
      }
      
      if (response.success) {
        alert(contract ? 'Contract actualizat cu succes!' : 'Contract creat cu succes!');
        onSuccess();
        onClose();
      } else {
        alert(response.message || 'Eroare la salvare');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60] transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between border-b border-emerald-700 z-10">
              <h3 className="text-lg font-bold text-white">
                {contract ? 'Editează Contract Operator Colectare' : 'Adaugă Contract Operator Colectare'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Informații Contract
                </h4>

                {/* Contract Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Număr Contract *
                  </label>
                  <input
                    type="text"
                    name="contract_number"
                    value={formData.contract_number}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                      errors.contract_number ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white`}
                    placeholder="Ex: C-123/2024"
                  />
                  {errors.contract_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.contract_number}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Început *
                    </label>
                    <input
                      type="date"
                      name="contract_date_start"
                      value={formData.contract_date_start}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.contract_date_start ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white`}
                    />
                    {errors.contract_date_start && (
                      <p className="mt-1 text-xs text-red-500">{errors.contract_date_start}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data Sfârșit
                    </label>
                    <input
                      type="date"
                      name="contract_date_end"
                      value={formData.contract_date_end}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Sector
          {/* Service Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Începere Serviciu *
            </label>
            <input
              type="date"
              name="service_start_date"
              value={formData.service_start_date}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                errors.service_start_date ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-gray-900 dark:text-white`}
            />
            {errors.service_start_date && (
              <p className="mt-1 text-xs text-red-500">{errors.service_start_date}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              📅 Data de la care începe efectiv prestarea serviciului
            </p>
          </div>

          

           */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sector
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                  >
                    <option value="">Selectează sector...</option>
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.sector_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observații
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white resize-none"
                    placeholder="Detalii suplimentare..."
                  />
                </div>

                {/* Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contract activ
                  </label>
                </div>
              </div>

              {/* Waste Codes */}
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Coduri Deșeuri cu Tarife
                  </h4>
                  <button
                    onClick={handleAddWasteCode}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă Cod
                  </button>
                </div>

                {formData.waste_codes.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nu există coduri de deșeuri adăugate
                    </p>
                    <button
                      onClick={handleAddWasteCode}
                      className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Adaugă primul cod
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.waste_codes.map((wc, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                        
                        {/* Waste Code Select */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Cod Deșeu
                          </label>
                          <select
                            value={wc.waste_code_id}
                            onChange={(e) => handleWasteCodeChange(index, 'waste_code_id', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="">Selectează cod...</option>
                            {wasteCodes.map(code => (
                              <option key={code.id} value={code.id}>
                                {code.code} - {code.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {/* Tariff */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Tarif (LEI)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={wc.tariff}
                              onChange={(e) => handleWasteCodeChange(index, 'tariff', e.target.value)}
                              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                                errors[`waste_code_tariff_${index}`] ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                              } rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none`}
                              placeholder="0.00"
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Unitate
                            </label>
                            <select
                              value={wc.unit}
                              onChange={(e) => handleWasteCodeChange(index, 'unit', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                              <option value="tonă">tonă</option>
                              <option value="mc">mc</option>
                            </select>
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Cantitate est.
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={wc.estimated_quantity}
                              onChange={(e) => handleWasteCodeChange(index, 'estimated_quantity', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveWasteCode(index)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Șterge cod
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvează
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WasteOperatorContractModal;