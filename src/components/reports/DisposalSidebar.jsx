// src/components/reports/DisposalSidebar.jsx
import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { createDisposalTicket, updateDisposalTicket } from '../../services/reportsService';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const DisposalSidebar = ({
  isOpen,
  mode,
  ticket,
  wasteCodes,
  suppliers,
  clients,
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
    recipient_id: '',
    waste_code_id: '',
    sector_id: '',
    vehicle_number: '',
    delivered_quantity_tons: '',
    accepted_quantity_tons: '',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && ticket) {
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
        notes: ticket.notes || '',
      });
      setError(null);
    } else if (mode === 'create') {
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
    if (!formData.ticket_date) errors.push('Data este obligatorie');
    if (!formData.supplier_id) errors.push('Furnizor este obligatoriu');
    if (!formData.recipient_id) errors.push('Operator depozit este obligatoriu');
    if (!formData.waste_code_id) errors.push('Cod deșeu este obligatoriu');
    if (!formData.sector_id) errors.push('Proveniența este obligatorie');

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
        notes: formData.notes?.trim() || null,
      };

      let response;
      if (mode === 'edit' && ticket?.id) {
        response = await updateDisposalTicket(ticket.id, payload);
      } else {
        response = await createDisposalTicket(payload);
      }

      if (response.success) {
        alert(mode === 'edit' ? 'Tichet actualizat cu succes!' : 'Tichet creat cu succes!');
        onSuccess();
      } else {
        throw new Error(response.message || 'Operație eșuată');
      }
    } catch (err) {
      console.error('❌ Disposal submit error:', err);
      setError(err.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-red-500 to-red-600">
            <h2 className="text-xl font-bold text-white">
              {mode === 'edit' ? '✏️ Editează Tichet Eliminare' : '➕ Adaugă Tichet Eliminare'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">📋 Date Bază</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Număr Tichet</label>
                  <input type="text" name="ticket_number" value={formData.ticket_number} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" placeholder="ex: ELI-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data *</label>
                  <input type="date" name="ticket_date" value={formData.ticket_date} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ora</label>
                  <input type="time" name="ticket_time" value={formData.ticket_time} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">🏢 Instituții</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Furnizor *</label>
                  <select name="supplier_id" value={formData.supplier_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                    <option value="">Selectează furnizor...</option>
                    {suppliers?.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operator Depozit *</label>
                  <select name="recipient_id" value={formData.recipient_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                    <option value="">Selectează operator...</option>
                    {clients?.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">♻️ Deșeu & Proveniență</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cod Deșeu *</label>
                  <select name="waste_code_id" value={formData.waste_code_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                    <option value="">Selectează cod...</option>
                    {wasteCodes?.map(wc => (<option key={wc.id} value={wc.id}>{wc.code} - {wc.description}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proveniență *</label>
                  <select name="sector_id" value={formData.sector_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
                    <option value="">Selectează sector...</option>
                    {sectors?.map(s => (<option key={s.id || s.sector_id} value={s.id || s.sector_id}>{s.sector_name || s.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">📦 Cantități & Transport</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span> Cantitate Livrată (tone) *
                  </label>
                  <input type="number" step="0.01" name="delivered_quantity_tons" value={formData.delivered_quantity_tons} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span> Cantitate Acceptată (tone) *
                  </label>
                  <input type="number" step="0.01" name="accepted_quantity_tons" value={formData.accepted_quantity_tons} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-rose-300 dark:border-rose-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Număr Auto</label>
                <input type="text" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" placeholder="ex: B-123-ABC" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observații</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none" placeholder="Observații suplimentare..." />
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">Anulează</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Se salvează...</>) : (<><Save className="w-4 h-4" />{mode === 'edit' ? 'Actualizează' : 'Salvează'}</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposalSidebar;