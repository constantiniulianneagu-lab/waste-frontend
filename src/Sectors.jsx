// src/Sectors.jsx
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { usePermissions } from "./hooks/usePermissions";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import SectorSidebar from "./components/sectors/SectorSidebar";
import {
  Layers,
  Building2,
  Users,
  MapPin,
  Edit2,
  Eye,
  Truck,
  Recycle,
  Building,
} from "lucide-react";

const Sectors = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { canEditData, hasAccess } = permissions;

  // Access guard
  if (!hasAccess('sectors')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-10">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[18px] p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Acces restricționat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Nu ai permisiuni pentru pagina „Sectoare".
          </p>
        </div>
      </div>
    );
  }

  // State
  const [sectors, setSectors] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Sidebar
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('view');
  const [selectedSector, setSelectedSector] = useState(null);

  // ========== LOAD DATA ==========
  useEffect(() => {
    loadSectors();
    loadInstitutions();
  }, []);

  const loadSectors = async () => {
    setLoading(true);
    try {
      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const response = await fetch(
        `${API_URL}/api/sectors?includeInstitutions=true`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('wasteAccessToken')}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setSectors(data.data || []);
      }
    } catch (err) {
      console.error("Error loading sectors:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const response = await fetch(
        `${API_URL}/api/institutions?limit=500`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('wasteAccessToken')}` }
        }
      );
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
  const handleViewSector = (sector) => {
    setSelectedSector(sector);
    setSidebarMode('view');
    setShowSidebar(true);
  };

  const handleEditSector = (sector) => {
    setSelectedSector(sector);
    setSidebarMode('edit');
    setShowSidebar(true);
  };

  const handleUpdateSector = async (sectorId, updates) => {
    try {
      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const response = await fetch(
        `${API_URL}/api/sectors/${sectorId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('wasteAccessToken')}`
          },
          body: JSON.stringify(updates)
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowSidebar(false);
        loadSectors();
      } else {
        alert(data.message || 'Eroare la actualizare');
      }
    } catch (err) {
      console.error('Update sector error:', err);
      alert('Eroare la actualizare');
    }
  };

  const handleUpdateInstitutions = async (sectorId, institutionIds) => {
    try {
      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const response = await fetch(
        `${API_URL}/api/sectors/${sectorId}/institutions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('wasteAccessToken')}`
          },
          body: JSON.stringify({ institutionIds })
        }
      );

      const data = await response.json();
      if (data.success) {
        setShowSidebar(false);
        loadSectors();
      } else {
        alert(data.message || 'Eroare la actualizare instituții');
      }
    } catch (err) {
      console.error('Update institutions error:', err);
      alert('Eroare la actualizare instituții');
    }
  };

  // ========== COMPUTED ==========
  const getTotalInstitutions = () => {
    return sectors.reduce((sum, sector) => {
      return sum + (sector.institutions?.length || 0);
    }, 0);
  };

  const getInstitutionIcon = (type) => {
    const icons = {
      MUNICIPALITY: Building,
      WASTE_COLLECTOR: Truck,
      TMB_OPERATOR: Recycle,
      SORTING_OPERATOR: Layers,
      LANDFILL: MapPin,
    };
  
    return icons[type] || Building2;
  };
  

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <DashboardHeader title="Gestionare Sectoare" />

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Sectors */}
          <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[14px] shadow-lg shadow-emerald-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sectoare</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{sectors.length}</p>
              </div>
            </div>
          </div>

          {/* Total Institutions */}
          <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[14px] shadow-lg shadow-blue-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Instituții</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalInstitutions()}</p>
              </div>
            </div>
          </div>

          {/* Total Population */}
          <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-[14px] shadow-lg shadow-violet-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Populație</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(sectors.reduce((sum, s) => sum + (s.population || 0), 0) / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </div>

          {/* Total Area */}
          <div className="bg-white dark:bg-gray-800 rounded-[20px] p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[14px] shadow-lg shadow-amber-500/20">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Suprafață</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sectors.reduce((sum, s) => sum + (parseFloat(s.area_km2) || 0), 0).toFixed(1)} km²
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-400">Se încarcă sectoarele...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-[14px] flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{sector.sector_number}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{sector.sector_name}</h3>
                          <p className="text-xs text-white/80">Sectorul {sector.sector_number}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[12px]">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Populație</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {sector.population ? (sector.population / 1000).toFixed(0) + 'k' : '-'}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-[12px]">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Suprafață</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {sector.area_km2 ? sector.area_km2 + ' km²' : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Institutions */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Instituții ({sector.institutions?.length || 0})
                      </p>
                    </div>
                    {sector.institutions && sector.institutions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {sector.institutions.slice(0, 3).map((inst) => {
                          const Icon = getInstitutionIcon(inst.type);
                          return (
                            <div
                              key={inst.id}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-[8px] text-xs font-medium"
                            >
                              <Icon className="w-3 h-3" />
                              <span className="truncate max-w-[100px]">{inst.short_name || inst.name}</span>
                            </div>
                          );
                        })}
                        {sector.institutions.length > 3 && (
                          <div className="inline-flex items-center px-2.5 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded-[8px] text-xs font-medium">
                            +{sector.institutions.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500">Nicio instituție asociată</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewSector(sector)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-[12px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detalii
                    </button>
                    {canEditData && (
                      <button
                        onClick={() => handleEditSector(sector)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-[12px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editează
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <SectorSidebar
          mode={sidebarMode}
          sector={selectedSector}
          institutions={institutions}
          onClose={() => setShowSidebar(false)}
          onUpdateSector={handleUpdateSector}
          onUpdateInstitutions={handleUpdateInstitutions}
        />
      )}
    </div>
  );
};

export default Sectors;