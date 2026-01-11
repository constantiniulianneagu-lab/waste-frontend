// src/components/reports/ReportsSidebar.jsx
/**
 * ============================================================================
 * REPORTS SIDEBAR COMPONENT - FIX KG/TONS + UX KG READONLY
 * ============================================================================
 *
 * Fixes:
 * - Sidebar edit pre-populează corect Data + Brut/Tară (din kg -> tone)
 * - Submit trimite kg către backend (gross_weight_kg / tare_weight_kg)
 * - Validare robustă (NaN, brut > tară)
 * - UX: afișează sub câmpuri valoarea "Înregistrat (kg)" + "Curent (kg)"
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import { createLandfillTicket, updateLandfillTicket } from '../../services/reportsService';

const toNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : NaN;
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
  const [ticketNumberConfirmed, setTicketNumberConfirmed] = useState(false);

  // păstrăm valorile originale din DB (kg) pentru UX (read-only)
  const [originalKg, setOriginalKg] = useState({
    gross: null,
    tare: null,
    net: null
  });

  const [formData, setFormData] = useState({
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
    operation_type: '',
    observations: ''
  });

  // Pre-populare pentru edit / reset pentru create
  useEffect(() => {
    if (mode === 'edit' && ticket) {
      // Data: input type="date" vrea yyyy-mm-dd
      const ticketDate = ticket.ticket_date
        ? String(ticket.ticket_date).slice(0, 10)
        : new Date().toISOString().split('T')[0];

      // Original kg (din DB)
      const origGrossKg = ticket.gross_weight_kg ?? null;
      const origTareKg = ticket.tare_weight_kg ?? null;
      const origNetKg = ticket.net_weight_kg ?? null;

      setOriginalKg({
        gross: origGrossKg,
        tare: origTareKg,
        net: origNetKg
      });

      // În form: vrem tone. Dacă API-ul nu are *_tons pentru brut/tară,
      // convertim din kg. Dacă există (fallback), le folosim.
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
        supplier_id: ticket.supplier_id || '',
        waste_code_id: ticket.waste_code_id || '',
        sector_id: ticket.sector_id || '',
        generator_type: ticket.generator_type || '',
        vehicle_number: ticket.vehicle_number || '',
        gross_weight_tons: grossTons || '',
        tare_weight_tons: tareTons || '',
        net_weight_tons: netTons || '',
        contract_type: ticket.contract_type || '',
        operation_type: ticket.operation_type || '',
        observations: ticket.observations || ''
      });

      setTicketNumberConfirmed(false);
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
        operation_type: '',
        observations: ''
      });

      setTicketNumberConfirmed(true);
    }

    setError(null);
  }, [mode, ticket, isOpen]);

  // Net = brut - tară (tone) (UI only)
  useEffect(() => {
    const gross = toNumber(formData.gross_weight_tons);
    const tare = toNumber(formData.tare_weight_tons);

    if (Number.isFinite(gross) && Number.isFinite(tare) && gross >= tare) {
      const net = gross - tare;
      setFormData((prev) => ({
        ...prev,
        net_weight_tons: net.toFixed(2)
      }));
    } else {
      // dacă e invalid, nu forțăm; lăsăm ce e / gol
      setFormData((prev) => ({
        ...prev,
        net_weight_tons: prev.net_weight_tons === '' ? '' : prev.net_weight_tons
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.gross_weight_tons, formData.tare_weight_tons]);

  const currentKg = useMemo(() => {
    const grossKg = tonsStrToKgInt(formData.gross_weight_tons);
    const tareKg = tonsStrToKgInt(formData.tare_weight_tons);

    const netKg =
      Number.isFinite(grossKg) && Number.isFinite(tareKg) && grossKg >= tareKg
        ? grossKg - tareKg
        : NaN;

    return {
      gross: grossKg,
      tare: tareKg,
      net: netKg
    };
  }, [formData.gross_weight_tons, formData.tare_weight_tons]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleTicketNumberChange = (value) => {
    if (mode === 'edit' && !ticketNumberConfirmed) {
      const confirmed = window.confirm(
        'ATENȚIE! Ești sigur că vrei să modifici numărul tichetului?\n\n' +
          'Modificarea acestui câmp poate genera erori dacă numărul deja există în sistem.'
      );
      if (confirmed) {
        setTicketNumberConfirmed(true);
        setFormData((prev) => ({ ...prev, ticket_number: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, ticket_number: value }));
    }
  };

  const validateForm = () => {
    const required = [
      'ticket_number',
      'ticket_date',
      'supplier_id',
      'waste_code_id',
      'sector_id',
      'vehicle_number',
      'gross_weight_tons',
      'tare_weight_tons'
    ];

    for (const field of required) {
      if (!formData[field]) {
        setError(`Câmpul ${field.replace(/_/g, ' ')} este obligatoriu`);
        return false;
      }
    }

    const gross = toNumber(formData.gross_weight_tons);
    const tare = toNumber(formData.tare_weight_tons);

    if (!Number.isFinite(gross) || !Number.isFinite(tare)) {
      setError('Greutățile trebuie să fie numere valide');
      return false;
    }

    if (gross <= tare) {
      setError('Greutatea brută trebuie să fie mai mare decât tara');
      return false;
    }

    // kg trebuie să fie valide și pozitive
    const grossKg = tonsStrToKgInt(formData.gross_weight_tons);
    const tareKg = tonsStrToKgInt(formData.tare_weight_tons);
    if (!Number.isFinite(grossKg) || grossKg <= 0) {
      setError('Greutatea brută (kg) este invalidă');
      return false;
    }
    if (!Number.isFinite(tareKg) || tareKg <= 0) {
      setError('Greutatea tară (kg) este invalidă');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // backend lucrează în KG
      const grossKg = tonsStrToKgInt(formData.gross_weight_tons);
      const tareKg = tonsStrToKgInt(formData.tare_weight_tons);

      const payload = {
        ticket_number: formData.ticket_number,
        ticket_date: formData.ticket_date,
        ticket_time: formData.ticket_time,
        supplier_id: Number(formData.supplier_id),
        waste_code_id: formData.waste_code_id,
        sector_id: formData.sector_id,
        generator_type: formData.generator_type,
        vehicle_number: formData.vehicle_number,
        contract_type: formData.contract_type,
        operation_type: formData.operation_type,
        observations: formData.observations,

        gross_weight_kg: grossKg,
        tare_weight_kg: tareKg
      };

      let response;
      if (mode === 'edit') {
        response = await updateLandfillTicket(ticket.id, payload);
      } else {
        response = await createLandfillTicket(payload);
      }

      if (response?.success) {
        onSuccess();
      } else {
        setError(response?.message || 'Eroare la salvare');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err?.message || 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-[#242b3d] shadow-xl
                   transform transition-transform duration-300 ease-in-out overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-[#242b3d] border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
            {/* Număr ticket cântar */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Număr ticket cântar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ticket_number}
                onChange={(e) => handleTicketNumberChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                placeholder="ex: 1286659"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.ticket_date}
                  onChange={(e) => handleChange('ticket_date', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                             rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ora
                </label>
                <input
                  type="time"
                  value={formData.ticket_time}
                  onChange={(e) => handleChange('ticket_time', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                             rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-colors"
                />
              </div>
            </div>

            {/* Furnizor */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Furnizor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => handleChange('supplier_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
              >
                <option value="">Selectează furnizor</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cod deșeu */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Cod deșeu <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.waste_code_id}
                onChange={(e) => handleChange('waste_code_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors max-h-32"
                style={{ maxHeight: '200px' }}
              >
                <option value="">Selectează cod deșeu</option>
                {wasteCodes.map((wc) => (
                  <option key={wc.id} value={wc.id} className="text-sm py-1">
                    {wc.code} - {wc.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scroll pentru mai multe opțiuni</p>
            </div>

            {/* Proveniență (Sector) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Proveniență <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sector_id}
                onChange={(e) => handleChange('sector_id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
              >
                <option value="">Selectează sector</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sector {s.sector_number} - {s.sector_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Generator */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Generator
              </label>
              <input
                type="text"
                value={formData.generator_type}
                onChange={(e) => handleChange('generator_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                placeholder="ex: CASNIC, NON-CASNIC"
              />
            </div>

            {/* Nr. Auto */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nr. Auto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => handleChange('vehicle_number', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                placeholder="ex: B 526 SDF"
              />
            </div>

            {/* Weights */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone brut <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gross_weight_tons}
                  onChange={(e) => handleChange('gross_weight_tons', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                             rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-colors"
                />
                {/* UX KG read-only */}
                <div className="mt-1 space-y-0.5">
                  {mode === 'edit' && originalKg.gross != null && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Înregistrat: <span className="font-mono">{originalKg.gross}</span> kg
                    </p>
                  )}
                  {Number.isFinite(currentKg.gross) && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Curent: <span className="font-mono">{currentKg.gross}</span> kg
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone tară <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tare_weight_tons}
                  onChange={(e) => handleChange('tare_weight_tons', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                             rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-colors"
                />
                {/* UX KG read-only */}
                <div className="mt-1 space-y-0.5">
                  {mode === 'edit' && originalKg.tare != null && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Înregistrat: <span className="font-mono">{originalKg.tare}</span> kg
                    </p>
                  )}
                  {Number.isFinite(currentKg.tare) && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Curent: <span className="font-mono">{currentKg.tare}</span> kg
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tone net
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.net_weight_tons}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700
                             rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                {/* UX KG net */}
                <div className="mt-1 space-y-0.5">
                  {mode === 'edit' && originalKg.net != null && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Înregistrat: <span className="font-mono">{originalKg.net}</span> kg
                    </p>
                  )}
                  {Number.isFinite(currentKg.net) && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Curent: <span className="font-mono">{currentKg.net}</span> kg
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contract */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contract
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => handleChange('contract_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
              >
                <option value="">Selectează tip contract</option>
                <option value="TAXA">Taxă</option>
                <option value="TARIF">Tarif</option>
              </select>
            </div>

            {/* Operație */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Operație
              </label>
              <input
                type="text"
                value={formData.operation_type}
                onChange={(e) => handleChange('operation_type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                placeholder="ex: Depozitare"
              />
            </div>

            {/* Observații */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Observații
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => handleChange('observations', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                           rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors resize-none"
                placeholder="Observații opționale..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-[#242b3d] border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg
                           transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
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
                           text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200
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
