// src/Users.jsx
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

  // State
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Sidebar
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
    phone: "",
    position: "",
    department: "",
    role: "EDITOR_INSTITUTION",
    isActive: true,
    institutionId: null,
    permissions: {
      can_edit_data: false,
      access_type: null,
      sector_id: null,
      operator_institution_id: null
    }
  });

  // Filters
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
    loadSectors();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ limit: 500 });
      if (response.success) {
        setUsers(response.data.users || []);
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
      console.log('🔄 Loading institutions...');
      
      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const response = await fetch(`${API_URL}/api/institutions?limit=1000`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('wasteAccessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📦 API Response:', data);
  
      if (data.success) {
        const institutionsArray = data.data?.institutions || [];
        console.log('✅ Institutions loaded:', institutionsArray.length);
        setInstitutions(institutionsArray);
      } else {
        console.error('❌ Failed to load institutions:', data.message);
        setInstitutions([]);
      }
    } catch (err) {
      console.error('💥 Error loading institutions:', err);
      setInstitutions([]);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const loadSectors = async () => {
    try {
      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const response = await fetch(`${API_URL}/api/sectors`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('wasteAccessToken')}` }
      });
      const data = await response.json();
      if (data.success) {
        setSectors(data.data || []);
      }
    } catch (err) {
      console.error("Error loading sectors:", err);
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
      phone: '',
      position: '',
      department: '',
      role: 'EDITOR_INSTITUTION',
      isActive: true,
      institutionId: null,
      permissions: {
        can_edit_data: false,
        access_type: null,
        sector_id: null,
        operator_institution_id: null
      }
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
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      role: user.role,
      isActive: user.is_active,
      institutionId: user.institution?.id || null,
      permissions: user.permissions || {
        can_edit_data: false,
        access_type: null,
        sector_id: null,
        operator_institution_id: null
      }
    });
    setFormError('');
    setShowSidebar(true);
  };

  // ⚠️ ATENȚIE: Înlocuiește handleSubmit din Users.jsx cu această versiune ⚠️

const handleSubmit = async (data) => {
  setFormError('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 HANDLESUBMIT CALLED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Mode:', sidebarMode);
  console.log('Data received:', JSON.stringify(data, null, 2));
  
  // Validare instituție
  if (!data.institutionId) {
    setFormError('Vă rugăm să selectați o instituție!');
    console.error('❌ No institution selected!');
    return;
  }

  try {
    let response;
    
    if (sidebarMode === 'create') {
      // ========== CREATE USER ==========
      const payload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        position: data.position || null,
        department: data.department || null,
        role: data.role,
        isActive: data.isActive,
        institutionIds: [data.institutionId]
      };

      console.log('🚀 CREATE USER PAYLOAD:', JSON.stringify(payload, null, 2));
      response = await userService.createUser(payload);
      console.log('✅ CREATE RESPONSE:', JSON.stringify(response, null, 2));
      
    } else if (sidebarMode === 'edit') {
      // ========== UPDATE USER ==========
      
      // ⚠️ IMPORTANT: Backend așteaptă exact aceste câmpuri
      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive,
        institutionIds: [data.institutionId]  // Array cu un singur ID
      };
      
      // Adaugă câmpurile opționale DOAR dacă există
      if (data.phone && data.phone.trim()) {
        payload.phone = data.phone;
      }
      if (data.position && data.position.trim()) {
        payload.position = data.position;
      }
      if (data.department && data.department.trim()) {
        payload.department = data.department;
      }

      // Include password DOAR dacă a fost schimbată
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✏️ UPDATE USER');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('User ID:', selectedUser.id);
      console.log('User ID type:', typeof selectedUser.id);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Payload keys:', Object.keys(payload));
      console.log('InstitutionIds value:', payload.institutionIds);
      console.log('InstitutionIds type:', typeof payload.institutionIds[0]);
      
      // Trimite request
      console.log('📡 Sending PUT request to:', `/api/users/${selectedUser.id}`);
      
      try {
        response = await userService.updateUser(selectedUser.id, payload);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 UPDATE RESPONSE RECEIVED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Response:', JSON.stringify(response, null, 2));
        console.log('Success:', response?.success);
        console.log('Message:', response?.message);
        
      } catch (updateError) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('❌ UPDATE ERROR CAUGHT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error object:', updateError);
        console.error('Error message:', updateError.message);
        console.error('Error stack:', updateError.stack);
        throw updateError;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 FINAL RESPONSE CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Response exists:', !!response);
    console.log('Response.success:', response?.success);

    if (response && response.success) {
      console.log('✅ SUCCESS! Closing sidebar and reloading users...');
      setShowSidebar(false);
      loadUsers();
    } else {
      const errorMsg = response?.message || 'Eroare la salvarea utilizatorului.';
      console.error('❌ OPERATION FAILED:', errorMsg);
      setFormError(errorMsg);
    }
  } catch (err) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💥 CATCH BLOCK - UNEXPECTED ERROR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
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
      if (filters.search) {
        const searchable = `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`.toLowerCase();
        if (!searchable.includes(filters.search.toLowerCase())) return false;
      }
      if (filters.role && user.role !== filters.role) return false;
      if (filters.institutionId && user.institution?.id !== parseInt(filters.institutionId)) return false;
      if (filters.status === 'active' && !user.is_active) return false;
      if (filters.status === 'inactive' && user.is_active) return false;
      return true;
    });
  }, [users, filters]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // ========== ROLE LABELS ==========
  const roleLabels = {
    PLATFORM_ADMIN: { label: "Admin Platformă", color: "red" },
    ADMIN_INSTITUTION: { label: "Admin Instituție", color: "blue" },
    EDITOR_INSTITUTION: { label: "Editor Instituție", color: "emerald" },
    REGULATOR_VIEWER: { label: "Regulator", color: "purple" }
  };

  const getRoleBadge = (role) => {
    const r = roleLabels[role] || roleLabels.EDITOR_INSTITUTION;
    const colors = {
      red: "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20",
      blue: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20",
      emerald: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      purple: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20"
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold border ${colors[r.color]}`}>
        <Shield className="w-3 h-3" />
        {r.label}
      </span>
    );
  };

  // ========== ACCESS LABEL ==========
  const getAccessLabel = (user) => {
    if (user.role === 'PLATFORM_ADMIN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          🌍 Total
        </span>
      );
    }
    
    if (user.role === 'ADMIN_INSTITUTION') {
      if (user.institution?.type === 'MUNICIPALITY' && user.institution?.name?.includes('PMB')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            🏙️ Toate sectoarele
          </span>
        );
      }
      if (user.sectors && user.sectors.length > 0) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            🏙️ Sector {user.sectors.map(s => s.sector_number).join(', ')}
          </span>
        );
      }
    }
  
    if (user.role === 'EDITOR_INSTITUTION') {
      const canEdit = user.permissions?.can_edit_data;
      if (user.sectors && user.sectors.length > 0) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {canEdit ? '📝' : '👁️'} Sector {user.sectors.map(s => s.sector_number).join(', ')}
          </span>
        );
      }
    }
  
    if (user.role === 'REGULATOR_VIEWER') {
      const perm = user.permissions;
      
      if (perm?.access_type === 'ALL') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            👁️ Toate datele
          </span>
        );
      }
      if (perm?.access_type === 'SECTOR' && perm.sector_id) {
        const sector = sectors.find(s => s.id === perm.sector_id);
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            👁️ Sector {sector?.sector_number || '?'}
          </span>
        );
      }
      if (perm?.access_type === 'OPERATOR' && perm.operator_institution_id) {
        const operator = institutions.find(i => i.id === perm.operator_institution_id);
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            👁️ {operator?.short_name || operator?.name || 'Operator'}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          👁️ View only
        </span>
      );
    }
  
    return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;
  };

  const hasActiveFilters = filters.search || filters.role || filters.institutionId || filters.status;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <DashboardHeader title="Gestionare Utilizatori" />

      {/* Filters + Actions */}
      <div className="px-6 py-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută utilizator..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">Toate rolurile</option>
            <option value="PLATFORM_ADMIN">Admin Platformă</option>
            <option value="ADMIN_INSTITUTION">Admin Instituție</option>
            <option value="EDITOR_INSTITUTION">Editor Instituție</option>
            <option value="REGULATOR_VIEWER">Regulator</option>
          </select>

          {/* Institution Filter */}
          <select
            value={filters.institutionId}
            onChange={(e) => setFilters({ ...filters, institutionId: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
            disabled={loadingInstitutions}
          >
            <option value="">Toate instituțiile</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="">Toate statusurile</option>
            <option value="active">Activ</option>
            <option value="inactive">Inactiv</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-[14px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Resetează
            </button>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateUser}
            className="ml-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-[14px] transition-all active:scale-98 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
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

      {/* Table */}
      <div className="px-6">
        <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Se încarcă...</p>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {hasActiveFilters ? 'Niciun utilizator găsit' : 'Nu există utilizatori'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm">
                  Resetează filtrele
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Utilizator</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Instituție</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Acces Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => handleViewUser(user)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.institution ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                              {user.institution.short_name || user.institution.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getAccessLabel(user)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-bold ${user.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
                          {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {user.is_active ? 'Activ' : 'Inactiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditUser(user); }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-[10px] transition-colors" title="Editează">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(user); }} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-[10px] transition-colors" title="Șterge">
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-gray-200 dark:border-gray-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-gray-200 dark:border-gray-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <UserSidebar
          mode={sidebarMode}
          user={selectedUser}
          formData={formData}
          institutions={institutions}
          sectors={sectors}
          onClose={() => setShowSidebar(false)}
          onSubmit={handleSubmit}
          onFormChange={setFormData}
          formError={formError}
        />
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-[20px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmare Ștergere</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sigur vrei să ștergi utilizatorul <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-[14px] transition-all">
                Șterge
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-[14px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
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