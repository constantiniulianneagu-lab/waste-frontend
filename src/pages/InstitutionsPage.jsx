// src/pages/InstitutionsPage.jsx
/**
 * ============================================================================
 * INSTITUTIONS PAGE - MODERN REDESIGN v2
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, RefreshCw, Search, X } from 'lucide-react';

import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiClient';
import { useAuth } from '../AuthContext';
import { usePermissions } from '../hooks/usePermissions';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import InstitutionFilters from '../components/institutions/InstitutionFilters';
import InstitutionTable from '../components/institutions/InstitutionTable';
import InstitutionSidebar from '../components/institutions/InstitutionSidebar';
import InstitutionViewModal from '../components/institutions/InstitutionViewModal';

// Institution types with colors - ORDERED AS REQUESTED
const INSTITUTION_TYPES = {
  ASSOCIATION: { label: 'Asociație', color: 'slate' },
  UAT: { label: 'U.A.T.', color: 'gray' },
  PUBLIC_AUTHORITY: { label: 'Autoritate publică', color: 'stone' },
  WASTE_COLLECTOR: { label: 'Colectare', color: 'teal' },
  SORTING_OPERATOR: { label: 'Sortare', color: 'pink' },
  AEROBIC_OPERATOR: { label: 'Aerob', color: 'cyan' },
  ANAEROBIC_OPERATOR: { label: 'Anaerob', color: 'indigo' },
  TMB_OPERATOR: { label: 'TMB', color: 'blue' },
  DISPOSAL_CLIENT: { label: 'Depozitare', color: 'orange' },
  LANDFILL: { label: 'Depozit', color: 'amber' },
  RECYCLING_OPERATOR: { label: 'Reciclare', color: 'purple' },
  RECOVERY_OPERATOR: { label: 'Valorificare', color: 'yellow' },
  // Legacy/unmapped types - map them to proper labels
  RECYCLING_CLIENT: { label: 'Reciclare', color: 'purple' },
  REGULATOR: { label: 'Regulator', color: 'red' },
};

// Dropdown order
const DROPDOWN_ORDER = [
  'ASSOCIATION',
  'UAT', 
  'PUBLIC_AUTHORITY',
  'WASTE_COLLECTOR',
  'SORTING_OPERATOR',
  'AEROBIC_OPERATOR',
  'ANAEROBIC_OPERATOR',
  'TMB_OPERATOR',
  'DISPOSAL_CLIENT',
  'LANDFILL',
  'RECYCLING_OPERATOR',
  'RECOVERY_OPERATOR',
];

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
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
  }, [searchQuery, selectedType, selectedStatus, selectedSector, itemsPerPage]);

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

  const hasActiveFilters = selectedType || selectedStatus || selectedSector || searchQuery;

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
      {/* Header - Standard cu User Profile */}
      <DashboardHeader
        title="Instituții"
        subtitle="Gestionare instituții partenere"
      />

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-4">
        {/* Filters Bar */}
        <InstitutionFilters
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          sectors={sectors}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onAdd={handleAdd}
          onRefresh={loadInstitutions}
          loading={loading}
          canCreate={canCreateData}
          institutionTypes={INSTITUTION_TYPES}
          dropdownOrder={DROPDOWN_ORDER}
        />

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
              din {filteredInstitutions.length} instituții
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
        dropdownOrder={DROPDOWN_ORDER}
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