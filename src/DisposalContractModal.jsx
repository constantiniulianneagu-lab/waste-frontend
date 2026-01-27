// src/DisposalContractModal.jsx
/**
 * ============================================================================
 * DISPOSAL CONTRACT MODAL
 * ============================================================================
 * Form pentru adăugare/editare contracte depozite
 * Include gestionare multiple sectoare cu tarife + taxa CEC
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { apiGet, apiPost, apiPut } from './api/apiClient';

const DisposalContractModal = ({ 
  isOpen, 
  onClose, 
  institutionId, 
  contract = null,
  onSuccess 
}) => {
  const [saving, setSaving] = useState(false);
  const [sectors, setSectors] = useState([]);
  
  const [formData, setFormData] = useState({
    contract_number: '',
    contract_date_start: '',
    contract_date_end: '',
    notes: '',
    is_active: true,
    sectors: [] // { sector_id, tariff_per_ton, cec_tax_per_ton, contracted_quantity_tons }
  });
  
  const [errors, setErrors] = useState({});

  // ========================================================================
  // LOAD DATA
  // ========================================================================

  useEffect(() => {
    if (isOpen) {
      loadSectors();
      
      if (contract) {
        setFormData({
          contract_number: contract.contract_number || '',
          contract_date_start: contract.contract_date_start || '',
          contract_date_end: contract.contract_date_end || '',
          notes: contract.notes || '',
          is_active: contract.is_active !== false,
          sectors: contract.sectors || []
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, contract]);

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
      notes: '',
      is_active: true,
      sectors: []
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

  const handleAddSector = () => {
    setFormData(prev => ({
      ...prev,
      sectors: [
        ...prev.sectors,
        { sector_id: '', tariff_per_ton: '', cec_tax_per_ton: '', contracted_quantity_tons: '' }
      ]
    }));
  };

  const handleRemoveSector = (index) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.filter((_, i) => i !== index)
    }));
  };

  const handleSectorChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
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
    
    // Validate sectors
    formData.sectors.forEach((s, i) => {
      if (s.sector_id && !s.tariff_per_ton) {
        newErrors[`sector_tariff_${i}`] = 'Tarif obligatoriu';
      }
      if (s.sector_id && s.cec_tax_per_ton === '') {
        newErrors[`sector_cec_${i}`] = 'Taxa CEC obligatorie';
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
        sectors: formData.sectors.filter(s => s.sector_id)
      };
      
      let response;
      if (contract) {
        response = await apiPut(
          `/api/institutions/${institutionId}/disposal-contracts/${contract.id}`,
          payload
        );
      } else {
        response = await apiPost(
          `/api/institutions/${institutionId}/disposal-contracts`,
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

  // Calculate total contract value
  const totalValue = formData.sectors.reduce((sum, s) => {
    const tariff = parseFloat(s.tariff_per_ton) || 0;
    const cec = parseFloat(s.cec_tax_per_ton) || 0;
    const qty = parseFloat(s.contracted_quantity_tons) || 0;
    return sum + ((tariff + cec) * qty);
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[700px] bg-white dark:bg-gray-800 shadow-2xl z-[70] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {contract ? 'Editează Contract Depozit' : 'Contract Nou Depozit'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Basic Info */}
          <div className="space-y-4">
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
                } rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-white`}
                placeholder="Ex: CD-123/2024"
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
                  } rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-white`}
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
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-white resize-none"
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
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contract activ
              </label>
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Sectoare cu Tarife
              </h4>
              <button
                onClick={handleAddSector}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adaugă Sector
              </button>
            </div>

            {formData.sectors.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nu există sectoare adăugate
                </p>
                <button
                  onClick={handleAddSector}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Adaugă primul sector
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.sectors.map((sector, index) => {
                  const tariff = parseFloat(sector.tariff_per_ton) || 0;
                  const cec = parseFloat(sector.cec_tax_per_ton) || 0;
                  const qty = parseFloat(sector.contracted_quantity_tons) || 0;
                  const sectorValue = (tariff + cec) * qty;
                  
                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      
                      {/* Sector Select */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Sector
                        </label>
                        <select
                          value={sector.sector_id}
                          onChange={(e) => handleSectorChange(index, 'sector_id', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="">Selectează sector...</option>
                          {sectors.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.sector_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Tariff */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Tarif Depozitare (LEI/tonă)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={sector.tariff_per_ton}
                            onChange={(e) => handleSectorChange(index, 'tariff_per_ton', e.target.value)}
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                              errors[`sector_tariff_${index}`] ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            } rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none`}
                            placeholder="0.00"
                          />
                        </div>

                        {/* CEC Tax */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Taxa CEC (LEI/tonă)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={sector.cec_tax_per_ton}
                            onChange={(e) => handleSectorChange(index, 'cec_tax_per_ton', e.target.value)}
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${
                              errors[`sector_cec_${index}`] ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            } rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Cantitate Contractată (tone)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={sector.contracted_quantity_tons}
                          onChange={(e) => handleSectorChange(index, 'contracted_quantity_tons', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Sector Value */}
                      {sectorValue > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Valoare sector: <span className="font-bold">
                              {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(sectorValue)}
                            </span>
                          </p>
                          <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                            ({tariff.toFixed(2)} + {cec.toFixed(2)}) × {qty.toFixed(2)} t
                          </p>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveSector(index)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Șterge sector
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Value */}
            {totalValue > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  Valoare Totală Contract (FĂRĂ TVA)
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {new Intl.NumberFormat('ro-RO', {
                    style: 'currency',
                    currency: 'RON'
                  }).format(totalValue)}
                </p>
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
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
    </>
  );
};

export default DisposalContractModal;