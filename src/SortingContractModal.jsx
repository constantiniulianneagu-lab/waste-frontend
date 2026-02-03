// src/SortingContractModal.jsx
/**
 * ============================================================================
 * SORTING CONTRACT MODAL
 * ============================================================================
 * Form pentru adăugare/editare contracte operatori sortare
 * Simplu: tarif + cantitate (ca TMB)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { apiGet, apiPost, apiPut } from './api/apiClient';

const SortingContractModal = ({ 
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
    service_start_date: '',
    sector_id: '',
    tariff_per_ton: '',
    estimated_quantity_tons: '',
    currency: 'RON',
    notes: '',
    is_active: true
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
          service_start_date: contract.service_start_date || '',
          sector_id: contract.sector_id || '',
          tariff_per_ton: contract.tariff_per_ton || '',
          estimated_quantity_tons: contract.estimated_quantity_tons || '',
          currency: contract.currency || 'RON',
          notes: contract.notes || '',
          is_active: contract.is_active !== false
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
      service_start_date: '',
      sector_id: '',
      tariff_per_ton: '',
      estimated_quantity_tons: '',
      currency: 'RON',
      notes: '',
      is_active: true
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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.contract_number.trim()) {
      newErrors.contract_number = 'Număr contract obligatoriu';
    }
    if (!formData.contract_date_start) {
      newErrors.contract_date_start = 'Data început obligatorie';
    }
    if (!formData.tariff_per_ton) {
      newErrors.tariff_per_ton = 'Tarif obligatoriu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    
    try {
      const payload = {
        institution_id: institutionId,
        ...formData
      };
      
      let response;
      if (contract) {
        response = await apiPut(
          `/api/institutions/${institutionId}/sorting-contracts/${contract.id}`,
          payload
        );
      } else {
        response = await apiPost(
          `/api/institutions/${institutionId}/sorting-contracts`,
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

  // Calculate contract value
  const contractValue = formData.tariff_per_ton && formData.estimated_quantity_tons
    ? parseFloat(formData.tariff_per_ton) * parseFloat(formData.estimated_quantity_tons)
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-[70] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {contract ? 'Editează Contract Sortare' : 'Contract Nou Sortare'}
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
              } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white`}
              placeholder="Ex: CS-123/2024"
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
                } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white`}
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
            >
              <option value="">Selectează sector...</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sector_name}
                </option>
              ))}
            </select>
          </div>

          {/* Tariff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tarif per Tonă (LEI) *
            </label>
            <input
              type="number"
              step="0.01"
              name="tariff_per_ton"
              value={formData.tariff_per_ton}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                errors.tariff_per_ton ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              } rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white`}
              placeholder="0.00"
            />
            {errors.tariff_per_ton && (
              <p className="mt-1 text-xs text-red-500">{errors.tariff_per_ton}</p>
            )}
          </div>

          {/* Estimated Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantitate Estimată (tone)
            </label>
            <input
              type="number"
              step="0.01"
              name="estimated_quantity_tons"
              value={formData.estimated_quantity_tons}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
              placeholder="0.00"
            />
          </div>

          {/* Contract Value Preview */}
          {contractValue > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                Valoare Contract Estimată
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {new Intl.NumberFormat('ro-RO', {
                  style: 'currency',
                  currency: 'RON'
                }).format(contractValue)}
              </p>
            </div>
          )}

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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white resize-none"
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
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contract activ
            </label>
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
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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

export default SortingContractModal;