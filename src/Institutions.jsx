// src/Institutions.jsx
import { useState, useEffect } from "react";
import { institutionService } from "./institutionService";
import { Building2, Plus, Edit2, Trash2, Search, X } from "lucide-react";

const Institutions = () => {
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
      const response = await institutionService.getAllInstitutions({
        limit: 200,
      });
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
        response = await institutionService.updateInstitution(
          editingInstitution.id,
          formData
        );
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
      console.error("Institution submit error:", err);
      setFormError("Eroare de conexiune.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await institutionService.deleteInstitution(id);
      if (response.success) {
        setDeleteConfirm(null);
        loadInstitutions();
      } else {
        console.error("Delete institution failed:", response.message);
      }
    } catch (err) {
      console.error("Error deleting institution:", err);
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERED
  // ---------------------------------------------------------------------------
  const filteredInstitutions = institutions.filter((inst) => {
    const q = searchTerm.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      (inst.contact_email || "").toLowerCase().includes(q)
    );
  });

  const typeLabels = {
    MUNICIPALITY: "Municipality",
    GOVERNMENT: "Government",
    WASTE_OPERATOR: "Waste Operator",
    TMB_OPERATOR: "TMB Operator",
    RECYCLING_CLIENT: "Recycling Client",
    RECOVERY_CLIENT: "Recovery Client",
    DISPOSAL_CLIENT: "Disposal Client",
  };

  const typeColors = {
    MUNICIPALITY:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    GOVERNMENT:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    WASTE_OPERATOR:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    TMB_OPERATOR:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    RECYCLING_CLIENT:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    RECOVERY_CLIENT:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    DISPOSAL_CLIENT:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Institution Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {institutions.length} instituții înregistrate
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adaugă instituție
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Caută după nume sau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1a1f2e] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Se încarcă instituțiile...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a1f2e] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#0f1419] border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Instituție
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Sector
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
                {filteredInstitutions.map((inst) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#0f1419] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {inst.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {inst.contact_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          typeColors[inst.type] ||
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {typeLabels[inst.type] || inst.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {inst.sector ? `Sector ${inst.sector}` : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inst.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {inst.is_active ? "Activă" : "Inactivă"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(inst)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(inst)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInstitutions.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Nu a fost găsită nicio instituție.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#1a1f2e] rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingInstitution
                    ? "Editează instituție"
                    : "Adaugă instituție"}
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
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nume instituție
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Primăria Sector 1"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tip
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="MUNICIPALITY">Municipality</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="WASTE_OPERATOR">Waste Operator</option>
                    <option value="TMB_OPERATOR">TMB Operator</option>
                    <option value="RECYCLING_CLIENT">Recycling Client</option>
                    <option value="RECOVERY_CLIENT">Recovery Client</option>
                    <option value="DISPOSAL_CLIENT">Disposal Client</option>
                  </select>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sector
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1">Sector 1</option>
                    <option value="2">Sector 2</option>
                    <option value="3">Sector 3</option>
                    <option value="4">Sector 4</option>
                    <option value="5">Sector 5</option>
                    <option value="6">Sector 6</option>
                    <option value="București">N/A</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f1419] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="contact@primarie.ro"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center gap-2">
                  <input
                    id="isActiveInstitution"
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
                    htmlFor="isActiveInstitution"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Activă
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
                    {editingInstitution ? "Salvează" : "Creează"}
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
                Sigur vrei să ștergi instituția{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {deleteConfirm.name}
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

export default Institutions;
