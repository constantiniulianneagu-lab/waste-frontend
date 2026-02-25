// src/components/dashboard/DashboardTmb.jsx
/**
 * ============================================================================
 * DASHBOARD TMB - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * Redesigned to match DashboardLandfill structure & design language
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Factory, Trash2, Package, Activity, TrendingUp, TrendingDown, Recycle, Zap, BarChart3 } from "lucide-react";

import { getTmbStats } from "../../services/dashboardTmbService.js";
import { exportTmbPDF } from "../../utils/exportTmbPDF.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";
import { useToast } from '../../contexts/ToastContext';

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// ============================================================================
// PROGRESS BAR
// ============================================================================
const ProgressBar = ({ value, gradient }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden">
    <div
      className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }}
    />
  </div>
);

// ============================================================================
// SUMMARY CARD — identic cu Depozitare
// ============================================================================
const SummaryCard = ({ title, value, subtitle, gradient, icon, highlighted = false, showProgressBar = false, percentage = 0 }) => (
  <div className="group relative h-full">
    {highlighted && (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20
                      dark:from-cyan-500/15 dark:to-blue-500/15
                      rounded-[24px] blur-md" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10
                      dark:from-cyan-500/10 dark:to-blue-500/10
                      rounded-[24px]" />
      </>
    )}
    <div className={`relative h-full
                  bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  ${highlighted
                    ? 'border-2 border-cyan-400/60 dark:border-cyan-500/50'
                    : 'border border-gray-200 dark:border-gray-700/50'}
                  rounded-[24px] p-5
                  shadow-sm dark:shadow-none
                  hover:shadow-lg dark:hover:shadow-xl
                  ${highlighted
                    ? 'hover:border-cyan-500/80 dark:hover:border-cyan-400/70'
                    : 'hover:border-gray-300 dark:hover:border-gray-600'}
                  hover:-translate-y-1
                  transition-all duration-300 ease-out
                  overflow-hidden flex flex-col justify-between`}>

      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase leading-tight">
            {title}
          </p>
          <div className={`w-11 h-11 rounded-[14px] bg-gradient-to-br ${gradient}
                        flex items-center justify-center flex-shrink-0
                        shadow-md group-hover:scale-110 transition-all duration-300`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <p className={`${highlighted ? 'text-3xl' : 'text-2xl'} font-black
                      text-gray-900 dark:text-white leading-none
                      group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
        </div>

        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-2">
          {subtitle}
        </p>

        {showProgressBar && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-end">
              <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {percentage}%
              </span>
            </div>
            <ProgressBar value={parseFloat(percentage)} gradient={gradient} />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent
                    pointer-events-none rounded-[24px]" />
    </div>
  </div>
);

// ============================================================================
// OUTPUT CARD — redesigned compact
// ============================================================================
const OutputCard = ({ label, icon, value, percentage, percentageValue, sent, accepted, acceptanceRate, gradient, badgeColor, onReportClick }) => (
  <div className="group relative">
    <div className={`relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  rounded-[24px] p-5 border border-gray-200 dark:border-gray-700/50
                  hover:border-gray-300 dark:hover:border-gray-600
                  hover:-translate-y-1 hover:shadow-xl
                  transition-all duration-300 overflow-hidden`}>

      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                    bg-gradient-to-b ${gradient}
                    group-hover:w-1.5 transition-all duration-300`} />

      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}
                    opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.06]
                    transition-opacity duration-500`} />

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-[12px] bg-gradient-to-br ${gradient}
                          flex items-center justify-center shadow-md`}>
              {icon}
            </div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {label}
            </p>
          </div>
          <button
            onClick={onReportClick}
            className={`px-2.5 py-1 ${badgeColor} text-white text-[10px] font-bold rounded-[8px]
                      hover:scale-105 active:scale-95 transition-all shadow-sm`}
          >
            Detalii →
          </button>
        </div>

        {/* Value */}
        <p className={`text-2xl font-black bg-gradient-to-r ${gradient}
                    bg-clip-text text-transparent mb-1`}>
          {value}
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">t</span>
        </p>

        {/* Procent din total TMB + progress bar imediat sub */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{percentage}</p>
        <ProgressBar value={parseFloat(percentageValue)} gradient={gradient} />

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-3 mb-3">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-2">
            <p className="text-gray-500 dark:text-gray-400 mb-0.5">Trimisă</p>
            <p className="font-bold text-gray-900 dark:text-white">{sent} t</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-2">
            <p className="text-gray-500 dark:text-gray-400 mb-0.5">Acceptată</p>
            <p className="font-bold text-gray-900 dark:text-white">{accepted} t</p>
          </div>
        </div>

        {/* Rată acceptare — fără progress bar, doar text */}
        <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Rată acceptare: <span className="font-semibold ml-0.5">{acceptanceRate}%</span>
        </p>
      </div>
    </div>
  </div>
);

