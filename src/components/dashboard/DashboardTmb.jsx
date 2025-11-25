/**
 * ============================================================================
 * DASHBOARD TMB - TRATAREA MECANO-BIOLOGICĂ A DEȘEURILOR
 * ============================================================================
 * 
 * Full-width dashboard for TMB operations with premium dark mode
 * Matches DashboardLandfill styling exactly
 * 
 * Features:
 * - Collection metrics (Total, Landfill Direct, TMB Net)
 * - Output streams (Recycling, Recovery, Disposal, Stock)
 * - Monthly evolution chart
 * - Sector distribution
 * - Top operators table (scrollable)
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, FileText, Recycle, Zap, Trash2, Package } from 'lucide-react';

import { getTmbStats } from '../../services/dashboardTmbService.js';
import { getTodayDate, getYearStart } from '../../utils/dashboardUtils.js';

import DashboardFilters from './DashboardFilters.jsx';
import WasteCategoryCards from './WasteCategoryCards.jsx';
import MonthlyEvolutionChart from './MonthlyEvolutionChart.jsx';
import SectorStatsTable from './SectorStatsTable.jsx';
import TopOperatorsTable from './TopOperatorsTable.jsx';

const DashboardTmb = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: null,
  });

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching TMB dashboard data with filters:', filterParams);

      const res = await getTmbStats({
        start_date: filterParams.from,
        end_date: filterParams.to,
        sector_id: filterParams.sector_id,
      });

      console.log('✅ TMB API response:', res);

      if (!res) {
        throw new Error('Empty response from API');
      }

      if (typeof res === 'object' && 'success' in res) {
        if (!res.success) {
          throw new Error(res.message || 'API responded with success=false');
        }
        console.log('✅ Using res.data for TMB dashboard:', res.data);
        setData(res.data);
      } else {
        console.log('⚠️ Using response as data directly');
        setData(res);
      }
    } catch (err) {
      console.error('❌ TMB Dashboard fetch error:', err);
      setError(err.message || 'Failed to load TMB dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters) => {
    console.log('🔄 TMB Filter change requested:', newFilters);
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleRefresh = () => {
    console.log('🔄 TMB Manual refresh with current filters:', filters);
    fetchDashboardData(filters);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1419]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Se încarcă datele TMB...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-[#0f1419]">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-lg dark:border-red-900/50 dark:bg-[#1a1f2e]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eroare la încărcarea datelor
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dashboard TMB
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Reîncearcă
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PREPARE DATA FOR COMPONENTS
  // ============================================================================

  // Main collection cards (left column)
  const collectionCards = [
    {
      title: 'Deșeuri total colectate',
      value: data?.total_collected || 0,
      subtitle: 'Cod deșeuri: 20 03 01',
      percentage: 100,
      percentageText: '100% din total',
      color: 'green',
      icon: FileText,
    },
    {
      title: 'Deșeuri depozitate',
      value: data?.total_landfill_direct || 0,
      subtitle: 'Cod deșeuri: 20 03 01',
      percentage: data?.total_collected > 0 
        ? ((data.total_landfill_direct / data.total_collected) * 100).toFixed(2)
        : 0,
      percentageText: 'din total deșeuri colectate',
      color: 'red',
      icon: Trash2,
    },
    {
      title: 'Deșeuri trimise la TMB',
      value: data?.tmb_net || 0,
      subtitle: 'Cod deșeuri: 20 03 01',
      percentage: data?.total_collected > 0
        ? ((data.tmb_net / data.total_collected) * 100).toFixed(2)
        : 0,
      percentageText: 'din total deșeuri colectate',
      color: 'cyan',
      icon: Package,
      showReport: true,
    },
  ];

  // Output cards (bottom row)
  const outputCards = [
    {
      title: 'Reciclabil',
      sent: data?.recycling?.sent || 0,
      accepted: data?.recycling?.accepted || 0,
      acceptanceRate: data?.recycling?.acceptance_rate || 0,
      percentOfTmb: data?.recycling?.percent_of_tmb || 0,
      color: 'green',
      icon: Recycle,
    },
    {
      title: 'Valorificare energetică',
      sent: data?.recovery?.sent || 0,
      accepted: data?.recovery?.accepted || 0,
      acceptanceRate: data?.recovery?.acceptance_rate || 0,
      percentOfTmb: data?.recovery?.percent_of_tmb || 0,
      color: 'red',
      icon: Zap,
    },
    {
      title: 'Depozitat',
      sent: data?.disposal?.sent || 0,
      accepted: data?.disposal?.accepted || 0,
      acceptanceRate: data?.disposal?.acceptance_rate || 0,
      percentOfTmb: data?.disposal?.percent_of_tmb || 0,
      color: 'purple',
      icon: Trash2,
    },
    {
      title: 'Stoc/Diferență',
      value: data?.stock_difference || 0,
      subtitle: 'Diferența dintre cantitățile acceptate la TMB și cele trimise către fluxurile de output',
      percentOfTmb: data?.stock_percent || 0,
      color: 'orange',
      icon: Package,
      isStock: true,
    },
  ];

  // Chart data (monthly evolution)
  const chartData = data?.monthly_evolution || [];

  // Sector stats
  const sectorStats = data?.sector_stats || [];

  // Top operators
  const topOperators = data?.top_operators || [];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-[#0f1419]">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard - Tratarea mecano-biologică a deșeurilor
        </h1>
      </div>

      {/* FILTERS */}
      <DashboardFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      {/* MAIN GRID */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - Collection Cards */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          {collectionCards.map((card, idx) => (
            <CollectionCard key={idx} {...card} />
          ))}
        </div>

        {/* CENTER COLUMN - Evolution Chart */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Evoluția cantităților de deșeuri colectate în amestec și trimise la tratare mecano-biologică vs la depozitare
              </h2>
            </div>
            
            <MonthlyEvolutionChart 
              data={chartData}
              dataKeys={[
                { key: 'tmb', name: 'Deșeuri tratate', color: '#10b981' },
                { key: 'landfill', name: 'Deșeuri depozitate', color: '#ef4444' }
              ]}
            />
          </div>
        </div>

      </div>

      {/* OUTPUT CARDS ROW */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {outputCards.map((card, idx) => (
          <OutputCard key={idx} {...card} />
        ))}
      </div>

      {/* BOTTOM SECTION - Sector Distribution + Top Operators */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Sector Distribution */}
        <SectorStatsTable 
          data={sectorStats}
          title="Distribuție pe sectoare: deșeuri tratate vs. depozitate direct"
          columns={[
            { key: 'sector', label: 'Sector' },
            { key: 'tmb', label: 'Tratate (tone)', color: 'green' },
            { key: 'landfill', label: 'Depozitate (tone)', color: 'red' }
          ]}
        />

        {/* Top Operators */}
        <TopOperatorsTableTmb data={topOperators} />

      </div>

    </div>
  );
};

// ============================================================================
// COLLECTION CARD COMPONENT
// ============================================================================
const CollectionCard = ({ title, value, subtitle, percentage, percentageText, color, icon: Icon, showReport }) => {
  const colorClasses = {
    green: 'border-green-500 bg-green-500/5',
    red: 'border-red-500 bg-red-500/5',
    cyan: 'border-cyan-500 bg-cyan-500/5',
  };

  const iconColorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
  };

  const textColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    cyan: 'text-cyan-500',
  };

  return (
    <div className={`rounded-2xl border-l-4 ${colorClasses[color]} border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]`}>
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColorClasses[color]}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className={`text-sm font-medium ${textColorClasses[color]}`}>
          {title}
        </span>
      </div>
      
      <div className={`mb-1 text-3xl font-bold ${textColorClasses[color]}`}>
        {value.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tone
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {subtitle}
      </div>
      
      <div className={`mt-2 text-sm font-semibold ${textColorClasses[color]}`}>
        {percentage}% {percentageText}
      </div>

      {showReport && (
        <button className={`mt-3 rounded-lg ${iconColorClasses[color]} px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90`}>
          📊 Raport
        </button>
      )}
    </div>
  );
};

