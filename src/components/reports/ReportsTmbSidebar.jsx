/**
 * ============================================================================
 * REPORTS TMB SIDEBAR COMPONENT
 * ============================================================================
 * Form complet pentru Add/Edit bonuri TMB
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  createTmbTicket, 
  updateTmbTicket 
} from '../../services/reportsService';

const ReportsTmbSidebar = ({ 
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
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    ticket_time: new Date().toTimeString().slice(0, 5),
    sector_id: '',
    supplier_id: '',
    operator_id: '',
    waste_code_id: '',
    vehicle_number: '',
    generator_type: 'NON-CASNIC',
    gross_weight_kg: '',
    tare_weight_kg: '',
    net_weight_kg: ''
  });

  // Populate form când se editează
  useEffect(() => {
    if (mode === 'edit' && ticket) {
      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticket.ticket_date || new Date().toISOString().split('T')[0],
        ticket_time: ticket.ticket_time || new Date().toTimeString().slice(0, 5),
        sector_id: ticket.sector_id || '',
        supplier_id: ticket.supplier_id || '',
        operator_id: ticket.operator_id || '',
        waste_code_id: ticket.waste_code_id || '',
        vehicle_number: ticket.vehicle_number || '',
        generator_type: ticket.generator_type || 'NON-CASNIC',
        gross_weight_kg: ticket.gross_weight_tons ? Math.round(ticket.gross_weight_tons * 1000) : '',
        tare_weight_kg: ticket.tare_weight_tons ? Math.round(ticket.tare_weight_tons * 1000) : '',
        net_weight_kg: ticket.net_weight_tons ? Math.round(ticket.net_weight_tons * 1000) : ''
      });
    } else {
      // Reset form pentru create
      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        ticket_time: new Date().toTimeString().slice(0, 5),
        sector_id: '',
        supplier_id: '',
        operator_id: '',
        waste_code_id: '',
        vehicle_number: '',
        generator_type: 'NON-CASNIC',
        gross_weight_kg: '',
        tare_weight_kg: '',
        net_weight_kg: ''
      });
    }
    setErrors({});
  }, [mode, ticket, isOpen]);

  // Auto-calculate net weight
  useEffect(() => {
    const gross = parseFloat(formData.gross_weight_kg) || 0;
    const tare = parseFloat(formData.tare_weight_kg) || 0;
    const net = gross - tare;
    
    if (gross > 0 && tare >= 0 && net >= 0) {
      setFormData(prev => ({
        ...prev,
        net_weight_kg: Math.round(net)
      }));
    }
  }, [formData.gross_weight_kg, formData.tare_weight_kg]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error când user modifică câmpul
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.ticket_number.trim()) {
      newErrors.ticket_number = 'Număr tichet obligatoriu';
    }
    if (!formData.ticket_date) {
      newErrors.ticket_date = 'Data obligatorie';
    }
    if (!formData.ticket_time) {
      newErrors.ticket_time = 'Ora obligatorie';
    }
    if (!formData.sector_id) {
      newErrors.sector_id = 'Sector obligatoriu';
    }
    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Furnizor obligatoriu';
    }
    if (!formData.operator_id) {
      newErrors.operator_id = 'Operator TMB obligatoriu';
    }
    if (!formData.waste_code_id) {
      newErrors.waste_code_id = 'Cod deșeu obligatoriu';
    }
    if (!formData.vehicle_number.trim()) {
      newErrors.vehicle_number = 'Număr auto obligatoriu';
    }
    if (!formData.gross_weight_kg || parseFloat(formData.gross_weight_kg) <= 0) {
      newErrors.gross_weight_kg = 'Greutate brută invalidă';
    }
    if (!formData.tare_weight_kg || parseFloat(formData.tare_weight_kg) < 0) {
      newErrors.tare_weight_kg = 'Greutate tară invalidă';
    }
    if (!formData.net_weight_kg || parseFloat(formData.net_weight_kg) <= 0) {
      newErrors.net_weight_kg = 'Greutate netă invalidă';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        gross_weight_kg: parseInt(formData.gross_weight_kg),
        tare_weight_kg: parseInt(formData.tare_weight_kg),
        net_weight_kg: parseInt(formData.net_weight_kg)
      };

      let response;
      if (mode === 'edit') {
        response = await updateTmbTicket(ticket.id, submitData);
      } else {
        response = await createTmbTicket(submitData);
      }

      if (response.success) {
        alert(mode === 'edit' ? 'Bon actualizat cu succes!' : 'Bon creat cu succes!');
        onSuccess();
      } else {
        alert('Eroare: ' + response.message);
      }
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-white dark:bg-[#242b3d] shadow-2xl z-50 overflow-y-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {mode === 'edit' ? 'Editează bon TMB' : 'Adaugă bon TMB'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              
              {/* Ticket Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Număr tichet cântar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ticket_number"
                    value={formData.ticket_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.ticket_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Ex: 4107260"
                  />
                  {errors.ticket_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.ticket_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nr. auto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.vehicle_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Ex: B110FFC"
                  />
                  {errors.vehicle_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.vehicle_number}</p>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="ticket_date"
                    value={formData.ticket_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.ticket_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.ticket_date && (
                    <p className="mt-1 text-xs text-red-500">{errors.ticket_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="ticket_time"
                    value={formData.ticket_time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.ticket_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  />
                  {errors.ticket_time && (
                    <p className="mt-1 text-xs text-red-500">{errors.ticket_time}</p>
                  )}
                </div>
              </div>

              {/* Sector & Supplier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sector <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sector_id"
                    value={formData.sector_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Selectează sector</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                  {errors.sector_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.sector_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Furnizor (Colector) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.supplier_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Selectează furnizor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.supplier_id}</p>
                  )}
                </div>
              </div>

              {/* Operator & Waste Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prestator (Operator TMB) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="operator_id"
                    value={formData.operator_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.operator_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Selectează operator</option>
                    {operators.map(operator => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name}
                      </option>
                    ))}
                  </select>
                  {errors.operator_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.operator_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cod deșeu <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="waste_code_id"
                    value={formData.waste_code_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.waste_code_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Selectează cod deșeu</option>
                    {wasteCodes.map(code => (
                      <option key={code.id} value={code.id}>
                        {code.code} - {code.description}
                      </option>
                    ))}
                  </select>
                  {errors.waste_code_id && (
                    <p className="mt-1 text-xs text-red-500">{errors.waste_code_id}</p>
                  )}
                </div>
              </div>

              {/* Generator Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tip generator <span className="text-red-500">*</span>
                </label>
                <select
                  name="generator_type"
                  value={formData.generator_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CASNIC">CASNIC</option>
                  <option value="NON-CASNIC">NON-CASNIC</option>
                  <option value="CASNIC / NON-CASNIC">CASNIC / NON-CASNIC</option>
                </select>
              </div>

              {/* Weights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Greutate brută (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="gross_weight_kg"
                    value={formData.gross_weight_kg}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.gross_weight_kg ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="18020"
                    min="0"
                  />
                  {errors.gross_weight_kg && (
                    <p className="mt-1 text-xs text-red-500">{errors.gross_weight_kg}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Greutate tară (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tare_weight_kg"
                    value={formData.tare_weight_kg}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg 
                             text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 
                             ${errors.tare_weight_kg ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="14460"
                    min="0"
                  />
                  {errors.tare_weight_kg && (
                    <p className="mt-1 text-xs text-red-500">{errors.tare_weight_kg}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Greutate netă (kg)
                  </label>
                  <input
                    type="number"
                    name="net_weight_kg"
                    value={formData.net_weight_kg}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
                    placeholder="Auto-calculat"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.net_weight_kg ? `${(formData.net_weight_kg / 1000).toFixed(2)} tone` : 'Auto-calculat'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 
                         hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg 
                         transition-all duration-200 shadow-md font-medium disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Se salvează...
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
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulează
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ReportsTmbSidebar;