// ============================================================================
// CHART SWITCHER BUTTON GROUP
// ============================================================================
const ChartSwitcher = ({ value, onChange, options, colorActive = "from-cyan-500 to-blue-600" }) => (
  <div className="flex gap-1.5">
    {options.map(({ type, label }) => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300
          ${value === type
            ? `bg-gradient-to-r ${colorActive} text-white shadow-md scale-105`
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
      >
        {label}
      </button>
    ))}
  </div>
);

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================
const CustomTooltip = ({ active, payload, label, formatFn }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                    border border-gray-200 dark:border-gray-700/50
                    rounded-[16px] px-4 py-3 shadow-xl min-w-[200px]">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="space-y-1.5">
        {[...payload].sort((a,b) => (b.value||0)-(a.value||0)).map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{p.name}</span>
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {formatFn ? formatFn(p.value) : p.value}{' '}
              <span className="font-medium text-gray-500">t</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const DashboardTmb = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [chartType2, setChartType2] = useState('bar');

  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    year: currentYear,
    from: `${currentYear}-01-01`,
    to: new Date().toISOString().split('T')[0],
    sector_id: null,
  });

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const [intPart, decPart] = num.toFixed(2).split('.');
    return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decPart}`;
  };

  const sectorColorThemes = {
    1: { badge: "bg-gradient-to-br from-violet-500 to-purple-600" },
    2: { badge: "bg-gradient-to-br from-slate-400 to-gray-500" },
    3: { badge: "bg-gradient-to-br from-emerald-500 to-teal-600" },
    4: { badge: "bg-gradient-to-br from-amber-500 to-orange-600" },
    5: { badge: "bg-gradient-to-br from-pink-500 to-rose-600" },
    6: { badge: "bg-gradient-to-br from-cyan-500 to-blue-600" },
  };

  // ========================================================================
  // FETCH
  // ========================================================================
  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);
      const tmbFilters = {
        year: filterParams.year?.toString(),
        start_date: filterParams.from,
        end_date: filterParams.to,
      };
      if (filterParams.sector_id && filterParams.sector_id >= 1 && filterParams.sector_id <= 6) {
        tmbFilters.sector_id = filterParams.sector_id.toString();
      }
      const res = await getTmbStats(tmbFilters);
      if (!res) throw new Error("Empty response from API");
      if (typeof res === "object" && "success" in res) {
        if (!res.success) throw new Error(res.message || "API error");
        setData(res.data);
      } else {
        setData(res);
      }
    } catch (err) {
      setError(err.message || "Failed to load TMB dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleExport = () => {
    try {
      setExporting(true);
      exportTmbPDF(data, filters);
    } catch (err) {
      toast.error('Eroare export PDF', 'Vă rugăm încercați din nou.');
    } finally {
      setExporting(false);
    }
  };

  // ========================================================================
  // LOADING
  // ========================================================================
  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader onSearchChange={setSearchQuery} title="Dashboard Tratarea mecano-biologică" />
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 73px)" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Se încarcă datele...</p>
        </div>
      </div>
    </div>
  );

  // ========================================================================
  // ERROR
  // ========================================================================
  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader onSearchChange={setSearchQuery} title="Dashboard Tratarea mecano-biologică" />
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-red-900 dark:text-red-100 mb-2">Eroare la încărcarea datelor</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button onClick={() => fetchDashboardData()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all">
                Încearcă din nou
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!data) return null;

  const availableYears = data?.available_years || [currentYear, currentYear - 1];
  const sectors = data?.all_sectors || Array.from({ length: 6 }, (_, i) => ({
    sector_id: i + 1, sector_number: i + 1, sector_name: `Sector ${i + 1}`
  }));

  // Chart data
  const MONTHS_RO = {
    Jan: 'Ian', Feb: 'Feb', Mar: 'Mar', Apr: 'Apr', May: 'Mai', Jun: 'Iun',
    Jul: 'Iul', Aug: 'Aug', Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Dec',
  };

  const monthlyChartData = (data?.monthly_evolution || []).map(item => ({
    month: MONTHS_RO[item.month] || item.month,
    'Deșeuri tratate': parseFloat(item.tmb_total) || 0,
    'Deșeuri depozitate': parseFloat(item.landfill_total) || 0,
  }));

  const sectorChartData = (data?.sector_distribution || []).map(item => ({
    name: item.sector_name,
    tratate: parseFloat(item.tmb_tons) || 0,
    depozitate: parseFloat(item.landfill_tons) || 0,
  }));

  const CYAN  = '#06b6d4';
  const RED  = '#ef4444';

  const chartOptions = [
    { type: 'bar',  label: 'Bare'  },
    { type: 'line', label: 'Linie' },
    { type: 'area', label: 'Area'  },
  ];

  const renderEvolutionChart = () => {
    const common = { data: monthlyChartData, margin: { top: 5, right: 20, left: 10, bottom: 5 } };
    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor"
          className="text-gray-200 dark:text-gray-700/50" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false}
          tick={{ fill: "currentColor", fontSize: 11, fontWeight: 500 }}
          className="text-gray-600 dark:text-gray-400" />
        <YAxis tickLine={false} axisLine={false}
          tick={{ fill: "currentColor", fontSize: 11, fontWeight: 500 }}
          className="text-gray-600 dark:text-gray-400"
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<CustomTooltip formatFn={formatNumberRO} />} cursor={{ opacity: 0.05 }} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
      </>
    );
    if (chartType === 'bar') return (
      <BarChart {...common} barCategoryGap="30%">
        {axes}
        <Bar dataKey="Deșeuri tratate" fill={CYAN} radius={[6,6,0,0]} />
        <Bar dataKey="Deșeuri depozitate" fill={RED} radius={[6,6,0,0]} />
      </BarChart>
    );
    if (chartType === 'line') return (
      <LineChart {...common}>
        {axes}
        <Line type="monotone" dataKey="Deșeuri tratate" stroke={CYAN} strokeWidth={2.5}
          dot={{ r: 3, fill: CYAN, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
        <Line type="monotone" dataKey="Deșeuri depozitate" stroke={RED} strokeWidth={2.5}
          dot={{ r: 3, fill: RED, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <defs>
          <linearGradient id="gradTratate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CYAN} stopOpacity={0.4} />
            <stop offset="95%" stopColor={CYAN} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradDepozitate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={RED} stopOpacity={0.4} />
            <stop offset="95%" stopColor={RED} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {axes}
        <Area type="monotone" dataKey="Deșeuri tratate" stroke={CYAN} strokeWidth={2} fill="url(#gradTratate)" />
        <Area type="monotone" dataKey="Deșeuri depozitate" stroke={RED} strokeWidth={2} fill="url(#gradDepozitate)" />
      </AreaChart>
    );
  };

  const INDIGO = '#10b981'; // emerald
  const AMBER  = '#f43f5e'; // rose

  const renderSectorChart = () => {
    const common = { data: sectorChartData, margin: { top: 5, right: 20, left: 10, bottom: 5 } };
    const axes = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor"
          className="text-gray-200 dark:text-gray-700/50" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false}
          tick={{ fill: "currentColor", fontSize: 11, fontWeight: 500 }}
          className="text-gray-600 dark:text-gray-400" />
        <YAxis tickLine={false} axisLine={false}
          tick={{ fill: "currentColor", fontSize: 11, fontWeight: 500 }}
          className="text-gray-600 dark:text-gray-400"
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<CustomTooltip formatFn={formatNumberRO} />} cursor={{ opacity: 0.05 }} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
      </>
    );
    if (chartType2 === 'bar') return (
      <BarChart {...common} barCategoryGap="30%">
        {axes}
        <Bar dataKey="tratate" name="Tratate" fill={INDIGO} radius={[6,6,0,0]} />
        <Bar dataKey="depozitate" name="Depozitate" fill={AMBER} radius={[6,6,0,0]} />
      </BarChart>
    );
    if (chartType2 === 'line') return (
      <LineChart {...common}>
        {axes}
        <Line type="monotone" dataKey="tratate" name="Tratate" stroke={INDIGO} strokeWidth={2.5}
          dot={{ r: 3, fill: INDIGO, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
        <Line type="monotone" dataKey="depozitate" name="Depozitate" stroke={AMBER} strokeWidth={2.5}
          dot={{ r: 3, fill: AMBER, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <defs>
          <linearGradient id="gradTratate2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={INDIGO} stopOpacity={0.4} />
            <stop offset="95%" stopColor={INDIGO} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradDepozitate2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={AMBER} stopOpacity={0.4} />
            <stop offset="95%" stopColor={AMBER} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {axes}
        <Area type="monotone" dataKey="tratate" name="Tratate" stroke={INDIGO} strokeWidth={2} fill="url(#gradTratate2)" />
        <Area type="monotone" dataKey="depozitate" name="Depozitate" stroke={AMBER} strokeWidth={2} fill="url(#gradDepozitate2)" />
      </AreaChart>
    );
  };

  // ========================================================================
  // RENDER MAIN
  // ========================================================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <DashboardHeader
        onSearchChange={setSearchQuery}
        onExport={handleExport}
        exporting={exporting}
        title="Dashboard Tratarea mecano-biologică"
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nu există date pentru perioada selectată</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Încearcă să selectezi o perioadă diferită.</p>
          </div>
        ) : (
          <>
            {/* ================================================================
                RÂD 1: SUMMARY CARDS (stânga) + GRAFIC EVOLUTIE (dreapta)
            ================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

              {/* STÂNGA: 3 carduri stacked — 4 coloane */}
              <div className="lg:col-span-4 flex flex-col gap-4">

                {/* CARD 1 — Total Colectat */}
                <div className="group relative flex-1">
                  <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl
                                border-2 border-cyan-400/60 dark:border-cyan-500/50
                                rounded-[24px] p-5 overflow-hidden flex flex-col justify-between
                                hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">

                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10
                                  dark:from-cyan-500/10 dark:to-blue-500/10 rounded-[24px]" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                          Total Colectat
                        </p>
                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-cyan-500 to-blue-600
                                      flex items-center justify-center shadow-md text-lg">
                          🏭
                        </div>
                      </div>

                      <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {formatNumberRO(data.summary.total_collected)}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">tone deșeuri colectate</p>

                      {/* Cod deșeu */}
                      <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20
                                    border border-cyan-200 dark:border-cyan-500/20
                                    rounded-xl px-3 py-2">
                        <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">
                          Cod
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">20 03 01</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                          — Deșeuri municipale amestecate
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2 — Depozitate Direct */}
                <div className="group relative flex-1">
                  <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl
                                border border-gray-200 dark:border-gray-700/50
                                rounded-[24px] p-5 overflow-hidden flex flex-col justify-between
                                hover:border-red-300 dark:hover:border-red-500/40
                                hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">

                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                                  bg-gradient-to-b from-red-500 to-rose-600
                                  group-hover:w-1.5 transition-all duration-300" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                          Depozitate Direct
                        </p>
                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-red-500 to-rose-600
                                      flex items-center justify-center shadow-md text-lg">
                          🗑️
                        </div>
                      </div>

                      <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {formatNumberRO(data.summary.total_landfill_direct)}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">tone fără tratare prealabilă</p>

                      {/* % + progress bar */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">% din total colectat</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {data.summary.landfill_percent}%
                        </span>
                      </div>
                      <ProgressBar value={parseFloat(data.summary.landfill_percent)} gradient="from-red-500 to-rose-600" />
                    </div>
                  </div>
                </div>

                {/* CARD 3 — Trimise la TMB */}
                <div className="group relative flex-1">
                  <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl
                                border border-gray-200 dark:border-gray-700/50
                                rounded-[24px] p-5 overflow-hidden flex flex-col justify-between
                                hover:border-teal-300 dark:hover:border-teal-500/40
                                hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">

                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                                  bg-gradient-to-b from-teal-500 to-cyan-600
                                  group-hover:w-1.5 transition-all duration-300" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-600
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                          Trimise la TMB
                        </p>
                        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-teal-500 to-cyan-600
                                      flex items-center justify-center shadow-md text-lg">
                          ⚙️
                        </div>
                      </div>

                      <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                        {formatNumberRO(data.summary.total_tmb_input)}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">tone intrate în instalație TMB</p>

                      {/* % + progress bar */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">% din total colectat</span>
                        <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                          {data.summary.tmb_percent}%
                        </span>
                      </div>
                      <ProgressBar value={parseFloat(data.summary.tmb_percent)} gradient="from-teal-500 to-cyan-600" />
                    </div>
                  </div>
                </div>

              </div>

              {/* DREAPTA: Grafic evoluție lunară — 8 coloane */}
              <div className="lg:col-span-8 bg-white dark:bg-gray-800/50 backdrop-blur-xl
                            rounded-[28px] border border-gray-200 dark:border-gray-700/50
                            p-6 shadow-sm dark:shadow-none flex flex-col">

                <div className="flex items-center justify-between mb-5 flex-shrink-0">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Evoluția lunară a cantităților
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Tratate vs. Depozitate direct · {filters.year}
                    </p>
                  </div>
                  <ChartSwitcher
                    value={chartType}
                    onChange={setChartType}
                    options={chartOptions}
                    colorActive="from-cyan-500 to-blue-600"
                  />
                </div>

                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderEvolutionChart()}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ================================================================
                RÂD 2: 4 OUTPUT CARDS
            ================================================================ */}
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Rezultatele procesului de tratare mecano-biologică (TMB)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <OutputCard
                label="Reciclabile"
                icon={<Recycle className="w-4 h-4 text-white" />}
                value={formatNumberRO(data.outputs.recycling.sent)}
                percentage={`${data.outputs.percentages.recycling}% din total TMB`}
                percentageValue={data.outputs.percentages.recycling}
                sent={formatNumberRO(data.outputs.recycling.sent)}
                accepted={formatNumberRO(data.outputs.recycling.accepted)}
                acceptanceRate={data.outputs.recycling.acceptance_rate}
                gradient="from-emerald-500 to-teal-600"
                badgeColor="bg-emerald-500"
                onReportClick={() => navigate('/reports/tmb?view=recycling')}
              />
              <OutputCard
                label="Valorificare energetică"
                icon={<Zap className="w-4 h-4 text-white" />}
                value={formatNumberRO(data.outputs.recovery.sent)}
                percentage={`${data.outputs.percentages.recovery}% din total TMB`}
                percentageValue={data.outputs.percentages.recovery}
                sent={formatNumberRO(data.outputs.recovery.sent)}
                accepted={formatNumberRO(data.outputs.recovery.accepted)}
                acceptanceRate={data.outputs.recovery.acceptance_rate}
                gradient="from-orange-500 to-red-600"
                badgeColor="bg-orange-500"
                onReportClick={() => navigate('/reports/tmb?view=recovery')}
              />
              <OutputCard
                label="Depozitat"
                icon={<Package className="w-4 h-4 text-white" />}
                value={formatNumberRO(data.outputs.disposal.sent)}
                percentage={`${data.outputs.percentages.disposal}% din total TMB`}
                percentageValue={data.outputs.percentages.disposal}
                sent={formatNumberRO(data.outputs.disposal.sent)}
                accepted={formatNumberRO(data.outputs.disposal.accepted)}
                acceptanceRate={data.outputs.disposal.acceptance_rate}
                gradient="from-purple-500 to-violet-600"
                badgeColor="bg-purple-500"
                onReportClick={() => navigate('/reports/tmb?view=disposal')}
              />
              {/* Card stoc */}
              <div className="group relative">
                <div className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl
                              rounded-[24px] p-5 border border-gray-200 dark:border-gray-700/50
                              hover:border-gray-300 dark:hover:border-gray-600
                              hover:-translate-y-1 hover:shadow-xl
                              transition-all duration-300 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                                bg-gradient-to-b from-amber-500 to-orange-600
                                group-hover:w-1.5 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600
                                opacity-[0.02] dark:opacity-[0.04] group-hover:opacity-[0.06]
                                transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-amber-500 to-orange-600
                                    flex items-center justify-center shadow-md">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Stoc / Diferență
                      </p>
                    </div>
                    <p className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-600
                                bg-clip-text text-transparent mb-1">
                      {formatNumberRO(data.summary.stock_difference)}
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">t</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {((parseFloat(data.summary.stock_difference) / parseFloat(data.summary.total_tmb_input)) * 100).toFixed(2)}% din total TMB
                    </p>
                    <ProgressBar
                      value={((parseFloat(data.summary.stock_difference) / parseFloat(data.summary.total_tmb_input)) * 100)}
                      gradient="from-amber-500 to-orange-600"
                    />
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* ================================================================
                RÂD 3: GRAFIC SECTOARE (stânga) + TABEL OPERATORI (dreapta)
            ================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* GRAFIC DISTRIBUȚIE SECTOARE */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                            rounded-[28px] border border-gray-200 dark:border-gray-700/50
                            p-6 shadow-sm dark:shadow-none flex flex-col">

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      Distribuția pe sectoare
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      Tratate vs. Depozitate per sector
                    </p>
                  </div>
                  <ChartSwitcher
                    value={chartType2}
                    onChange={setChartType2}
                    options={chartOptions}
                    colorActive="from-cyan-500 to-blue-600"
                  />
                </div>

                <div className="flex-1" style={{minHeight: 0}}>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderSectorChart()}
                  </ResponsiveContainer>
                </div>

              </div>

              {/* OPERATORI — tabel compact grupat pe sector, un singur tabel cu thead sticky */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                            rounded-[28px] border border-gray-200 dark:border-gray-700/50
                            p-6 shadow-sm dark:shadow-none flex flex-col">

                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Cantități gestionate de operatori
                </h3>

                {(() => {
                  const operators = data.operators || [];
                  const totalTmb = operators.reduce((s, op) => s + (parseFloat(op.tmb_total_tons) || 0), 0);
                  const totalLandfill = operators.reduce((s, op) => s + (parseFloat(op.landfill_total_tons) || 0), 0);

                  const grouped = {};
                  operators.forEach(op => {
                    const sNum = Array.isArray(op.sector_numbers) && op.sector_numbers.length
                      ? op.sector_numbers[0] : 0;
                    if (!grouped[sNum]) grouped[sNum] = [];
                    grouped[sNum].push(op);
                  });

                  const pct = (val, total) => total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';

                  return (
                    <div className="flex flex-col min-h-0">
                      {/* SCROLL WRAPPER — un singur tabel, thead sticky */}
                      <div className="overflow-y-auto max-h-[360px] pr-1
                                      scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                                      scrollbar-track-transparent">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col className="w-8" />
                            <col />
                            <col className="w-[115px]" />
                            <col className="w-[115px]" />
                          </colgroup>

                          <thead className="sticky top-0 z-10 bg-white dark:bg-gray-800">
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="pb-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                              <th className="pb-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operator</th>
                              <th className="pb-2 text-right text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">TMB</th>
                              <th className="pb-2 text-right text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">Depozitat</th>
                            </tr>
                          </thead>

                          <tbody>
                            {Object.keys(grouped).map(Number).sort((a, b) => a - b).flatMap(sNum => {
                              const ops = grouped[sNum];
                              const badge = (sectorColorThemes[sNum] || sectorColorThemes[1]).badge;
                              const sectorTmb      = ops.reduce((s, op) => s + (parseFloat(op.tmb_total_tons) || 0), 0);
                              const sectorLandfill = ops.reduce((s, op) => s + (parseFloat(op.landfill_total_tons) || 0), 0);

                              return [
                                // ── HEADER SECTOR ──
                                <tr key={`s-${sNum}`} className="bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700/50">
                                  <td className="py-1.5">
                                    <div className={`w-6 h-6 rounded-[8px] ${badge} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                                      {sNum}
                                    </div>
                                  </td>
                                  <td className="py-1.5">
                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                      Sector {sNum}
                                      <span className="normal-case font-normal ml-1 text-gray-400 dark:text-gray-500">· {ops.length} op.</span>
                                    </span>
                                  </td>
                                  <td className="py-1.5 text-right">
                                    <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">{formatNumberRO(sectorTmb)} t</span>
                                  </td>
                                  <td className="py-1.5 text-right">
                                    <span className="text-[11px] font-bold text-red-500 dark:text-red-400">{formatNumberRO(sectorLandfill)} t</span>
                                  </td>
                                </tr>,

                                // ── OPERATORI ──
                                ...ops.map((op, i) => (
                                  <tr key={`op-${sNum}-${i}`}
                                    className="border-t border-gray-100 dark:border-gray-700/30
                                              hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="py-1.5">
                                      <div className="flex justify-center">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${badge} opacity-50`} />
                                      </div>
                                    </td>
                                    <td className="py-1.5 pr-2">
                                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate block">
                                        {op.name}
                                      </span>
                                    </td>
                                    <td className="py-1.5 text-right">
                                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{formatNumberRO(op.tmb_total_tons)} t</span>
                                      <span className="block text-[9px] text-gray-400">{pct(parseFloat(op.tmb_total_tons)||0, sectorTmb)}%</span>
                                    </td>
                                    <td className="py-1.5 text-right">
                                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{formatNumberRO(op.landfill_total_tons)} t</span>
                                      <span className="block text-[9px] text-gray-400">{pct(parseFloat(op.landfill_total_tons)||0, sectorLandfill)}%</span>
                                    </td>
                                  </tr>
                                )),
                              ];
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* TOTAL — fix sub scroll */}
                      <div className="border-t-2 border-gray-200 dark:border-gray-600 mt-2 pt-2">
                        <table className="w-full table-fixed">
                          <colgroup>
                            <col className="w-8" />
                            <col />
                            <col className="w-[115px]" />
                            <col className="w-[115px]" />
                          </colgroup>
                          <tbody>
                            <tr>
                              <td>
                                <div className="w-6 h-6 rounded-[8px] bg-gradient-to-br from-indigo-500 to-purple-600
                                              flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                  Σ
                                </div>
                              </td>
                              <td>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">Total general</span>
                              </td>
                              <td className="text-right">
                                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{formatNumberRO(totalTmb)} t</span>
                                <span className="block text-[9px] text-gray-400">{pct(totalTmb, totalTmb + totalLandfill)}% din total</span>
                              </td>
                              <td className="text-right">
                                <span className="text-xs font-bold text-red-500 dark:text-red-400">{formatNumberRO(totalLandfill)} t</span>
                                <span className="block text-[9px] text-gray-400">{pct(totalLandfill, totalTmb + totalLandfill)}% din total</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardTmb;