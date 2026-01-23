// src/Institutions.jsx
/**
 * ============================================================================
 * INSTITUTIONS MANAGEMENT - REFACTORED
 * ============================================================================
 * 
 * Design: Amber/Orange theme - consistent cu stilul aplicației
 * 
 * Features:
 * - CRUD complet pentru instituții
 * - Filtrare după tip, căutare
 * - Sortare, paginare
 * - Contracte expandabile
 * - Permission-based access
 * 
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';

import { apiGet, apiPost, apiPut, apiDelete } from './api/apiClient';
import { useAuth } from './AuthContext';
import { usePermissions } from './hooks/usePermissions';

// Components
import DashboardHeader from './components/dashboard/DashboardHeader';
import InstitutionStats from './components/institutions/InstitutionStats';
import InstitutionFilters from './components/institutions/InstitutionFilters';
import InstitutionTable from './components/institutions/InstitutionTable';
import InstitutionSidebar from './components/institutions/InstitutionSidebar';

// Contract Modals (existing)
import WasteOperatorContractModal from './WasteOperatorContractModal';
import SortingContractModal from './SortingContractModal';
import DisposalContractModal from './DisposalContractModal';
import TMBContractModal from './TMBContractModal';

// Toast notification helper (simple version)
const showToast = (message, type = 'success') => {
  if (type === 'error') {
    console.error(message);
    alert(message);
  } else {
    console.log(message);
  }
};

const Institutions = () => {
  // ========================================================================
  // AUTH & PERMISSIONS
  // ========================================================================
  const { user } = useAuth();
  const permissions = usePermissions();
  const { canCreateData, canEditData, canDeleteData, hasAccess } = permissions;

  // ========================================================================
  // STATE
  // ========================================================================
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {},
  });

  // Expand rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Contracts for institutions
  const [institutionContracts, setInstitutionContracts] = useState({});
  const [loadingContracts, setLoadingContracts] = useState({});

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [saving, setSaving] = useState(false);

  // Contract modals
  const [wasteContractModalOpen, setWasteContractModalOpen] = useState(false);
  const [sortingContractModalOpen, setSortingContractModalOpen] = useState(false);
  const [disposalContractModalOpen, setDisposalContractModalOpen] = useState(false);
  const [tmbContractModalOpen, setTmbContractModalOpen] = useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] = useState(null);
  const [currentInstitutionId, setCurrentInstitutionId] = useState(null);

  // ========================================================================
  // LOAD DATA
  // ========================================================================
  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/institutions', { limit: 1000 });

      if (response.success) {
        const institutionsArray = Array.isArray(response.data?.institutions)
          ? response.data.institutions
          : [];
        setInstitutions(institutionsArray);
        calculateStats(institutionsArray);
      } else {
        console.error('Failed to load institutions:', response.message);
        setInstitutions([]);
        calculateStats([]);
      }
    } catch (err) {
      console.error('Error loading institutions:', err);
      setInstitutions([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const calculateStats = (data) => {
    const active = data.filter(i => i.is_active).length;
    const inactive = data.length - active;

    const byType = data.reduce((acc, inst) => {
      acc[inst.type] = (acc[inst.type] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total: data.length,
      active,
      inactive,
      byType,
    });
  };

  // ========================================================================
  // LOAD CONTRACTS
  // ========================================================================
  const loadContractsForInstitution = async (institutionId, forceReload = false) => {
    if (institutionContracts[institutionId] && !forceReload) return;

    setLoadingContracts(prev => ({ ...prev, [institutionId]: true }));

    try {
      const institution = institutions.find(inst => inst.id === institutionId);
      if (!institution) {
        setInstitutionContracts(prev => ({ ...prev, [institutionId]: [] }));
        return;
      }

      let endpoint = '';
      switch (institution.type) {
        case 'TMB_OPERATOR':
          endpoint = `/api/institutions/${institutionId}/tmb-contracts`;
          break;
        case 'WASTE_COLLECTOR':
          endpoint = `/api/institutions/${institutionId}/waste-contracts`;
          break;
        case 'SORTING_OPERATOR':
          endpoint = `/api/institutions/${institutionId}/sorting-contracts`;
          break;
        case 'DISPOSAL_CLIENT':
        case 'LANDFILL':
          endpoint = `/api/institutions/${institutionId}/disposal-contracts`;
          break;
        default:
          setInstitutionContracts(prev => ({ ...prev, [institutionId]: [] }));
          return;
      }

      const response = await apiGet(endpoint);
      setInstitutionContracts(prev => ({
        ...prev,
        [institutionId]: response.success ? (response.data || []) : []
      }));
    } catch (err) {
      console.error('Error loading contracts:', err);
      setInstitutionContracts(prev => ({ ...prev, [institutionId]: [] }));
    } finally {
      setLoadingContracts(prev => ({ ...prev, [institutionId]: false }));
    }
  };

  // ========================================================================
  // FILTERING, SORTING & PAGINATION
  // ========================================================================
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      if (activeTypeFilter && inst.type !== activeTypeFilter) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          inst.name?.toLowerCase().includes(query) ||
          inst.short_name?.toLowerCase().includes(query) ||
          inst.fiscal_code?.toLowerCase().includes(query) ||
          inst.contact_email?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [institutions, activeTypeFilter, searchQuery]);

  const sortedInstitutions = useMemo(() => {
    return [...filteredInstitutions].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'type':
          aValue = (a.type || '').toLowerCase();
          bValue = (b.type || '').toLowerCase();
          break;
        case 'sector':
          aValue = a.sector || '';
          bValue = b.sector || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });
  }, [filteredInstitutions, sortBy, sortOrder]);

  const paginatedInstitutions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedInstitutions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedInstitutions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedInstitutions.length / itemsPerPage);

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (type) => {
    setActiveTypeFilter(type);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleToggleExpand = (id) => {
    if (expandedRows.has(id)) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set([id]));
      loadContractsForInstitution(id);
    }
  };

  const handleAdd = () => {
    setSelectedInstitution(null);
    setSidebarMode('add');
    setSidebarOpen(true);
  };

  const handleEdit = (institution) => {
    setSelectedInstitution(institution);
    setSidebarMode('edit');
    setSidebarOpen(true);
  };

  const handleView = (institution) => {
    setSelectedInstitution(institution);
    setSidebarMode('view');
    setSidebarOpen(true);
  };

  const handleDeleteClick = (institution) => {
    setSelectedInstitution(institution);
    setSidebarMode('delete');
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSidebarMode(null);
    setSelectedInstitution(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (sidebarMode === 'add') {
        const response = await apiPost('/api/institutions', formData);
        if (response.success) {
          showToast('Instituție adăugată cu succes!');
          await loadInstitutions();
          handleCloseSidebar();
        } else {
          showToast(response.message || 'Eroare la adăugare', 'error');
        }
      } else if (sidebarMode === 'edit') {
        const response = await apiPut(`/api/institutions/${selectedInstitution.id}`, formData);
        if (response.success) {
          showToast('Instituție actualizată cu succes!');
          await loadInstitutions();
          handleCloseSidebar();
        } else {
          showToast(response.message || 'Eroare la actualizare', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving:', err);
      showToast('Eroare la salvare', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (institution) => {
    setSaving(true);
    try {
      const response = await apiDelete(`/api/institutions/${institution.id}`);
      if (response.success) {
        showToast('Instituție ștearsă cu succes!');
        await loadInstitutions();
        handleCloseSidebar();
      } else {
        showToast(response.message || 'Eroare la ștergere', 'error');
      }
    } catch (err) {
      console.error('Error deleting:', err);
      showToast('Eroare la ștergere', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContract = (institution) => {
    setCurrentInstitutionId(institution.id);
    setSelectedContractForEdit(null);

    switch (institution.type) {
      case 'TMB_OPERATOR':
        setTmbContractModalOpen(true);
        break;
      case 'WASTE_COLLECTOR':
        setWasteContractModalOpen(true);
        break;
      case 'SORTING_OPERATOR':
        setSortingContractModalOpen(true);
        break;
      case 'DISPOSAL_CLIENT':
      case 'LANDFILL':
        setDisposalContractModalOpen(true);
        break;
      default:
        showToast('Acest tip de instituție nu suportă contracte', 'error');
    }
  };

  const handleContractSuccess = () => {
    if (currentInstitutionId) {
      loadContractsForInstitution(currentInstitutionId, true);
    }
  };

  // ========================================================================
  // ACCESS GUARD
  // ========================================================================
  if (!hasAccess('institutions')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/10 
                          flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Acces restricționat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Nu ai permisiuni pentru pagina „Instituții".
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
        title="Instituții"
        subtitle="Gestionare instituții și contracte"
        onSearchChange={handleSearchChange}
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <InstitutionStats stats={stats} loading={loading} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 
                          flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Lista Instituțiilor
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {sortedInstitutions.length} instituții găsite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadInstitutions}
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
                         bg-gradient-to-r from-amber-500 to-orange-600 
                         hover:from-amber-600 hover:to-orange-700 
                         text-white font-semibold rounded-xl 
                         shadow-lg shadow-amber-500/30 
                         transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Adaugă Instituție
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <InstitutionFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeTypeFilter={activeTypeFilter}
          onTypeFilterChange={handleTypeFilterChange}
          stats={stats}
        />

        {/* Table */}
        <InstitutionTable
          institutions={paginatedInstitutions}
          loading={loading}
          expandedRows={expandedRows}
          onToggleExpand={handleToggleExpand}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          onAddContract={handleAddContract}
          institutionContracts={institutionContracts}
          loadingContracts={loadingContracts}
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
      <InstitutionSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        mode={sidebarMode}
        institution={selectedInstitution}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
      />

      {/* Contract Modals */}
      <WasteOperatorContractModal
        isOpen={wasteContractModalOpen}
        onClose={() => {
          setWasteContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={handleContractSuccess}
      />

      <SortingContractModal
        isOpen={sortingContractModalOpen}
        onClose={() => {
          setSortingContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={handleContractSuccess}
      />

      <DisposalContractModal
        isOpen={disposalContractModalOpen}
        onClose={() => {
          setDisposalContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={handleContractSuccess}
      />

      <TMBContractModal
        isOpen={tmbContractModalOpen}
        onClose={() => {
          setTmbContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={handleContractSuccess}
      />
    </div>
  );
};

export default Institutions;