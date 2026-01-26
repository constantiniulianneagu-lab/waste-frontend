// src/pages/InstitutionsPage.jsx
/**
 * ============================================================================
 * INSTITUTIONS PAGE - MODERN REDESIGN
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, RefreshCw, Search } from 'lucide-react';

import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../hooks/usePermissions';

import InstitutionFilters from '../components/institutions/InstitutionFilters';
import InstitutionTable from '../components/institutions/InstitutionTable';
import InstitutionSidebar from '../components/institutions/InstitutionSidebar';
import InstitutionViewModal from '../components/institutions/InstitutionViewModal';

// Institution types with colors
const INSTITUTION_TYPES = {
  WASTE_COLLECTOR: { label: 'Colectare', color: 'teal' },
  TMB_OPERATOR: { label: 'TMB', color: 'blue' },
  AEROBIC_OPERATOR: { label: 'Aerob', color: 'cyan' },
  ANAEROBIC_OPERATOR: { label: 'Anaerob', color: 'indigo' },
  DISPOSAL_CLIENT: { label: 'Depozitare', color: 'orange' },
  LANDFILL: { label: 'Depozit', color: 'amber' },
  RECYCLING_OPERATOR: { label: 'Reciclare', color: 'purple' },
  SORTING_OPERATOR: { label: 'Sortare', color: 'pink' },
  RECOVERY_OPERATOR: { label: 'Valorificare', color: 'yellow' },
  UAT: { label: 'U.A.T.', color: 'gray' },
  ASSOCIATION: { label: 'Asociație', color: 'slate' },
  PUBLIC_AUTHORITY: { label: 'Autoritate', color: 'stone' },
};

// Toast notification helper
const showToast = (message, type = 'success') => {
  if (type === 'error') {
    console.error(message);
    alert(message);
  } else {
    console.log(message);
  }
};

const InstitutionsPage = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { canCreateData, canEditData, canDeleteData, hasAccess } = permissions;
  const navigate = useNavigate();

  // State
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  // Reference data
  const [sectors, setSectors] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Sidebar (add/edit/delete)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [saving, setSaving] = useState(false);

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewInstitution, setViewInstitution] = useState(null);

  // Load data
  useEffect(() => {
    loadInstitutions();
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const response = await apiGet('/api/sectors');
      if (response.success) {
        setSectors(response.data || []);
      }
    } catch (err) {
      console.error('Error loading sectors:', err);
    }
  };

  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/institutions', { limit: 1000 });
      if (response.success) {
        const institutionsArray = Array.isArray(response.data?.institutions)
          ? response.data.institutions
          : [];
        setInstitutions(institutionsArray);
      } else {
        setInstitutions([]);
      }
    } catch (err) {
      console.error('Error loading institutions:', err);
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = institutions.length;
    const active = institutions.filter(i => i.is_active).length;
    const operators = institutions.filter(i => 
      ['WASTE_COLLECTOR', 'TMB_OPERATOR', 'AEROBIC_OPERATOR', 'ANAEROBIC_OPERATOR', 
       'RECYCLING_OPERATOR', 'SORTING_OPERATOR', 'RECOVERY_OPERATOR', 'DISPOSAL_CLIENT', 'LANDFILL']
      .includes(i.type)
    ).length;
    return { total, active, operators };
  }, [institutions]);

  // Filtering
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          inst.name?.toLowerCase().includes(query) ||
          inst.short_name?.toLowerCase().includes(query) ||
          inst.email?.toLowerCase().includes(query) ||
          inst.contact_email?.toLowerCase().includes(query) ||
          inst.phone?.toLowerCase().includes(query) ||
          inst.fiscal_code?.toLowerCase().includes(query) ||
          inst.representative_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedType) {
        // Handle LANDFILL/DISPOSAL_CLIENT as same
        if (selectedType === 'LANDFILL' || selectedType === 'DISPOSAL_CLIENT') {
          if (inst.type !== 'LANDFILL' && inst.type !== 'DISPOSAL_CLIENT') {
            return false;
          }
        } else if (inst.type !== selectedType) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus === 'active' && !inst.is_active) return false;
      if (selectedStatus === 'inactive' && inst.is_active) return false;

      // Sector filter
      if (selectedSector) {
        const instSectors = inst.sectors || [];
        const hasSector = instSectors.some(s => s.id === parseInt(selectedSector));
        if (!hasSector) return false;
      }

      return true;
    });
  }, [institutions, searchQuery, selectedType, selectedStatus, selectedSector]);

  // Sorting
  const sortedInstitutions = useMemo(() => {
    return [...filteredInstitutions].sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInstitutions, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedInstitutions.length / itemsPerPage);
  const paginatedInstitutions = sortedInstitutions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus, selectedSector]);

  // Handlers
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSelectedType('');
    setSelectedStatus('');
    setSelectedSector('');
    setSearchQuery('');
  };

  // CRUD handlers
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
    setViewInstitution(institution);
    setViewModalOpen(true);
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

  // Navigate to contracts
  const handleNavigateToContracts = (institution) => {
    navigate(`/contracts?institution=${institution.id}`);
  };

  // Access guard
  if (!hasAccess('institutions')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
          <Building2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acces restricționat</h1>
          <p className="text-gray-600 dark:text-gray-400">Nu ai permisiuni pentru pagina „Instituții".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title & Stats */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Instituții
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.total} total
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    {stats.active} active
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {stats.operators} operatori
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută instituție..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={loadInstitutions}
                disabled={loading}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                title="Reîncarcă"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Add Button */}
              {canCreateData && (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-teal-500/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adaugă</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-4">
        {/* Filters */}
        <InstitutionFilters
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          sectors={sectors}
          onReset={handleResetFilters}
          institutionTypes={INSTITUTION_TYPES}
        />

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredInstitutions.length} instituții găsite
          </p>
        </div>

        {/* Table */}
        <InstitutionTable
          institutions={paginatedInstitutions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          canEdit={canEditData}
          canDelete={canDeleteData}
          institutionTypes={INSTITUTION_TYPES}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pagina {currentPage} din {totalPages}
            </p>
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
          </div>
        )}
      </div>

      {/* Sidebar - Add/Edit/Delete */}
      <InstitutionSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        mode={sidebarMode}
        institution={selectedInstitution}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
        sectors={sectors}
        institutionTypes={INSTITUTION_TYPES}
      />

      {/* View Modal */}
      <InstitutionViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewInstitution(null);
        }}
        institution={viewInstitution}
        institutionTypes={INSTITUTION_TYPES}
      />
    </div>
  );
};

export default InstitutionsPage;