// src/pages/ContractsPage.jsx
/**
 * ============================================================================
 * CONTRACTS MANAGEMENT PAGE - REDESIGNED v2.0
 * ============================================================================
 * Design: Matching InstitutionsPage - Clean, modern layout
 * Features: Export (PDF/XLS/CSV), Modern filters, No stats cards
 * Updated: 2026-01-27
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../hooks/usePermissions';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import ContractFilters from '../components/contracts/ContractFilters';
import ContractTable from '../components/contracts/ContractTable';
import ContractSidebar from '../components/contracts/ContractSidebar';
import ContractViewModal from '../components/contracts/ContractViewModal';

// Contract types
const CONTRACT_TYPES = {
  DISPOSAL: 'DISPOSAL',
  WASTE_COLLECTOR: 'WASTE_COLLECTOR',
  TMB: 'TMB',
};

const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPES.DISPOSAL]: 'Depozitare',
  [CONTRACT_TYPES.WASTE_COLLECTOR]: 'Colectare',
  [CONTRACT_TYPES.TMB]: 'TMB',
};

// Toast helper
const showToast = (message, type = 'success') => {
  if (type === 'error') {
    console.error(message);
    alert(message);
  } else {
    console.log(message);
  }
};

const ContractsPage = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { canCreateData, canEditData, canDeleteData, hasAccess } = permissions;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialContractType = searchParams.get('type') || '';
  const initialSector = searchParams.get('sector') || '';

  // State
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedContractType, setSelectedContractType] = useState(initialContractType);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Reference data
  const [institutions, setInstitutions] = useState([]);
  const [sectors, setSectors] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const [sortBy, setSortBy] = useState('contract_date_start');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sidebar (for add/edit/delete)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [saving, setSaving] = useState(false);

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewContract, setViewContract] = useState(null);

  // Export
  const [exporting, setExporting] = useState(false);

  // Load reference data
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [instResponse, sectorsResponse] = await Promise.all([
        apiGet('/api/institutions', { limit: 500 }),
        apiGet('/api/sectors')
      ]);
      
      if (instResponse.success) {
        setInstitutions(instResponse.data?.institutions || []);
      }
      if (sectorsResponse.success) {
        setSectors(sectorsResponse.data || []);
      }
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  // Load contracts
  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      let allContracts = [];

      // If no contract type selected, load all types
      if (!selectedContractType) {
        const [disposalRes, wasteRes, tmbRes] = await Promise.all([
          apiGet('/api/institutions/0/disposal-contracts', { 
            sector_id: selectedSector || undefined,
            is_active: selectedStatus ? selectedStatus === 'active' : undefined 
          }),
          apiGet('/api/institutions/0/waste-contracts', { 
            sector_id: selectedSector || undefined,
            is_active: selectedStatus ? selectedStatus === 'active' : undefined 
          }),
          apiGet('/api/institutions/0/tmb-contracts', { 
            sector_id: selectedSector || undefined,
            is_active: selectedStatus ? selectedStatus === 'active' : undefined 
          }),
        ]);

        if (disposalRes.success) {
          const contracts = Array.isArray(disposalRes.data) ? disposalRes.data : [];
          allContracts.push(...contracts.map(c => ({ ...c, _type: 'DISPOSAL' })));
        }
        if (wasteRes.success) {
          const contracts = Array.isArray(wasteRes.data) ? wasteRes.data : [];
          allContracts.push(...contracts.map(c => ({ ...c, _type: 'WASTE_COLLECTOR' })));
        }
        if (tmbRes.success) {
          const contracts = Array.isArray(tmbRes.data) ? tmbRes.data : [];
          allContracts.push(...contracts.map(c => ({ ...c, _type: 'TMB' })));
        }

        setContracts(allContracts);
      } else {
        // Load specific contract type
        let endpoint = '';
        const params = {};

        switch (selectedContractType) {
          case CONTRACT_TYPES.DISPOSAL:
            endpoint = '/api/institutions/0/disposal-contracts';
            break;
          case CONTRACT_TYPES.WASTE_COLLECTOR:
            endpoint = '/api/institutions/0/waste-contracts';
            break;
          case CONTRACT_TYPES.TMB:
            endpoint = '/api/institutions/0/tmb-contracts';
            break;
          default:
            endpoint = '/api/institutions/0/disposal-contracts';
        }

        if (selectedSector) {
          params.sector_id = selectedSector;
        }
        if (selectedStatus) {
          params.is_active = selectedStatus === 'active';
        }

        const response = await apiGet(endpoint, params);

        if (response.success) {
          const contractsArray = Array.isArray(response.data) ? response.data : [];
          setContracts(contractsArray.map(c => ({ ...c, _type: selectedContractType })));
        } else {
          setContracts([]);
        }
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedContractType, selectedSector, selectedStatus]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Filtering & Sorting
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          contract.contract_number?.toLowerCase().includes(query) ||
          contract.institution_name?.toLowerCase().includes(query) ||
          contract.sector_name?.toLowerCase().includes(query) ||
          contract.associate_name?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [contracts, searchQuery]);

  const sortedContracts = useMemo(() => {
    return [...filteredContracts].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'contract_number':
          aValue = a.contract_number || '';
          bValue = b.contract_number || '';
          break;
        case 'contract_date_start':
          aValue = a.contract_date_start || '';
          bValue = b.contract_date_start || '';
          break;
        case 'sector_number':
          aValue = a.sector_number || 0;
          bValue = b.sector_number || 0;
          break;
        default:
          aValue = a.contract_date_start || '';
          bValue = b.contract_date_start || '';
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredContracts, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);
  const paginatedContracts = sortedContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedContractType, selectedSector, selectedStatus, searchQuery]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return selectedSector !== '' || selectedStatus !== '' || searchQuery !== '';
  }, [selectedSector, selectedStatus, searchQuery]);

  // Handlers
  const handleSearchChange = (value) => setSearchQuery(value);

  const handleContractTypeChange = (type) => {
    setSelectedContractType(type);
    setSearchParams(prev => { prev.set('type', type); return prev; });
  };

  const handleSectorChange = (sectorId) => {
    setSelectedSector(sectorId);
    if (sectorId) {
      setSearchParams(prev => { prev.set('sector', sectorId); return prev; });
    } else {
      setSearchParams(prev => { prev.delete('sector'); return prev; });
    }
  };

  const handleStatusChange = (status) => setSelectedStatus(status);

  const handleResetFilters = () => {
    setSelectedSector('');
    setSelectedStatus('');
    setSearchQuery('');
    setSearchParams(prev => { 
      prev.delete('sector'); 
      return prev; 
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Sidebar handlers (add/edit/delete)
  const handleAdd = () => {
    setSelectedContract(null);
    setSidebarMode('add');
    setSidebarOpen(true);
  };

  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setSidebarMode('edit');
    setSidebarOpen(true);
  };

  const handleView = (contract) => {
    setViewContract(contract);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (contract) => {
    setSelectedContract(contract);
    setSidebarMode('delete');
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedContract(null);
    setSidebarMode(null);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewContract(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      let endpoint = '';
      
      switch (selectedContractType) {
        case CONTRACT_TYPES.DISPOSAL:
          endpoint = `/api/institutions/${formData.institution_id || 0}/disposal-contracts`;
          break;
        case CONTRACT_TYPES.WASTE_COLLECTOR:
          endpoint = `/api/institutions/${formData.institution_id || 0}/waste-contracts`;
          break;
        case CONTRACT_TYPES.TMB:
          endpoint = `/api/institutions/0/tmb-contracts`;
          break;
        default:
          throw new Error('Invalid contract type');
      }

      let response;
      if (sidebarMode === 'add') {
        response = await apiPost(endpoint, formData);
      } else if (sidebarMode === 'edit') {
        response = await apiPut(`${endpoint}/${selectedContract.id}`, formData);
      }

      if (response.success) {
        showToast(`Contract ${sidebarMode === 'add' ? 'adăugat' : 'actualizat'} cu succes!`);
        handleCloseSidebar();
        loadContracts();
      } else {
        showToast(response.message || 'Eroare la salvare', 'error');
      }
    } catch (err) {
      console.error('Error saving contract:', err);
      showToast('Eroare la salvare', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContract) return;
    
    setSaving(true);
    try {
      let endpoint = '';
      
      switch (selectedContractType) {
        case CONTRACT_TYPES.DISPOSAL:
          endpoint = `/api/institutions/${selectedContract.institution_id || 0}/disposal-contracts/${selectedContract.id}`;
          break;
        case CONTRACT_TYPES.WASTE_COLLECTOR:
          endpoint = `/api/institutions/${selectedContract.institution_id || 0}/waste-contracts/${selectedContract.id}`;
          break;
        case CONTRACT_TYPES.TMB:
          endpoint = `/api/institutions/0/tmb-contracts/${selectedContract.id}`;
          break;
        default:
          throw new Error('Invalid contract type');
      }

      const response = await apiDelete(endpoint);

      if (response.success) {
        showToast('Contract șters cu succes!');
        handleCloseSidebar();
        loadContracts();
      } else {
        showToast(response.message || 'Eroare la ștergere', 'error');
      }
    } catch (err) {
      console.error('Error deleting contract:', err);
      showToast('Eroare la ștergere', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Export handler
  const handleExport = async (format) => {
    setExporting(true);
    try {
      // If no contract type selected, we can't export (need to specify type for backend)
      if (!selectedContractType) {
        showToast('Vă rugăm selectați un tip de contract pentru export', 'error');
        setExporting(false);
        return;
      }

      const params = new URLSearchParams({
        contractType: selectedContractType,
      });
      
      if (selectedSector) params.append('sector_id', selectedSector);
      if (selectedStatus) params.append('is_active', selectedStatus === 'active');

      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const token = localStorage.getItem('wasteAccessToken');
      
      const response = await fetch(
        `${API_URL}/api/contracts/export/${format}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileExtension = format === 'xlsx' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf';
      a.download = `contracte-${CONTRACT_TYPE_LABELS[selectedContractType].toLowerCase()}-${timestamp}.${fileExtension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Export ${format.toUpperCase()} realizat cu succes!`);
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Eroare la generarea ${format.toUpperCase()}. Vă rugăm încercați din nou.`, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DashboardHeader
        title="Contracte"
        subtitle="Gestionare contracte operatori"
      />

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-4">
        {/* Filters Bar */}
        <ContractFilters
          contractType={selectedContractType}
          onContractTypeChange={handleContractTypeChange}
          sectorId={selectedSector}
          onSectorChange={handleSectorChange}
          status={selectedStatus}
          onStatusChange={handleStatusChange}
          sectors={sectors}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onAdd={handleAdd}
          onRefresh={loadContracts}
          loading={loading}
          canCreate={canCreateData}
          onExport={handleExport}
          exporting={exporting}
        />

        {/* Table */}
        <ContractTable
          contracts={paginatedContracts}
          loading={loading}
          contractType={selectedContractType || 'DISPOSAL'}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          canEdit={canEditData}
          canDelete={canDeleteData}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          {/* Left - Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Afișează</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              din {filteredContracts.length} contracte
            </span>
          </div>

          {/* Right - Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Anterior
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-teal-500 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Următor
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - for Add/Edit/Delete */}
      <ContractSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        mode={sidebarMode}
        contract={selectedContract}
        contractType={selectedContractType}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
        institutions={institutions}
        sectors={sectors}
      />

      {/* View Modal - Elegant display for viewing contract details */}
      <ContractViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        contract={viewContract}
        contractType={viewContract?._type || selectedContractType || 'DISPOSAL'}
      />
    </div>
  );
};

export default ContractsPage;