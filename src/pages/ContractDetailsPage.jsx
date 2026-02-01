// src/pages/ContractDetailsPage.jsx
/**
 * ============================================================================
 * CONTRACT DETAILS PAGE - Detalii contract cu tab-uri
 * ============================================================================
 * Tabs: Detalii, Acte Adiționale, Bonuri
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AmendmentsList from '../components/contracts/AmendmentsList';
import AmendmentFormModal from '../components/contracts/AmendmentFormModal';

const ContractDetailsPage = () => {
  const { contractType, contractId } = useParams();
  const navigate = useNavigate();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchContract();
  }, [contractType, contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const endpoint = getEndpointForType(contractType);
      const response = await axios.get(`${endpoint}/${contractId}`);
      setContract(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      alert('Eroare la încărcarea contractului');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const getEndpointForType = (type) => {
    const endpoints = {
      TMB: '/api/tmb-contracts',
      DISPOSAL: '/api/disposal-contracts',
      AEROBIC: '/api/aerobic-contracts',
      ANAEROBIC: '/api/anaerobic-contracts',
      WASTE_COLLECTOR: '/api/waste-operator-contracts',
      SORTING: '/api/sorting-contracts'
    };
    return endpoints[type] || '/api/contracts';
  };

  const handleEditAmendment = (amendment) => {
    setSelectedAmendment(amendment);
    setShowAmendmentModal(true);
  };

  const handleNewAmendment = () => {
    setSelectedAmendment(null);
    setShowAmendmentModal(true);
  };

  const handleAmendmentSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowAmendmentModal(false);
    setSelectedAmendment(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Contractul nu a fost găsit</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-gray-700 mb-2"
                >
                  ← Înapoi
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {contract.contract_number}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {contract.institution_name || contract.institution?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Sector</div>
                <div className="font-medium">{contract.sector_number || contract.sector?.sector_number}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detalii Contract
              </button>
              <button
                onClick={() => setActiveTab('amendments')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'amendments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Acte Adiționale
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'tickets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bonuri
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* TAB: Detalii */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Începere</label>
                  <div className="mt-1 text-gray-900">
                    {new Date(contract.contract_date_start).toLocaleDateString('ro-RO')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Sfârșit</label>
                  <div className="mt-1 text-gray-900">
                    {contract.contract_date_end 
                      ? new Date(contract.contract_date_end).toLocaleDateString('ro-RO')
                      : 'Nedefinită'}
                  </div>
                </div>
                {contract.service_start_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data Început Prestare</label>
                    <div className="mt-1 text-gray-900">
                      {new Date(contract.service_start_date).toLocaleDateString('ro-RO')}
                    </div>
                  </div>
                )}
                {contract.tariff_per_ton && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tarif</label>
                    <div className="mt-1 text-gray-900">
                      {contract.tariff_per_ton} RON/tonă
                    </div>
                  </div>
                )}
                {contract.estimated_quantity_tons && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cantitate Estimată</label>
                    <div className="mt-1 text-gray-900">
                      {contract.estimated_quantity_tons.toLocaleString('ro-RO')} tone
                    </div>
                  </div>
                )}
                {contract.associate_institution_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Instituție Asociată</label>
                    <div className="mt-1 text-gray-900">
                      {contract.associate_name || contract.associate_short_name || 'N/A'}
                    </div>
                  </div>
                )}
              </div>

              {contract.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observații</label>
                  <div className="mt-1 text-gray-900 whitespace-pre-wrap">{contract.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Acte Adiționale */}
          {activeTab === 'amendments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Acte Adiționale</h2>
                <button
                  onClick={handleNewAmendment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Act Adițional Nou
                </button>
              </div>

              <AmendmentsList
                contractId={contractId}
                contractType={contractType}
                onEdit={handleEditAmendment}
                onRefresh={refreshKey}
              />
            </div>
          )}

          {/* TAB: Bonuri */}
          {activeTab === 'tickets' && (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">Vizualizare bonuri - în dezvoltare</p>
            </div>
          )}
        </div>
      </div>

      {/* Amendment Modal */}
      <AmendmentFormModal
        isOpen={showAmendmentModal}
        onClose={() => {
          setShowAmendmentModal(false);
          setSelectedAmendment(null);
        }}
        contract={contract}
        contractType={contractType}
        amendment={selectedAmendment}
        onSuccess={handleAmendmentSuccess}
      />
    </div>
  );
};

export default ContractDetailsPage;