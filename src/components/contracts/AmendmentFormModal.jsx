// src/components/contracts/AmendmentFormModal.jsx
/**
 * ============================================================================
 * AMENDMENT FORM MODAL - Formular creare/editare acte adiționale
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AmendmentFormModal = ({ 
  isOpen, 
  onClose, 
  contract, 
  contractType,
  amendment = null,  // null = create, object = edit
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    amendment_number: '',
    amendment_date: new Date().toISOString().split('T')[0],
    amendment_type: 'MANUAL',
    new_contract_date_end: '',
    new_contract_date_start: '',
    new_service_start_date: '',
    new_tariff_per_ton: '',
    new_cec_tax_per_ton: '',
    new_estimated_quantity_tons: '',
    new_indicator_recycling_percent: '',
    new_indicator_energy_recovery_percent: '',
    new_indicator_disposal_percent: '',
    changes_description: '',
    reason: '',
    notes: ''
  });

  const [calculatedQuantity, setCalculatedQuantity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (amendment) {
      // Edit mode - populează cu date existente
      setFormData({
        amendment_number: amendment.amendment_number || '',
        amendment_date: amendment.amendment_date || '',
        amendment_type: amendment.amendment_type || 'MANUAL',
        new_contract_date_end: amendment.new_contract_date_end || '',
        new_contract_date_start: amendment.new_contract_date_start || '',
        new_service_start_date: amendment.new_service_start_date || '',
        new_tariff_per_ton: amendment.new_tariff_per_ton || '',
        new_cec_tax_per_ton: amendment.new_cec_tax_per_ton || '',
        new_estimated_quantity_tons: amendment.new_estimated_quantity_tons || '',
        new_indicator_recycling_percent: amendment.new_indicator_recycling_percent || '',
        new_indicator_energy_recovery_percent: amendment.new_indicator_energy_recovery_percent || '',
        new_indicator_disposal_percent: amendment.new_indicator_disposal_percent || '',
        changes_description: amendment.changes_description || '',
        reason: amendment.reason || '',
        notes: amendment.notes || ''
      });
    } else {
      // Create mode - generează număr automat
      generateAmendmentNumber();
    }
  }, [amendment, contract]);

  // Calcul automat cantitate când se schimbă data
  useEffect(() => {
    if (formData.new_contract_date_end && contract && 
        (formData.amendment_type === 'PRELUNGIRE' || 
         formData.amendment_type === 'INCETARE' ||
         formData.amendment_type === 'MODIFICARE_VALABILITATE')) {
      calculateProportionalQuantity();
    }
  }, [formData.new_contract_date_end, formData.amendment_type]);

  const generateAmendmentNumber = async () => {
    try {
      const response = await axios.get(
        `/api/amendments/${contractType}/${contract.id}`
      );
      const count = response.data.data.length + 1;
      setFormData(prev => ({
        ...prev,
        amendment_number: `${contract.contract_number}-${count}`
      }));
    } catch (err) {
      console.error('Error generating amendment number:', err);
      setFormData(prev => ({
        ...prev,
        amendment_number: `${contract.contract_number}-1`
      }));
    }
  };

  const calculateProportionalQuantity = () => {
    const totalQuantity = contract.estimated_quantity_tons || contract.contracted_quantity_tons;
    if (!totalQuantity) return;

    const startDate = new Date(contract.contract_date_start);
    const originalEndDate = new Date(contract.contract_date_end);
    const newEndDate = new Date(formData.new_contract_date_end);

    const totalDays = Math.ceil((originalEndDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const newDays = Math.ceil((newEndDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const tonsPerDay = totalQuantity / totalDays;
    const adjustedQuantity = (tonsPerDay * newDays).toFixed(2);

    setCalculatedQuantity({
      original: totalQuantity,
      adjusted: parseFloat(adjustedQuantity),
      difference: (parseFloat(adjustedQuantity) - totalQuantity).toFixed(2),
      tonsPerDay: tonsPerDay.toFixed(2),
      totalDays,
      newDays
    });

    setFormData(prev => ({
      ...prev,
      new_estimated_quantity_tons: adjustedQuantity
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (amendment) {
        // Update
        await axios.put(
          `/api/amendments/${contractType}/${amendment.id}`,
          formData
        );
      } else {
        // Create
        await axios.post(
          `/api/amendments/${contractType}/${contract.id}`,
          formData
        );
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la salvarea actului adițional');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {amendment ? 'Editare Act Adițional' : 'Act Adițional Nou'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="width" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Contract Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Contract: {contract.contract_number}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Perioada:</span> {contract.contract_date_start} → {contract.contract_date_end}
              </div>
              <div>
                <span className="font-medium">Cantitate:</span> {contract.estimated_quantity_tons || contract.contracted_quantity_tons || 'N/A'} tone
              </div>
            </div>
          </div>

          {/* Bază Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Număr Act *
              </label>
              <input
                type="text"
                name="amendment_number"
                value={formData.amendment_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Act *
              </label>
              <input
                type="date"
                name="amendment_date"
                value={formData.amendment_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Modificare *
              </label>
              <select
                name="amendment_type"
                value={formData.amendment_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MANUAL">Manual</option>
                <option value="PRELUNGIRE">Prelungire</option>
                <option value="INCETARE">Încetare</option>
                <option value="MODIFICARE_TARIF">Modificare Tarif</option>
                {contractType === 'DISPOSAL' && (
                  <option value="MODIFICARE_CEC">Modificare Taxa CEC</option>
                )}
                <option value="MODIFICARE_CANTITATE">Modificare Cantitate</option>
                <option value="MODIFICARE_VALABILITATE">Modificare Valabilitate</option>
                {(contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
                  <option value="MODIFICARE_INDICATORI">Modificare Indicatori</option>
                )}
              </select>
            </div>
          </div>

          {/* Date Modificare */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouă Dată Sfârșit
              </label>
              <input
                type="date"
                name="new_contract_date_end"
                value={formData.new_contract_date_end}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouă Dată Început
              </label>
              <input
                type="date"
                name="new_contract_date_start"
                value={formData.new_contract_date_start}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouă Dată Început Prestare
              </label>
              <input
                type="date"
                name="new_service_start_date"
                value={formData.new_service_start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Calcul Cantitate Automată */}
          {calculatedQuantity && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📊 Calcul Automat Cantitate</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-600 font-medium">Original</div>
                  <div className="text-blue-900">{calculatedQuantity.original} tone</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Tone/zi</div>
                  <div className="text-blue-900">{calculatedQuantity.tonsPerDay}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Zile noi</div>
                  <div className="text-blue-900">{calculatedQuantity.newDays}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Cantitate ajustată</div>
                  <div className="text-blue-900 font-bold">{calculatedQuantity.adjusted} tone</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                Diferență: {calculatedQuantity.difference > 0 ? '+' : ''}{calculatedQuantity.difference} tone
              </div>
            </div>
          )}

          {/* Tarife */}
          {(contractType === 'DISPOSAL' || contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC' || contractType === 'SORTING') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nou Tarif (RON/t)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="new_tariff_per_ton"
                  value={formData.new_tariff_per_ton}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {contractType === 'DISPOSAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouă Taxa CEC (RON/t)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="new_cec_tax_per_ton"
                    value={formData.new_cec_tax_per_ton}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouă Cantitate (tone)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="new_estimated_quantity_tons"
                  value={formData.new_estimated_quantity_tons}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Indicatori */}
          {contractType === 'TMB' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reciclare (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="new_indicator_recycling_percent"
                  value={formData.new_indicator_recycling_percent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valorificare Energetică (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="new_indicator_energy_recovery_percent"
                  value={formData.new_indicator_energy_recovery_percent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depozitare (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="new_indicator_disposal_percent"
                  value={formData.new_indicator_disposal_percent}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {(contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Depozitare (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="new_indicator_disposal_percent"
                value={formData.new_indicator_disposal_percent}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Descriere și Observații */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere Modificări
              </label>
              <textarea
                name="changes_description"
                value={formData.changes_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrieți modificările aduse prin acest act adițional..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motiv
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Motivul pentru acest act adițional..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observații
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Observații suplimentare..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Se salvează...' : (amendment ? 'Actualizează' : 'Creează Act')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmendmentFormModal;