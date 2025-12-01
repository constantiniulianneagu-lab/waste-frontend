/**
 * ============================================================================
 * RECOVERY SIDEBAR COMPONENT
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';

const RecoverySidebar = ({ 
  isOpen, 
  mode, 
  ticket, 
  wasteCodes = [], 
  clients = [],
  suppliers = [],
  sectors = [],
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    sector_id: '',
    supplier_id: '',
    client_id: '',
    waste_code_id: '',
    vehicle_number: '',
    delivered_quantity_kg: '',
    accepted_quantity_kg: ''
  });

  useEffect(() => {
    if (mode === 'edit' && ticket) {
      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticket.ticket_date || new Date().toISOString().split('T')[0],
        sector_id: ticket.sector_id || '',
        supplier_id: ticket.supplier_id || '',
        client_id: ticket.client_id || '',
        waste_code_id: ticket.waste_code_id || '',
        vehicle_number: ticket.vehicle_number || '',
        delivered_quantity_kg: ticket.delivered_quantity_tons ? Math.round(ticket.delivered_quantity_tons * 1000) : '',
        accepted_quantity_kg: ticket.accepted_quantity_tons ? Math.round(ticket.accepted_quantity_tons * 1000) : ''
      });
    } else {
      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        sector_id: '',
        supplier_id: '',
        client_id: '',
        waste_code_id: '',
        vehicle_number: '',
        delivered_quantity_kg: '',
        accepted_quantity_kg: ''
      });
    }
    setErrors({});
  }, [mode, ticket, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.ticket_number.trim()) newErrors.ticket_number = 'Obligatoriu';
    if (!formData.ticket_date) newErrors.ticket_date = 'Obligatoriu';
    if (!formData.sector_id) newErrors.sector_id = 'Obligatoriu';
    if (!formData.supplier_id) newErrors.supplier_id = 'Obligatoriu';
    if (!formData.client_id) newErrors.client_id = 'Obligatoriu';
    if (!formData.waste_code_id) newErrors.waste_code_id = 'Obligatoriu';
    if (!formData.vehicle_number.trim()) newErrors.vehicle_number = 'Obligatoriu';
    if (!formData.delivered_quantity_kg || parseFloat(formData.delivered_quantity_kg) <= 0) newErrors.delivered_quantity_kg = 'Invalid';
    if (!formData.accepted_quantity_kg || parseFloat(formData.accepted_quantity_kg) < 0) newErrors.accepted_quantity_kg = 'Invalid';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        delivered_quantity_kg: parseInt(formData.delivered_quantity_kg),
        accepted_quantity_kg: parseInt(formData.accepted_quantity_kg)
      };

      console.log('Submit recovery:', submitData);
      alert('Funcția va fi implementată cu API real');
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Eroare la salvare: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-white dark:bg-[#242b3d] shadow-2xl z-50 overflow-y-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'edit' ? 'Editează bon Valorificare' : 'Adaugă bon Valorificare'}
              </h2>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tichet <span className="text-red-500">*</span></label>
                <input type="text" name="ticket_number" value={formData.ticket_number} onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.ticket_number ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data <span className="text-red-500">*</span></label>
                <input type="date" name="ticket_date" value={formData.ticket_date} onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.ticket_date ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sector <span className="text-red-500">*</span></label>
              <select name="sector_id" value={formData.sector_id} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.sector_id ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Selectează</option>
                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Furnizor (Operator TMB) <span className="text-red-500">*</span></label>
              <select name="supplier_id" value={formData.supplier_id} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.supplier_id ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Selectează</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Client (Valorificator) <span className="text-red-500">*</span></label>
              <select name="client_id" value={formData.client_id} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.client_id ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Selectează</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cod deșeu <span className="text-red-500">*</span></label>
              <select name="waste_code_id" value={formData.waste_code_id} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.waste_code_id ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Selectează</option>
                {wasteCodes.map(wc => <option key={wc.id} value={wc.id}>{wc.code} - {wc.description}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nr. Auto <span className="text-red-500">*</span></label>
              <input type="text" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.vehicle_number ? 'border-red-500' : 'border-gray-300'}`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cantitate livrată (kg) <span className="text-red-500">*</span></label>
                <input type="number" name="delivered_quantity_kg" value={formData.delivered_quantity_kg} onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.delivered_quantity_kg ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cantitate acceptată (kg) <span className="text-red-500">*</span></label>
                <input type="number" name="accepted_quantity_kg" value={formData.accepted_quantity_kg} onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.accepted_quantity_kg ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg">
                {loading ? 'Se salvează...' : 'Salvează'}
              </button>
              <button type="button" onClick={onClose} disabled={loading}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                Anulează
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default RecoverySidebar;