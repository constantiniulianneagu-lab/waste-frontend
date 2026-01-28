// src/pages/SectorStatsOverview.jsx
/**
 * ============================================================================
 * SECTOR STATS OVERVIEW - GRID 6 SECTOARE
 * ============================================================================
 * Modern UI - Samsung/Apple Style 2026
 * Grid cu carduri pentru fiecare sector cu statistici sumare
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, MapPin, TrendingUp, 
  AlertCircle, ChevronRight, DollarSign 
} from 'lucide-react';
import { getAllSectorsOverview } from '../services/sectorWasteManagementService';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const SectorStatsOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  // Available years (last 3 years)
  const availableYears = Array.from(
    { length: 3 }, 
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllSectorsOverview({ year });
      
      if (response.success) {
        setSectors(response.data.sectors || []);
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching sectors overview:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('ro-RO');
  };

  const getSectorColor = (sectorNum) => {
    const colors = {
      1: 'from-blue-500 to-indigo-600',
      2: 'from-emerald-500 to-teal-600',
      3: 'from-yellow-500 to-orange-600',
      4: 'from-red-500 to-rose-600',
      5: 'from-purple-500 to-pink-600',
      6: 'from-cyan-500 to-blue-600'
    };
    return colors[sectorNum] || colors[1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Se încarcă datele sectorului...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-900 dark:text-red-100 mb-2">
                  Eroare la încărcarea datelor
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Încearcă din nou
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER - standardizat */}
      <DashboardHeader 
        title="Statistici - Managementul Deșeurilor București"
        notificationCount={0}
      />

      {/* FILTRE - Sub header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vizualizează statistici complete pentru fiecare sector din București
            </p>

            {/* YEAR FILTER */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                An:
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                         rounded-lg text-sm font-medium text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         transition-all"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* GRID 6 SECTOARE */}
      <div className="px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => (
            <SectorCard
              key={sector.sector_number}
              sector={sector}
              color={getSectorColor(sector.sector_number)}
              onClick={() => navigate(`/sectoare/${sector.sector_number}`)}
              formatNumber={formatNumber}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * SECTOR CARD COMPONENT
 * ============================================================================
 */
const SectorCard = ({ sector, color, onClick, formatNumber }) => {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Card Container */}
      <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                    rounded-[24px] p-6 border border-gray-200 dark:border-gray-700/50
                    hover:border-gray-300 dark:hover:border-gray-600
                    hover:-translate-y-2 hover:shadow-2xl
                    transition-all duration-300 overflow-hidden">

        {/* Left Accent Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                      bg-gradient-to-b ${color}
                      group-hover:w-2 transition-all duration-300`} />

        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color}
                      opacity-[0.02] dark:opacity-[0.04]
                      group-hover:opacity-[0.06] dark:group-hover:opacity-[0.10]
                      transition-opacity duration-500`} />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${color}
                            flex items-center justify-center text-white shadow-lg
                            group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Sector {sector.sector_number}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sector.sector_name}
                </p>
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 
                                   group-hover:text-gray-600 dark:group-hover:text-gray-300
                                   group-hover:translate-x-1 transition-all" />
          </div>

          {/* Info Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Populație</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatNumber(sector.population)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Suprafață</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {sector.area_km2 ? `${sector.area_km2} km²` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Cost Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Cost Total
                </span>
              </div>
              <span className={`text-base font-bold bg-gradient-to-r ${color} 
                             bg-clip-text text-transparent`}>
                {sector.total_cost_formatted} RON
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Cost/Tonă
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {sector.cost_per_ton_formatted} RON
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Cost/Locuitor/An
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {sector.cost_per_capita_formatted} RON
              </span>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Deșeuri procesate
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {sector.total_tons_formatted} tone
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Element */}
        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full
                      bg-gradient-to-br ${color}
                      opacity-40 dark:opacity-60 animate-pulse`} />
      </div>
    </div>
  );
};

export default SectorStatsOverview;