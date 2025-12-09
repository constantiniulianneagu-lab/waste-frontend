// src/Institutions.jsx
/**
 * ============================================================================
 * INSTITUTIONS MANAGEMENT - REAL DATA + REFINED CARDS
 * ============================================================================
 * ✅ Date reale din backend
 * ✅ Stats cards fine și discrete (white/glass style)
 * ✅ Expand row pentru detalii
 * ✅ Paginare (10/20/50)
 * ✅ Sidebar dreapta
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
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Building,
  TrendingUp,
  Activity,
} from "lucide-react";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import { apiGet, apiPost, apiPut, apiDelete } from "./api/apiClient";

const Institutions = () => {
  // ========================================================================
  // STATE
  // ========================================================================
  
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState(null); // ✅ ADĂUGAT - filtru tip activ
  
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

  // ========================================================================
  // LOAD DATA FROM BACKEND
  // ========================================================================

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      // Preia TOATE instituțiile (limit=1000 sau fără limit)
      const response = await apiGet('/api/institutions', { limit: 1000 });
      
      console.log('API Response:', response); // Debug
      
      if (response.success) {
        // Backend returnează: { success: true, data: { institutions: [...], pagination: {...} } }
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
      // Mapare tipuri backend → categorii frontend
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
  // HANDLERS
  // ========================================================================

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeFilterClick = (type) => {
    // Toggle filter: click pe același card = dezactivează filtrul
    if (activeTypeFilter === type) {
      setActiveTypeFilter(null);
    } else {
      setActiveTypeFilter(type);
    }
    setCurrentPage(1); // Reset la prima pagină
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
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // ========================================================================
  // FILTERING & PAGINATION
  // ========================================================================

  const filteredInstitutions = institutions.filter((inst) => {
    // Filtru pe tip (dacă e activ)
    if (activeTypeFilter) {
      // Mapare tip backend → categorie frontend
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
    
    // Filtru pe search
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
      // Categorii frontend
      MUNICIPIU: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      OPERATOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      COLECTOR: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      TMB: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
      DEPOZIT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      RECICLATOR: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      VALORIFICARE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      
      // Tipuri backend (fallback)
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
      // Categorii frontend
      MUNICIPIU: "Municipiu",
      OPERATOR: "Operator",
      COLECTOR: "Colector",
      TMB: "Tratare mecano-biologică",
      DEPOZIT: "Depozit",
      RECICLATOR: "Reciclator",
      VALORIFICARE: "Valorificare",
      
      // Tipuri backend
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

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader title="Gestionare Instituții" onSearchChange={handleSearchChange} />
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
      <DashboardHeader title="Gestionare Instituții" onSearchChange={handleSearchChange} />

      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-6">
        
        {/* REFINED STATS CARDS - WHITE/GLASS STYLE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          
          {/* Total */}
          <div 
            onClick={() => handleTypeFilterClick(null)}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === null 
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Total Instituții</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                {stats.active} active
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-500 dark:text-gray-400">{stats.inactive} inactive</span>
            </div>
            {activeTypeFilter === null && (
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">✓ Toate tipurile</p>
              </div>
            )}
          </div>

          {/* Municipiu */}
          <div 
            onClick={() => handleTypeFilterClick('MUNICIPIU')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'MUNICIPIU' 
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.MUNICIPIU || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Municipiu</p>
            {activeTypeFilter === 'MUNICIPIU' && (
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">✓ Filtru activ</p>
              </div>
            )}
          </div>

          {/* Operator */}
          <div 
            onClick={() => handleTypeFilterClick('OPERATOR')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'OPERATOR' 
                ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.OPERATOR || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Operator</p>
            {activeTypeFilter === 'OPERATOR' && (
              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Filtru activ</p>
              </div>
            )}
          </div>

          {/* Colector */}
          <div 
            onClick={() => handleTypeFilterClick('COLECTOR')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'COLECTOR' 
                ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.COLECTOR || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Colector</p>
            {activeTypeFilter === 'COLECTOR' && (
              <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">✓ Filtru activ</p>
              </div>
            )}
          </div>

          {/* TMB */}
          <div 
            onClick={() => handleTypeFilterClick('TMB')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'TMB' 
                ? 'border-cyan-500 dark:border-cyan-400 ring-2 ring-cyan-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors">
                <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.TMB || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">TMB</p>
            {activeTypeFilter === 'TMB' && (
              <div className="mt-2 pt-2 border-t border-cyan-200 dark:border-cyan-800">
                <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">✓ Filtru activ</p>
              </div>
            )}
          </div>

          {/* Depozit */}
          <div 
            onClick={() => handleTypeFilterClick('DEPOZIT')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'DEPOZIT' 
                ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.DEPOZIT || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Depozit</p>
            {activeTypeFilter === 'DEPOZIT' && (
              <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">✓ Filtru activ</p>
              </div>
            )}
          </div>

          {/* Reciclator */}
          <div 
            onClick={() => handleTypeFilterClick('RECICLATOR')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'RECICLATOR' 
                ? 'border-green-500 dark:border-green-400 ring-2 ring-green-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.RECICLATOR || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Reciclator</p>
            {activeTypeFilter === 'RECICLATOR' && (
              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">✓ Filtru activ</p>
              </div>
            )}
          </div>

          {/* Valorificare */}
          <div 
            onClick={() => handleTypeFilterClick('VALORIFICARE')}
            className={`bg-white dark:bg-gray-800 rounded-xl border ${
              activeTypeFilter === 'VALORIFICARE' 
                ? 'border-orange-500 dark:border-orange-400 ring-2 ring-orange-500/20' 
                : 'border-gray-200 dark:border-gray-700'
            } shadow-sm hover:shadow-md transition-all p-5 group cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stats.byType.VALORIFICARE || 0}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Valorificare</p>
            {activeTypeFilter === 'VALORIFICARE' && (
              <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-800">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">✓ Filtru activ</p>
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Lista Instituții
            </h2>
            <div className="flex items-center gap-3">
              {/* DEBUG BUTTON - TEMPORAR */}
              <button
                onClick={() => {
                  console.log('=== DEBUG INSTITUTIONS ===');
                  console.log('Total loaded:', institutions.length);
                  console.log('Active filter:', activeTypeFilter);
                  console.log('Filtered count:', filteredInstitutions.length);
                  console.log('Stats:', stats);
                  
                  // Tipuri distincte
                  const types = [...new Set(institutions.map(i => i.type))];
                  console.log('Unique types:', types);
                  
                  // Count per type
                  const typeCounts = {};
                  institutions.forEach(inst => {
                    typeCounts[inst.type] = (typeCounts[inst.type] || 0) + 1;
                  });
                  console.table(typeCounts);
                  
                  // Sample data
                  console.log('First 5 institutions:', institutions.slice(0, 5));
                }}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-all"
              >
                🐛 Debug
              </button>
              
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Adaugă Instituție
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="w-12 px-6 py-3"></th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Denumire Instituție
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Activitate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedInstitutions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {searchQuery ? "Nu s-au găsit instituții" : "Nu există instituții"}
                        </p>
                        <button
                          onClick={handleAdd}
                          className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Adaugă prima instituție
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInstitutions.map((inst) => (
                    <>
                      {/* Main Row */}
                      <tr
                        key={inst.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRowExpand(inst.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            {expandedRows.has(inst.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {inst.name}
                              </p>
                              {inst.short_name && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {inst.short_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                              inst.type
                            )}`}
                          >
                            {getTypeLabel(inst.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSectorBadges(inst.sector)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {inst.contact_email || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {inst.contact_phone || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(inst)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Editează"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(inst)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Șterge"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRows.has(inst.id) && (
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                    Adresă
                                  </p>
                                  <p className="text-gray-700 dark:text-gray-300">
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
                                      href={inst.website.startsWith("http") ? inst.website : `https://${inst.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 dark:text-blue-400 hover:underline"
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
                                    <p className="text-gray-700 dark:text-gray-300">
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
                                    <p className="text-gray-700 dark:text-gray-300">
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
                                  <span className={`inline-flex items-center gap-2 ${inst.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}>
                                    <span className={`w-2 h-2 rounded-full ${inst.is_active ? "bg-emerald-400" : "bg-gray-400"}`}></span>
                                    {inst.is_active ? "Activ" : "Inactiv"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedInstitutions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pagina {currentPage} din {totalPages}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value={10}>10 / pagină</option>
                  <option value={20}>20 / pagină</option>
                  <option value={50}>50 / pagină</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Următorul
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR - SAME AS BEFORE (cu toate formularele) */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleCloseSidebar}
          />

          <div className="fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {sidebarMode === "add" && "Adaugă Instituție Nouă"}
                {sidebarMode === "edit" && "Editează Instituție"}
                {sidebarMode === "delete" && "Confirmare Ștergere"}
              </h3>
              <button
                onClick={handleCloseSidebar}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sidebarMode === "delete" ? (
              <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Sigur dorești să ștergi instituția{" "}
                    <span className="font-semibold">{selectedInstitution?.name}</span>?
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                    Această acțiune nu poate fi anulată.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseSidebar}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    Anulează
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {saving ? "Se șterge..." : "Șterge"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {/* Form fields - SAME AS BEFORE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Denumire Instituție *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.name ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all`}
                      placeholder="Ex: ROMPREST SERVICE S.A."
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nume Scurt
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      value={formData.short_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      placeholder="Ex: ROMPREST"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tip Instituție *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.type ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all`}
                    >
                      <option value="">Selectează tip...</option>
                      <option value="MUNICIPIU">Municipiu</option>
                      <option value="OPERATOR">Operator</option>
                      <option value="COLECTOR">Colector</option>
                      <option value="TMB">Tratare mecano-biologică</option>
                      <option value="DEPOZIT">Depozit</option>
                      <option value="RECICLATOR">Reciclator</option>
                      <option value="RECYCLING_CLIENT">Reciclator (Client)</option>
                      <option value="VALORIFICARE">Valorificare</option>
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sector (ex: 1 sau 1,2,3 pentru multiple)
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      placeholder="Lasă gol pentru București"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Lasă gol pentru instituții care operează în tot Bucureștiul
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.contact_email ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all`}
                      placeholder="office@example.com"
                    />
                    {errors.contact_email && (
                      <p className="mt-1 text-xs text-red-500">{errors.contact_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      placeholder="+40 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Adresă
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all resize-none"
                      placeholder="Adresa completă"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      placeholder="www.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cod Fiscal
                    </label>
                    <input
                      type="text"
                      name="fiscal_code"
                      value={formData.fiscal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      placeholder="RO12345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nr. Înregistrare
                    </label>
                    <input
                      type="text"
                      name="registration_no"
                      value={formData.registration_no}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                      placeholder="J40/1234/2010"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Instituție activă
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800 pb-6">
                  <button
                    onClick={handleCloseSidebar}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Anulează
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Se salvează...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvează
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Institutions;