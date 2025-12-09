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
} from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import { apiGet, apiPost, apiPut, apiDelete } from "./api/apiClient";
import WasteOperatorContractModal from './WasteOperatorContractModal';
import SortingContractModal from './SortingContractModal';
import DisposalContractModal from './DisposalContractModal';

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
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {}
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
  const [sortingContractModalOpen, setSortingContractModalOpen] = useState(false);
  const [disposalContractModalOpen, setDisposalContractModalOpen] = useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] = useState(null);
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
      const response = await apiGet('/api/institutions', { limit: 1000 });
      
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
      switch(inst.type) {
        case 'MUNICIPALITY':
          normalizedType = 'MUNICIPIU';
          break;
        case 'WASTE_OPERATOR':
          normalizedType = 'OPERATOR';
          break;
        case 'TMB_OPERATOR':
          normalizedType = 'TMB';
          break;
        case 'DISPOSAL_CLIENT':
          normalizedType = 'DEPOZIT';
          break;
        case 'RECYCLING_CLIENT':
          normalizedType = 'RECICLATOR';
          break;
        case 'RECOVERY_CLIENT':
          normalizedType = 'VALORIFICARE';
          break;
        case 'SORTING_OPERATOR':
          normalizedType = 'COLECTOR';
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

  const loadContractsForInstitution = async (institutionId, forceReload = false) => {
    if (institutionContracts[institutionId] && !forceReload) return;
    
    setLoadingContracts(prev => ({ ...prev, [institutionId]: true }));
    
    try {
      const response = await apiGet(`/api/institutions/${institutionId}/contracts`);
      
      if (response.success) {
        setInstitutionContracts(prev => ({
          ...prev,
          [institutionId]: response.data || []
        }));
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
      setInstitutionContracts(prev => ({
        ...prev,
        [institutionId]: []
      }));
    } finally {
      setLoadingContracts(prev => ({ ...prev, [institutionId]: false }));
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
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
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
        const data = await apiPost('/api/institutions', formData);
        if (data.success) {
          alert("Instituție adăugată cu succes!");
          await loadInstitutions();
          handleCloseSidebar();
        } else {
          alert(data.message || "Eroare la adăugare");
        }
      } else if (sidebarMode === "edit") {
        const data = await apiPut(`/api/institutions/${selectedInstitution.id}`, formData);
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
      const data = await apiDelete(`/api/institutions/${selectedInstitution.id}`);
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

  const toggleRowExpand = (id) => {
    // Auto-close: doar un rând deschis odată
    if (expandedRows.has(id)) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set([id]));
      loadContractsForInstitution(id);
    }
  };

  // ========================================================================
  // FILTERING & PAGINATION
  // ========================================================================

  const filteredInstitutions = institutions.filter((inst) => {
    if (activeTypeFilter) {
      let normalizedType;
      switch(inst.type) {
        case 'MUNICIPALITY':
          normalizedType = 'MUNICIPIU';
          break;
        case 'WASTE_OPERATOR':
          normalizedType = 'OPERATOR';
          break;
        case 'TMB_OPERATOR':
          normalizedType = 'TMB';
          break;
        case 'DISPOSAL_CLIENT':
          normalizedType = 'DEPOZIT';
          break;
        case 'RECYCLING_CLIENT':
          normalizedType = 'RECICLATOR';
          break;
        case 'RECOVERY_CLIENT':
          normalizedType = 'VALORIFICARE';
          break;
        case 'SORTING_OPERATOR':
          normalizedType = 'COLECTOR';
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

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInstitutions = filteredInstitutions.slice(startIndex, endIndex);

  // ========================================================================
  // UTILS
  // ========================================================================

  const getTypeBadgeColor = (type) => {
    const colors = {
      MUNICIPIU: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      OPERATOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      COLECTOR: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      TMB: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      DEPOZIT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      RECICLATOR: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      VALORIFICARE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      MUNICIPALITY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      WASTE_OPERATOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      SORTING_OPERATOR: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      TMB_OPERATOR: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      DISPOSAL_CLIENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      RECYCLING_CLIENT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      RECOVERY_CLIENT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return colors[type] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
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
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2
    }).format(value || 0);
  };
  
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ro-RO');
  };
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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

      if (file.type !== 'application/pdf') {
        alert('Doar fișiere PDF sunt acceptate');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('Fișierul este prea mare (max 10MB)');
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/contracts/${contractId}/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (data.success) {
          alert('Contract încărcat cu succes!');
          onSuccess();
        } else {
          alert(data.message || 'Eroare la upload');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Eroare la încărcarea fișierului');
      } finally {
        setUploading(false);
      }
    };

    const handleDelete = async () => {
      if (!confirm('Sigur vrei să ștergi acest contract?')) return;

      setDeleting(true);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/contracts/${contractId}/file`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          alert('Contract șters cu succes!');
          onSuccess();
        } else {
          alert(data.message || 'Eroare la ștergere');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Eroare la ștergerea fișierului');
      } finally {
        setDeleting(false);
      }
    };

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
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
              onClick={() => window.open(existingFile.url, '_blank')}
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
              title="Vizualizează"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            
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
            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
            : 'border-gray-300 dark:border-gray-600'
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
            {uploading ? 'Se încarcă...' : 'Drag & drop sau click'}
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
    const [showAmendments, setShowAmendme