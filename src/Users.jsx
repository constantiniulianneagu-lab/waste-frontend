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
  // FILTERED LIST
  // ---------------------------------------------------------------------------
  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(q) ||
      user.first_name.toLowerCase().includes(q) ||
      user.last_name.toLowerCase().includes(q)
    );
  });

  const roleLabels = {
    PLATFORM_ADMIN: "Platform Admin",
    INSTITUTION_ADMIN: "Institution Admin",
    INSTITUTION_EDITOR: "Institution Editor",
    REGULATOR_VIEWER: "Regulator Viewer",
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

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020817] transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/10 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Administrare utilizatori
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {users.length} utilizatori înregistrați
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adaugă utilizator
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Caută după email sau nume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-[#020617] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Se încarcă utilizatorii...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#020617] rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#020817] border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Utilizator
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#020817] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roleColors[user.role] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {user.is_active ? "Activ" : "Inactiv"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          disabled={user.id === currentUser?.id}
                          className={`p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${
                            user.id === currentUser?.id
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Nu a fost găsit niciun utilizator.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ADD / EDIT SIDEBAR DRAWER */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex">
            {/* overlay */}
            <div
              className="flex-1 bg-black/60"
              onClick={() => setShowModal(false)}
            />

            {/* panel dreapta */}
            <div className="w-full max-w-xl bg-white dark:bg-[#020617] border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col animate-[slideIn_0.2s_ease-out]">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {editingUser
                      ? "Editează utilizator"
                      : "Adaugă utilizator nou"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Completează toate câmpurile obligatorii
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content scrollable */}
              <div className="px-6 py-4 flex-1 overflow-y-auto">
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-[#020817] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parolă {editingUser && "(opțional)"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-[#020817] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder={
                          editingUser
                            ? "Lasă gol pentru a nu schimba"
                            : "••••••••"
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

                  {/* First / Last name */}
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-[#020817] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-[#020817] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Popescu"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rol
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-800 rounded-lg bg-white dark:bg-[#020817] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PLATFORM_ADMIN">Platform Admin</option>
                      <option value="INSTITUTION_ADMIN">
                        Institution Admin
                      </option>
                      <option value="INSTITUTION_EDITOR">
                        Institution Editor
                      </option>
                      <option value="REGULATOR_VIEWER">
                        Regulator Viewer
                      </option>
                    </select>
                  </div>

                  {/* Active */}
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
                </form>
              </div>

              {/* Footer buttons */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingUser ? "Salvează" : "Creează"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM (rămâne modal central) */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#020617] rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
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
