// src/components/reports/ReportsTmbSidebar.jsx
/**
 * ============================================================================
 * REPORTS TMB SIDEBAR - ADD/EDIT TICKETS
 * ============================================================================
 *
 * DB schema waste_tickets_tmb:
 * - ticket_number (varchar) - Număr Tichet Cântar
 * - ticket_date (date) - Data
 * - ticket_time (time) - Ora
 * - supplier_id (uuid FK) - Furnizor Deșeuri (institutions.id)
 * - operator_id (uuid FK) - Prestator TMB (institutions.id)
 * - waste_code_id (uuid FK) - Cod Deșeu (waste_codes.id)
 * - sector_id (uuid FK) - Proveniență (sectors.id)
 * - generator_type (varchar) - Tip Generator
 * - vehicle_number (varchar) - Nr. Auto
 * - net_weight_tons (numeric) - Cantitate (tone)
 *
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createTmbTicket, updateTmbTicket } from '../../services/reportsService';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const ReportsTmbSidebar = ({
  isOpen,
  mode,
  ticket,
  wasteCodes,
  suppliers,    // Furnizori deșeuri
  operators,    // Prestatori TMB
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
    
    supplier_id: '',      // UUID - Furnizor deșeuri
    operator_id: '',      // UUID - Prestator TMB
    waste_code_id: '',    // UUID - Cod deșeu
    sector_id: '',        // UUID - Proveniență
    
    generator_type: '',   // VARCHAR
    vehicle_number: '',   // VARCHAR
    net_weight_tons: '',  // DECIMAL - Cantitate tone
  });

  // Pre-populate on edit; reset on create
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && ticket) {
      console.log('📝 Editing TMB ticket:', ticket);
      
      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticket.ticket_date || new Date().toISOString().split('T')[0],
        ticket_time: ticket.ticket_time || new Date().toTimeString().slice(0, 5),
        
        supplier_id: ticket.supplier_id || '',
        operator_id: ticket.operator_id || '',
        waste_code_id: ticket.waste_code_id || '',
        sector_id: ticket.sector_id || '',
        
        generator_type: ticket.generator_type || '',
        vehicle_number: ticket.vehicle_number || '',
        net_weight_tons: ticket.net_weight_tons ? ticket.net_weight_tons.toString() : '',
      });
      
      setError(null);
    } else if (mode === 'create') {
      // Reset form
      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        ticket_time: new Date().toTimeString().slice(0, 5),
        supplier_id: '',
        operator_id: '',
        waste_code_id: '',
        sector_id: '',
        generator_type: '',
        vehicle_number: '',
        net_weight_tons: '',
      });
      setError(null);
    }
  }, [isOpen, mode, ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.ticket_number?.trim()) {
      errors.push('Număr tichet cântar este obligatoriu');
    }
    if (!formData.ticket_date) {
      errors.push('Data este obligatorie');
    }
    if (!formData.supplier_id) {
      errors.push('Furnizor deșeuri este obligatoriu');
    }
    if (!formData.operator_id) {
      errors.push('Prestator TMB este obligatoriu');
    }
    if (!formData.waste_code_id) {
      errors.push('Cod deșeu este obligatoriu');
    }
    if (!formData.sector_id) {
      errors.push('Proveniența este obligatorie');
    }
    if (!formData.vehicle_number?.trim()) {
      errors.push('Număr auto este obligatoriu');
    }

    const tons = toNumber(formData.net_weight_tons);
    if (!Number.isFinite(tons) || tons <= 0) {
      errors.push('Cantitate (tone) trebuie să fie un număr > 0');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('; '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ticket_number: formData.ticket_number.trim(),
        ticket_date: formData.ticket_date,
        ticket_time: formData.ticket_time,
        supplier_id: formData.supplier_id,
        operator_id: formData.operator_id,
        waste_code_id: formData.waste_code_id,
        sector_id: formData.sector_id,
        generator_type: formData.generator_type?.trim() || null,
        vehicle_number: formData.vehicle_number.trim(),
        net_weight_tons: toNumber(formData.net_weight_tons),
      };

      console.log('🚀 Submitting TMB payload:', payload);

      let response;
      if (mode === 'edit' && ticket?.id) {
        response = await updateTmbTicket(ticket.id, payload);
      } else {
        response = await createTmbTicket(payload);
      }

      console.log('✅ TMB Response:', response);

      if (response.success) {
        alert(mode === 'edit' ? 'Tichet actualizat cu succes!' : 'Tichet creat cu succes!');
        onSuccess();
      } else {
        throw new Error(response.message || 'Operație eșuată');
      }
    } catch (err) {
      console.error('❌ TMB Submit error:', err);
      setError(err.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-amber-500 to-orange-600">
            <h2 className="text-xl font-bold text-white">
              {mode === 'edit' ? '✏️ Editează Tichet TMB' : '➕ Adaugă Tichet TMB'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Date Bază */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                📋 Date Bază
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Număr Tichet Cântar *
                  </label>
                  <input
                    type="text"
                    name="ticket_number"
                    value={formData.ticket_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="ex: TMB-001"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    name="ticket_date"
                    value={formData.ticket_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ora
                  </label>
                  <input
                    type="time"
                    name="ticket_time"
                    value={formData.ticket_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Instituții */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                🏢 Instituții
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Furnizor Deșeuri *
                  </label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează furnizor...</option>
                    {suppliers?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prestator TMB *
                  </label>
                  <select
                    name="operator_id"
                    value={formData.operator_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează prestator...</option>
                    {operators?.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Deșeu & Proveniență */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                ♻️ Deșeu & Proveniență
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cod Deșeu *
                  </label>
                  <select
                    name="waste_code_id"
                    value={formData.waste_code_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează cod...</option>
                    {wasteCodes?.map(wc => (
                      <option key={wc.id} value={wc.id}>
                        {wc.code} - {wc.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Proveniență (Sector) *
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează sector...</option>
                    {sectors?.map(s => (
                      <option key={s.id || s.sector_id} value={s.id || s.sector_id}>
                        Sector {s.sector_number} - {s.sector_name || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tip Generator
                </label>
                <select
                  name="generator_type"
                  value={formData.generator_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                >
                  <option value="">Selectează tip...</option>
                  <option value="Menajer">Menajer</option>
                  <option value="Nemenajer">Nemenajer</option>
                  <option value="Instituție Publică">Instituție Publică</option>
                </select>
              </div>
            </div>

            {/* Section 4: Transport & Cantitate */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                🚛 Transport & Cantitate
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Număr Auto *
                  </label>
                  <input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="ex: B-123-ABC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cantitate (tone) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="net_weight_tons"
                    value={formData.net_weight_tons}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Anulează
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'edit' ? 'Actualizează' : 'Salvează'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTmbSidebar;