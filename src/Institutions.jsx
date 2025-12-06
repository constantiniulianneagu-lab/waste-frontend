// src/Institutions.jsx
/**
 * ============================================================================
 * INSTITUTIONS COMPONENT - CU DASHBOARD HEADER UNIFORM
 * ============================================================================
 * 
 * ✅ DashboardHeader uniform (title="Gestionare Instituții")
 * ✅ Design modern cu gradient buttons
 * ✅ Cards cu shadow și hover effects
 * ✅ Dark mode complet
 * ✅ Toată logica funcțională păstrată
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { institutionService } from "./institutionService";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import { Building2, Plus, Edit2, Trash2, Search, X } from "lucide-react";

const Institutions = () => {
  const [notificationCount] = useState(3);

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "MUNICIPALITY",
    sector: "1",
    contactEmail: "",
    isActive: true,
  });

  // ---------------------------------------------------------------------------
  // LOAD
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const response = await institutionService.getAllInstitutions({ limit: 200 });
      if (response.success) {
        setInstitutions(response.data.institutions || []);
      } else {
        console.error("Failed to load institutions:", response.message);
      }
    } catch (err) {
      console.error("Error loading institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  const handleAdd = () => {
    setEditingInstitution(null);
    setFormData({
      name: "",
      type: "MUNICIPALITY",
      sector: "1",
      contactEmail: "",
      isActive: true,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleEdit = (inst) => {
    setEditingInstitution(inst);
    setFormData({
      name: inst.name,
      type: inst.type,
      sector: inst.sector,
      contactEmail: inst.contact_email,
      isActive: inst.is_active,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      let response;
      if (editingInstitution) {
        response = await institutionService.updateInstitution(editingInstitution.id, formData);
      } else {
        response = await institutionService.createInstitution(formData);
      }

      if (response.success) {
        setShowModal(false);
        loadInstitutions();
      } else {
        setFormError(response.message || "Eroare la salvarea instituției.");
      }
    } catch (err) {
      setFormError(err.message || "Eroare la salvarea instituției.");
    }
  };

  const handleDelete = async (instId) => {
    try {
      const response = await institutionService.deleteInstitution(instId);
      if (response.success) {
        setDeleteConfirm(null);
        loadInstitutions();
      } else {
        alert(response.message || "Eroare la ștergere.");
      }
    } catch (err) {
      alert(err.message || "Eroare la ștergere.");
    }
  };

  // ---------------------------------------------------------------------------
  // FILTRARE
  // ---------------------------------------------------------------------------
  const filteredInstitutions = institutions.filter((inst) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      inst.name.toLowerCase().includes(lowerSearch) ||
      inst.type.toLowerCase().includes(lowerSearch) ||
      (inst.contact_email && inst.contact_email.toLowerCase().includes(lowerSearch))
    );
  });

  // ---------------------------------------------------------------------------
  // TYPE MAPPING
  // ---------------------------------------------------------------------------
  const typeMap = {
    MUNICIPALITY: { label: "Municipiu", color: "blue" },
    OPERATOR: { label: "Operator", color: "emerald" },
    WASTE_COLLECTOR: { label: "Colector", color: "purple" },
    TMB_FACILITY: { label: "Stație TMB", color: "cyan" },
    LANDFILL: { label: "Depozit", color: "red" },
    RECYCLER: { label: "Reciclator", color: "green" },
    RECOVERY_FACILITY: { label: "Valorificare", color: "orange" },
    OTHER: { label: "Altele", color: "gray" },
  };

  const getTypeBadge = (type) => {
    const t = typeMap[type] || { label: type, color: "gray" };
    return (
      <span
        className={`px-3 py-1 rounded-lg text-xs font-semibold
          ${t.color === "blue" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : ""}
          ${t.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : ""}
          ${t.color === "purple" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : ""}
          ${t.color === "cyan" ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300" : ""}
          ${t.color === "red" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : ""}
          ${t.color === "green" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : ""}
          ${t.color === "orange" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" : ""}
          ${t.color === "gray" ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : ""}
        `}
      >
        {t.label}
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
        title="Gestionare Instituții"
      />

      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-[1920px] mx-auto">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Instituții</p>
                  <p className="text-3xl font-bold">{institutions.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Active</p>
                  <p className="text-3xl font-bold">{institutions.filter((i) => i.is_active).length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Operatori</p>
                  <p className="text-3xl font-bold">{institutions.filter((i) => i.type === "OPERATOR").length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium mb-1">Stații TMB</p>
                  <p className="text-3xl font-bold">{institutions.filter((i) => i.type === "TMB_FACILITY").length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  Lista Instituții
                </h2>

                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Caută instituții..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă Instituție
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Nume</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Tip</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Sector</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        Se încarcă...
                      </td>
                    </tr>
                  ) : filteredInstitutions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? "Niciun rezultat găsit." : "Nu există instituții."}
                      </td>
                    </tr>
                  ) : (
                    filteredInstitutions.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{inst.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getTypeBadge(inst.type)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {inst.sector ? `Sector ${inst.sector}` : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {inst.contact_email || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            inst.is_active
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}>
                            {inst.is_active ? "Activă" : "Inactivă"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(inst)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editează"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(inst.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
          </div>
        </div>
      </div>

      {/* MODAL ADD/EDIT - PĂSTRAT IDENTIC */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingInstitution ? "Editează Instituție" : "Adaugă Instituție"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nume</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tip</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="MUNICIPALITY">Municipiu</option>
                  <option value="OPERATOR">Operator</option>
                  <option value="WASTE_COLLECTOR">Colector</option>
                  <option value="TMB_FACILITY">Stație TMB</option>
                  <option value="LANDFILL">Depozit</option>
                  <option value="RECYCLER">Reciclator</option>
                  <option value="RECOVERY_FACILITY">Valorificare</option>
                  <option value="OTHER">Altele</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Instituție activă
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all"
                >
                  {editingInstitution ? "Salvează" : "Creează"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM - PĂSTRAT IDENTIC */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirmare Ștergere</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Ești sigur că vrei să ștergi această instituție?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all"
              >
                Șterge
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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

export default Institutions;