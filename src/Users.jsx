// src/Users.jsx
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "./userService";
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
} from "lucide-react";

const Users = () => {
  const { user: currentUser } = useAuth();

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

  // dacă se schimbă lista sau căutarea, resetăm pagina
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
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        response = await userService.updateUser(editingUser.id, updateData);
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
      console.error("Submit error:", err);
      setFormError("Eroare de conexiune.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        setDeleteConfirm(null);
        loadUsers();
      } else {
        console.error("Delete failed:", response.message);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERED LIST + PAGINATION
  // ---------------------------------------------------------------------------
  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(q) ||
      user.first_name.toLowerCase().includes(q) ||
      user.last_name.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize || 1)
  );
  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  // label-urile în română, valorile rămân neschimbate
  const roleLabels = {
    PLATFORM_ADMIN: "Administrator platformă",
    INSTITUTION_ADMIN: "Administrator instituție",
    INSTITUTION_EDITOR: "Editor instituție",
    REGULATOR_VIEWER: "Vizualizare regulator",
  };

  const roleColors = {
    PLATFORM_ADMIN:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    INSTITUTION_ADMIN:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    INSTITUTION_EDITOR:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    REGULATOR_VIEWER:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };

  const currentUserRoleLabel =
    currentUser?.role && roleLabels[currentUser.role]
      ? roleLabels[currentUser.role]
      : currentUser?.role;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* BREADCRUMB + ROL CURENT */}
        <div className="flex flex-col gap-2">
          <nav className="text-xs text-gray-500 dark:text-gray-400">
            <span className="hover:text-gray-700 dark:hover:text-gray-200 cursor-default">
              Setări
            </span>
            <span className="mx-1">/</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Utilizatori
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Administrare utilizatori
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {users.length} utilizatori înregistrați în platformă
              </p>
            </div>

            {currentUser && (
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Rolul tău:
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {currentUserRoleLabel || "Utilizator"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Header card: search + buton */}
          <div className="px-6 pt-5 pb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-800">
            <div className="w-full md:max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Caută după nume sau e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f1419] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 shadow-sm transition-colors self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Adaugă utilizator
            </button>
          </div>

          {/* LISTĂ UTILIZATORI */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Se încarcă utilizatorii...
              </p>
            </div>
          ) : (
            <>
              {/* Header „tabel” */}
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_80px] px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-[#0f1419] border-b border-gray-200 dark:border-gray-800">
                <span>Utilizator</span>
                <span>Rol</span>
                <span>Status</span>
                <span className="text-right">Acțiuni</span>
              </div>

              {/* Rows */}
              <div>
                {paginatedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_80px] items-center px-6 py-4 text-sm border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#101623] transition-colors"
                  >
                    {/* Utilizator */}
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </span>
                    </div>

                    {/* Rol */}
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          roleColors[user.role] ||
                          "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            user.is_active ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {user.is_active ? "Activ" : "Inactiv"}
                      </span>
                    </div>

                    {/* Acțiuni */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Editează utilizator"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        disabled={user.id === currentUser?.id}
                        className={`p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors ${
                          user.id === currentUser?.id
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        title="Șterge utilizator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && !loading && (
                  <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nu a fost găsit niciun utilizator.
                  </div>
                )}
              </div>

              {/* FOOTER: paginație */}
              {filteredUsers.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Afișezi{" "}
                    <span className="font-medium">
                      {startIndex + 1}-
                      {Math.min(startIndex + pageSize, filteredUsers.length)}
                    </span>{" "}
                    din{" "}
                    <span className="font-medium">
                      {filteredUsers.length}
                    </span>{" "}
                    utilizatori
                  </span>

                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Anterior
                    </button>
                    <span className="text-xs">
                      Pagina{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {page}
                      </span>{" "}
                      din{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {totalPages}
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium"
                    >
                      Următor
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingUser ? "Editează utilizator" : "Adaugă utilizator"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="user@example.com"
                  />
                </div>

                {/* Parolă */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parolă {editingUser && "(opțional)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={
                        editingUser ? "Lasă gol pentru a nu schimba" : "••••••••"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Prenume / Nume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prenume
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ion"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nume
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Popescu"
                    />
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PLATFORM_ADMIN">
                      Administrator platformă
                    </option>
                    <option value="INSTITUTION_ADMIN">
                      Administrator instituție
                    </option>
                    <option value="INSTITUTION_EDITOR">
                      Editor instituție
                    </option>
                    <option value="REGULATOR_VIEWER">
                      Vizualizare regulator
                    </option>
                  </select>
                </div>

                {/* Activ */}
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-700 rounded focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Activ
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {editingUser ? "Salvează" : "Creează"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Confirmare ștergere
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Sigur vrei să ștergi utilizatorul{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {deleteConfirm.first_name} {deleteConfirm.last_name}
                </span>
                ? Această acțiune nu poate fi anulată.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
