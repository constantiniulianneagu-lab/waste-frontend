// src/components/dashboard/DashboardTmb.jsx
/**
 * ============================================================================
 * DASHBOARD TMB - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * Modern UI with glassmorphism, perfect light/dark mode, and premium gradients
 * 
 * ✅ Ani: Array de 2 ani (2025, 2024)
 * ✅ Filtre: start_date / end_date (nu from/to)
 * ✅ Sectoare: Hardcoded București + Sector 1-6
 * ✅ Default: An curent, startOfYear, today
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle, Factory, Trash2, Package, Activity } from "lucide-react";

import { getTmbStats } from "../../services/dashboardTmbService.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * ============================================================================
 * PROGRESS BAR COMPONENT - MODERN STYLE
 * ============================================================================
 */
const ProgressBar = ({ value, gradient }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
    <div
      className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

const DashboardTmb = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [chartType, setChartType] = useState('bar'); // Pentru "Evoluția cantităților"
  const [chartType2, setChartType2] = useState('bar'); // Pentru "Distribuția pe sectoare"
  const [exporting, setExporting] = useState(false);

  // ========================================================================
  // FILTRE - CONFORM COD VECHI TMB
  // ========================================================================

  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    year: currentYear,
    from: startOfYear,
    to: today,
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
  // SECTOR COLOR THEMES (badge stânga tabel) - aceeași idee ca la Depozitare
  // ========================================================================
  const sectorColorThemes = {
    1: { badge: "bg-gradient-to-br from-blue-500 to-indigo-600" },
    2: { badge: "bg-gradient-to-br from-emerald-500 to-teal-600" },
    3: { badge: "bg-gradient-to-br from-yellow-500 to-orange-600" },
    4: { badge: "bg-gradient-to-br from-red-500 to-rose-600" },
    5: { badge: "bg-gradient-to-br from-purple-500 to-pink-600" },
    6: { badge: "bg-gradient-to-br from-cyan-500 to-blue-600" },
  };

  const getSectorBadgeClass = (sectorNum) => {
    const n = Number(sectorNum);
    return (sectorColorThemes[n] || sectorColorThemes[1]).badge;
  };

  // ========================================================================
  // FETCH DATA
  // ========================================================================

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Fetching TMB dashboard data with filters:", filterParams);

      // Adaptare filtre pentru API TMB
      const tmbFilters = {
        year: filterParams.year?.toString(),
        start_date: filterParams.from,
        end_date: filterParams.to,
      };

      // Adaugă sector_id doar dacă e selectat
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Build query params from current filters
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.from) params.append('start_date', filters.from);
      if (filters.to) params.append('end_date', filters.to);
      if (filters.sector_id) params.append('sector_id', filters.sector_id);

      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const token = localStorage.getItem('wasteAccessToken');
      
      const response = await fetch(
        `${API_URL}/api/dashboard/tmb/export?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport-tmb-${filters.year || 'current'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export error:', error);
      alert('Eroare la generarea raportului PDF. Vă rugăm încercați din nou.');
    } finally {
      setExporting(false);
    }
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
  // ANI - ARRAY DE 2 ANI (CA LA DEPOZITARE)
  // ========================================================================

  const availableYears = data?.available_years || Array.from({ length: 2 }, (_, i) => currentYear - i);
  console.log("📅 Available years from API:", availableYears);

  // ========================================================================
  // SECTOARE - DIN API (nu mai hardcoded)
  // ========================================================================

  const sectors = data?.all_sectors || [
    { sector_id: 1, sector_number: 1, sector_name: "Sector 1" },
    { sector_id: 2, sector_number: 2, sector_name: "Sector 2" },
    { sector_id: 3, sector_number: 3, sector_name: "Sector 3" },
    { sector_id: 4, sector_number: 4, sector_name: "Sector 4" },
    { sector_id: 5, sector_number: 5, sector_name: "Sector 5" },
    { sector_id: 6, sector_number: 6, sector_name: "Sector 6" },
  ];

  console.log("🗺️ Sectors from API:", sectors);

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
  // RENDER CHART WITH MODERN TOOLTIP
  // ========================================================================

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-[16px] p-4 shadow-xl">
          <p className="text-xs font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatNumberRO(entry.value)} tone
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: monthlyChartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    // CYAN/TEAL for "Deșeuri tratate" instead of green
    const CYAN_COLOR = '#014f86'; // cyan-500

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }} />
          <YAxis className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Bar dataKey="Deșeuri tratate" fill={CYAN_COLOR} radius={[8, 8, 0, 0]} />
          <Bar dataKey="Deșeuri depozitate" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      );
    } else if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }} />
          <YAxis className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Line type="monotone" dataKey="Deșeuri tratate" stroke={CYAN_COLOR} strokeWidth={3} dot={{ fill: CYAN_COLOR, r: 4 }} />
          <Line type="monotone" dataKey="Deșeuri depozitate" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
        </LineChart>
      );
    } else {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorTratate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CYAN_COLOR} stopOpacity={0.4} />
              <stop offset="95%" stopColor={CYAN_COLOR} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorDepozitate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }} />
          <YAxis className="text-gray-600 dark:text-gray-400" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Area type="monotone" dataKey="Deșeuri tratate" stroke={CYAN_COLOR} strokeWidth={2} fill="url(#colorTratate)" />
          <Area type="monotone" dataKey="Deșeuri depozitate" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepozitate)" />
        </AreaChart>
      );
    }
  };

  // ========================================================================
  // RENDER CHART 2 - Distribuția pe sectoare (cu switcher Area/Bare/Linie)
  // ========================================================================
  const renderChart2 = () => {
    const commonProps = {
      data: sectorPieData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const CYAN_COLOR = '#0077b6'; // cyan-500 for "Tratate"
    const RED_COLOR = '#ef4444'; // red-500 for "Depozitate"

    if (chartType2 === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }} />
          <YAxis className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="tratate" name="Tratate" fill={CYAN_COLOR} radius={[8, 8, 0, 0]} />
          <Bar dataKey="depozitate" name="Depozitate" fill={RED_COLOR} radius={[8, 8, 0, 0]} />
        </BarChart>
      );
    } else if (chartType2 === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }} />
          <YAxis className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="tratate" name="Tratate" stroke={CYAN_COLOR} strokeWidth={3} dot={{ fill: CYAN_COLOR, r: 4 }} />
          <Line type="monotone" dataKey="depozitate" name="Depozitate" stroke={RED_COLOR} strokeWidth={3} dot={{ fill: RED_COLOR, r: 4 }} />
        </LineChart>
      );
    } else {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorTratate2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CYAN_COLOR} stopOpacity={0.4} />
              <stop offset="95%" stopColor={CYAN_COLOR} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorDepozitate2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={RED_COLOR} stopOpacity={0.4} />
              <stop offset="95%" stopColor={RED_COLOR} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }} />
          <YAxis className="text-gray-600 dark:text-gray-400" style={{ fontSize: '11px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Area type="monotone" dataKey="tratate" name="Tratate" stroke={CYAN_COLOR} strokeWidth={2} fill="url(#colorTratate2)" />
          <Area type="monotone" dataKey="depozitate" name="Depozitate" stroke={RED_COLOR} strokeWidth={2} fill="url(#colorDepozitate2)" />
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
        onExport={handleExport}
        exporting={exporting}
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

              {/* LEFT COLUMN - 3 MODERN CARDS */}
              <div className="space-y-4">
                <StatCard
                  icon={<Trash2 className="w-5 h-5" />}
                  iconGradient="from-emerald-500 to-teal-600"
                  label="Deșeuri total colectate"
                  value={`${formatNumberRO(data.summary.total_collected)} tone`}
                  subtitle="Cod deșeu: 20 03 01"
                  percentage="100% din total"
                  percentageColor="text-emerald-600 dark:text-emerald-400"
                />

                <StatCard
                  icon={<Package className="w-5 h-5" />}
                  iconGradient="from-red-500 to-rose-600"
                  label="Deșeuri depozitate"
                  value={`${formatNumberRO(data.summary.total_landfill_direct)} tone`}
                  subtitle="Cod deșeu: 20 03 01"
                  percentage={`${data.summary.landfill_percent}% din total`}
                  percentageColor="text-red-600 dark:text-red-400"
                />

                <StatCard
                  icon={<Factory className="w-5 h-5" />}
                  iconGradient="from-cyan-500 to-blue-600"
                  label="Trimise la TMB"
                  value={`${formatNumberRO(data.summary.total_tmb_input)} tone`}
                  subtitle="Cod deșeu: 20 03 01"
                  percentage={`${data.summary.tmb_percent}% din total`}
                  percentageColor="text-cyan-600 dark:text-cyan-400"
                />
              </div>

              {/* RIGHT COLUMN - CHART */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Evoluția cantităților de deșeuri
                  </h3>

                  <div className="flex gap-2">
                    {[
                      { type: 'bar', label: 'Bare' },
                      { type: 'line', label: 'Linii' },
                      { type: 'area', label: 'Arie' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${chartType === type
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>

            {/* OUTPUT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <OutputCard
                label="Reciclabile"
                badgeColor="bg-emerald-500"
                value={formatNumberRO(data.outputs.recycling.sent)}
                percentage={`${data.outputs.percentages.recycling}% din total TMB`}
                sent={formatNumberRO(data.outputs.recycling.sent)}
                accepted={formatNumberRO(data.outputs.recycling.accepted)}
                acceptanceRate={data.outputs.recycling.acceptance_rate}
                gradient="from-emerald-500 to-teal-600"
              />

              <OutputCard
                label="Valorificare energetică"
                badgeColor="bg-red-500"
                value={formatNumberRO(data.outputs.recovery.sent)}
                percentage={`${data.outputs.percentages.recovery}% din total TMB`}
                sent={formatNumberRO(data.outputs.recovery.sent)}
                accepted={formatNumberRO(data.outputs.recovery.accepted)}
                acceptanceRate={data.outputs.recovery.acceptance_rate}
                gradient="from-red-500 to-rose-600"
              />

              <OutputCard
                label="Depozitat"
                badgeColor="bg-purple-500"
                value={formatNumberRO(data.outputs.disposal.sent)}
                percentage={`${data.outputs.percentages.disposal}% din total TMB`}
                sent={formatNumberRO(data.outputs.disposal.sent)}
                accepted={formatNumberRO(data.outputs.disposal.accepted)}
                acceptanceRate={data.outputs.disposal.acceptance_rate}
                gradient="from-purple-500 to-violet-600"
              />

              <div className="group relative">
                <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                              rounded-[24px] p-6 border border-gray-200 dark:border-gray-700/50
                              hover:border-amber-300 dark:hover:border-amber-500/50
                              hover:-translate-y-1 hover:shadow-xl
                              transition-all duration-300 overflow-hidden">

                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                                bg-gradient-to-b from-amber-500 to-orange-600
                                group-hover:w-1.5 transition-all duration-300" />

                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600
                                opacity-[0.02] dark:opacity-[0.04]
                                group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                                transition-opacity duration-500" />

                  <div className="relative z-10">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                      Stoc/Diferență
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 
                                bg-clip-text text-transparent mb-2">
                      {formatNumberRO(data.summary.stock_difference)} tone
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((parseFloat(data.summary.stock_difference) / parseFloat(data.summary.total_tmb_input)) * 100).toFixed(2)}% din total TMB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW - CHART + TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* SECTOR DISTRIBUTION CHART */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] 
                            border border-gray-200 dark:border-gray-700/50 p-6 
                            shadow-sm dark:shadow-none">
                
                {/* HEADER cu Switcher */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Distribuția pe sectoare
                  </h3>

                  {/* SWITCHER Area/Bare/Linie */}
                  <div className="flex gap-2">
                    {[
                      { type: 'area', label: 'Area', icon: '📊' },
                      { type: 'bar', label: 'Bare', icon: '📊' },
                      { type: 'line', label: 'Linie', icon: '📈' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setChartType2(type)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 
                                  ${chartType2 === type
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHART */}
                <ResponsiveContainer width="100%" height={350}>
                  {renderChart2()}
                </ResponsiveContainer>

                {/* CARDURI SUB GRAFIC - 4 STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/50">
                  
                  {/* Card 1: TOTAL DEPOZITATE */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 
                                  rounded-[20px] opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative p-4 rounded-[20px] border border-red-200 dark:border-red-500/20
                                  hover:border-red-300 dark:hover:border-red-500/40 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-red-500 to-rose-600 
                                      flex items-center justify-center shadow-md">
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                          Total Depozitate
                        </span>
                      </div>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {formatNumberRO(sectorPieData.reduce((sum, s) => sum + (s.depozitate || 0), 0))}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        tone
                      </p>
                    </div>
                  </div>

                  {/* Card 2: TOTAL TRATATE */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 
                                  rounded-[20px] opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative p-4 rounded-[20px] border border-cyan-200 dark:border-cyan-500/20
                                  hover:border-cyan-300 dark:hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-cyan-500 to-blue-600 
                                      flex items-center justify-center shadow-md">
                          <Factory className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                          Total Tratate
                        </span>
                      </div>
                      <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                        {formatNumberRO(sectorPieData.reduce((sum, s) => sum + (s.tratate || 0), 0))}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        tone
                      </p>
                    </div>
                  </div>

                  {/* Card 3: RATA TRATARE */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 
                                  rounded-[20px] opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative p-4 rounded-[20px] border border-violet-200 dark:border-violet-500/20
                                  hover:border-violet-300 dark:hover:border-violet-500/40 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-violet-500 to-purple-600 
                                      flex items-center justify-center shadow-md">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                          Rată Tratare
                        </span>
                      </div>
                      <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                        {(() => {
                          const totalTratate = sectorPieData.reduce((sum, s) => sum + (s.tratate || 0), 0);
                          const totalDepozitate = sectorPieData.reduce((sum, s) => sum + (s.depozitate || 0), 0);
                          const total = totalTratate + totalDepozitate;
                          return total > 0 ? ((totalTratate / total) * 100).toFixed(1) : '0.0';
                        })()}%
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        din total
                      </p>
                    </div>
                  </div>

                  {/* Card 4: SECTOR LIDER */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 
                                  rounded-[20px] opacity-5 group-hover:opacity-10 transition-opacity" />
                    <div className="relative p-4 rounded-[20px] border border-cyan-200 dark:border-cyan-500/20
                                  hover:border-cyan-300 dark:hover:border-cyan-500/40 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-cyan-500 to-blue-600 
                                      flex items-center justify-center shadow-md">
                          <span className="text-white text-sm font-bold">🏆</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                          Sector Lider
                        </span>
                      </div>
                      <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                        {(() => {
                          const leader = sectorPieData.reduce((max, s) => 
                            (s.tratate || 0) > (max.tratate || 0) ? s : max, 
                            sectorPieData[0] || {}
                          );
                          return leader.name || '-';
                        })()}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        {(() => {
                          const leader = sectorPieData.reduce((max, s) => 
                            (s.tratate || 0) > (max.tratate || 0) ? s : max, 
                            sectorPieData[0] || {}
                          );
                          return formatNumberRO(leader.tratate || 0) + ' t';
                        })()}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* OPERATORS TABLE */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] 
                            border border-gray-200 dark:border-gray-700/50 p-6 
                            shadow-sm dark:shadow-none">
                <h3 className="text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 
                            bg-clip-text text-transparent mb-6">
                  Cantități gestionate de operatori
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                        <th className="pb-3 font-bold uppercase tracking-wider">Sector</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Operator</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">TMB</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Depozitat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.operators && data.operators.slice(0, 6).map((op, idx) => {
                        const sectorNum = Array.isArray(op.sector_numbers) && op.sector_numbers.length
                          ? op.sector_numbers[0]
                          : null;

                        const badgeClass = getSectorBadgeClass(sectorNum || 1);
                        const tooltip = Array.isArray(op.sector_numbers) && op.sector_numbers.length
                          ? `Sectoare: ${op.sector_numbers.join(", ")}`
                          : '';

                        return (
                          <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all">
                            <td className="py-4">
                              <div
                                className={`w-8 h-8 rounded-[12px] ${badgeClass}
                                          flex items-center justify-center text-white text-xs font-bold
                                          shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}
                                title={tooltip}
                              >
                                {sectorNum ?? "-"}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="text-gray-900 dark:text-white font-medium">
                                {op.name}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {formatNumberRO(op.tmb_total_tons)} t
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {op.tmb_percent}%
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div className="text-red-600 dark:text-red-400 font-bold">
                                {formatNumberRO(op.landfill_total_tons)} t
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {op.landfill_percent}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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

/**
 * ============================================================================
 * STAT CARD - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 */
const StatCard = ({ icon, iconGradient, label, value, subtitle, percentage, percentageColor }) => (
  <div className="group relative">
    <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                  rounded-[24px] p-5 border border-gray-200 dark:border-gray-700/50
                  hover:border-gray-300 dark:hover:border-gray-600
                  hover:-translate-y-1 hover:shadow-xl
                  transition-all duration-300 overflow-hidden">

      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                    bg-gradient-to-b ${iconGradient}
                    group-hover:w-1.5 transition-all duration-300`} />

      <div className={`absolute inset-0 bg-gradient-to-br ${iconGradient}
                    opacity-[0.02] dark:opacity-[0.04]
                    group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                    transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-[14px] bg-gradient-to-br ${iconGradient}
                        flex items-center justify-center text-white shadow-lg
                        group-hover:scale-110 group-hover:rotate-3 transition-all`}>
            {icon}
          </div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
        </div>

        <p className={`text-2xl font-bold bg-gradient-to-r ${iconGradient} 
                    bg-clip-text text-transparent mb-1`}>
          {value}
        </p>

        <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-2">
          {subtitle}
        </p>

        <p className={`text-xs font-bold ${percentageColor}`}>
          {percentage}
        </p>
      </div>

      <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full
                    bg-gradient-to-br ${iconGradient}
                    opacity-40 dark:opacity-60 animate-pulse`} />
    </div>
  </div>
);