// ============================================================================
// OUTPUT CARD COMPONENT
// ============================================================================
const OutputCard = ({ title, sent, accepted, acceptanceRate, percentOfTmb, value, subtitle, color, icon: Icon, isStock }) => {
  const colorClasses = {
    green: 'border-green-500 bg-green-500/5',
    red: 'border-red-500 bg-red-500/5',
    purple: 'border-purple-500 bg-purple-500/5',
    orange: 'border-orange-500 bg-orange-500/5',
  };

  const iconColorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const textColorClasses = {
    green: 'text-green-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  };

  if (isStock) {
    return (
      <div className={`rounded-2xl border-l-4 ${colorClasses[color]} border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]`}>
        <div className="mb-3 flex items-center gap-2">
          <Icon className={`h-5 w-5 ${textColorClasses[color]}`} />
          <span className={`text-sm font-medium ${textColorClasses[color]}`}>
            {title}
          </span>
        </div>
        
        <div className={`mb-2 text-3xl font-bold ${textColorClasses[color]}`}>
          {value.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tone
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
        
        <div className={`mt-3 text-sm font-semibold ${textColorClasses[color]}`}>
          {percentOfTmb}% din total TMB
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-l-4 ${colorClasses[color]} border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${textColorClasses[color]}`} />
          <span className={`text-sm font-medium ${textColorClasses[color]}`}>
            {title}
          </span>
        </div>
        <button className={`rounded-lg ${iconColorClasses[color]} px-2 py-1 text-xs font-medium text-white transition-colors hover:opacity-90`}>
          📊 Raport
        </button>
      </div>
      
      <div className={`mb-2 text-3xl font-bold ${textColorClasses[color]}`}>
        {sent.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tone
      </div>
      
      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Trimis:</span>
          <span className="font-semibold">{sent.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tone</span>
        </div>
        <div className="flex justify-between">
          <span>Acceptat:</span>
          <span className="font-semibold">{accepted.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tone</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
          <span>Grad acceptare:</span>
          <span className={`font-bold ${textColorClasses[color]}`}>{acceptanceRate}%</span>
        </div>
      </div>
      
      <div className={`mt-3 text-sm font-semibold ${textColorClasses[color]}`}>
        {percentOfTmb}% din total TMB
      </div>
    </div>
  );
};

// ============================================================================
// TOP OPERATORS TABLE TMB COMPONENT
// ============================================================================
const TopOperatorsTableTmb = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nu există operatori pentru perioada selectată.
        </p>
      </div>
    );
  }

  const getColorConfig = (sectorNum) => {
    const configs = {
      1: { gradient: 'from-purple-500 to-pink-500' },
      2: { gradient: 'from-blue-500 to-cyan-500' },
      3: { gradient: 'from-cyan-500 to-teal-500' },
      4: { gradient: 'from-green-500 to-emerald-500' },
      5: { gradient: 'from-yellow-500 to-orange-500' },
      6: { gradient: 'from-red-500 to-pink-500' },
    };
    return configs[sectorNum] || configs[1];
  };

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
      {/* HEADER */}
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cantități gestionate de operatori
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cantități trimise la TMB și depozitate direct
        </p>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="max-h-[420px] flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
        {data.map((operator, idx) => {
          const sectorNum = operator.sector !== 'N/A' ? parseInt(operator.sector) : 1;
          const colorConfig = getColorConfig(sectorNum);

          return (
            <div
              key={idx}
              className="group relative flex flex-shrink-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm shadow-xs transition-all duration-300 hover:-translate-x-1 hover:border-gray-200 hover:bg-white hover:shadow-lg dark:border-gray-800 dark:bg-[#0f1419] dark:hover:border-gray-700 dark:hover:bg-[#101623]"
            >
              {/* Left color bar */}
              <div className={`absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b ${colorConfig.gradient}`} />

              {/* Sector badge */}
              <div className="ml-3 flex flex-shrink-0 items-center gap-1.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${colorConfig.gradient} text-xs font-semibold text-white shadow-md`}>
                  {operator.sector}
                </div>
              </div>

              {/* Operator info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">
                  {operator.operator}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Sector {operator.sector}
                </p>
              </div>

              {/* TMB quantity */}
              <div className="flex flex-shrink-0 flex-col items-end">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {operator.tmb_tons.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  TMB ({operator.tmb_percent}%)
                </p>
              </div>

              {/* Landfill quantity */}
              <div className="flex flex-shrink-0 flex-col items-end">
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {operator.landfill_tons.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Landfill ({operator.landfill_percent}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex-shrink-0 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-2 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-[#0f1419] dark:text-gray-400">
        Total{' '}
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {data.length}
        </span>{' '}
        operatori afișați
      </div>
    </div>
  );
};

export default DashboardTmb;