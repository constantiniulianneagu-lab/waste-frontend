/**
 * ============================================================================
 * DASHBOARD TMB - COMPLETE WITH SECTOR FILTERING
 * ============================================================================
 * Matches DashboardLandfill filtering pattern exactly
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, FileText, Recycle, Zap, Trash2, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { getTmbStats } from '../../services/dashboardTmbService.js';
import { getTodayDate, getYearStart } from '../../utils/dashboardUtils.js';
import DashboardFilters from './DashboardFilters.jsx';

const DashboardTmb = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [sectors, setSectors] = useState([]);

  // Filters matching DashboardLandfill pattern
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: null, // null = București (toate sectoarele)
  });

  // Fetch sectors for dropdown
  const fetchSectors = async () => {
    try {
      // Mock sectors - replace with actual API call if needed
      const mockSectors = [
        { sector_id: 1, sector_number: 1, sector_name: 'Sector 1 București' },
        { sector_id: 2, sector_number: 2, sector_name: 'Sector 2 București' },
        { sector_id: 3, sector_number: 3, sector_name: 'Sector 3 București' },
        { sector_id: 4, sector_number: 4, sector_name: 'Sector 4 București' },
        { sector_id: 5, sector_number: 5, sector_name: 'Sector 5 București' },
        { sector_id: 6, sector_number: 6, sector_name: 'Sector 6 București' },
      ];
      setSectors(mockSectors);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching TMB dashboard data with filters:', filterParams);

      // Build API params matching backend expectations
      const apiParams = {
        start_date: filterParams.from,
        end_date: filterParams.to,
      };

      // Only add sector_id if it's a valid number
      if (filterParams.sector_id && !isNaN(filterParams.sector_id)) {
        apiParams.sector_id = filterParams.sector_id;
      }

      console.log('🔍 API params:', apiParams);

      const res = await getTmbStats(apiParams);

      console.log('✅ TMB API response:', res);

      if (!res) {
        throw new Error('Empty response from API');
      }

      if (res.success && res.data) {
        setData(res.data);
      } else if (res.data) {
        setData(res.data);
      } else {
        setData(res);
      }
    } catch (err) {
      console.error('❌ TMB Dashboard error:', err);
      setError(err.message || 'Eroare la obținerea statisticilor TMB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" />
            Reîncearcă
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1419]">
        <p className="text-gray-500 dark:text-gray-400">Nu există date disponibile</p>
      </div>
    );
  }

  // ============================================================================
  // PREPARE DATA
  // ============================================================================
  const chartData = (data.monthly_evolution || []).map(item => ({
    month: item.month,
    'Deșeuri tratate': item.tmb || 0,
    'Deșeuri depozitate': item.landfill || 0,
  }));

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

      {/* FILTERS - Using DashboardFilters component */}
      <DashboardFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        sectors={sectors}
        loading={loading}
      />

      {/* MAIN GRID */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - Collection Cards */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          
          {/* Card 1: Total Collected */}
          <div className="rounded-2xl border-l-4 border-green-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-500">
                Deșeuri total colectate
              </span>
            </div>
            <div className="mb-1 text-3xl font-bold text-green-500">
              {(data.total_collected || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cod deșeuri: 20 03 01
            </div>
            <div className="mt-2 text-sm font-semibold text-green-500">
              100% din total
            </div>
          </div>

          {/* Card 2: Landfill Direct */}
          <div className="rounded-2xl border-l-4 border-red-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-red-500">
                Deșeuri depozitate
              </span>
            </div>
            <div className="mb-1 text-3xl font-bold text-red-500">
              {(data.total_landfill_direct || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cod deșeuri: 20 03 01
            </div>
            <div className="mt-2 text-sm text-red-500">
              {data.total_collected > 0 
                ? `${((data.total_landfill_direct / data.total_collected) * 100).toFixed(2)}% din total`
                : '0% din total'
              }
            </div>
          </div>

          {/* Card 3: TMB Net */}
          <div className="rounded-2xl border-l-4 border-cyan-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-cyan-500">
                Deșeuri trimise la TMB
              </span>
            </div>
            <div className="mb-1 text-3xl font-bold text-cyan-500">
              {(data.tmb_net || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cod deșeuri: 20 03 01
            </div>
            <div className="mt-2 text-sm text-cyan-500">
              {data.total_collected > 0
                ? `${((data.tmb_net / data.total_collected) * 100).toFixed(2)}% din total`
                : '0% din total'
              }
            </div>
            <button className="mt-3 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-600">
              📊 Raport
            </button>
          </div>

        </div>

        {/* CENTER COLUMN - Chart */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Evoluția cantităților de deșeuri colectate în amestec și trimise la tratare mecano-biologică vs la depozitare
            </h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="Deșeuri tratate" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Deșeuri depozitate" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* OUTPUT CARDS ROW */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Reciclabil */}
        <div className="rounded-2xl border-l-4 border-green-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">Reciclabil</span>
            </div>
            <button className="rounded-lg bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600">
              📊 Raport
            </button>
          </div>
          <div className="mb-2 text-3xl font-bold text-green-500">
            {(data.recycling?.sent || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
          </div>
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Trimis:</span>
              <span className="font-semibold">{(data.recycling?.sent || 0).toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptat:</span>
              <span className="font-semibold">{(data.recycling?.accepted || 0).toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
              <span>Grad acceptare:</span>
              <span className="font-bold text-green-500">{data.recycling?.acceptance_rate || 0}%</span>
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-green-500">
            {data.recycling?.percent_of_tmb || 0}% din total TMB
          </div>
        </div>

        {/* Valorificare energetică */}
        <div className="rounded-2xl border-l-4 border-red-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Valorificare energetică</span>
            </div>
            <button className="rounded-lg bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600">
              📊 Raport
            </button>
          </div>
          <div className="mb-2 text-3xl font-bold text-red-500">
            {(data.recovery?.sent || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
          </div>
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Trimis:</span>
              <span className="font-semibold">{(data.recovery?.sent || 0).toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptat:</span>
              <span className="font-semibold">{(data.recovery?.accepted || 0).toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
              <span>Grad acceptare:</span>
              <span className="font-bold text-red-500">{data.recovery?.acceptance_rate || 0}%</span>
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-red-500">
            {data.recovery?.percent_of_tmb || 0}% din total TMB
          </div>
        </div>

        {/* Depozitat */}
        <div className="rounded-2xl border-l-4 border-purple-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-purple-500">Depozitat</span>
            </div>
            <button className="rounded-lg bg-purple-500 px-2 py-1 text-xs text-white hover:bg-purple-600">
              📊 Raport
            </button>
          </div>
          <div className="mb-2 text-3xl font-bold text-purple-500">
            {(data.disposal?.sent || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
          </div>
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Trimis:</span>
              <span className="font-semibold">{(data.disposal?.sent || 0).toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptat:</span>
              <span className="font-semibold">{(data.disposal?.accepted || 0).toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
              <span>Grad acceptare:</span>
              <span className="font-bold text-purple-500">{data.disposal?.acceptance_rate || 0}%</span>
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-purple-500">
            {data.disposal?.percent_of_tmb || 0}% din total TMB
          </div>
        </div>

        {/* Stoc/Diferență */}
        <div className="rounded-2xl border-l-4 border-orange-500 border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Stoc/Diferență</span>
          </div>
          <div className="mb-2 text-3xl font-bold text-orange-500">
            {(data.stock_difference || 0).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} tone
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Diferența dintre cantitățile acceptate la TMB și cele trimise către fluxurile de output
          </div>
          <div className="mt-3 text-sm font-semibold text-orange-500">
            {data.stock_percent || 0}% din total TMB
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION - Sector Stats + Top Operators */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Sector Distribution */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Distribuție pe sectoare: deșeuri tratate vs. depozitate direct
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 text-left font-medium text-gray-700 dark:text-gray-300">Sector</th>
                  <th className="py-3 text-right font-medium text-green-600 dark:text-green-400">Tratate (tone)</th>
                  <th className="py-3 text-right font-medium text-red-600 dark:text-red-400">Depozitate (tone)</th>
                </tr>
              </thead>
              <tbody>
                {(data.sector_stats || []).map((sector, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 text-gray-900 dark:text-white">{sector.sector}</td>
                    <td className="py-3 text-right font-semibold text-green-600 dark:text-green-400">
                      {(sector.tmb || 0).toLocaleString('ro-RO')}
                    </td>
                    <td className="py-3 text-right font-semibold text-red-600 dark:text-red-400">
                      {(sector.landfill || 0).toLocaleString('ro-RO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Operators */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1a1f2e]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Cantități gestionate de operatori
          </h3>
          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
            {(data.top_operators || []).map((op, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-[#0f1419]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                    {op.sector}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{op.operator}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sector {op.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {(op.tmb_tons || 0).toLocaleString('ro-RO')} t
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    TMB: {op.tmb_percent}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardTmb;