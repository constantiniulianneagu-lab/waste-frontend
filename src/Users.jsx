// src/Users.jsx
/**
 * ============================================================================
 * USERS COMPONENT - UPDATED WITH INSTITUTIONS SUPPORT
 * ============================================================================
 * 
 * ✅ Sidebar instead of modal
 * ✅ Multi-select institutions
 * ✅ Show institutions in table
 * ✅ Advanced filtering (role, institution, status)
 * ✅ Backend sync with institutionIds
 * 
 * ============================================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "./userService";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import UserSidebar from "./components/users/UserSidebar";
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  Building2,
} from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();

  // ========== STATE ==========
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "INSTITUTION_EDITOR",
    isActive: true,
    institutionIds: []
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    institutionId: '',
    status: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ========== LOAD DATA ==========
  useEffect(() => {
    loadUsers();
    loadInstitutions();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ limit: 500 });
      if (response.success) {
        setUsers(response.data.users || []);
      } else {
        console.error("Failed to load users:", response.message);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/institutions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInstitutions(data.data || []);
      }
    } catch (err) {
      console.error("Error loading institutions:", err);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  // ========== HANDLERS ==========
  const handleCreateUser = () => {
    setSelectedUser(null);
    setSidebarMode('create');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'INSTITUTION_EDITOR',
      isActive: true,
      institutionIds: []
    });
    setFormError('');
    setShowSidebar(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setSidebarMode('view');
    setShowSidebar(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setSidebarMode('edit');
    setFormData({
      email: user.email,
      password: '',
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      institutionIds: user.institutions?.map(i => i.id) || []
    });
    setFormError('');
    setShowSidebar(true);
  };

  const handleSubmit = async (data) => {
    setFormError('');

    try {
      let response;
      if (sidebarMode === 'create') {
        response = await userService.createUser(data);
      } else if (sidebarMode === 'edit') {
        response = await userService.updateUser(selectedUser.id, data);
      }

      if (response.success) {
        setShowSidebar(false);
        loadUsers();
      } else {
        setFormError(response.message || 'Eroare la salvarea utilizatorului.');
      }
    } catch (err) {
      setFormError(err.message || 'Eroare la salvarea utilizatorului.');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        setDeleteConfirm(null);
        loadUsers();
      } else {
        alert(response.message || 'Eroare la ștergere.');
      }
    } catch (err) {
      alert(err.message || 'Eroare la ștergere.');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      institutionId: '',
      status: ''
    });
    setPage(1);
  };

  // ========== COMPUTED ==========
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search
      if (filters.search) {
        const searchable = `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`.toLowerCase();
        if (!searchable.includes(filters.search.toLowerCase())) return false;
      }

      // Role filter
      if (filters.role && user.role !== filters.role) return false;

      // Institution filter
      if (filters.institutionId) {
        const hasInst = user.institutions?.some(i => i.id === parseInt(filters.institutionId));
        if (!hasInst) return false;
      }

      // Status filter
      if (filters.status === 'active' && !user.is_active) return false;
      if (filters.status === 'inactive' && user.is_active) return false;

      return true;
    });
  }, [users, filters]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // ========== ROLE MAPPING ==========
  const roleMap = {
    SUPER_ADMIN: { 
      label: "Super Admin", 
      bg: "bg-red-500/10 dark:bg-red-500/20", 
      text: "text-red-600 dark:text-red-400", 
      border: "border-red-500/20 dark:border-red-500/30" 
    },
    INSTITUTION_ADMIN: { 
      label: "Admin Instituție", 
      bg: "bg-blue-500/10 dark:bg-blue-500/20", 
      text: "text-blue-600 dark:text-blue-400", 
      border: "border-blue-500/20 dark:border-blue-500/30" 
    },
    INSTITUTION_EDITOR: { 
      label: "Editor Instituție", 
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20", 
      text: "text-emerald-600 dark:text-emerald-400", 
      border: "border-emerald-500/20 dark:border-emerald-500/30" 
    },
    INSTITUTION_VIEWER: { 
      label: "Vizualizator", 
      bg: "bg-gray-500/10 dark:bg-gray-500/20", 
      text: "text-gray-600 dark:text-gray-400", 
      border: "border-gray-500/20 dark:border-gray-500/30" 
    },
  };

  const getRoleBadge = (role) => {
    const r = roleMap[role] || roleMap.INSTITUTION_VIEWER;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold border ${r.bg} ${r.text} ${r.border}`}>
        <Shield className="w-3 h-3" />
        {r.label}
      </span>
    );
  };

  const hasActiveFilters = filters.search || filters.role || filters.institutionId || filters.status;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <DashboardHeader title="Gestionare Utilizatori" />

      {/* Filters + Actions Bar */}
      <div className="px-6 py-4 space-y-4">
        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută utilizator (nume, email)..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 
                       border border-gray-200 dark:border-gray-700 
                       rounded-[14px] 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-white text-sm
                       placeholder:text-gray-400
                       focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                       transition-all duration-300"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2.5 
                     border border-gray-200 dark:border-gray-700 
                     rounded-[14px] 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-white text-sm
                     focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                     transition-all duration-300 cursor-pointer"
          >
            <option value="">Toate rolurile</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="INSTITUTION_ADMIN">Admin Instituție</option>
            <option value="INSTITUTION_EDITOR">Editor Instituție</option>
            <option value="INSTITUTION_VIEWER">Vizualizator</option>
          </select>

          {/* Institution Filter */}
          <select
            value={filters.institutionId}
            onChange={(e) => setFilters({ ...filters, institutionId: e.target.value })}
            className="px-4 py-2.5 
                     border border-gray-200 dark:border-gray-700 
                     rounded-[14px] 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-white text-sm
                     focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                     transition-all duration-300 cursor-pointer"
            disabled={loadingInstitutions}
          >
            <option value="">Toate instituțiile</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 
                     border border-gray-200 dark:border-gray-700 
                     rounded-[14px] 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-white text-sm
                     focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                     transition-all duration-300 cursor-pointer"
          >
            <option value="">Toate statusurile</option>
            <option value="active">Activ</option>
            <option value="inactive">Inactiv</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 
                       bg-gray-100 dark:bg-gray-700 
                       text-gray-700 dark:text-gray-300 
                       rounded-[14px] 
                       hover:bg-gray-200 dark:hover:bg-gray-600 
                       transition-all duration-300
                       flex items-center gap-2 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Resetează
            </button>
          )}

          {/* Create User Button */}
          <button
            onClick={handleCreateUser}
            className="ml-auto px-5 py-2.5 
                     bg-gradient-to-r from-emerald-600 to-teal-600 
                     hover:from-emerald-700 hover:to-teal-700 
                     text-white font-bold rounded-[14px] 
                     transition-all duration-300
                     active:scale-98
                     shadow-lg shadow-emerald-500/20
                     flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Utilizator Nou
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredUsers.length} utilizator{filteredUsers.length !== 1 ? 'i' : ''} găsi{filteredUsers.length !== 1 ? 'ți' : 't'}
          {hasActiveFilters && ` (filtrat din ${users.length})`}
        </div>
      </div>

      {/* Users Table */}
      <div className="px-6">
        <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Se încarcă utilizatorii...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {hasActiveFilters ? 'Niciun utilizator găsit' : 'Nu există utilizatori'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
                >
                  Resetează filtrele
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Utilizator
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Instituții
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => handleViewUser(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {user.institutions && user.institutions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {user.institutions.slice(0, 2).map(inst => (
                              <span
                                key={inst.id}
                                className="inline-flex items-center gap-1 
                                         px-2 py-1 
                                         bg-blue-500/10 dark:bg-blue-500/20 
                                         text-blue-700 dark:text-blue-400 
                                         rounded-[8px] 
                                         text-xs font-medium"
                              >
                                <Building2 className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{inst.name}</span>
                              </span>
                            ))}
                            {user.institutions.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                +{user.institutions.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            Nicio instituție
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-bold ${
                          user.is_active 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                        }`}>
                          {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.is_active ? 'Activ' : 'Inactiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[10px] transition-colors"
                            title="Editează"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(user);
                            }}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[10px] transition-colors"
                            title="Șterge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pagina {page} din {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-[10px] 
                         hover:bg-gray-50 dark:hover:bg-gray-800 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-[10px] 
                         hover:bg-gray-50 dark:hover:bg-gray-800 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Sidebar */}
      {showSidebar && (
        <UserSidebar
          mode={sidebarMode}
          user={selectedUser}
          formData={formData}
          institutions={institutions}
          onClose={() => setShowSidebar(false)}
          onSubmit={handleSubmit}
          onFormChange={setFormData}
          formError={formError}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-[20px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Confirmare Ștergere
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sigur vrei să ștergi utilizatorul <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>?
              Această acțiune nu poate fi anulată.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2.5 
                         bg-red-600 hover:bg-red-700 
                         text-white font-bold rounded-[14px] 
                         transition-all duration-300"
              >
                Șterge
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 
                         bg-gray-100 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 
                         font-bold rounded-[14px] 
                         hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-all duration-300"
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

export default Users;