/**
 * ============================================================================
 * OUTPUT CARD - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 */
const OutputCard = ({ label, badgeColor, value, percentage, sent, accepted, acceptanceRate, gradient }) => (
  <div className="group relative">
    <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                  rounded-[24px] p-6 border border-gray-200 dark:border-gray-700/50
                  hover:border-gray-300 dark:hover:border-gray-600
                  hover:-translate-y-1 hover:shadow-xl
                  transition-all duration-300 overflow-hidden">

      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                    bg-gradient-to-b ${gradient}
                    group-hover:w-1.5 transition-all duration-300`} />

      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}
                    opacity-[0.02] dark:opacity-[0.04]
                    group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                    transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {label}
          </p>
          <span className={`px-3 py-1.5 ${badgeColor} text-white text-[10px] font-bold rounded-[10px] shadow-lg
                        group-hover:scale-110 transition-all`}>
            Raport
          </span>
        </div>

        <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} 
                    bg-clip-text text-transparent mb-2`}>
          {value} tone
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {percentage}
        </p>

        <div className="space-y-2 text-xs mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Trimisă:</span>
            <span className="font-bold text-gray-900 dark:text-white">{sent} t</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Acceptată:</span>
            <span className="font-bold text-gray-900 dark:text-white">{accepted} t</span>
          </div>
        </div>

        <div>
          <ProgressBar value={parseFloat(acceptanceRate)} gradient={gradient} />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Rata acceptare: {acceptanceRate}%
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardTmb;