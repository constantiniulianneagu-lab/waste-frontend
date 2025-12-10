// src/Users.jsx
/**
 * ============================================================================
 * USERS COMPONENT - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * Modern glassmorphism design with perfect light/dark mode
 * 
 * ✅ DashboardHeader uniform (title="Gestionare Utilizatori")
 * ✅ Samsung One UI 7.0 rounded corners (24-28px)
 * ✅ Apple iOS 18 glassmorphism effects
 * ✅ Premium gradients and micro-interactions
 * ✅ Perfect light/dark mode adaptive colors
 * ✅ Smooth animations (300ms)
 * ✅ All functionality preserved
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "./userService";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();
  const [notificationCount] = useState(3);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "INSTITUTION_EDITOR",
    isActive: true,
  });

  // paginație UI
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ---------------------------------------------------------------------------
  // LOAD USERS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ limit: 200 });
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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, users.length]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "INSTITUTION_EDITOR",
      isActive: true,
    });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
    });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      let response;
      if (editingUser) {
        response = await userService.updateUser(editingUser.id, formData);
      } else {
        response = await userService.createUser(formData);
      }

      if (response.success) {
        setShowModal(false);
        loadUsers();
      } else {
        setFormError(response.message || "Eroare la salvarea utilizatorului.");
      }
    } catch (err) {
      setFormError(err.message || "Eroare la salvarea utilizatorului.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        setDeleteConfirm(null);
        loadUsers();
      } else {
        alert(response.message || "Eroare la ștergere.");
      }
    } catch (err) {
      alert(err.message || "Eroare la ștergere.");
    }
  };

  // ---------------------------------------------------------------------------
  // FILTRARE + PAGINAȚIE
  // ---------------------------------------------------------------------------
  const filteredUsers = users.filter((u) => {
    const full = `${u.first_name || ""} ${u.last_name || ""} ${u.email || ""}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // ---------------------------------------------------------------------------
  // ROLE MAPPING
  // ---------------------------------------------------------------------------
  const roleMap = {
    SUPER_ADMIN: { label: "Super Admin", gradient: "from-red-500 to-rose-600", bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", border: "border-red-500/20 dark:border-red-500/30" },
    INSTITUTION_ADMIN: { label: "Admin Instituție", gradient: "from-blue-500 to-blue-600", bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20 dark:border-blue-500/30" },
    INSTITUTION_EDITOR: { label: "Editor Instituție", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20 dark:border-emerald-500/30" },
    INSTITUTION_VIEWER: { label: "Vizualizator", gradient: "from-gray-500 to-gray-600", bg: "bg-gray-500/10 dark:bg-gray-500/20", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/20 dark:border-gray-500/30" },
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

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER UNIFORM */}
      <DashboardHeader 
        notificationCount={notificationCount}
        onSearchChange={(query) => setSearchTerm(query)}
        title="Gestionare Utilizatori"
      />

      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-[1920px] mx-auto">

          {/* Stats Cards - Modern Samsung style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Total Users Card */}
            <div className="group relative">
              <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                            rounded-[24px] border border-gray-200 dark:border-gray-700/50 
                            p-6 shadow-sm dark:shadow-none
                            hover:-translate-y-1 hover:shadow-lg
                            transition-all duration-300 overflow-hidden">
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 
                              opacity-[0.02] dark:opacity-[0.04]
                              group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                              transition-opacity duration-500" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Total Utilizatori
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 
                                bg-clip-text text-transparent">
                      {users.length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-blue-500 to-blue-600 
                                flex items-center justify-center shadow-lg
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UsersIcon className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Pulse indicator */}
                <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full 
                              bg-gradient-to-br from-blue-500 to-blue-600
                              opacity-40 dark:opacity-60 animate-pulse" />
              </div>
            </div>

            {/* Active Users Card */}
            <div className="group relative">
              <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                            rounded-[24px] border border-gray-200 dark:border-gray-700/50 
                            p-6 shadow-sm dark:shadow-none
                            hover:-translate-y-1 hover:shadow-lg
                            transition-all duration-300 overflow-hidden">
                
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 
                              opacity-[0.02] dark:opacity-[0.04]
                              group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                              transition-opacity duration-500" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Activi
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 
                                bg-clip-text text-transparent">
                      {users.filter((u) => u.is_active).length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-emerald-500 to-teal-600 
                                flex items-center justify-center shadow-lg
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full 
                              bg-gradient-to-br from-emerald-500 to-teal-600
                              opacity-40 dark:opacity-60 animate-pulse" />
              </div>
            </div>

            {/* Inactive Users Card */}
            <div className="group relative">
              <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                            rounded-[24px] border border-gray-200 dark:border-gray-700/50 
                            p-6 shadow-sm dark:shadow-none
                            hover:-translate-y-1 hover:shadow-lg
                            transition-all duration-300 overflow-hidden">
                
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 
                              opacity-[0.02] dark:opacity-[0.04]
                              group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                              transition-opacity duration-500" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Inactivi
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-500 to-gray-600 
                                bg-clip-text text-transparent">
                      {users.filter((u) => !u.is_active).length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-gray-500 to-gray-600 
                                flex items-center justify-center shadow-lg
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <UserX className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full 
                              bg-gradient-to-br from-gray-500 to-gray-600
                              opacity-40 dark:opacity-60 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Card - Modern Samsung style */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                        rounded-[28px] border border-gray-200 dark:border-gray-700/50 
                        shadow-sm dark:shadow-none overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] 
                                bg-emerald-500/10 dark:bg-emerald-500/20 
                                flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Lista Utilizatori
                </h2>

                <div className="flex items-center gap-3">
                  {/* Search - Hidden on mobile (uses header search) */}
                  <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Caută utilizatori..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 
                               border border-gray-200 dark:border-gray-700 
                               rounded-[14px] text-sm 
                               bg-gray-50 dark:bg-gray-900/50 
                               text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                               transition-all duration-300"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 
                             bg-gradient-to-r from-emerald-600 to-teal-600 
                             hover:from-emerald-700 hover:to-teal-700 
                             text-white text-sm font-bold rounded-[14px] 
                             transition-all duration-300
                             active:scale-95
                             shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă Utilizator
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Nume
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700/30">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Se încarcă...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-[16px] 
                                        bg-gray-100 dark:bg-gray-800 
                                        flex items-center justify-center">
                            <UsersIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {searchTerm ? "Niciun rezultat găsit." : "Nu există utilizatori."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className="group hover:bg-gray-50 dark:hover:bg-gray-900/30 
                                 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-[12px] 
                                            bg-gradient-to-br from-emerald-500 to-teal-600 
                                            flex items-center justify-center 
                                            text-white font-bold text-sm
                                            shadow-lg
                                            group-hover:scale-105 group-hover:rotate-3
                                            transition-all duration-300">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </div>
                              {user.is_active && (
                                <div className="absolute -bottom-0.5 -right-0.5">
                                  <div className="relative">
                                    <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full 
                                                  border-2 border-white dark:border-gray-800" />
                                    <div className="absolute inset-0 w-3.5 h-3.5 bg-emerald-400 
                                                  rounded-full animate-ping opacity-40" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-xs font-bold border ${
                            user.is_active
                              ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30"
                              : "bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20 dark:border-gray-500/30"
                          }`}>
                            {user.is_active ? (
                              <>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Activ
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                Inactiv
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2.5 text-blue-600 dark:text-blue-400 
                                       hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                       rounded-[10px] transition-all duration-300
                                       active:scale-95"
                              title="Editează"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              className="p-2.5 text-red-600 dark:text-red-400 
                                       hover:bg-red-50 dark:hover:bg-red-900/20 
                                       rounded-[10px] transition-all duration-300
                                       active:scale-95"
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/50 
                            flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pagina {page} din {totalPages} ({filteredUsers.length} utilizatori)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2.5 border border-gray-200 dark:border-gray-700 
                             rounded-[10px] 
                             hover:bg-gray-50 dark:hover:bg-gray-800 
                             disabled:opacity-50 disabled:cursor-not-allowed 
                             transition-all duration-300
                             active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2.5 border border-gray-200 dark:border-gray-700 
                             rounded-[10px] 
                             hover:bg-gray-50 dark:hover:bg-gray-800 
                             disabled:opacity-50 disabled:cursor-not-allowed 
                             transition-all duration-300
                             active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ADD/EDIT - Modern glassmorphism */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 
                     transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-2xl 
                          w-full max-w-md animate-scale-in
                          border border-gray-200 dark:border-gray-700">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingUser ? "Editează Utilizator" : "Adaugă Utilizator"}
                </h3>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 
                                border border-red-200 dark:border-red-800/30 
                                rounded-[14px]">
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {formError}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                    uppercase tracking-wider mb-2">
                      Prenume
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 
                               border border-gray-200 dark:border-gray-700 
                               rounded-[14px] 
                               bg-gray-50 dark:bg-gray-900/50 
                               text-gray-900 dark:text-white text-sm
                               focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                               transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                    uppercase tracking-wider mb-2">
                      Nume
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 
                               border border-gray-200 dark:border-gray-700 
                               rounded-[14px] 
                               bg-gray-50 dark:bg-gray-900/50 
                               text-gray-900 dark:text-white text-sm
                               focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                               transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                  uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 
                             border border-gray-200 dark:border-gray-700 
                             rounded-[14px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white text-sm
                             focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                             transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                  uppercase tracking-wider mb-2">
                    Parolă {editingUser && "(lasă gol pentru a păstra)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 pr-12
                               border border-gray-200 dark:border-gray-700 
                               rounded-[14px] 
                               bg-gray-50 dark:bg-gray-900/50 
                               text-gray-900 dark:text-white text-sm
                               focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                               transition-all duration-300"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 
                               p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                               transition-colors rounded-[10px]
                               hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                                  uppercase tracking-wider mb-2">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 
                             border border-gray-200 dark:border-gray-700 
                             rounded-[14px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white text-sm
                             focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                             transition-all duration-300"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="INSTITUTION_ADMIN">Admin Instituție</option>
                    <option value="INSTITUTION_EDITOR">Editor Instituție</option>
                    <option value="INSTITUTION_VIEWER">Vizualizator</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/30 
                              rounded-[14px] border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 
                             rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Cont activ
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 
                             bg-gradient-to-r from-emerald-600 to-teal-600 
                             hover:from-emerald-700 hover:to-teal-700 
                             text-white font-bold rounded-[14px] 
                             transition-all duration-300
                             active:scale-98
                             shadow-lg shadow-emerald-500/20"
                  >
                    {editingUser ? "Salvează" : "Creează"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 
                             bg-gray-100 dark:bg-gray-700 
                             text-gray-700 dark:text-gray-300 
                             font-bold rounded-[14px] 
                             hover:bg-gray-200 dark:hover:bg-gray-600 
                             transition-all duration-300
                             active:scale-98"
                  >
                    Anulează
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRM - Modern glassmorphism */}
      {deleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 
                     transition-opacity duration-300"
            onClick={() => setDeleteConfirm(null)}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-[24px] shadow-2xl 
                          w-full max-w-md p-6 animate-scale-in
                          border border-gray-200 dark:border-gray-700">
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Confirmare Ștergere
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Ești sigur că vrei să ștergi acest utilizator? Această acțiune este ireversibilă.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-5 py-3 
                           bg-gradient-to-r from-red-600 to-red-700 
                           hover:from-red-700 hover:to-red-800 
                           text-white font-bold rounded-[14px] 
                           transition-all duration-300
                           active:scale-98
                           shadow-lg shadow-red-500/20"
                >
                  Șterge
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 
                           bg-gray-100 dark:bg-gray-700 
                           text-gray-700 dark:text-gray-300 
                           font-bold rounded-[14px] 
                           hover:bg-gray-200 dark:hover:bg-gray-600 
                           transition-all duration-300
                           active:scale-98"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;