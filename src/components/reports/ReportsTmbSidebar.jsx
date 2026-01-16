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
  suppliers,    // TOATE institutions
  operators,    // TOATE institutions
  sectors,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtrare instituții
  const wasteCollectors = suppliers?.filter(s => s.type === 'WASTE_COLLECTOR') || [];
  const tmbOperators = operators?.filter(o => o.type === 'TMB_OPERATOR') || [];
  
  // Filtrare cod deșeu - DOAR 20 03 01
  const tmbWasteCodes = wasteCodes?.filter(wc => wc.code === '20 03 01') || [];

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    ticket_time: new Date().toTimeString().slice(0, 5),
    
    supplier_id: '',      // UUID - Furnizor deșeuri (WASTE_COLLECTOR)
    operator_id: '',      // UUID - Prestator TMB (TMB_OPERATOR)
    waste_code_id: '',    // UUID - Cod deșeu (20 03 01)
    sector_id: '',        // UUID - Proveniență
    
    generator_type: '',   // CASNIC / NON-CASNIC / CASNIC / NON-CASNIC
    vehicle_number: '',   // VARCHAR
    net_weight_tons: '',  // DECIMAL - Cantitate tone (UI) → convertesc în kg pentru backend
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
    if (!formData.generator_type?.trim()) {
      errors.push('Tip Generator este obligatoriu');
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
        net_weight_kg: Math.round(toNumber(formData.net_weight_tons) * 1000), // Convertesc tone → kg (INT)
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
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-[#1a1f2e] shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          
          {/* Header Sticky */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? '✏️ Editează Tichet TMB' : '➕ Adaugă Tichet TMB'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Alert (sub header) */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Section 1: Date Bază */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                📋 Date Bază
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Tichet Cântar *
                  </label>
                  <input
                    type="text"
                    name="ticket_number"
                    value={formData.ticket_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ex: TMB-001"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Data *
                  </label>
                  <input
                    type="date"
                    name="ticket_date"
                    value={formData.ticket_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Ora
                  </label>
                  <input
                    type="time"
                    name="ticket_time"
                    value={formData.ticket_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Furnizor Deșeuri *
                  </label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează furnizor...</option>
                    {wasteCollectors?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Prestator TMB *
                  </label>
                  <select
                    name="operator_id"
                    value={formData.operator_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează prestator...</option>
                    {tmbOperators?.map(o => (
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Cod Deșeu (20 03 01) *
                  </label>
                  <select
                    name="waste_code_id"
                    value={formData.waste_code_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează cod...</option>
                    {tmbWasteCodes?.map(wc => (
                      <option key={wc.id} value={wc.id}>
                        {wc.code} - {wc.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Proveniență *
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează sector...</option>
                    {sectors?.map(s => (
                      <option key={s.id || s.sector_id} value={s.id || s.sector_id}>
                        {s.sector_name || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tip Generator *
                </label>
                <select
                  name="generator_type"
                  value={formData.generator_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Selectează tip...</option>
                  <option value="CASNIC">CASNIC</option>
                  <option value="NON-CASNIC">NON-CASNIC</option>
                  <option value="CASNIC / NON-CASNIC">CASNIC / NON-CASNIC</option>
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Număr Auto *
                  </label>
                  <input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ex: B-123-ABC"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Cantitate (tone) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="net_weight_tons"
                    value={formData.net_weight_tons}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer Sticky ÎN FORM */}
          <div className="sticky bottom-0 bg-white dark:bg-[#242b3d] border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50"
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

export default ReportsTmbSidebar;