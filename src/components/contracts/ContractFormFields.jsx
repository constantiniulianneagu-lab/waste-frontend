// src/components/contracts/ContractFormFields.jsx
/**
 * ============================================================================
 * CONTRACT FORM FIELDS - Câmpuri comune pentru toate contractele
 * ============================================================================
 * Include: service_start_date, associate_institution_id, attribution_type
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const ServiceStartDateField = ({ value, onChange, contractDateStart }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Data Început Prestare Serviciu
        <span className="text-xs text-gray-500 ml-1">(opțional)</span>
      </label>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        min={contractDateStart}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="mt-1 text-xs text-gray-500">
        Data efectivă când începe prestarea serviciului (după perioada de mobilizare)
      </p>
    </div>
  );
};

export const AssociateInstitutionField = ({ value, onChange, disabled = false }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await axios.get('/api/institutions');
      setInstitutions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Instituție Asociată
        <span className="text-xs text-gray-500 ml-1">(opțional)</span>
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
      >
        <option value="">-- Selectează --</option>
        {institutions.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.short_name || inst.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Instituția care lucrează în asociere pentru acest contract
      </p>
    </div>
  );
};

export const AttributionTypeField = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tip Atribuire
        <span className="text-xs text-gray-500 ml-1">(opțional)</span>
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- Selectează --</option>
        <option value="LICITATIE_DESCHISA">Licitație Deschisă</option>
        <option value="LICITATIE_RESTRANSA">Licitație Restrânsă</option>
        <option value="NEGOCIERE">Negociere</option>
        <option value="ACHIZITIE_DIRECTA">Achiziție Directă</option>
        <option value="DIALOG_COMPETITIV">Dialog Competitiv</option>
        <option value="PROCEDURA_SIMPLIFICATA">Procedură Simplificată</option>
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Tipul procedurii de atribuire a contractului
      </p>
    </div>
  );
};

export const AutoTerminationAlert = ({ autoTerminations }) => {
  if (!autoTerminations || autoTerminations.terminated?.length === 0) {
    return null;
  }

  const successCount = autoTerminations.terminated.filter(t => t.success).length;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-orange-800">
            Contracte Închise Automat ({successCount})
          </h3>
          <div className="mt-2 text-sm text-orange-700">
            <p className="mb-2">{autoTerminations.message}</p>
            <ul className="list-disc list-inside space-y-1">
              {autoTerminations.terminated.filter(t => t.success).map((term, idx) => (
                <li key={idx}>
                  Contract <strong>{term.oldContract.contract_number}</strong> închis la{' '}
                  {new Date(term.oldContract.new_end_date).toLocaleDateString('ro-RO')}
                  {term.calculation && (
                    <span className="text-xs ml-2">
                      ({term.calculation.original_quantity.toLocaleString('ro-RO')} t → {term.calculation.adjusted_quantity.toLocaleString('ro-RO')} t)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  ServiceStartDateField,
  AssociateInstitutionField,
  AttributionTypeField,
  AutoTerminationAlert
};