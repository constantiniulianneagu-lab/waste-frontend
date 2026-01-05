/**
 * ============================================================================
 * REPORTS SIDEBAR COMPONENT
 * ============================================================================
 * Sidebar pentru adăugare/editare înregistrări
 * Slide-in din dreapta cu form complet
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { createLandfillTicket, updateLandfillTicket } from '../../services/reportsService';

const ReportsSidebar = ({ 
  isOpen, 
  mode, // 'create' | 'edit'
  ticket, // ticket data for edit mode
  wasteCodes,
  operators,
  sectors,
  onClose,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    ticket_time: new Date().toTimeString().slice(0, 5),
    supplier_id: '',
    waste_code_id: '',
    sector_id: '',
    generator: '',
    vehicle_number: '',
    gross_weight_tons: '',
    tare_weight_tons: '',
    net_weight_tons: '',
    contract: '',
    observations: ''
  });

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && ticket) {
      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticket.ticket_date || '',
        ticket_time: ticket.ticket_time || '',
        supplier_id: ticket.supplier_id || '',
        waste_code_id: ticket.waste_code_id || '',
        sector_id: ticket.sector_id || '',
        generator: ticket.generator || '',
        vehicle_number: ticket.vehicle_number || '',
        gross_weight_tons: ticket.gross_weight_tons || '',
        tare_weight_tons: ticket.tare_weight_tons || '',
        net_weight_tons: ticket.net_weight_tons || '',
        contract: ticket.contract || '',
        observations: ticket.observations || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        ticket_time: new Date().toTimeString().slice(0, 5),
        supplier_id: '',
        waste_code_id: '',
        sector_id: '',
        generator: '',
        vehicle_number: '',
        gross_weight_tons: '',
        tare_weight_tons: '',
        net_weight_tons: '',
        contract: '',
        observations: ''
      });
    }
    setError(null);
  }, [mode, ticket, isOpen]);

  // Auto-calculate net weight
  useEffect(() => {
    const gross = parseFloat(formData.gross_weight_tons) || 0;
    const tare = parseFloat(formData.tare_weight_tons) || 0;
    const net = gross - tare;
    
    if (gross > 0 && tare > 0 && net >= 0) {
      setFormData(prev => ({
        ...prev,
        net_weight_tons: net.toFixed(2)
      }));
    }
  }, [formData.gross_weight_tons, formData.tare_weight_tons]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    const required = [
      'ticket_number',
      'ticket_date',
      'ticket_time',
      'supplier_id',
      'waste_code_id',
      'sector_id',
      'generator',
      'vehicle_number',
      'gross_weight_tons',
      'tare_weight_tons'
    ];

    for (const field of required) {
      if (!formData[field]) {
        setError(`Câmpul ${field.replace('_', ' ')} este obligatoriu`);
        return false;
      }
    }

    const gross = parseFloat(formData.gross_weight_tons);
    const tare = parseFloat(formData.tare_weight_tons);

    if (gross <= tare) {
      setError('Greutatea brută trebuie să fie mai mare decât tara');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        gross_weight_tons: parseFloat(formData.gross_weight_tons),
        tare_weight_tons: parseFloat(formData.tare_weight_tons),
        net_weight_tons: parseFloat(formData.net_weight_tons)
      };

      let response;
      if (mode === 'edit') {
        response = await updateLandfillTicket(ticket.id, payload);
      } else {
        response = await createLandfillTicket(payload);
      }

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Eroare la salvare');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-[#242b3d] shadow-xl 
                    transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-[#242b3d] border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Adaugă înregistrare nouă' : 'Editează înregistrare'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
            {/* Ticket Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Număr ticket cântar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ticket_number}
                onChange={(e) => handleChange('ticket_number', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
                placeholder="ex: 1286659"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ticket_date}
                  onChange={(e) => handleChange('ticket_date', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.ticket_time}
                  onChange={(e) => handleChange('ticket_time', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                />
              </div>
            </div>

            {/* Supplier (Furnizor) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Furnizor (Operator) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => handleChange('supplier_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
              >
                <option value="">Selectează furnizor</option>
                {operators.map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>
            </div>

            {/* Waste Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tip produs (Cod deșeu) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.waste_code_id}
                onChange={(e) => handleChange('waste_code_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
              >
                <option value="">Selectează cod deșeu</option>
                {wasteCodes.map(wc => (
                  <option key={wc.id} value={wc.id}>
                    {wc.code} - {wc.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provenință (Sector) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sector_id}
                onChange={(e) => handleChange('sector_id', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
              >
                <option value="">Selectează sector</option>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Generator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generator <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.generator}
                onChange={(e) => handleChange('generator', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
                placeholder="ex: Populatie"
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Număr auto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => handleChange('vehicle_number', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
                placeholder="ex: B 526 SDF"
              />
            </div>

            {/* Weights */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tone brut <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gross_weight_tons}
                  onChange={(e) => handleChange('gross_weight_tons', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tone tară <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tare_weight_tons}
                  onChange={(e) => handleChange('tare_weight_tons', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tone net
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.net_weight_tons}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Contract */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract
              </label>
              <input
                type="text"
                value={formData.contract}
                onChange={(e) => handleChange('contract', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors"
                placeholder="ex: Taxă"
              />
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observații
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-colors resize-none"
                placeholder="Observații opționale..."
              />
            </div>
          </div>

          {/* Footer - Buttons */}
          <div className="sticky bottom-0 bg-white dark:bg-[#242b3d] border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg 
                         transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvare...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvează
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                         text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulează
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportsSidebar;