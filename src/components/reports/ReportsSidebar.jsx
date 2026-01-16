// src/components/reports/ReportsSidebar.jsx
/**
 * ============================================================================
 * REPORTS SIDEBAR (LANDFILL) - TERMINOLOGIE CORECTĂ
 * ============================================================================
 *
 * DB schema waste_tickets_landfill:
 * - ticket_number (varchar) - Număr Tichet
 * - ticket_date (date) - Data
 * - ticket_time (time) - Ora
 * - supplier_id (int FK) - Furnizor (institutions.id)
 * - waste_code_id (uuid FK) - Cod Deșeu (waste_codes.id)
 * - sector_id (uuid FK) - Sector (sectors.id)
 * - vehicle_number (varchar) - Nr. Auto
 * - gross_weight_kg (numeric) - Greutate Brută (kg)
 * - tare_weight_kg (numeric) - Greutate Tară (kg)
 * - net_weight_kg (computed) - Greutate Netă (kg)
 * - net_weight_tons (computed) - Tone Nete
 * - generator_type (varchar) - Tip Generator
 * - operation_type (varchar) - Tip Operație
 * - contract_type (varchar) - Tip Contract
 *
 * UI: input weights in tons → convert to kg (INT) for API
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createLandfillTicket, updateLandfillTicket } from '../../services/reportsService';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const isUuid = (v) => {
  if (!v || typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
};

const kgToTonsStr = (kg) => {
  if (kg === null || kg === undefined || kg === '') return '';
  const n = toNumber(kg);
  if (!Number.isFinite(n)) return '';
  return (n / 1000).toFixed(2);
};

const tonsStrToKgInt = (tonsStr) => {
  const t = toNumber(tonsStr);
  if (!Number.isFinite(t)) return NaN;
  return Math.round(t * 1000);
};

const ReportsSidebar = ({
  isOpen,
  mode,
  ticket,
  wasteCodes,
  operators,
  sectors,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Original values from DB (kg) for UX
  const [originalKg, setOriginalKg] = useState({
    gross: null,
    tare: null,
    net: null
  });

  const [formData, setFormData] = useState({
    ticket_number: '',
    ticket_date: new Date().toISOString().split('T')[0],
    ticket_time: new Date().toTimeString().slice(0, 5),

    supplier_id: '',      // INT (furnizor - institution id)
    waste_code_id: '',    // UUID (waste_codes.id)
    sector_id: '',        // UUID (sectors.id)

    generator_type: '',
    vehicle_number: '',

    gross_weight_tons: '',
    tare_weight_tons: '',
    net_weight_tons: '',

    contract_type: '',
    operation_type: ''
  });

  // Pre-populate on edit; reset on create
  useEffect(() => {
    // DEBUG: Check sectors structure
    if (sectors && sectors.length > 0) {
      console.log('🔍 Sectors structure:', sectors[0]);
    }
    
    // DEBUG: Check waste codes structure
    if (wasteCodes && wasteCodes.length > 0) {
      console.log('🔍 Waste Codes structure:', wasteCodes[0]);
    }

    if (mode === 'edit' && ticket) {
      const ticketDate = ticket.ticket_date
        ? String(ticket.ticket_date).slice(0, 10)
        : new Date().toISOString().split('T')[0];

      const origGrossKg = ticket.gross_weight_kg ?? null;
      const origTareKg = ticket.tare_weight_kg ?? null;
      const origNetKg = ticket.net_weight_kg ?? null;

      setOriginalKg({
        gross: origGrossKg,
        tare: origTareKg,
        net: origNetKg
      });

      const grossTons =
        ticket.gross_weight_tons != null && ticket.gross_weight_tons !== ''
          ? Number(ticket.gross_weight_tons).toFixed(2)
          : kgToTonsStr(origGrossKg);

      const tareTons =
        ticket.tare_weight_tons != null && ticket.tare_weight_tons !== ''
          ? Number(ticket.tare_weight_tons).toFixed(2)
          : kgToTonsStr(origTareKg);

      const netTons =
        ticket.net_weight_tons != null && ticket.net_weight_tons !== ''
          ? Number(ticket.net_weight_tons).toFixed(2)
          : (() => {
              const g = toNumber(grossTons);
              const t = toNumber(tareTons);
              if (Number.isFinite(g) && Number.isFinite(t) && g >= t) return (g - t).toFixed(2);
              return '';
            })();

      setFormData({
        ticket_number: ticket.ticket_number || '',
        ticket_date: ticketDate,
        ticket_time: ticket.ticket_time || '',

        supplier_id: ticket.supplier_id ?? '',
        waste_code_id: ticket.waste_code_id ?? '',
        sector_id: ticket.sector_id ?? '',

        generator_type: ticket.generator_type || '',
        vehicle_number: ticket.vehicle_number || '',

        gross_weight_tons: grossTons || '',
        tare_weight_tons: tareTons || '',
        net_weight_tons: netTons || '',

        contract_type: ticket.contract_type || '',
        operation_type: ticket.operation_type || ''
      });
    } else {
      setOriginalKg({ gross: null, tare: null, net: null });

      setFormData({
        ticket_number: '',
        ticket_date: new Date().toISOString().split('T')[0],
        ticket_time: new Date().toTimeString().slice(0, 5),

        supplier_id: '',
        waste_code_id: '',
        sector_id: '',

        generator_type: '',
        vehicle_number: '',

        gross_weight_tons: '',
        tare_weight_tons: '',
        net_weight_tons: '',

        contract_type: '',
        operation_type: ''
      });
    }

    setError(null);
  }, [mode, ticket, isOpen]);

  // auto-calc net tons
  useEffect(() => {
    const gross = toNumber(formData.gross_weight_tons);
    const tare = toNumber(formData.tare_weight_tons);

    if (Number.isFinite(gross) && Number.isFinite(tare) && gross >= tare) {
      const net = gross - tare;
      setFormData((prev) => ({ ...prev, net_weight_tons: net.toFixed(2) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.gross_weight_tons, formData.tare_weight_tons]);

  // current kg (derived from current tons inputs)
  const currentKg = useMemo(() => {
    const grossKg = tonsStrToKgInt(formData.gross_weight_tons);
    const tareKg = tonsStrToKgInt(formData.tare_weight_tons);
    const netKg =
      Number.isFinite(grossKg) && Number.isFinite(tareKg) && grossKg >= tareKg
        ? grossKg - tareKg
        : NaN;

    return { gross: grossKg, tare: tareKg, net: netKg };
  }, [formData.gross_weight_tons, formData.tare_weight_tons]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.ticket_number?.trim()) errors.push('Număr tichet lipsă');
    if (!formData.ticket_date) errors.push('Data lipsă');
    if (!formData.ticket_time) errors.push('Ora lipsă');
    if (!formData.supplier_id) errors.push('Furnizor lipsă');
    if (!formData.waste_code_id) errors.push('Cod deșeu lipsă');
    if (!formData.sector_id) errors.push('Sector lipsă');
    
    // UUID validation with better error messages
    if (formData.sector_id && !isUuid(formData.sector_id)) {
      console.error('❌ Invalid sector_id:', formData.sector_id, 'Type:', typeof formData.sector_id);
      errors.push(`Sector ID invalid (trebuie UUID, primit: ${formData.sector_id.substring(0, 20)}...)`);
    }
    if (formData.waste_code_id && !isUuid(formData.waste_code_id)) {
      console.error('❌ Invalid waste_code_id:', formData.waste_code_id, 'Type:', typeof formData.waste_code_id);
      errors.push(`Waste Code ID invalid (trebuie UUID, primit: ${formData.waste_code_id.substring(0, 20)}...)`);
    }
    
    if (!formData.vehicle_number?.trim()) errors.push('Număr auto lipsă');
    if (!formData.generator_type?.trim()) errors.push('Tip generator lipsă');
    if (!formData.operation_type?.trim()) errors.push('Tip operație lipsă');
    if (!formData.contract_type?.trim()) errors.push('Tip contract lipsă');
    if (!Number.isFinite(currentKg.gross) || currentKg.gross <= 0) errors.push('Tone brut invalid (> 0)');
    if (!Number.isFinite(currentKg.tare) || currentKg.tare < 0) errors.push('Tone tară invalid (≥ 0)');
    if (currentKg.gross <= currentKg.tare) errors.push('Tone brut > tone tară');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    const payload = {
      ticket_number: formData.ticket_number.trim(),
      ticket_date: formData.ticket_date,
      ticket_time: formData.ticket_time,
      supplier_id: parseInt(formData.supplier_id, 10),
      waste_code_id: formData.waste_code_id,
      sector_id: formData.sector_id,
      vehicle_number: formData.vehicle_number.trim(),
      generator_type: formData.generator_type.trim(),
      operation_type: formData.operation_type.trim(),
      contract_type: formData.contract_type.trim(),
      gross_weight_kg: currentKg.gross,
      tare_weight_kg: currentKg.tare
    };

    console.log('📤 Submitting payload:', JSON.stringify(payload, null, 2));
    console.log('📊 Payload types:', {
      ticket_number: typeof payload.ticket_number,
      ticket_date: typeof payload.ticket_date,
      ticket_time: typeof payload.ticket_time,
      supplier_id: typeof payload.supplier_id,
      waste_code_id: typeof payload.waste_code_id,
      sector_id: typeof payload.sector_id,
      vehicle_number: typeof payload.vehicle_number,
      generator_type: typeof payload.generator_type,
      operation_type: typeof payload.operation_type,
      contract_type: typeof payload.contract_type,
      gross_weight_kg: typeof payload.gross_weight_kg,
      tare_weight_kg: typeof payload.tare_weight_kg
    });

    try {
      setLoading(true);
      let response;
      if (mode === 'edit' && ticket?.id) {
        console.log('✏️ Updating ticket ID:', ticket.id);
        response = await updateLandfillTicket(ticket.id, payload);
      } else {
        console.log('➕ Creating new ticket...');
        response = await createLandfillTicket(payload);
      }

      console.log('✅ Response:', response);

      if (response?.success) {
        console.log('🎉 Success! Closing sidebar...');
        onSuccess?.();
        onClose();
      } else {
        const errorMsg = response?.message || 'Eroare la salvare';
        console.error('❌ API returned error:', errorMsg, 'Full response:', response);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('❌ Catch block error:', err);
      console.error('❌ Error details:', {
        message: err?.message,
        response: err?.response,
        responseData: err?.response?.data,
        stack: err?.stack
      });
      
      // Extract error message from various possible locations
      const errorMessage = err?.message 
        || err?.response?.data?.error
        || err?.response?.data?.message 
        || 'Eroare necunoscută la salvare';
      
      console.error('🚨 Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-[#1a1f2e] shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? '✏️ Editează Tichet' : '➕ Adaugă Tichet'}
              </h2>
              <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            {/* 📋 DATE BAZĂ */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">
                📋 Date Bază
              </h3>
            
            {/* Număr Tichet */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Număr Tichet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ticket_number}
                onChange={(e) => handleChange('ticket_number', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: TICK-2024-001"
              />
            </div>

            {/* Data & Ora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ticket_date}
                  onChange={(e) => handleChange('ticket_date', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                             text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.ticket_time}
                  onChange={(e) => handleChange('ticket_time', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                             text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            </div>

            {/* 🏢 INSTITUȚII */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">
                🏢 Instituții
              </h3>

            {/* Furnizor */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Furnizor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => handleChange('supplier_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selectează furnizor</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>
            </div>
            </div>

            {/* ♻️ DEȘEU & PROVENIENȚĂ */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">
                ♻️ Deșeu & Proveniență
              </h3>

            {/* Cod Deșeu */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Cod Deșeu <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.waste_code_id}
                onChange={(e) => handleChange('waste_code_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selectează cod deșeu</option>
                {wasteCodes && wasteCodes.length > 0 ? (
                  wasteCodes
                    .filter(wc => !wc.code.startsWith('15'))
                    .map((wc) => (
                      <option key={wc.id} value={wc.id}>
                        {wc.code} - {wc.description}
                      </option>
                    ))
                ) : (
                  <option disabled>Niciun cod deșeu disponibil</option>
                )}
              </select>
              {formData.waste_code_id && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  UUID: <span className="font-mono text-[10px]">{formData.waste_code_id}</span>
                </p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sector_id}
                onChange={(e) => handleChange('sector_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selectează sector</option>
                {sectors && sectors.length > 0 ? (
                  sectors.map((sec) => (
                    <option key={sec.id || sec.sector_id} value={sec.id || sec.sector_id}>
                      Sectorul {sec.sector_number}
                    </option>
                  ))
                ) : (
                  <option disabled>Niciun sector disponibil</option>
                )}
              </select>
              {formData.sector_id && (
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  UUID: <span className="font-mono text-[10px]">{formData.sector_id}</span>
                </p>
              )}
            </div>
            </div>

            {/* 🚛 TRANSPORT & CANTITATE */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-2">
                🚛 Transport & Cantitate
              </h3>

            {/* Tip Generator */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tip Generator <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.generator_type}
                onChange={(e) => handleChange('generator_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: CASNIC / NON-CASNIC"
              />
            </div>

            {/* Număr Auto */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Număr Auto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => handleChange('vehicle_number', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: B 526 SDF"
              />
            </div>

            {/* Greutăți */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone Brut <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gross_weight_tons}
                  onChange={(e) => handleChange('gross_weight_tons', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                             text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                {mode === 'edit' && originalKg.gross != null && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Original: <span className="font-mono">{originalKg.gross}</span> kg
                  </p>
                )}
                {Number.isFinite(currentKg.gross) && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Curent: <span className="font-mono">{currentKg.gross}</span> kg
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone Tară <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tare_weight_tons}
                  onChange={(e) => handleChange('tare_weight_tons', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                             text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                {mode === 'edit' && originalKg.tare != null && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Original: <span className="font-mono">{originalKg.tare}</span> kg
                  </p>
                )}
                {Number.isFinite(currentKg.tare) && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Curent: <span className="font-mono">{currentKg.tare}</span> kg
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone Net
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.net_weight_tons}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg
                             text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                {mode === 'edit' && originalKg.net != null && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Original: <span className="font-mono">{originalKg.net}</span> kg
                  </p>
                )}
                {Number.isFinite(currentKg.net) && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Curent: <span className="font-mono">{currentKg.net}</span> kg
                  </p>
                )}
              </div>
            </div>

            {/* Tip Contract */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tip Contract <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => handleChange('contract_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selectează tip contract</option>
                <option value="TAXA">Taxă</option>
                <option value="TARIF">Tarif</option>
              </select>
            </div>

            {/* Tip Operație */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tip Operație <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.operation_type}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg
                           text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: Depozitare"
              />
            </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-[#242b3d] border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvare...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                           text-gray-700 dark:text-gray-300 rounded-lg font-medium disabled:opacity-50"
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