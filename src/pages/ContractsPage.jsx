// src/pages/ContractsPage.jsx
/**
 * ============================================================================
 * CONTRACTS MANAGEMENT PAGE
 * ============================================================================
 * 
 * Design: Green/Teal theme - waste management
 * Created: 2025-01-24
 * 
 * Features:
 * - CRUD pentru toate tipurile de contracte
 * - Filtrare după tip contract, instituție, sector, status
 * - Gestionare acte adiționale
 * - Upload PDF pentru contracte și acte
 * 
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Plus, RefreshCw, Filter } from 'lucide-react';

import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../hooks/usePermissions';

// Components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ContractFilters from '../components/contracts/ContractFilters';
import ContractTable from '../components/contracts/ContractTable';
import ContractSidebar from '../components/contracts/ContractSidebar';

// Contract types
const CONTRACT_TYPES = {
  DISPOSAL: 'DISPOSAL',
  WASTE_COLLECTOR: 'WASTE_COLLECTOR',
  SORTING: 'SORTING',
  TMB: 'TMB',
};

const CONTRACT_TYPE_LABELS = {
  [CONTRACT_TYPES.DISPOSAL]: 'Depozitare',
  [CONTRACT_TYPES.WASTE_COLLECTOR]: 'Colectare',
  [CONTRACT_TYPES.SORTING]: 'Sortare',
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
  // ========================================================================
  // AUTH & PERMISSIONS
  // ========================================================================
  const { user } = useAuth();
  const permissions = usePermissions();
  const { canCreateData, canEditData, canDeleteData, hasAccess } = permissions;
  
  // URL params for filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInstitutionId = searchParams.get('institution');
  const initialContractType = searchParams.get('type');

  // ========================================================================
  // STATE
  // ========================================================================
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedContractType, setSelectedContractType] = useState(initialContractType || 'DISPOSAL');
  const [selectedInstitution, setSelectedInstitution] = useState(initialInstitutionId || '');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // '', 'active', 'inactive'

  // Reference data
  const [institutions, setInstitutions] = useState([]);
  const [sectors, setSectors] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Sorting
  const [sortBy, setSortBy] = useState('contract_date_start');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [saving, setSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {},
  });

  // ========================================================================
  // LOAD REFERENCE DATA
  // ========================================================================
  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      // Load institutions
      const instResponse = await apiGet('/api/institutions', { limit: 500 });
      if (instResponse.success) {
        setInstitutions(instResponse.data?.institutions || []);
      }

      // Load sectors
      const sectorsResponse = await apiGet('/api/sectors');
      if (sectorsResponse.success) {
        setSectors(sectorsResponse.data || []);
      }
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  // ========================================================================
  // LOAD CONTRACTS
  // ========================================================================
  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      const params = {};

      // Different endpoints based on contract type
      switch (selectedContractType) {
        case CONTRACT_TYPES.DISPOSAL:
          endpoint = selectedInstitution 
            ? `/api/institutions/${selectedInstitution}/disposal-contracts`
            : '/api/institutions/0/disposal-contracts'; // All disposal contracts
          break;
        case CONTRACT_TYPES.WASTE_COLLECTOR:
          endpoint = selectedInstitution 
            ? `/api/institutions/${selectedInstitution}/waste-contracts`
            : '/api/institutions/0/waste-contracts';
          break;
        case CONTRACT_TYPES.SORTING:
          endpoint = selectedInstitution 
            ? `/api/institutions/${selectedInstitution}/sorting-contracts`
            : '/api/institutions/0/sorting-contracts';
          break;
        case CONTRACT_TYPES.TMB:
          endpoint = selectedInstitution 
            ? `/api/institutions/${selectedInstitution}/tmb-contracts`
            : '/api/institutions/0/tmb-contracts';
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
        setContracts(contractsArray);
        calculateStats(contractsArray);
      } else {
        setContracts([]);
        calculateStats([]);
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
      setContracts([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }, [selectedContractType, selectedInstitution, selectedSector, selectedStatus]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const calculateStats = (data) => {
    const active = data.filter(c => c.is_active).length;
    const inactive = data.length - active;

    setStats({
      total: data.length,
      active,
      inactive,
    });
  };

  // ========================================================================
  // FILTERING & SORTING
  // ========================================================================
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          contract.contract_number?.toLowerCase().includes(query) ||
          contract.institution_name?.toLowerCase().includes(query) ||
          contract.sector_name?.toLowerCase().includes(query)
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
        case 'institution_name':
          aValue = a.institution_name || '';
          bValue = b.institution_name || '';
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedContractType, selectedInstitution, selectedSector, selectedStatus, searchQuery]);

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleContractTypeChange = (type) => {
    setSelectedContractType(type);
    setSearchParams(prev => {
      prev.set('type', type);
      return prev;
    });
  };

  const handleInstitutionChange = (institutionId) => {
    setSelectedInstitution(institutionId);
    if (institutionId) {
      setSearchParams(prev => {
        prev.set('institution', institutionId);
        return prev;
      });
    } else {
      setSearchParams(prev => {
        prev.delete('institution');
        return prev;
      });
    }
  };

  const handleSectorChange = (sectorId) => {
    setSelectedSector(sectorId);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // ========================================================================
  // SIDEBAR HANDLERS
  // ========================================================================
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
    setSelectedContract(contract);
    setSidebarMode('view');
    setSidebarOpen(true);
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

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      let endpoint = '';
      const institutionId = formData.institution_id || selectedInstitution;

      switch (selectedContractType) {
        case CONTRACT_TYPES.DISPOSAL:
          endpoint = `/api/institutions/${institutionId}/disposal-contracts`;
          break;
        case CONTRACT_TYPES.WASTE_COLLECTOR:
          endpoint = `/api/institutions/${institutionId}/waste-contracts`;
          break;
        case CONTRACT_TYPES.SORTING:
          endpoint = `/api/institutions/${institutionId}/sorting-contracts`;
          break;
        case CONTRACT_TYPES.TMB:
          endpoint = `/api/institutions/${institutionId}/tmb-contracts`;
          break;
      }

      let response;
      if (sidebarMode === 'add') {
        response = await apiPost(endpoint, formData);
      } else {
        response = await apiPut(`${endpoint}/${selectedContract.id}`, formData);
      }

      if (response.success) {
        showToast(sidebarMode === 'add' ? 'Contract adăugat cu succes' : 'Contract actualizat cu succes');
        handleCloseSidebar();
        loadContracts();
      } else {
        showToast(response.message || 'Eroare la salvare', 'error');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Eroare la salvare', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contract) => {
    setSaving(true);
    try {
      let endpoint = '';
      const institutionId = contract.institution_id;

      switch (selectedContractType) {
        case CONTRACT_TYPES.DISPOSAL:
          endpoint = `/api/institutions/${institutionId}/disposal-contracts/${contract.id}`;
          break;
        case CONTRACT_TYPES.WASTE_COLLECTOR:
          endpoint = `/api/institutions/${institutionId}/waste-contracts/${contract.id}`;
          break;
        case CONTRACT_TYPES.SORTING:
          endpoint = `/api/institutions/${institutionId}/sorting-contracts/${contract.id}`;
          break;
        case CONTRACT_TYPES.TMB:
          endpoint = `/api/institutions/${institutionId}/tmb-contracts/${contract.id}`;
          break;
      }

      const response = await apiDelete(endpoint);
      if (response.success) {
        showToast('Contract șters cu succes');
        handleCloseSidebar();
        loadContracts();
      } else {
        showToast(response.message || 'Eroare la ștergere', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Eroare la ștergere', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ========================================================================
  // ACCESS GUARD
  // ========================================================================
  if (!hasAccess('contracts') && !hasAccess('institutions')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/10 
                          flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-teal-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Acces restricționat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Nu ai permisiuni pentru pagina „Contracte".
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DashboardHeader
        title="Contracte"
        subtitle="Gestionare contracte operatori"
        onSearchChange={handleSearchChange}
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                            flex items-center justify-center shadow-lg shadow-teal-500/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 
                            flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 
                            flex items-center justify-center shadow-lg shadow-gray-400/30">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                          flex items-center justify-center shadow-lg shadow-teal-500/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Contracte {CONTRACT_TYPE_LABELS[selectedContractType]}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {sortedContracts.length} contracte găsite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadContracts}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 
                       text-gray-600 dark:text-gray-400 
                       hover:bg-gray-200 dark:hover:bg-gray-700 
                       transition-colors disabled:opacity-50"
              title="Reîncarcă"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {canCreateData && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 
                         bg-gradient-to-r from-teal-500 to-emerald-600 
                         hover:from-teal-600 hover:to-emerald-700 
                         text-white font-semibold rounded-xl 
                         shadow-lg shadow-teal-500/30 
                         transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Adaugă Contract
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <ContractFilters
          contractType={selectedContractType}
          onContractTypeChange={handleContractTypeChange}
          institutionId={selectedInstitution}
          onInstitutionChange={handleInstitutionChange}
          sectorId={selectedSector}
          onSectorChange={handleSectorChange}
          status={selectedStatus}
          onStatusChange={handleStatusChange}
          institutions={institutions}
          sectors={sectors}
        />

        {/* Table */}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pagina {currentPage} din {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-700 
                         text-sm font-medium text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-700 
                         text-sm font-medium text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Următor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
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
        preselectedInstitutionId={selectedInstitution}
      />
    </div>
  );
};

export default ContractsPage;
