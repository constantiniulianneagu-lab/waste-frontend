// src/components/contracts/AmendmentsList.jsx
/**
 * ============================================================================
 * AMENDMENTS LIST - Listă acte adiționale pentru un contract
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AmendmentsList = ({ 
  contractId, 
  contractType,
  onEdit,
  onRefresh 
}) => {
  const [amendments, setAmendments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contractId && contractType) {
      fetchAmendments();
    }
  }, [contractId, contractType, onRefresh]);

  const fetchAmendments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/amendments/${contractType}/${contractId}`
      );
      setAmendments(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Eroare la încărcarea actelor adiționale');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (amendmentId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest act adițional?')) {
      return;
    }

    try {
      await axios.delete(`/api/amendments/${contractType}/${amendmentId}`);
      fetchAmendments(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la ștergerea actului');
    }
  };

  const getAmendmentTypeBadge = (type) => {
    const types = {
      'AUTO_TERMINATION': { color: 'bg-red-100 text-red-800', label: '🤖 Închidere Automată' },
      'PRELUNGIRE': { color: 'bg-green-100 text-green-800', label: '📈 Prelungire' },
      'INCETARE': { color: 'bg-orange-100 text-orange-800', label: '📉 Încetare' },
      'MODIFICARE_TARIF': { color: 'bg-blue-100 text-blue-800', label: '💰 Modificare Tarif' },
      'MODIFICARE_CEC': { color: 'bg-purple-100 text-purple-800', label: '💰 Modificare CEC' },
      'MODIFICARE_CANTITATE': { color: 'bg-yellow-100 text-yellow-800', label: '📊 Modificare Cantitate' },
      'MODIFICARE_INDICATORI': { color: 'bg-indigo-100 text-indigo-800', label: '📊 Modificare Indicatori' },
      'MODIFICARE_VALABILITATE': { color: 'bg-teal-100 text-teal-800', label: '📅 Modificare Valabilitate' },
      'MANUAL': { color: 'bg-gray-100 text-gray-800', label: '✏️ Manual' }
    };
    
    const config = types[type] || types['MANUAL'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (amendments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm">Nu există acte adiționale pentru acest contract</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {amendments.map((amendment) => (
        <div
          key={amendment.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{amendment.amendment_number}</h4>
                {getAmendmentTypeBadge(amendment.amendment_type)}
                {amendment.reference_contract_number && (
                  <span className="text-xs text-gray-500">
                    → Preluat de {amendment.reference_contract_number}
                  </span>
                )}
              </div>

              {/* Date și Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Data act:</span>
                  <div className="font-medium text-gray-900">
                    {new Date(amendment.amendment_date).toLocaleDateString('ro-RO')}
                  </div>
                </div>

                {amendment.new_contract_date_end && (
                  <div>
                    <span className="text-gray-500">Nouă dată sfârșit:</span>
                    <div className="font-medium text-gray-900">
                      {new Date(amendment.new_contract_date_end).toLocaleDateString('ro-RO')}
                    </div>
                  </div>
                )}

                {amendment.new_tariff_per_ton && (
                  <div>
                    <span className="text-gray-500">Nou tarif:</span>
                    <div className="font-medium text-gray-900">
                      {amendment.new_tariff_per_ton} RON/t
                    </div>
                  </div>
                )}

                {amendment.quantity_adjustment_auto && (
                  <div>
                    <span className="text-gray-500">Cantitate ajustată:</span>
                    <div className="font-medium text-green-600">
                      {amendment.quantity_adjustment_auto.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} t
                    </div>
                  </div>
                )}
              </div>

              {/* Descriere */}
              {amendment.changes_description && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Descriere:</span> {amendment.changes_description}
                </div>
              )}

              {/* Motiv */}
              {amendment.reason && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Motiv:</span> {amendment.reason}
                </div>
              )}

              {/* Notes */}
              {amendment.notes && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Observații:</span> {amendment.notes}
                </div>
              )}

              {/* Creat de */}
              {amendment.created_by_name && (
                <div className="text-xs text-gray-400 mt-2">
                  Creat de {amendment.created_by_name} la {new Date(amendment.created_at).toLocaleDateString('ro-RO')}
                </div>
              )}
            </div>

            {/* Actions */}
            {amendment.amendment_type !== 'AUTO_TERMINATION' && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEdit(amendment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editează"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(amendment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Șterge"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AmendmentsList;