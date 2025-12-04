// src/components/dashboard/DashboardTmb.jsx
/**
 * ============================================================================
 * DASHBOARD TMB - FIX URGENT SECTOARE
 * ============================================================================
 * 
 * 🔧 FIX:
 * ✅ Extrage sector_id din sector_name ("Sector 1" → 1)
 * ✅ Backend returnează doar sector_name, nu sector_id
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle, Factory, Trash2, Recycle, Zap, Package } from "lucide-react";

import { getTmbStats } from "../../services/dashboardTmbService.js";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";

import {
  ComposedChart, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DashboardTmb = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [chartType, setChartType] = useState('bar');

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: null,
  });

  // ========================================================================
  // FORMAT NUMBER RO
  // ========================================================================

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatted = num.toFixed(2);
    const [intPart, decPart] = formatted.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intWithDots},${decPart}`;
  };

  // ========================================================================
  // FETCH DATA
  // ========================================================================

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("📊 Fetching TMB dashboard data with filters:", filterParams);
      
      const tmbFilters = {
        year: filterParams.year?.toString(),
        start_date: filterParams.from,
        end_date: filterParams.to,
      };

      if (filterParams.sector_id && filterParams.sector_id >= 1 && filterParams.sector_id <= 6) {
        tmbFilters.sector_id = filterParams.sector_id.toString();
      }
      
      console.log("🔄 TMB Filters sent to API:", tmbFilters);
      
      const res = await getTmbStats(tmbFilters);
      
      console.log("✅ Raw response from TMB API:", res);
  
      if (!res) {
        throw new Error("Empty response from API");
      }
  
      if (typeof res === "object" && "success" in res) {
        if (!res.success) {
          throw new Error(res.message || "API responded with success=false");
        }
        console.log("✅ Using res.data for TMB dashboard:", res.data);
        setData(res.data);
      } else {
        console.log("⚠️ Using response as data directly");
        setData(res);
      }
    } catch (err) {
      console.error("❌ TMB Dashboard fetch error:", err);
      setError(err.message || "Failed to load TMB dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleFilterChange = (newFilters) => {
    console.log('🔄 TMB Filter change requested:', newFilters);
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    console.log("🔍 Search query:", query);
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          onSearchChange={handleSearchChange}
          title="Dashboard Tratare Mecano-Biologică"
        />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 73px)" }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Se încarcă datele...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          onSearchChange={handleSearchChange}
          title="Dashboard Tratare Mecano-Biologică"
        />
        <div className="p-6">
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
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={() => fetchDashboardData()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    Încearcă din nou
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ========================================================================
  // EXTRAGE ANI DIN MONTHLY EVOLUTION
  // ========================================================================

  const extractYearsFromMonthlyEvolution = () => {
    if (!data?.monthly_evolution || data.monthly_evolution.length === 0) {
      return [new Date().getFullYear()];
    }

    const years = new Set();
    data.monthly_evolution.forEach(item => {
      const match = item.month?.match(/\d{4}/);
      if (match) {
        years.add(parseInt(match[0], 10));
      }
    });

    const yearArray = Array.from(years).sort((a, b) => b - a);
    console.log("📅 Years extracted from monthly_evolution:", yearArray);
    return yearArray.length > 0 ? yearArray : [new Date().getFullYear()];
  };

  const availableYears = extractYearsFromMonthlyEvolution();

  // ========================================================================
  // EXTRAGE SECTOARE DIN SECTOR_DISTRIBUTION
  // ========================================================================

  const extractSectorsFromDistribution = () => {
    if (!data?.sector_distribution || data.sector_distribution.length === 0) {
      return [];
    }

    // Extrage sector_id din sector_name (ex: "Sector 1" → 1)
    const sectorsData = data.sector_distribution
      .map(item => {
        // Extrage numărul din sector_name
        const match = item.sector_name?.match(/\d+/);
        const sectorNumber = match ? parseInt(match[0], 10) : null;
        
        if (!sectorNumber || sectorNumber < 1 || sectorNumber > 6) {
          return null;
        }

        return {
          sector_id: sectorNumber,
          sector_number: sectorNumber,
          sector_name: `Sector ${sectorNumber}`,
        };
      })
      .filter(Boolean) // Elimină null-urile
      .sort((a, b) => a.sector_id - b.sector_id);

    console.log("🗺️ Sectors extracted from distribution:", sectorsData);
    return sectorsData;
  };

  const sectors = extractSectorsFromDistribution();

  // ========================================================================
  // PREPARE DATA PENTRU GRAFICE
  // ========================================================================

  const monthlyChartData = data?.monthly_evolution?.map(item => ({
    month: item.month,
    'Deșeuri tratate': parseFloat(item.tmb_total) || 0,
    'Deșeuri depozitate': parseFloat(item.landfill_total) || 0
  })) || [];

  const sectorPieData = data?.sector_distribution?.map(item => ({
    name: item.sector_name,
    tratate: parseFloat(item.tmb_tons) || 0,
    depozitate: parseFloat(item.landfill_tons) || 0
  })) || [];

  // ========================================================================
  // PROGRESS BAR COMPONENT
  // ========================================================================

  const ProgressBar = ({ value, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
      <div
        className={`h-1 rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  // ========================================================================
  // RENDER CHART
  // ========================================================================

  const renderChart = () => {
    const commonProps = {
      data: monthlyChartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Bar dataKey="Deșeuri tratate" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Deșeuri depozitate" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    } else if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Line type="monotone" dataKey="Deșeuri tratate" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="Deșeuri depozitate" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      );
    } else {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorTratate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDepozitate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Area type="monotone" dataKey="Deșeuri tratate" stroke="#10b981" strokeWidth={2} fill="url(#colorTratate)" />
          <Area type="monotone" dataKey="Deșeuri depozitate" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepozitate)" />
        </AreaChart>
      );
    }
  };

  // ========================================================================
  // RENDER MAIN
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <DashboardHeader 
        notificationCount={notificationCount}
        onSearchChange={handleSearchChange}
        title="Dashboard Tratare Mecano-Biologică"
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sectors={sectors}
          availableYears={availableYears}
          loading={loading}
        />

        {!data?.summary ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Nu există date pentru perioada selectată
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Încearcă să selectezi o perioadă diferită.
            </p>
          </div>
        ) : (
          <>
            {/* LINIA 1: CARDS + GRAFIC */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              <div className="space-y-4">
                
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-4 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Deșeuri total colectate</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    {formatNumberRO(data.summary.total_collected)} tone
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Cod deșeu: 20 03 01</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">100% din total</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-500/30 p-4 hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Deșeuri depozitate</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {formatNumberRO(data.summary.total_landfill_direct)} tone
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Cod deșeu: 20 03 01</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{data.summary.landfill_percent}% din total</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-cyan-200 dark:border-cyan-500/30 p-4 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Factory className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Trimise la TMB</p>
                  </div>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                    {formatNumberRO(data.summary.total_tmb_input)} tone
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Cod deșeu: 20 03 01</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">{data.summary.tmb_percent}% din total</p>
                </div>
              </div>

              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Evoluția cantităților de deșeuri
                  </h3>
                  <div className="flex gap-2">
                    {['bar', 'line', 'area'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          chartType === type 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {type === 'bar' ? 'Bare' : type === 'line' ? 'Linii' : 'Arie'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>

            {/* RESTUL COMPONENTELOR (Output Cards, Distribuție, Tabel) - identice cu versiunea anterioară */}
            {/* Copiază din versiunea anterioară sau vezi în /mnt/user-data/outputs/DashboardTmb_FIX_FILTERS.jsx */}
            
            {/* LINIA 2: OUTPUT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-400">Reciclabile</p>
                  <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-lg">Raport</span>
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {formatNumberRO(data.outputs.recycling.sent)} tone
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  {data.outputs.percentages.recycling}% din total TMB
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Trimisă:</span>
                    <span className="text-gray-900 dark:text-white">{formatNumberRO(data.outputs.recycling.sent)} t</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Acceptată:</span>
                    <span className="text-gray-900 dark:text-white">{formatNumberRO(data.outputs.recycling.accepted)} t</span>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={parseFloat(data.outputs.recycling.acceptance_rate)} color="bg-emerald-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                    Rata acceptare: {data.outputs.recycling.acceptance_rate}%
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-400">Valorificare energetică</p>
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">Raport</span>
                </div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {formatNumberRO(data.outputs.recovery.sent)} tone
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  {data.outputs.percentages.recovery}% din total TMB
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Trimisă:</span>
                    <span className="text-gray-900 dark:text-white">{formatNumberRO(data.outputs.recovery.sent)} t</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Acceptată:</span>
                    <span className="text-gray-900 dark:text-white">{formatNumberRO(data.outputs.recovery.accepted)} t</span>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={parseFloat(data.outputs.recovery.acceptance_rate)} color="bg-red-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                    Rata acceptare: {data.outputs.recovery.acceptance_rate}%
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-400">Depozitat</p>
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-lg">Raport</span>
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {formatNumberRO(data.outputs.disposal.sent)} tone
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  {data.outputs.percentages.disposal}% din total TMB
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Trimisă:</span>
                    <span className="text-gray-900 dark:text-white">{formatNumberRO(data.outputs.disposal.sent)} t</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Acceptată:</span>
                    <span className="text-gray-900 dark:text-white">{formatNumberRO(data.outputs.disposal.accepted)} t</span>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={parseFloat(data.outputs.disposal.acceptance_rate)} color="bg-purple-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                    Rata acceptare: {data.outputs.disposal.acceptance_rate}%
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-300">
                <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">Stoc/Diferență</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                  {formatNumberRO(data.summary.stock_difference)} tone
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {((parseFloat(data.summary.stock_difference) / parseFloat(data.summary.total_tmb_input)) * 100).toFixed(2)}% din total TMB
                </p>
              </div>
            </div>

            {/* LINIA 3: DISTRIBUȚIE + TABEL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                  Distribuția pe sectoare
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sectorPieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value) => `${formatNumberRO(value)} tone`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="tratate" name="Tratate" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="depozitate" name="Depozitate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mb-6">
                  Cantități gestionate de operatori
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Operator</th>
                        <th className="pb-3 font-medium text-right">TMB</th>
                        <th className="pb-3 font-medium text-right">Depozitat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.operators && data.operators.slice(0, 6).map((op, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold">
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 text-gray-900 dark:text-white font-medium">{op.name}</td>
                          <td className="py-3 text-right">
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {formatNumberRO(op.tmb_total_tons)} t
                            </div>
                            <div className="text-xs text-gray-500">{op.tmb_percent}%</div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="text-red-600 dark:text-red-400 font-bold">
                              {formatNumberRO(op.landfill_total_tons)} t
                            </div>
                            <div className="text-xs text-gray-500">{op.landfill_percent}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardTmb;