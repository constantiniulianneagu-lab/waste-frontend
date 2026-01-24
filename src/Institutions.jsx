// src/Institutions.jsx
/**
 * ============================================================================
 * INSTITUTIONS MANAGEMENT - REFACTORED
 * ============================================================================
 * 
 * Design: Green/Teal theme - waste management
 * Updated: 2025-01-24
 * 
 * Features:
 * - CRUD complet pentru instituții
 * - Filtrare după tip, căutare
 * - Sortare, paginare
 * - Contracte read-only (management în pagina Contracte)
 * - Representative info pentru operatori
 * - Permission-based access
 * 
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Toast notification helper
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
  const navigate = useNavigate();

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

  // Contracts for institutions (read-only display)
  const [institutionContracts, setInstitutionContracts] = useState({});
  const [loadingContracts, setLoadingContracts] = useState({});

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [saving, setSaving] = useState(false);

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
  // LOAD CONTRACTS (read-only for display)
  // ========================================================================
  const loadContractsForInstitution = async (institutionId, forceReload = false) => {
    if (institutionContracts[institutionId] && !forceReload) return;

    setLoadingContracts(prev => ({ ...prev, [institutionId]: true }));

    try {
      const response = await apiGet(`/api/institutions/${institutionId}/contracts`);
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
      // Type filter
      if (activeTypeFilter) {
        // Handle LANDFILL/DISPOSAL_CLIENT as same
        if (activeTypeFilter === 'LANDFILL' || activeTypeFilter === 'DISPOSAL_CLIENT') {
          if (inst.type !== 'LANDFILL' && inst.type !== 'DISPOSAL_CLIENT') {
            return false;
          }
        } else if (inst.type !== activeTypeFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          inst.name?.toLowerCase().includes(query) ||
          inst.short_name?.toLowerCase().includes(query) ||
          inst.fiscal_code?.toLowerCase().includes(query) ||
          inst.contact_email?.toLowerCase().includes(query) ||
          inst.representative_name?.toLowerCase().includes(query)
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
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'sector':
          aValue = a.sector || '';
          bValue = b.sector || '';
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInstitutions, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedInstitutions.length / itemsPerPage);
  const paginatedInstitutions = sortedInstitutions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTypeFilter, searchQuery]);

  // ========================================================================
  // HANDLERS
  // ========================================================================
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleTypeFilterChange = (type) => {
    setActiveTypeFilter(type);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleToggleExpand = (institutionId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(institutionId)) {
        newSet.delete(institutionId);
      } else {
        newSet.add(institutionId);
        // Load contracts when expanding
        loadContractsForInstitution(institutionId);
      }
      return newSet;
    });
  };

  // ========================================================================
  // SIDEBAR HANDLERS
  // ========================================================================
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
    setSelectedInstitution(null);
    setSidebarMode(null);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      let response;
      if (sidebarMode === 'add') {
        response = await apiPost('/api/institutions', formData);
      } else {
        response = await apiPut(`/api/institutions/${selectedInstitution.id}`, formData);
      }

      if (response.success) {
        showToast(sidebarMode === 'add' ? 'Instituție adăugată cu succes' : 'Instituție actualizată cu succes');
        handleCloseSidebar();
        loadInstitutions();
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

  const handleDelete = async (institution) => {
    setSaving(true);
    try {
      const response = await apiDelete(`/api/institutions/${institution.id}`);
      if (response.success) {
        showToast('Instituție ștearsă cu succes');
        handleCloseSidebar();
        loadInstitutions();
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
  // NAVIGATE TO CONTRACTS
  // ========================================================================
  const handleNavigateToContracts = (institution) => {
    // Navigate to Contracts page with institution filter
    navigate(`/contracts?institution=${institution.id}`);
  };

  // ========================================================================
  // ACCESS GUARD
  // ========================================================================
  if (!hasAccess('institutions')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/10 
                          flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-teal-500" />
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
        subtitle="Gestionare instituții partenere"
        onSearchChange={handleSearchChange}
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <InstitutionStats stats={stats} loading={loading} />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                          flex items-center justify-center shadow-lg shadow-teal-500/30">
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
                         bg-gradient-to-r from-teal-500 to-emerald-600 
                         hover:from-teal-600 hover:to-emerald-700 
                         text-white font-semibold rounded-xl 
                         shadow-lg shadow-teal-500/30 
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
          onNavigateToContracts={handleNavigateToContracts}
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
    </div>
  );
};

export default Institutions;
