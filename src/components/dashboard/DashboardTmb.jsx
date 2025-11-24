// ============================================================================
// DASHBOARD TMB - TRATAREA MECANO-BIOLOGICĂ A DEȘEURILOR
// ============================================================================
// Main dashboard for TMB (Mechanical-Biological Treatment) operations
// Shows: Collection, Output streams (Recycling, Recovery, Disposal), Stock
// ============================================================================

import { useState, useEffect } from 'react';
import { getTmbStats } from '../../services/dashboardTmbService';
import { useTheme } from '../../hooks/useTheme';
import DashboardFilters from './DashboardFilters';
import MonthlyEvolutionChart from './MonthlyEvolutionChart';
import SectorStatsTable from './SectorStatsTable';
import { TrendingUp, TrendingDown, FileText, Recycle, Zap, Trash2, Package } from 'lucide-react';

const DashboardTmb = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    sector: 'Bucuresti',
    uat: 'Bucuresti'
  });

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate
      };
      const response = await getTmbStats(params);
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching TMB stats:', err);
      setError('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = (type, format) => {
    console.log(`Exporting ${type} as ${format}`);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Se încarcă datele...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Dashboard - Tratarea mecano-biologică a deșeurilor
        </h1>
      </div>

      {/* Filters */}
      <DashboardFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        isDark={isDark}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        
        {/* LEFT COLUMN - Main Cards */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          
          {/* Card 1: Deșeuri total colectate */}
          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-green-500`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-500">
                Deșeuri total colectate
              </span>
            </div>
            <div className="text-3xl font-bold text-green-500 mb-1">
              {stats?.total_collected?.toLocaleString('ro-RO')} tone
            </div>
            <div className="text-xs text-gray-500">
              Cod deșeuri: 20 03 01
            </div>
            <div className="text-sm font-semibold text-green-500 mt-2">
              100% din total
            </div>
          </div>

          {/* Card 2: Deșeuri depozitate direct */}
          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-red-500`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-red-500">
                Deșeuri depozitate
              </span>
            </div>
            <div className="text-3xl font-bold text-red-500 mb-1">
              {stats?.total_landfill_direct?.toLocaleString('ro-RO')} tone
            </div>
            <div className="text-xs text-gray-500">
              Cod deșeuri: 20 03 01
            </div>
            <div className="text-sm text-red-500 mt-2">
              {stats?.total_collected > 0 
                ? `${((stats.total_landfill_direct / stats.total_collected) * 100).toFixed(2)}% din total deșeuri colectate`
                : '0% din total'
              }
            </div>
          </div>

          {/* Card 3: Deșeuri trimise la TMB */}
          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-cyan-500`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-cyan-500">
                Deșeuri trimise la TMB
              </span>
            </div>
            <div className="text-3xl font-bold text-cyan-500 mb-1">
              {stats?.tmb_net?.toLocaleString('ro-RO')} tone
            </div>
            <div className="text-xs text-gray-500">
              Cod deșeuri: 20 03 01
            </div>
            <div className="text-sm text-cyan-500 mt-2">
              {stats?.total_collected > 0 
                ? `${((stats.tmb_net / stats.total_collected) * 100).toFixed(2)}% din total deșeuri colectate`
                : '0% din total'
              }
            </div>
            <button 
              onClick={() => handleExport('tmb', 'xlsx')}
              className="mt-3 px-3 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600 transition-colors"
            >
              📊 Raport
            </button>
          </div>

        </div>

        {/* CENTER COLUMN - Main Chart */}
        <div className="col-span-12 lg:col-span-9">
          <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Evoluția cantităților de deșeuri colectate în amestec și trimise la tratare mecano-biologică vs la depozitare
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport('evolution', 'chart')}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  📊 Bare
                </button>
                <button 
                  onClick={() => handleExport('evolution', 'line')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  📈 Linii
                </button>
                <button 
                  onClick={() => handleExport('evolution', 'area')}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  📊 Arie
                </button>
              </div>
            </div>
            
            <MonthlyEvolutionChart 
              data={stats?.monthly_evolution || []}
              isDark={isDark}
              dataKeys={[
                { key: 'tmb', name: 'Deșeuri tratate', color: '#10b981' },
                { key: 'landfill', name: 'Deșeuri depozitate', color: '#ef4444' }
              ]}
            />
          </div>
        </div>

      </div>

      {/* OUTPUT CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        
        {/* Reciclabil */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-green-500`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">Reciclabil</span>
            </div>
            <button 
              onClick={() => handleExport('recycling', 'xlsx')}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
            >
              📊 Raport
            </button>
          </div>
          
          <div className="text-3xl font-bold text-green-500 mb-2">
            {stats?.recycling?.sent?.toLocaleString('ro-RO')} tone
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Trimis:</span>
              <span className="font-semibold">{stats?.recycling?.sent?.toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptat:</span>
              <span className="font-semibold">{stats?.recycling?.accepted?.toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
              <span>Grad acceptare:</span>
              <span className="font-bold text-green-500">{stats?.recycling?.acceptance_rate}%</span>
            </div>
          </div>
          
          <div className="text-sm font-semibold text-green-500 mt-3">
            {stats?.recycling?.percent_of_tmb}% din total TMB
          </div>
        </div>

        {/* Valorificare energetică */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-red-500`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">Valorificare energetică</span>
            </div>
            <button 
              onClick={() => handleExport('recovery', 'xlsx')}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              📊 Raport
            </button>
          </div>
          
          <div className="text-3xl font-bold text-red-500 mb-2">
            {stats?.recovery?.sent?.toLocaleString('ro-RO')} tone
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Trimis:</span>
              <span className="font-semibold">{stats?.recovery?.sent?.toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptat:</span>
              <span className="font-semibold">{stats?.recovery?.accepted?.toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
              <span>Grad acceptare:</span>
              <span className="font-bold text-red-500">{stats?.recovery?.acceptance_rate}%</span>
            </div>
          </div>
          
          <div className="text-sm font-semibold text-red-500 mt-3">
            {stats?.recovery?.percent_of_tmb}% din total TMB
          </div>
        </div>

        {/* Depozitat */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-purple-500`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-purple-500">Depozitat</span>
            </div>
            <button 
              onClick={() => handleExport('disposal', 'xlsx')}
              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
            >
              📊 Raport
            </button>
          </div>
          
          <div className="text-3xl font-bold text-purple-500 mb-2">
            {stats?.disposal?.sent?.toLocaleString('ro-RO')} tone
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Trimis:</span>
              <span className="font-semibold">{stats?.disposal?.sent?.toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptat:</span>
              <span className="font-semibold">{stats?.disposal?.accepted?.toLocaleString('ro-RO')} tone</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
              <span>Grad acceptare:</span>
              <span className="font-bold text-purple-500">{stats?.disposal?.acceptance_rate}%</span>
            </div>
          </div>
          
          <div className="text-sm font-semibold text-purple-500 mt-3">
            {stats?.disposal?.percent_of_tmb}% din total TMB
          </div>
        </div>

        {/* Stoc/Diferență */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-orange-500`}>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Stoc/Diferență</span>
          </div>
          
          <div className="text-3xl font-bold text-orange-500 mb-2">
            {stats?.stock_difference?.toLocaleString('ro-RO')} tone
          </div>
          
          <div className="text-xs text-gray-500">
            Diferența dintre cantitățile acceptate la TMB și cele trimise către fluxurile de output
          </div>
          
          <div className="text-sm font-semibold text-orange-500 mt-3">
            {stats?.stock_percent}% din total TMB
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION - Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Distribuție pe sectoare */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-semibold mb-4">
            Distribuție pe sectoare: deșeuri tratate vs. depozitate direct
          </h2>
          <SectorStatsTable 
            data={stats?.sector_stats || []}
            isDark={isDark}
            columns={[
              { key: 'sector', label: 'Sector' },
              { key: 'tmb', label: 'Deșeuri tratate (tone)', color: 'text-green-500' },
              { key: 'landfill', label: 'Deșeuri depozitate (tone)', color: 'text-red-500' }
            ]}
          />
        </div>

        {/* Cantități gestionate de operatori */}
        <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-semibold mb-4">
            Cantități gestionate de operatori
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left py-3 px-2">Sector</th>
                  <th className="text-left py-3 px-2">Operator de salubrizare</th>
                  <th className="text-right py-3 px-2">Cantitate trimisă la TMB</th>
                  <th className="text-right py-3 px-2">Cantitate depozitată direct</th>
                </tr>
              </thead>
              <tbody>
                {stats?.top_operators?.map((op, idx) => (
                  <tr 
                    key={idx}
                    className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:bg-opacity-50 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-3 px-2">
                      <span className={`inline-block w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        idx === 0 ? 'bg-purple-500' :
                        idx === 1 ? 'bg-blue-500' :
                        idx === 2 ? 'bg-cyan-500' :
                        idx === 3 ? 'bg-green-500' :
                        idx === 4 ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        {op.sector}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium">{op.operator}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="font-semibold">{op.tmb_tons.toLocaleString('ro-RO')} tone</div>
                      <div className="text-xs text-gray-500">{op.tmb_percent}% din total</div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="font-semibold">{op.landfill_tons.toLocaleString('ro-RO')} tone</div>
                      <div className="text-xs text-gray-500">{op.landfill_percent}% din total</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardTmb;