// src/components/reports/RecyclingSidebar.jsx
/**
 * ============================================================================
 * RECYCLING SIDEBAR - ADD/EDIT TICKETS
 * ============================================================================
 *
 * DB schema waste_tickets_recycling:
 * - ticket_number (varchar) - Număr Tichet
 * - ticket_date (date) - Data
 * - ticket_time (time) - Ora
 * - supplier_id (uuid FK) - Furnizor (TMB_OPERATOR - care trimite deșeuri procesate)
 * - recipient_id (uuid FK) - Client Reciclare (RECYCLING_OPERATOR)
 * - waste_code_id (uuid FK) - Cod Deșeu
 * - sector_id (uuid FK) - Proveniență
 * - vehicle_number (varchar) - Nr. Auto
 * - delivered_quantity_kg (numeric) - Cantitate Livrată (kg)
 * - accepted_quantity_kg (numeric) - Cantitate Acceptată (kg)
 * - stock_month (varchar) - Luna Stoc (optional)
 * - notes (text) - Observații (optional)
 *
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createRecyclingTicket, updateRecyclingTicket } from '../../services/reportsService';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const RecyclingSidebar = ({
  isOpen,
  mode,
  ticket,
  wasteCodes,
  suppliers,    // TOATE institutions (filtrăm TMB_OPERATOR)
  clients,      // TOATE institutions (filtrăm RECYCLING_OPERATOR)
  sectors,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Folosim direct listele primite (backend deja le filtrează)
  const tmbOperators = suppliers || [];
  const recyclingOperators = clients || [];

  console.log('🔍 Recycling debug:', {
    suppliers_total: suppliers?.length,
    clients_total: clients?.length,
    suppliers_sample: suppliers?.[0],
    clients_sample: clients?.[0],
  });

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    ticket_time: new Date().toTimeString().slice(0, 5),
    
    supplier_id: '',          // UUID - Furnizor (TMB_OPERATOR)
    recipient_id: '',         // UUID - Client Reciclare (RECYCLING_OPERATOR)
    waste_code_id: '',        // UUID - Cod deșeu
    sector_id: '',            // UUID - Proveniență
    
    vehicle_number: '',       // VARCHAR
    delivered_quantity_tons: '',  // UI în tone
    accepted_quantity_tons: '',   // UI în tone
    stock_month: '',          // VARCHAR (optional)
    notes: '',                // TEXT (optional)
  });

  // Pre-populate on edit; reset on create
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && ticket) {
      console.log('📝 Editing Recycling ticket:', ticket);
      
      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticket.ticket_date || new Date().toISOString().split('T')[0],
        ticket_time: ticket.ticket_time || new Date().toTimeString().slice(0, 5),
        
        supplier_id: ticket.supplier_id || '',
        recipient_id: ticket.recipient_id || '',
        waste_code_id: ticket.waste_code_id || '',
        sector_id: ticket.sector_id || '',
        
        vehicle_number: ticket.vehicle_number || '',
        delivered_quantity_tons: ticket.delivered_quantity_tons ? ticket.delivered_quantity_tons.toString() : '',
        accepted_quantity_tons: ticket.accepted_quantity_tons ? ticket.accepted_quantity_tons.toString() : '',
        stock_month: ticket.stock_month || '',
        notes: ticket.notes || '',
      });
      
      setError(null);
    } else if (mode === 'create') {
      // Reset form
      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        ticket_time: new Date().toTimeString().slice(0, 5),
        supplier_id: '',
        recipient_id: '',
        waste_code_id: '',
        sector_id: '',
        vehicle_number: '',
        delivered_quantity_tons: '',
        accepted_quantity_tons: '',
        stock_month: '',
        notes: '',
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

    if (!formData.ticket_date) {
      errors.push('Data este obligatorie');
    }
    if (!formData.supplier_id) {
      errors.push('Furnizor este obligatoriu');
    }
    if (!formData.recipient_id) {
      errors.push('Client reciclare este obligatoriu');
    }
    if (!formData.waste_code_id) {
      errors.push('Cod deșeu este obligatoriu');
    }
    if (!formData.sector_id) {
      errors.push('Proveniența este obligatorie');
    }

    const delivered = toNumber(formData.delivered_quantity_tons);
    if (!Number.isFinite(delivered) || delivered <= 0) {
      errors.push('Cantitate livrată trebuie să fie un număr > 0');
    }

    const accepted = toNumber(formData.accepted_quantity_tons);
    if (!Number.isFinite(accepted) || accepted < 0) {
      errors.push('Cantitate acceptată trebuie să fie un număr >= 0');
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
        ticket_number: formData.ticket_number?.trim() || null,
        ticket_date: formData.ticket_date,
        ticket_time: formData.ticket_time,
        supplier_id: formData.supplier_id,
        recipient_id: formData.recipient_id,
        waste_code_id: formData.waste_code_id,
        sector_id: formData.sector_id,
        vehicle_number: formData.vehicle_number?.trim() || null,
        delivered_quantity_kg: Math.round(toNumber(formData.delivered_quantity_tons) * 1000),
        accepted_quantity_kg: Math.round(toNumber(formData.accepted_quantity_tons) * 1000),
        stock_month: formData.stock_month?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      console.log('🚀 Recycling payload:', JSON.stringify(payload, null, 2));

      let response;
      if (mode === 'edit' && ticket?.id) {
        response = await updateRecyclingTicket(ticket.id, payload);
      } else {
        response = await createRecyclingTicket(payload);
      }

      console.log('✅ Recycling response:', response);

      if (response.success) {
        alert(mode === 'edit' ? 'Tichet actualizat cu succes!' : 'Tichet creat cu succes!');
        onSuccess();
      } else {
        throw new Error(response.message || 'Operație eșuată');
      }
    } catch (err) {
      console.error('❌ Recycling submit error:', err);
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
                {mode === 'edit' ? '✏️ Editează Tichet Reciclare' : '➕ Adaugă Tichet Reciclare'}
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
                    Număr Tichet
                  </label>
                  <input
                    type="text"
                    name="ticket_number"
                    value={formData.ticket_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ex: REC-001"
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
                    Furnizor *
                  </label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează furnizor...</option>
                    {tmbOperators?.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Operator Reciclare *
                  </label>
                  <select
                    name="recipient_id"
                    value={formData.recipient_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Selectează operator...</option>
                    {recyclingOperators?.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
                    Cod Deșeu *
                  </label>
                  <select
                    name="waste_code_id"
                    value={formData.waste_code_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
            </div>

            {/* Section 4: Cantități & Transport */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                📦 Cantități & Transport
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    Cantitate Livrată (tone) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="delivered_quantity_tons"
                    value={formData.delivered_quantity_tons}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-cyan-400 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                    Cantitate Acceptată (tone) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="accepted_quantity_tons"
                    value={formData.accepted_quantity_tons}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-cyan-300 dark:border-cyan-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Număr Auto
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
                    Luna Stoc
                  </label>
                  <input
                    type="text"
                    name="stock_month"
                    value={formData.stock_month}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ex: 2025-01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Observații
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Observații suplimentare..."
                />
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

export default RecyclingSidebar;