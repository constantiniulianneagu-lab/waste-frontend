// src/components/reports/RejectedSidebar.jsx
/**
 * ============================================================================
 * REJECTED SIDEBAR - ADD/EDIT TICKETS
 * ============================================================================
 * Schema de culori: Zinc - Instituțional Modern
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const RejectedSidebar = ({ 
  isOpen, 
  mode, 
  ticket, 
  wasteCodes = [], 
  operators = [],
  suppliers = [],
  sectors = [],
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    sector_id: '',
    supplier_id: '',
    operator_id: '',
    waste_code_id: '',
    vehicle_number: '',
    generator_type: 'NON-CASNIC',
    rejected_quantity_kg: '',
    rejection_reason: ''
  });

  useEffect(() => {
    if (mode === 'edit' && ticket) {
      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticket.ticket_date || new Date().toISOString().split('T')[0],
        sector_id: ticket.sector_id || '',
        supplier_id: ticket.supplier_id || '',
        operator_id: ticket.operator_id || '',
        waste_code_id: ticket.waste_code_id || '',
        vehicle_number: ticket.vehicle_number || '',
        generator_type: ticket.generator_type || 'NON-CASNIC',
        rejected_quantity_kg: ticket.rejected_quantity_tons ? Math.round(ticket.rejected_quantity_tons * 1000) : '',
        rejection_reason: ticket.rejection_reason || ''
      });
    } else {
      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        sector_id: '',
        supplier_id: '',
        operator_id: '',
        waste_code_id: '',
        vehicle_number: '',
        generator_type: 'NON-CASNIC',
        rejected_quantity_kg: '',
        rejection_reason: ''
      });
    }
    setError(null);
  }, [mode, ticket, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.ticket_number?.trim()) errors.push('Număr tichet este obligatoriu');
    if (!formData.ticket_date) errors.push('Data este obligatorie');
    if (!formData.sector_id) errors.push('Sector este obligatoriu');
    if (!formData.supplier_id) errors.push('Furnizor este obligatoriu');
    if (!formData.operator_id) errors.push('Operator este obligatoriu');
    if (!formData.waste_code_id) errors.push('Cod deșeu este obligatoriu');
    if (!formData.vehicle_number?.trim()) errors.push('Nr. auto este obligatoriu');
    if (!formData.rejected_quantity_kg || parseFloat(formData.rejected_quantity_kg) <= 0) {
      errors.push('Cantitate refuzată trebuie să fie > 0');
    }
    if (!formData.rejection_reason?.trim()) errors.push('Motiv refuz este obligatoriu');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('; '));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        ...formData,
        rejected_quantity_kg: parseInt(formData.rejected_quantity_kg)
      };

      console.log('Submit rejected:', submitData);
      alert('Funcția va fi implementată cu API real');
      onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-[#1a1f2e] shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          
          <div className="sticky top-0 z-10 bg-zinc-600 px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? '✏️ Editează Tichet Respins' : '➕ Adaugă Tichet Respins'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                📋 Date Bază
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tichet *</label>
                  <input type="text" name="ticket_number" value={formData.ticket_number} onChange={handleChange} className={inputClass} placeholder="ex: REJ-001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Data *</label>
                  <input type="date" name="ticket_date" value={formData.ticket_date} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                🏢 Instituții
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sector *</label>
                <select name="sector_id" value={formData.sector_id} onChange={handleChange} className={inputClass}>
                  <option value="">Selectează sector...</option>
                  {sectors.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Furnizor (Colector) *</label>
                  <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} className={inputClass}>
                    <option value="">Selectează furnizor...</option>
                    {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prestator (Operator TMB) *</label>
                  <select name="operator_id" value={formData.operator_id} onChange={handleChange} className={inputClass}>
                    <option value="">Selectează operator...</option>
                    {operators.map(op => (<option key={op.id} value={op.id}>{op.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                ♻️ Deșeu & Transport
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cod Deșeu *</label>
                  <select name="waste_code_id" value={formData.waste_code_id} onChange={handleChange} className={inputClass}>
                    <option value="">Selectează cod...</option>
                    {wasteCodes.map(wc => (<option key={wc.id} value={wc.id}>{wc.code} - {wc.description}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nr. Auto *</label>
                  <input type="text" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} className={inputClass} placeholder="ex: B-123-ABC" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tip Generator</label>
                <select name="generator_type" value={formData.generator_type} onChange={handleChange} className={inputClass}>
                  <option value="CASNIC">CASNIC</option>
                  <option value="NON-CASNIC">NON-CASNIC</option>
                  <option value="CASNIC / NON-CASNIC">CASNIC / NON-CASNIC</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                ⚠️ Detalii Refuz
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-400 mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-zinc-500"></span>
                  Cantitate Refuzată (kg) *
                </label>
                <input
                  type="number"
                  name="rejected_quantity_kg"
                  value={formData.rejected_quantity_kg}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Motiv Refuz *</label>
                <textarea
                  name="rejection_reason"
                  value={formData.rejection_reason}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Detalii despre motivul refuzului..."
                />
              </div>
            </div>

          </div>

          <div className="sticky bottom-0 bg-white dark:bg-[#242b3d] border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvare...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === 'edit' ? 'Actualizează' : 'Salvează'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50 transition-colors"
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

export default RejectedSidebar;
