// src/pages/ContractsPage.jsx
/**
 * ============================================================================
 * CONTRACTS PAGE - FIXED VERSION
 * ============================================================================
 * FIX 1: Added institutions state and loading
 * FIX 2: Added saving state
 * FIX 3: Added handleSave function for sidebar
 * FIX 4: Fixed props passed to ContractSidebar (onSave instead of onSuccess)
 * FIX 5: Added DashboardHeader for consistency
 * FIX 6: Added "Toate" option in status filter
 * FIX 7: Removed border from pagination (as per screenshot)
 * FIX 8: Toast messages for all actions
 * ============================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ContractFilters from '../components/contracts/ContractFilters';
import ContractTable from '../components/contracts/ContractTable';
import ContractViewModal from '../components/contracts/ContractViewModal';
import ContractSidebar from '../components/contracts/ContractSidebar';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';
import Toast from '../components/common/Toast';

const CONTRACT_TYPES = {
  WASTE_COLLECTOR: 'WASTE_COLLECTOR',
  SORTING: 'SORTING',
  AEROBIC: 'AEROBIC',
  ANAEROBIC: 'ANAEROBIC',
  TMB: 'TMB',
  DISPOSAL: 'DISPOSAL'
};

const CONTRACT_TYPE_LABELS = {
  WASTE_COLLECTOR: 'Colectare',
  SORTING: 'Sortare',
  AEROBIC: 'Aerobă',
  ANAEROBIC: 'Anaerobă',
  TMB: 'TMB',
  DISPOSAL: 'Depozitare'
};

const ENDPOINT_MAP = {
  WASTE_COLLECTOR: '/api/institutions/0/waste-contracts',
  SORTING: '/api/institutions/0/sorting-contracts',
  AEROBIC: '/api/institutions/0/aerobic-contracts',
  ANAEROBIC: '/api/institutions/0/anaerobic-contracts',
  TMB: '/api/institutions/0/tmb-contracts',
  DISPOSAL: '/api/institutions/0/disposal-contracts'
};

const ContractsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialContractType = searchParams.get('type') || 'WASTE_COLLECTOR';
  const initialSector = searchParams.get('sector') || '';

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contractCounts, setContractCounts] = useState({
    WASTE_COLLECTOR: 0,
    SORTING: 0,
    AEROBIC: 0,
    ANAEROBIC: 0,
    TMB: 0,
    DISPOSAL: 0
  });

  const [selectedContractType, setSelectedContractType] = useState(initialContractType);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [sortBy, setSortBy] = useState('contract_date_start');
  const [sortOrder, setSortOrder] = useState('desc');

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewContract, setViewContract] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('create');
  const [editContract, setEditContract] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);

  const [sectors, setSectors] = useState([]);
  // FIX 1: Added institutions state
  const [institutions, setInstitutions] = useState([]);
  // FIX 2: Added saving state
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const canCreateData = true;
  const canEditData = true;
  const canDeleteData = true;

  useEffect(() => {
    loadReferenceData();
    loadContractCounts();
  }, []);

  const loadContractCounts = async () => {
    try {
      const [wasteRes, sortRes, aeroRes, anaeroRes, tmbRes, dispRes] = await Promise.all([
        apiGet('/api/institutions/0/waste-contracts'),
        apiGet('/api/institutions/0/sorting-contracts'),
        apiGet('/api/institutions/0/aerobic-contracts'),
        apiGet('/api/institutions/0/anaerobic-contracts'),
        apiGet('/api/institutions/0/tmb-contracts'),
        apiGet('/api/institutions/0/disposal-contracts'),
      ]);

      setContractCounts({
        WASTE_COLLECTOR: wasteRes.success ? (Array.isArray(wasteRes.data) ? wasteRes.data.length : 0) : 0,
        SORTING: sortRes.success ? (Array.isArray(sortRes.data) ? sortRes.data.length : 0) : 0,
        AEROBIC: aeroRes.success ? (Array.isArray(aeroRes.data) ? aeroRes.data.length : 0) : 0,
        ANAEROBIC: anaeroRes.success ? (Array.isArray(anaeroRes.data) ? anaeroRes.data.length : 0) : 0,
        TMB: tmbRes.success ? (Array.isArray(tmbRes.data) ? tmbRes.data.length : 0) : 0,
        DISPOSAL: dispRes.success ? (Array.isArray(dispRes.data) ? dispRes.data.length : 0) : 0,
      });
    } catch (err) {
      console.error('Error loading contract counts:', err);
    }
  };

  // FIX 1: Updated loadReferenceData to also load institutions
  const loadReferenceData = async () => {
    try {
      const [sectorsRes, institutionsRes] = await Promise.all([
        apiGet('/api/sectors'),
        apiGet('/api/institutions', { limit: 1000 })
      ]);
      
      if (sectorsRes.success) {
        setSectors(sectorsRes.data || []);
      }
      
      if (institutionsRes.success) {
        setInstitutions(institutionsRes.data?.institutions || institutionsRes.data || []);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      // If ALL is selected, load all contract types
      if (selectedContractType === 'ALL') {
        const params = {};
        if (selectedSector) {
          params.sector_id = selectedSector;
        }
        if (selectedStatus) {
          params.is_active = selectedStatus === 'active';
        }

        const [wasteRes, sortRes, aeroRes, anaeroRes, tmbRes, dispRes] = await Promise.all([
          apiGet('/api/institutions/0/waste-contracts', params),
          apiGet('/api/institutions/0/sorting-contracts', params),
          apiGet('/api/institutions/0/aerobic-contracts', params),
          apiGet('/api/institutions/0/anaerobic-contracts', params),
          apiGet('/api/institutions/0/tmb-contracts', params),
          apiGet('/api/institutions/0/disposal-contracts', params),
        ]);

        // Combine all contracts and add type field
        const allContracts = [
          ...(wasteRes.success && Array.isArray(wasteRes.data) ? wasteRes.data.map(c => ({ ...c, contract_type: 'WASTE_COLLECTOR' })) : []),
          ...(sortRes.success && Array.isArray(sortRes.data) ? sortRes.data.map(c => ({ ...c, contract_type: 'SORTING' })) : []),
          ...(aeroRes.success && Array.isArray(aeroRes.data) ? aeroRes.data.map(c => ({ ...c, contract_type: 'AEROBIC' })) : []),
          ...(anaeroRes.success && Array.isArray(anaeroRes.data) ? anaeroRes.data.map(c => ({ ...c, contract_type: 'ANAEROBIC' })) : []),
          ...(tmbRes.success && Array.isArray(tmbRes.data) ? tmbRes.data.map(c => ({ ...c, contract_type: 'TMB' })) : []),
          ...(dispRes.success && Array.isArray(dispRes.data) ? dispRes.data.map(c => ({ ...c, contract_type: 'DISPOSAL' })) : []),
        ];

        // Sort by contract date start (newest first)
        allContracts.sort((a, b) => new Date(b.contract_date_start) - new Date(a.contract_date_start));

        setContracts(allContracts);
      } else {
        // Single contract type
        const endpoint = ENDPOINT_MAP[selectedContractType];
        const params = {};

        if (selectedSector) {
          params.sector_id = selectedSector;
        }
        if (selectedStatus) {
          params.is_active = selectedStatus === 'active';
        }

        const response = await apiGet(endpoint, params);

        if (response.success) {
          const contractsArray = Array.isArray(response.data) ? response.data : [];
          setContracts(contractsArray);
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

  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        (c.contract_number && c.contract_number.toLowerCase().includes(query)) ||
        (c.operator_name && c.operator_name.toLowerCase().includes(query)) ||
        (c.institution_name && c.institution_name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [contracts, searchQuery]);

  const sortedContracts = useMemo(() => {
    const sorted = [...filteredContracts];
    sorted.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredContracts, sortBy, sortOrder]);

  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedContracts.slice(start, start + itemsPerPage);
  }, [sortedContracts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);

  const handleContractTypeChange = (type) => {
    setSelectedContractType(type);
    setSearchParams({ type, sector: selectedSector });
    setCurrentPage(1);
  };

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
    setSearchParams({ type: selectedContractType, sector });
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedSector('');
    setSelectedStatus('');
    setSearchQuery('');
    setSearchParams({ type: selectedContractType });
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedSector || selectedStatus || searchQuery;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleView = (contract) => {
    setViewContract(contract);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewContract(null);
  };

  const handleAdd = () => {
    setSidebarMode('create');
    setEditContract(null);
    setSidebarOpen(true);
  };

  const handleEdit = (contract) => {
    setSidebarMode('edit');
    setEditContract(contract);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditContract(null);
  };

  // FIX 3: Added handleSave function for sidebar
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const endpoint = ENDPOINT_MAP[selectedContractType];
      const response = sidebarMode === 'edit'
        ? await apiPut(`${endpoint}/${editContract.id}`, formData)
        : await apiPost(endpoint, formData);
      
      if (response.success) {
        setSidebarOpen(false);
        setEditContract(null);
        loadContracts();
        loadContractCounts();
        // FIX 8: Different toast messages for add vs edit
        showToast(sidebarMode === 'edit' ? 'Contract actualizat cu succes!' : 'Contract adăugat cu succes!');
      } else {
        showToast(response.message || 'Eroare la salvarea contractului', 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Eroare la salvarea contractului', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    try {
      const endpoint = ENDPOINT_MAP[selectedContractType];
      const response = await apiDelete(`${endpoint}/${contractToDelete.id}`);

      if (response.success) {
        showToast('Contract șters cu succes!');
        loadContracts();
        loadContractCounts();
      } else {
        showToast('Eroare la ștergerea contractului', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Eroare la ștergerea contractului', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
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

      // FIX 8: Better export success message
      showToast(`Export ${format.toUpperCase()} realizat cu succes!`);
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Eroare la generarea ${format.toUpperCase()}. Vă rugăm încercați din nou.`, 'error');
    } finally {
      setExporting(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* FIX 5: Using DashboardHeader for consistency */}
      <DashboardHeader title="Contracte" />

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-4">
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
          contractCounts={contractCounts}
        />

        <ContractTable
          contracts={paginatedContracts}
          loading={loading}
          contractType={selectedContractType}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          canEdit={canEditData}
          canDelete={canDeleteData}
        />

        {/* FIX 7: Pagination without border (as per screenshot) */}
        {!loading && sortedContracts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Afișează
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                din <span className="font-semibold text-gray-900 dark:text-white">{sortedContracts.length} contracte</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[2.5rem] px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-teal-500 text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Următor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FIX 4: Fixed props - using onSave instead of onSuccess, added institutions and saving */}
      <ContractSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        mode={sidebarMode}
        contract={editContract}
        contractType={editContract?.contract_type || selectedContractType}
        onSave={handleSave}
        saving={saving}
        institutions={institutions}
        sectors={sectors}
      />

      <ContractViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        contract={viewContract}
        contractType={viewContract?.contract_type || selectedContractType}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Șterge Contract"
        message={`Sigur doriți să ștergeți contractul ${contractToDelete?.contract_number}?`}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default ContractsPage;