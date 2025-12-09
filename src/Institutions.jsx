// src/Institutions.jsx
/**
 * ============================================================================
 * INSTITUTIONS MANAGEMENT - COMPLETE WITH ALL CONTRACT TYPES
 * ============================================================================
 */

import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  MapPin,
  Globe,
  FileText,
  Building,
  TrendingUp,
  Activity,
  Eye,
  Download,
  Upload,
  Trash,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import { apiGet, apiPost, apiPut, apiDelete } from "./api/apiClient";
import WasteOperatorContractModal from "./WasteOperatorContractModal";
import SortingContractModal from "./SortingContractModal";
import DisposalContractModal from "./DisposalContractModal";

const Institutions = () => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {},
  });

  // Expand rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Contracts for institutions
  const [institutionContracts, setInstitutionContracts] = useState({});
  const [loadingContracts, setLoadingContracts] = useState({});

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    short_name: "",
    type: "",
    sector: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    website: "",
    fiscal_code: "",
    registration_no: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Contract modals state
  const [wasteContractModalOpen, setWasteContractModalOpen] = useState(false);
  const [sortingContractModalOpen, setSortingContractModalOpen] =
    useState(false);
  const [disposalContractModalOpen, setDisposalContractModalOpen] =
    useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] =
    useState(null);
  const [currentInstitutionId, setCurrentInstitutionId] = useState(null);

  // ========================================================================
  // LOAD DATA FROM BACKEND
  // ========================================================================

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const response = await apiGet("/api/institutions", { limit: 1000 });

      if (response.success) {
        const institutionsArray = Array.isArray(response.data?.institutions)
          ? response.data.institutions
          : [];
        setInstitutions(institutionsArray);
        calculateStats(institutionsArray);
      } else {
        console.error("Failed to load institutions:", response.message);
        setInstitutions([]);
        calculateStats([]);
      }
    } catch (err) {
      console.error("Error loading institutions:", err);
      setInstitutions([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const active = data.filter((i) => i.is_active).length;
    const inactive = data.length - active;

    const byType = data.reduce((acc, inst) => {
      let normalizedType;
      switch (inst.type) {
        case "MUNICIPALITY":
          normalizedType = "MUNICIPIU";
          break;
        case "WASTE_OPERATOR":
          normalizedType = "OPERATOR";
          break;
        case "TMB_OPERATOR":
          normalizedType = "TMB";
          break;
        case "DISPOSAL_CLIENT":
          normalizedType = "DEPOZIT";
          break;
        case "RECYCLING_CLIENT":
          normalizedType = "RECICLATOR";
          break;
        case "RECOVERY_CLIENT":
          normalizedType = "VALORIFICARE";
          break;
        case "SORTING_OPERATOR":
          normalizedType = "COLECTOR";
          break;
        default:
          normalizedType = inst.type;
      }

      acc[normalizedType] = (acc[normalizedType] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total: data.length,
      active,
      inactive,
      byType,
    });
  };

  // ========================================================================
  // LOAD CONTRACTS FOR INSTITUTION
  // ========================================================================

  const loadContractsForInstitution = async (
    institutionId,
    forceReload = false
  ) => {
    if (institutionContracts[institutionId] && !forceReload) return;

    setLoadingContracts((prev) => ({ ...prev, [institutionId]: true }));

    try {
      const response = await apiGet(
        `/api/institutions/${institutionId}/contracts`
      );

      if (response.success) {
        setInstitutionContracts((prev) => ({
          ...prev,
          [institutionId]: response.data || [],
        }));
      }
    } catch (err) {
      console.error("Error loading contracts:", err);
      setInstitutionContracts((prev) => ({
        ...prev,
        [institutionId]: [],
      }));
    } finally {
      setLoadingContracts((prev) => ({
        ...prev,
        [institutionId]: false,
      }));
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeFilterClick = (type) => {
    if (activeTypeFilter === type) {
      setActiveTypeFilter(null);
    } else {
      setActiveTypeFilter(type);
    }
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      short_name: "",
      type: "",
      sector: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      website: "",
      fiscal_code: "",
      registration_no: "",
      is_active: true,
    });
    setErrors({});
    setSelectedInstitution(null);
    setSidebarMode("add");
    setSidebarOpen(true);
  };

  const handleEdit = (institution) => {
    setFormData({
      name: institution.name,
      short_name: institution.short_name || "",
      type: institution.type,
      sector: institution.sector || "",
      contact_email: institution.contact_email || "",
      contact_phone: institution.contact_phone || "",
      address: institution.address || "",
      website: institution.website || "",
      fiscal_code: institution.fiscal_code || "",
      registration_no: institution.registration_no || "",
      is_active: institution.is_active,
    });
    setErrors({});
    setSelectedInstitution(institution);
    setSidebarMode("edit");
    setSidebarOpen(true);
  };

  const handleDelete = (institution) => {
    setSelectedInstitution(institution);
    setSidebarMode("delete");
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSidebarMode(null);
    setSelectedInstitution(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Denumirea este obligatorie";
    if (!formData.type) newErrors.type = "Tipul este obligatoriu";
    if (
      formData.contact_email &&
      !/\S+@\S+\.\S+/.test(formData.contact_email)
    ) {
      newErrors.contact_email = "Email invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (sidebarMode === "add") {
        const data = await apiPost("/api/institutions", formData);
        if (data.success) {
          alert("Instituție adăugată cu succes!");
          await loadInstitutions();
          handleCloseSidebar();
        } else {
          alert(data.message || "Eroare la adăugare");
        }
      } else if (sidebarMode === "edit") {
        const data = await apiPut(
          `/api/institutions/${selectedInstitution.id}`,
          formData
        );
        if (data.success) {
          alert("Instituție actualizată cu succes!");
          await loadInstitutions();
          handleCloseSidebar();
        } else {
          alert(data.message || "Eroare la actualizare");
        }
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      const data = await apiDelete(
        `/api/institutions/${selectedInstitution.id}`
      );
      if (data.success) {
        alert("Instituție ștearsă cu succes!");
        await loadInstitutions();
        handleCloseSidebar();
      } else {
        alert(data.message || "Eroare la ștergere");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Eroare la ștergere");
    } finally {
      setSaving(false);
    }
  };

  // Auto-close expand rows: un singur rând deschis
  const toggleRowExpand = (id) => {
    if (expandedRows.has(id)) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set([id]));
      loadContractsForInstitution(id);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-500" />
    );
  };

  // ========================================================================
  // FILTERING, SORTING & PAGINATION
  // ========================================================================

  const filteredInstitutions = institutions.filter((inst) => {
    if (activeTypeFilter) {
      let normalizedType;
      switch (inst.type) {
        case "MUNICIPALITY":
          normalizedType = "MUNICIPIU";
          break;
        case "WASTE_OPERATOR":
          normalizedType = "OPERATOR";
          break;
        case "TMB_OPERATOR":
          normalizedType = "TMB";
          break;
        case "DISPOSAL_CLIENT":
          normalizedType = "DEPOZIT";
          break;
        case "RECYCLING_CLIENT":
          normalizedType = "RECICLATOR";
          break;
        case "RECOVERY_CLIENT":
          normalizedType = "VALORIFICARE";
          break;
        case "SORTING_OPERATOR":
          normalizedType = "COLECTOR";
          break;
        default:
          normalizedType = inst.type;
      }

      if (normalizedType !== activeTypeFilter) {
        return false;
      }
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inst.name.toLowerCase().includes(query) ||
      inst.short_name?.toLowerCase().includes(query) ||
      inst.type.toLowerCase().includes(query) ||
      inst.contact_email?.toLowerCase().includes(query)
    );
  });

  const sortedInstitutions = [...filteredInstitutions].sort((a, b) => {
    let aValue;
    let bValue;

    switch (sortBy) {
      case "name":
        aValue = (a.name || "").toLowerCase();
        bValue = (b.name || "").toLowerCase();
        break;
      case "type":
        aValue = (a.type || "").toLowerCase();
        bValue = (b.type || "").toLowerCase();
        break;
      case "sector":
        aValue = a.sector || "";
        bValue = b.sector || "";
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedInstitutions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInstitutions = sortedInstitutions.slice(startIndex, endIndex);

  // ========================================================================
  // UTILS
  // ========================================================================

  const getTypeBadgeColor = (type) => {
    const colors = {
      MUNICIPIU:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      OPERATOR:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      COLECTOR:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      TMB: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      DEPOZIT:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      RECICLATOR:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      VALORIFICARE:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      MUNICIPALITY:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      WASTE_OPERATOR:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      SORTING_OPERATOR:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      TMB_OPERATOR:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      DISPOSAL_CLIENT:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      RECYCLING_CLIENT:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      RECOVERY_CLIENT:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      MUNICIPIU: "Municipiu",
      OPERATOR: "Operator",
      COLECTOR: "Colector",
      TMB: "Tratare mecano-biologică",
      DEPOZIT: "Depozit",
      RECICLATOR: "Reciclator",
      VALORIFICARE: "Valorificare",
      MUNICIPALITY: "Municipiu",
      WASTE_OPERATOR: "Operator",
      SORTING_OPERATOR: "Colector",
      TMB_OPERATOR: "Tratare mecano-biologică",
      DISPOSAL_CLIENT: "Depozit",
      RECYCLING_CLIENT: "Reciclator",
      RECOVERY_CLIENT: "Valorificare",
    };
    return labels[type] || type;
  };

  const getSectorBadges = (sector) => {
    if (!sector) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-bold shadow-sm">
          B
        </span>
      );
    }

    const sectors = sector.split(",").map((s) => s.trim());
    const colors = [
      "from-blue-500 to-blue-600",
      "from-emerald-500 to-emerald-600",
      "from-purple-500 to-purple-600",
      "from-cyan-500 to-cyan-600",
      "from-red-500 to-red-600",
      "from-green-500 to-green-600",
    ];

    return (
      <div className="flex flex-wrap gap-1.5">
        {sectors.map((s, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${
              colors[parseInt(s) - 1] || colors[0]
            } text-white text-xs font-bold shadow-sm`}
          >
            {s}
          </span>
        ))}
      </div>
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ro-RO");
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  // ========================================================================
  // FILE UPLOAD COMPONENT
  // ========================================================================

  const ContractFileUpload = ({ contractId, existingFile, onSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (file) => {
      if (!file) return;

      if (file.type !== "application/pdf") {
        alert("Doar fișiere PDF sunt acceptate");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Fișierul este prea mare (max 10MB)");
        return;
      }

      setUploading(true);

      try {
        const fd = new FormData();
        fd.append("file", file);

        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/contracts/${contractId}/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: fd,
          }
        );

        const data = await response.json();

        if (data.success) {
          alert("Contract încărcat cu succes!");
          onSuccess();
        } else {
          alert(data.message || "Eroare la upload");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Eroare la încărcarea fișierului");
      } finally {
        setUploading(false);
      }
    };

    const handleDelete = async () => {
      if (!confirm("Sigur vrei să ștergi acest contract?")) return;

      setDeleting(true);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/contracts/${contractId}/file`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          alert("Contract șters cu succes!");
          onSuccess();
        } else {
          alert(data.message || "Eroare la ștergere");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Eroare la ștergerea fișierului");
      } finally {
        setDeleting(false);
      }
    };

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    };

    const handleChange = (e) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    };

    if (existingFile) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-200 truncate">
              {existingFile.name}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {(existingFile.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.open(existingFile.url, "_blank")}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
              title="Vizualizează"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <a
              href={existingFile.url}
              download
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
              title="Descarcă"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
              title="Șterge"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative border-2 border-dashed rounded-lg p-3 transition-colors ${
          dragActive
            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={`file-upload-${contractId}`}
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
        />
        <label
          htmlFor={`file-upload-${contractId}`}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload className="w-6 h-6 text-gray-400 mb-1" />
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {uploading ? "Se încarcă..." : "Drag & drop sau click"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            PDF, max 10MB
          </p>
        </label>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-lg">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // CONTRACT ROW COMPONENT
  // ========================================================================

  const ContractRow = ({ contract, onRefresh, isActive }) => {
    const [showAmendments, setShowAmendments] = useState(false);

    return (
      <div
        className={`border rounded-lg overflow-hidden ${
          isActive
            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
            : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        }`}
      >
        {/* HEADER ROW */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <FileText
                className={`w-4 h-4 ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Contract {contract.contract_number}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {contract.sector_name || `Sector ${contract.sector_id}`}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-gray-400"
              }`}
            ></span>
            {isActive ? "Activ" : "Inactiv"}
          </span>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-white dark:bg-gray-800">
          {/* Perioadă */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Perioadă
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(contract.contract_date_start)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                →{" "}
                {formatDate(
                  contract.effective_end_date || contract.contract_date_end
                ) || "nedeterminat"}
              </p>
            </div>
          </div>

          {/* Tarif */}
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Tarif
              </p>
              <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                {formatCurrency(contract.tariff_per_ton)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                per tonă
              </p>
            </div>
          </div>

          {/* Cantitate */}
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Cantitate
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatNumber(contract.estimated_quantity_tons)} t
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                estimată
              </p>
            </div>
          </div>

          {/* Valoare */}
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Valoare contract
              </p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(contract.contract_value)}
              </p>
            </div>
          </div>
        </div>

        {/* FILE UPLOAD ROW */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <ContractFileUpload
            contractId={contract.id}
            existingFile={
              contract.contract_file_url
                ? {
                    url: contract.contract_file_url,
                    name: contract.contract_file_name,
                    size: contract.contract_file_size,
                    uploadedAt: contract.contract_file_uploaded_at,
                  }
                : null
            }
            onSuccess={onRefresh}
          />
        </div>

        {/* AMENDMENTS */}
        {contract.amendments && contract.amendments.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowAmendments(!showAmendments)}
              className="w-full px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span>Acte adiționale ({contract.amendments.length})</span>
              <span>{showAmendments ? "▼" : "►"}</span>
            </button>

            {showAmendments && (
              <div className="px-4 py-3 bg-white dark:bg-gray-800 space-y-2">
                {contract.amendments.map((amendment) => (
                  <div
                    key={amendment.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-xs"
                  >
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {amendment.amendment_number}
                      </span>
                      {amendment.reason && (
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          - {amendment.reason}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatDate(amendment.amendment_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {contract.notes && (
          <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <span className="font-semibold">Observații:</span>{" "}
              {contract.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  // ========================================================================
  // EXPANDED ROW COMPONENT
  // ========================================================================

  const InstitutionExpandedRow = ({ inst }) => {
    const contracts = institutionContracts[inst.id] || [];
    const isLoading = loadingContracts[inst.id];

    const activeContracts = contracts.filter((c) => c.is_active);
    const inactiveContracts = contracts.filter((c) => !c.is_active);

    return (
      <tr className="bg-gray-50 dark:bg-gray-900/50">
        <td colSpan="7" className="px-6 py-6">
          {/* INSTITUTION DETAILS */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              Detalii Instituție
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Adresă
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {inst.address || "-"}
                  </p>
                </div>
              </div>

              {inst.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Website
                    </p>
                    <a
                      href={
                        inst.website.startsWith("http")
                          ? inst.website
                          : `https://${inst.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {inst.website}
                    </a>
                  </div>
                </div>
              )}

              {inst.fiscal_code && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Cod Fiscal
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {inst.fiscal_code}
                    </p>
                  </div>
                </div>
              )}

              {inst.registration_no && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Nr. Înregistrare
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {inst.registration_no}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 text-sm ${
                      inst.is_active
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        inst.is_active ? "bg-emerald-400" : "bg-gray-400"
                      }`}
                    ></span>
                    {inst.is_active ? "Activ" : "Inactiv"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TMB CONTRACTS */}
          {(inst.type === "TMB_OPERATOR" || inst.type === "TMB") && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Contracte TMB
                </h4>
                {contracts.length > 0 && (
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {activeContracts.length} active
                    </span>
                    {inactiveContracts.length > 0 && (
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <XCircle className="w-3.5 h-3.5" />
                        {inactiveContracts.length} inactive
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : contracts.length === 0 ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nu există contracte
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeContracts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          Contracte Active
                        </p>
                      </div>
                      {activeContracts.map((contract) => (
                        <ContractRow
                          key={contract.id}
                          contract={contract}
                          onRefresh={() =>
                            loadContractsForInstitution(inst.id, true)
                          }
                          isActive={true}
                        />
                      ))}
                    </div>
                  )}

                  {inactiveContracts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 mt-4">
                        <XCircle className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Contracte Inactive
                        </p>
                      </div>
                      {inactiveContracts.map((contract) => (
                        <ContractRow
                          key={contract.id}
                          contract={contract}
                          onRefresh={() =>
                            loadContractsForInstitution(inst.id, true)
                          }
                          isActive={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* WASTE OPERATOR CONTRACTS */}
          {inst.type === "WASTE_OPERATOR" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Contracte Operator Colectare
                </h4>
                <button
                  onClick={() => {
                    setCurrentInstitutionId(inst.id);
                    setSelectedContractForEdit(null);
                    setWasteContractModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + Adaugă Contract
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon...
                </p>
              </div>
            </div>
          )}

          {/* SORTING CONTRACTS */}
          {inst.type === "SORTING_OPERATOR" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Contracte Sortare
                </h4>
                <button
                  onClick={() => {
                    setCurrentInstitutionId(inst.id);
                    setSelectedContractForEdit(null);
                    setSortingContractModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + Adaugă Contract
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon...
                </p>
              </div>
            </div>
          )}

          {/* DISPOSAL CONTRACTS */}
          {inst.type === "DISPOSAL_CLIENT" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Contracte Depozit
                </h4>
                <button
                  onClick={() => {
                    setCurrentInstitutionId(inst.id);
                    setSelectedContractForEdit(null);
                    setDisposalContractModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + Adaugă Contract
                </button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coming soon...
                </p>
              </div>
            </div>
          )}
        </td>
      </tr>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader
          title="Gestionare Instituții"
          onSearchChange={handleSearchChange}
        />
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <DashboardHeader
        title="Gestionare Instituții"
        onSearchChange={handleSearchChange}
      />

      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-6">
        {/* STATS CARDS - MODERN COMPACT DESIGN */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Total */}
          <div
            onClick={() => handleTypeFilterClick(null)}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === null
                ? "border-slate-400 dark:border-slate-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Building2
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === null
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.total}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total
              </div>
              {activeTypeFilter === null && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-600"></div>
              )}
            </div>
          </div>

          {/* UAT/ADI */}
          <div
            onClick={() => handleTypeFilterClick("MUNICIPIU")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "MUNICIPIU"
                ? "border-indigo-400 dark:border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Building
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "MUNICIPIU"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.MUNICIPIU || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                UAT/ADI
              </div>
              {activeTypeFilter === "MUNICIPIU" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              )}
            </div>
          </div>

          {/* Colector */}
          <div
            onClick={() => handleTypeFilterClick("OPERATOR")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "OPERATOR"
                ? "border-emerald-400 dark:border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Activity
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "OPERATOR"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.OPERATOR || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Colector
              </div>
              {activeTypeFilter === "OPERATOR" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
              )}
            </div>
          </div>

          {/* Sortator */}
          <div
            onClick={() => handleTypeFilterClick("COLECTOR")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "COLECTOR"
                ? "border-violet-400 dark:border-violet-500 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-200 dark:hover:border-violet-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Package
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "COLECTOR"
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.COLECTOR || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Sortator
              </div>
              {activeTypeFilter === "COLECTOR" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600"></div>
              )}
            </div>
          </div>

          {/* TMB */}
          <div
            onClick={() => handleTypeFilterClick("TMB")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "TMB"
                ? "border-cyan-400 dark:border-cyan-500 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-200 dark:hover:border-cyan-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Activity
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "TMB"
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.TMB || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                TMB
              </div>
              {activeTypeFilter === "TMB" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
              )}
            </div>
          </div>

          {/* Depozitare */}
          <div
            onClick={() => handleTypeFilterClick("DEPOZIT")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "DEPOZIT"
                ? "border-rose-400 dark:border-rose-500 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-200 dark:hover:border-rose-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Building2
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "DEPOZIT"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.DEPOZIT || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Depozitare
              </div>
              {activeTypeFilter === "DEPOZIT" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600"></div>
              )}
            </div>
          </div>

          {/* Reciclator */}
          <div
            onClick={() => handleTypeFilterClick("RECICLATOR")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "RECICLATOR"
                ? "border-green-400 dark:border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-200 dark:hover:border-green-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <Activity
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "RECICLATOR"
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.RECICLATOR || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Reciclator
              </div>
              {activeTypeFilter === "RECICLATOR" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              )}
            </div>
          </div>

          {/* Valorificator */}
          <div
            onClick={() => handleTypeFilterClick("VALORIFICARE")}
            className={`group relative overflow-hidden rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
              activeTypeFilter === "VALORIFICARE"
                ? "border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 shadow-lg"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-200 dark:hover:border-amber-800"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
            <div className="relative p-3">
              <TrendingUp
                className={`w-5 h-5 mb-2 ${
                  activeTypeFilter === "VALORIFICARE"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stats.byType.VALORIFICARE || 0}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Valorificator
              </div>
              {activeTypeFilter === "VALORIFICARE" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#141b28] rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-[#1a2332]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Lista Instituții
              </h2>
              <p className="text-sm text-slate-400">
                {sortedInstitutions.length}{" "}
                {sortedInstitutions.length === 1
                  ? "instituție"
                  : "instituții"}
                {activeTypeFilter &&
                  ` • ${getTypeLabel(activeTypeFilter)}`}
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="group flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/70 hover:scale-105"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Adaugă Instituție
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f1623] border-b border-slate-700/50">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="group flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-emerald-400 transition-colors"
                    >
                      Denumire Instituție
                      {getSortIcon("name")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("type")}
                      className="group flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-emerald-400 transition-colors"
                    >
                      Activitate
                      {getSortIcon("type")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("sector")}
                      className="group flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-emerald-400 transition-colors"
                    >
                      Sector
                      {getSortIcon("sector")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {paginatedInstitutions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-slate-600" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white mb-1">
                            {searchQuery
                              ? "Niciun rezultat găsit"
                              : "Nu există instituții"}
                          </p>
                          <p className="text-sm text-slate-400 mb-4">
                            {searchQuery
                              ? "Încearcă să schimbi termenii de căutare"
                              : "Începe prin a adăuga prima instituție"}
                          </p>
                        </div>
                        <button
                          onClick={handleAdd}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/50"
                        >
                          Adaugă Instituție
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInstitutions.map((inst) => (
                    <>
                      <tr
                        key={inst.id}
                        className="group hover:bg-[#1a2332] transition-all duration-200"
                      >
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleRowExpand(inst.id)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg transition-all duration-200"
                          >
                            {expandedRows.has(inst.id) ? (
                              <ChevronDown className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
                                inst.type === "MUNICIPALITY"
                                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                                  : inst.type === "WASTE_OPERATOR"
                                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                  : inst.type === "SORTING_OPERATOR"
                                  ? "bg-gradient-to-br from-violet-500 to-violet-600"
                                  : inst.type === "TMB_OPERATOR"
                                  ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
                                  : inst.type === "DISPOSAL_CLIENT"
                                  ? "bg-gradient-to-br from-rose-500 to-rose-600"
                                  : inst.type === "RECYCLING_CLIENT"
                                  ? "bg-gradient-to-br from-green-500 to-green-600"
                                  : inst.type === "RECOVERY_CLIENT"
                                  ? "bg-gradient-to-br from-amber-500 to-amber-600"
                                  : "bg-gradient-to-br from-slate-500 to-slate-600"
                              }`}
                            >
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {inst.name}
                              </p>
                              {inst.short_name && (
                                <p className="text-xs text-slate-400 truncate">
                                  {inst.short_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${getTypeBadgeColor(
                              inst.type
                            )}`}
                          >
                            {getTypeLabel(inst.type)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {getSectorBadges(inst.sector)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-300 truncate max-w-[200px]">
                            {inst.contact_email || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-400">
                            {inst.contact_phone || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(inst)}
                              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                              title="Editează"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(inst)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(inst.id) && (
                        <InstitutionExpandedRow key={`${inst.id}-expanded`} inst={inst} />
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedInstitutions.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-700/50 bg-[#0f1623]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-400">
                      Pagina
                    </span>
                    <div className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-sm">
                      {currentPage}
                    </div>
                    <span className="text-sm text-slate-500">
                      din {totalPages}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-700"></div>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 bg-[#1a2332] border border-slate-700 rounded-lg text-sm text-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none hover:border-slate-600 transition-colors cursor-pointer"
                  >
                    <option value={10}>10 / pagină</option>
                    <option value={20}>20 / pagină</option>
                    <option value={50}>50 / pagină</option>
                    <option value={100}>100 / pagină</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-[#1a2332] hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[#1a2332] hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600"
                  >
                    Următorul
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleCloseSidebar}
          />

          <div className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
            {/* HEADER */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between border-b border-emerald-700 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {sidebarMode === "add" && (
                  <>
                    <Plus className="w-5 h-5" />
                    Adaugă Instituție
                  </>
                )}
                {sidebarMode === "edit" && (
                  <>
                    <Edit2 className="w-5 h-5" />
                    Editează Instituție
                  </>
                )}
                {sidebarMode === "delete" && (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Șterge Instituție
                  </>
                )}
              </h3>
              <button
                onClick={handleCloseSidebar}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              {/* DELETE MODE */}
              {sidebarMode === "delete" && selectedInstitution && (
                <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-red-900 dark:text-red-100 mb-1">
                          Confirmare Ștergere
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Ești sigur că vrei să ștergi instituția{" "}
                          <span className="font-semibold">
                            {selectedInstitution.name}
                          </span>
                          ?
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Această acțiune nu poate fi anulată.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseSidebar}
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Se șterge...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Șterge Instituția
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ADD/EDIT MODE */}
              {(sidebarMode === "add" || sidebarMode === "edit") && (
                <div className="space-y-6">
                  {/* Denumire */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Denumire *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.name
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Denumirea instituției"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Denumire Scurtă */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Denumire Scurtă
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      value={formData.short_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ex: PMB, S1, S2..."
                    />
                  </div>

                  {/* Tip Instituție */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tip Instituție *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.type
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all`}
                    >
                      <option value="">Selectează tipul</option>
                      <option value="MUNICIPALITY">Municipiu</option>
                      <option value="WASTE_OPERATOR">
                        Operator Colectare
                      </option>
                      <option value="SORTING_OPERATOR">
                        Operator Sortare
                      </option>
                      <option value="TMB_OPERATOR">Operator TMB</option>
                      <option value="DISPOSAL_CLIENT">
                        Client Depozit
                      </option>
                      <option value="RECYCLING_CLIENT">
                        Client Reciclare
                      </option>
                      <option value="RECOVERY_CLIENT">
                        Client Valorificare
                      </option>
                    </select>
                    {errors.type && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {errors.type}
                      </p>
                    )}
                  </div>

                  {/* Sector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Sector
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ex: 1,2,3 sau B pentru București"
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Separate prin virgulă pentru sectoare multiple (ex:
                      1,2,3)
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Contact
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.contact_email
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all`}
                      placeholder="contact@institutie.ro"
                    />
                    {errors.contact_email && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                        {errors.contact_email}
                      </p>
                    )}
                  </div>

                  {/* Telefon */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Telefon Contact
                    </label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="+40 21 XXX XXXX"
                    />
                  </div>

                  {/* Adresă */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Adresă
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Adresa completă"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="https://www.institutie.ro"
                    />
                  </div>

                  {/* Cod Fiscal */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Cod Fiscal
                    </label>
                    <input
                      type="text"
                      name="fiscal_code"
                      value={formData.fiscal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="RO12345678"
                    />
                  </div>

                  {/* Nr. Înregistrare */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nr. Înregistrare
                    </label>
                    <input
                      type="text"
                      name="registration_no"
                      value={formData.registration_no}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      placeholder="J40/XXXX/YYYY"
                    />
                  </div>

                  {/* Status Activ */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instituție activă
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleCloseSidebar}
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Se salvează...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {sidebarMode === "add" ? "Adaugă" : "Salvează"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      <WasteOperatorContractModal
        isOpen={wasteContractModalOpen}
        onClose={() => {
          setWasteContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={() => {
          if (currentInstitutionId) {
            loadContractsForInstitution(currentInstitutionId, true);
          }
        }}
      />

      <SortingContractModal
        isOpen={sortingContractModalOpen}
        onClose={() => {
          setSortingContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={() => {
          if (currentInstitutionId) {
            loadContractsForInstitution(currentInstitutionId, true);
          }
        }}
      />

      <DisposalContractModal
        isOpen={disposalContractModalOpen}
        onClose={() => {
          setDisposalContractModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        institutionId={currentInstitutionId}
        contract={selectedContractForEdit}
        onSuccess={() => {
          if (currentInstitutionId) {
            loadContractsForInstitution(currentInstitutionId, true);
          }
        }}
      />
    </div>
  );
};

export default Institutions;
