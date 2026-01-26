// src/pages/UsersPage.jsx
/**
 * ============================================================================
 * USERS PAGE - MODERN REDESIGN
 * ============================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Users as UsersIcon } from 'lucide-react';

import { useAuth } from '../AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { userService } from '../userService';
import { apiGet } from '../api/apiClient';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import UserFilters from '../components/users/UserFilters';
import UserTable from '../components/users/UserTable';
import UserSidebar from '../components/users/UserSidebar';
import UserViewModal from '../components/users/UserViewModal';

// Role definitions
const ROLE_TYPES = {
  PLATFORM_ADMIN: { label: 'Administrator Platformă', color: 'red' },
  ADMIN_INSTITUTION: { label: 'Administrator Instituție', color: 'blue' },
  EDITOR_INSTITUTION: { label: 'Editor Instituție', color: 'emerald' },
  REGULATOR_VIEWER: { label: 'Autoritate publică', color: 'purple' },
};

const ROLE_ORDER = [
  'PLATFORM_ADMIN',
  'ADMIN_INSTITUTION',
  'EDITOR_INSTITUTION',
  'REGULATOR_VIEWER',
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

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();
  const { canCreateData, canEditData, canDeleteData, hasAccess, isPlatformAdmin, isInstitutionAdmin } = permissions;

  const myInstitutionId = currentUser?.institution?.id || null;

  // State
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Sidebar (add/edit)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    department: '',
    role: 'EDITOR_INSTITUTION',
    isActive: true,
    institutionId: isInstitutionAdmin ? myInstitutionId : null,
  });

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load data
  useEffect(() => {
    loadUsers();
    loadInstitutions();
    loadSectors();
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ limit: 500 });
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const response = await apiGet('/api/institutions', { limit: 1000 });
      if (response.success) {
        setInstitutions(response.data?.institutions || []);
      }
    } catch (err) {
      console.error('Error loading institutions:', err);
      setInstitutions([]);
    } finally {
      setLoadingInstitutions(false);
    }
  };

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

  // Permissions check
  const canManageTargetUser = (target) => {
    if (isPlatformAdmin) return true;
    if (!isInstitutionAdmin) return false;
    const sameInstitution = Number(target?.institution?.id) === Number(myInstitutionId);
    const isEditor = target?.role === 'EDITOR_INSTITUTION';
    return sameInstitution && isEditor;
  };

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      // Role filter
      if (selectedRole && user.role !== selectedRole) return false;

      // Status filter
      if (selectedStatus === 'active' && !user.is_active) return false;
      if (selectedStatus === 'inactive' && user.is_active) return false;

      // Institution filter
      if (selectedInstitution) {
        if (String(user.institution?.id) !== String(selectedInstitution)) return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedRole, selectedStatus, selectedInstitution]);

  // Sorting
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
        case 'last_name':
          aValue = `${a.last_name || ''} ${a.first_name || ''}`.toLowerCase();
          bValue = `${b.last_name || ''} ${b.first_name || ''}`.toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        case 'institution':
          aValue = (a.institution?.name || '').toLowerCase();
          bValue = (b.institution?.name || '').toLowerCase();
          break;
        default:
          aValue = `${a.last_name || ''} ${a.first_name || ''}`.toLowerCase();
          bValue = `${b.last_name || ''} ${b.first_name || ''}`.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedStatus, selectedInstitution, itemsPerPage]);

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
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedInstitution('');
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || selectedRole || selectedStatus || selectedInstitution;

  // CRUD handlers
  const handleAdd = () => {
    setSelectedUser(null);
    setSidebarMode('create');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      position: '',
      department: '',
      role: 'EDITOR_INSTITUTION',
      isActive: true,
      institutionId: isInstitutionAdmin ? myInstitutionId : null,
    });
    setFormError('');
    setSidebarOpen(true);
  };

  const handleEdit = (user) => {
    if (!canManageTargetUser(user)) return;
    
    setSelectedUser(user);
    setSidebarMode('edit');
    setFormData({
      email: user.email,
      password: '',
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      role: user.role,
      isActive: user.is_active,
      institutionId: isInstitutionAdmin ? myInstitutionId : user.institution?.id || null,
    });
    setFormError('');
    setSidebarOpen(true);
  };

  const handleView = (user) => {
    setViewUser(user);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedUser(null);
    setSidebarMode(null);
    setFormError('');
  };

  const handleSubmit = async (data) => {
    setFormError('');

    // Normalize data for institution admin
    const normalized = { ...data };
    if (isInstitutionAdmin) {
      normalized.role = 'EDITOR_INSTITUTION';
      normalized.institutionId = myInstitutionId;
    }

    if (!normalized.institutionId) {
      setFormError('Vă rugăm să selectați o instituție!');
      return;
    }

    try {
      let response;

      if (sidebarMode === 'create') {
        const payload = {
          email: normalized.email,
          password: normalized.password,
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          phone: normalized.phone || null,
          position: normalized.position || null,
          department: normalized.department || null,
          role: normalized.role,
          isActive: normalized.isActive,
          institutionIds: [normalized.institutionId],
        };
        response = await userService.createUser(payload);
      } else if (sidebarMode === 'edit') {
        if (isInstitutionAdmin && !canManageTargetUser(selectedUser)) {
          setFormError('Nu ai voie să editezi acest utilizator.');
          return;
        }

        const payload = {
          email: normalized.email,
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          role: normalized.role,
          isActive: normalized.isActive,
          institutionIds: [normalized.institutionId],
        };

        if (normalized.phone?.trim()) payload.phone = normalized.phone;
        if (normalized.position?.trim()) payload.position = normalized.position;
        if (normalized.department?.trim()) payload.department = normalized.department;
        if (normalized.password?.trim()) payload.password = normalized.password;

        response = await userService.updateUser(selectedUser.id, payload);
      }

      if (response?.success) {
        showToast(sidebarMode === 'create' ? 'Utilizator creat cu succes' : 'Utilizator actualizat cu succes');
        handleCloseSidebar();
        loadUsers();
      } else {
        setFormError(response?.message || 'Eroare la salvarea utilizatorului.');
      }
    } catch (err) {
      setFormError(err.message || 'Eroare la salvarea utilizatorului.');
    }
  };

  const handleDelete = async (userId) => {
    const target = users.find(u => u.id === userId);
    if (!isPlatformAdmin && isInstitutionAdmin && !canManageTargetUser(target)) {
      alert('Nu ai voie să ștergi acest utilizator.');
      return;
    }

    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        showToast('Utilizator șters cu succes');
        setDeleteConfirm(null);
        loadUsers();
      } else {
        alert(response.message || 'Eroare la ștergere.');
      }
    } catch (err) {
      alert(err.message || 'Eroare la ștergere.');
    }
  };

  // Access guard
  if (!hasAccess('users')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
          <UsersIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acces restricționat</h1>
          <p className="text-gray-600 dark:text-gray-400">Nu ai permisiuni pentru pagina „Utilizatori".</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DashboardHeader
        title="Utilizatori"
        subtitle="Gestionare utilizatori platformă"
      />

      {/* Content */}
      <div className="px-6 lg:px-8 py-6 space-y-4">
        {/* Filters Bar */}
        <UserFilters
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedInstitution={selectedInstitution}
          onInstitutionChange={setSelectedInstitution}
          institutions={institutions}
          loadingInstitutions={loadingInstitutions}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onAdd={handleAdd}
          onRefresh={loadUsers}
          loading={loading}
          canCreate={canCreateData}
          isPlatformAdmin={isPlatformAdmin}
          roleTypes={ROLE_TYPES}
          roleOrder={ROLE_ORDER}
        />

        {/* Table */}
        <UserTable
          users={paginatedUsers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          canEdit={canEditData}
          canDelete={canDeleteData}
          canManageUser={canManageTargetUser}
          isPlatformAdmin={isPlatformAdmin}
          roleTypes={ROLE_TYPES}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          {/* Left - Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Afișează</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              din {filteredUsers.length} utilizatori
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
                          ? 'bg-emerald-500 text-white'
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

      {/* Sidebar - Add/Edit */}
      {sidebarOpen && (
        <UserSidebar
          mode={sidebarMode}
          user={selectedUser}
          formData={formData}
          institutions={institutions}
          sectors={sectors}
          currentUser={currentUser}
          onClose={handleCloseSidebar}
          onSubmit={handleSubmit}
          onFormChange={setFormData}
          formError={formError}
          roleTypes={ROLE_TYPES}
          roleOrder={ROLE_ORDER}
        />
      )}

      {/* View Modal */}
      <UserViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewUser(null);
        }}
        user={viewUser}
        roleTypes={ROLE_TYPES}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setDeleteConfirm(null)} 
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Confirmare Ștergere
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sigur vrei să ștergi utilizatorul{' '}
              <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                Șterge
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;