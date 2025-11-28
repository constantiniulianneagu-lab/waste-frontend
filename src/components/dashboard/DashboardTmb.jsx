// ============================================================================
// DASHBOARD TMB - CU HOVER EFFECTS + DEBUG GRAFIC
// ============================================================================

import React, { useState, useEffect } from 'react';
import { getTmbStats, getTmbOperatorsBySector } from '../../services/dashboardTmbService';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Factory, Trash2, Recycle, Zap, Package, TrendingUp, 
  Filter, RotateCcw
} from 'lucide-react';

const DashboardTMB = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operators, setOperators] = useState([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = new Date().toISOString().split('T')[0];
  
  const [filters, setFilters] = useState({
    year: currentYear.toString(),
    start_date: startOfYear,
    end_date: today,
    sector_id: '',
    operator_id: ''
  });

  const [sectors] = useState([
    { id: '', name: 'București' },
    { id: '1', name: 'Sector 1' },
    { id: '2', name: 'Sector 2' },
    { id: '3', name: 'Sector 3' },
    { id: '4', name: 'Sector 4' },
    { id: '5', name: 'Sector 5' },
    { id: '6', name: 'Sector 6' }
  ]);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatted = num.toFixed(2);
    const [intPart, decPart] = formatted.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intWithDots},${decPart}`;
  };

  useEffect(() => {
    if (filters.sector_id) {
      fetchOperators(filters.sector_id);
    } else {
      setOperators([]);
      setFilters(prev => ({ ...prev, operator_id: '' }));
    }
  }, [filters.sector_id]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching TMB stats with filters:', filters);
      
      const response = await getTmbStats(filters);
      
      console.log('📊 Response received:', response);
      console.log('📈 Monthly evolution data:', response.data?.monthly_evolution);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      console.error('❌ Error fetching TMB stats:', err);
      setError('Eroare la încărcarea statisticilor TMB');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async (sectorId) => {
    try {
      setLoadingOperators(true);
      const response = await getTmbOperatorsBySector(sectorId);
      if (response.success) {
        setOperators(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching operators:', err);
      setOperators([]);
    } finally {
      setLoadingOperators(false);
    }
  };

  const handleApplyFilters = () => {
    fetchStats();
  };

  const handleResetFilters = () => {
    const newFilters = {
      year: currentYear.toString(),
      start_date: startOfYear,
      end_date: today,
      sector_id: '',
      operator_id: ''
    };
    setFilters(newFilters);
    // Fetch cu filtre noi
    setTimeout(() => fetchStats(), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="bg-[#1e293b] rounded-lg border border-red-800 p-6 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // DEBUG: Log monthly data
  console.log('🔍 Stats monthly_evolution:', stats.monthly_evolution);

  const monthlyChartData = stats.monthly_evolution?.map(item => ({
    month: item.month,
    'Deseuri tratate': parseFloat(item.tmb_total) || 0,
    'Deseuri depozitate': parseFloat(item.landfill_total) || 0
  })) || [];

  console.log('📊 Chart data prepared:', monthlyChartData);

  const sectorPieData = stats.sector_distribution?.map(item => ({
    name: item.sector_name,
    tratate: parseFloat(item.tmb_tons) || 0,
    depozitate: parseFloat(item.landfill_tons) || 0
  })).filter(item => (item.tratate + item.depozitate) > 0) || [];

  const SECTOR_COLORS = ['#10b981', '#ef4444'];

  const ProgressBar = ({ value, color }) => (
    <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
      <div
        className={`h-1 rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            Dashboard - Tratarea mecano-biologică a deșeurilor
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-5">
          <div className="grid grid-cols-7 gap-4">
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Anul</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#0f172a] border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Data de început</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#0f172a] border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Data de sfârșit</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#0f172a] border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">U.A.T.</label>
              <select
                value={filters.sector_id}
                onChange={(e) => setFilters({ ...filters, sector_id: e.target.value, operator_id: '' })}
                className="w-full px-4 py-2.5 text-sm bg-[#0f172a] border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Operator TMB</label>
              <select
                value={filters.operator_id}
                onChange={(e) => setFilters({ ...filters, operator_id: e.target.value })}
                disabled={!filters.sector_id || loadingOperators || operators.length === 0}
                className="w-full px-4 py-2.5 text-sm bg-[#0f172a] border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Toți operatorii</option>
                {operators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-transparent mb-2">.</label>
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Aplică filtre
              </button>
            </div>

            <div>
              <label className="block text-sm text-transparent mb-2">.</label>
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg 
                         transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Resetează
              </button>
            </div>
          </div>
        </div>

        {/* LINIA 1 */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Cards Stack */}
          <div className="space-y-6">
            
            {/* Total - CU HOVER */}
            <div className="bg-[#1e293b] rounded-xl border border-emerald-500/30 p-6 
                          hover:bg-[#1e293b]/80 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20
                          transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-400">Deșeuri total colectate</p>
              </div>
              <p className="text-3xl font-bold text-emerald-400 mb-2">
                {formatNumberRO(stats.summary.total_collected)} tone
              </p>
              <p className="text-xs text-gray-500">Cod deșeu: 20 03 01</p>
              <p className="text-sm text-emerald-400 font-medium mt-2">100% din total</p>
            </div>

            {/* Depozitate - CU HOVER */}
            <div className="bg-[#1e293b] rounded-xl border border-red-500/30 p-6
                          hover:bg-[#1e293b]/80 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20
                          transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-sm text-gray-400">Deșeuri depozitate</p>
              </div>
              <p className="text-3xl font-bold text-red-400 mb-3">
                {formatNumberRO(stats.summary.total_landfill_direct)} tone
              </p>
              <p className="text-xs text-gray-500 mb-2">Cod deșeu: 20 03 01</p>
              <p className="text-sm text-red-400 font-medium mb-2">{stats.summary.landfill_percent}% din total deșeuri colectate</p>
            </div>

            {/* TMB - CU HOVER */}
            <div className="bg-[#1e293b] rounded-xl border border-cyan-500/30 p-6
                          hover:bg-[#1e293b]/80 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20
                          transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Factory className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-sm text-gray-400">Deșeuri trimise la TMB</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-3xl font-bold text-cyan-400">
                  {formatNumberRO(stats.summary.total_tmb_input)} tone
                </p>
                <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg 
                                 transition-colors flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                  Raport
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Cod deșeu: 20 03 01</p>
              <p className="text-sm text-cyan-400 font-medium">{stats.summary.tmb_percent}% din total deșeuri colectate</p>
            </div>
          </div>

          {/* Grafic - CU DEBUG */}
          <div className="col-span-2 bg-[#1e293b] rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-white">
                Evoluția cantităților de deșeuri colectate în amestec și trimise la tratare mecano-biologică vs la depozitare
              </h3>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z"/>
                  </svg>
                  Bare
                </button>
                <button className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors">
                  Linii
                </button>
                <button className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors">
                  Arie
                </button>
              </div>
            </div>
            
            {/* DEBUG INFO */}
            {monthlyChartData.length === 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Nu există date lunare! Verifică că ai adăugat bonuri în waste_tickets_tmb și waste_tickets_landfill.
                </p>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                  formatter={(value) => `${formatNumberRO(value)} tone`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="Deseuri tratate" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="Deseuri depozitate" 
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINIA 2 - Cards cu HOVER */}
        <div className="grid grid-cols-4 gap-6">
          
          {/* Reciclabil - CU HOVER */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-5
                        hover:bg-[#1e293b]/80 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Reciclabile</p>
              <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
                Raport
              </button>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-1">
              {formatNumberRO(stats.outputs.recycling.sent)} tone
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {stats.outputs.percentages.recycling}% din total TMB
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Cantitate trimisă:</span>
                <span className="text-white">{formatNumberRO(stats.outputs.recycling.sent)} t</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Cantitate acceptată:</span>
                <span className="text-white">{formatNumberRO(stats.outputs.recycling.accepted)} t</span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={parseFloat(stats.outputs.recycling.acceptance_rate)} color="bg-emerald-500" />
              <p className="text-xs text-gray-500 mt-1.5">
                Rata acceptare: {stats.outputs.recycling.acceptance_rate}%
              </p>
            </div>
          </div>

          {/* Valorificare - CU HOVER */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-5
                        hover:bg-[#1e293b]/80 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Valorificare energetică</p>
              <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
                Raport
              </button>
            </div>
            <p className="text-3xl font-bold text-red-400 mb-1">
              {formatNumberRO(stats.outputs.recovery.sent)} tone
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {stats.outputs.percentages.recovery}% din total TMB
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Cantitate trimisă:</span>
                <span className="text-white">{formatNumberRO(stats.outputs.recovery.sent)} t</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Cantitate acceptată:</span>
                <span className="text-white">{formatNumberRO(stats.outputs.recovery.accepted)} t</span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={parseFloat(stats.outputs.recovery.acceptance_rate)} color="bg-red-500" />
              <p className="text-xs text-gray-500 mt-1.5">
                Rata acceptare: {stats.outputs.recovery.acceptance_rate}%
              </p>
            </div>
          </div>

          {/* Depozitat - CU HOVER */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-5
                        hover:bg-[#1e293b]/80 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Depozitat</p>
              <button className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors">
                Raport
              </button>
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-1">
              {formatNumberRO(stats.outputs.disposal.sent)} tone
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {stats.outputs.percentages.disposal}% din total TMB
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Cantitate trimisă:</span>
                <span className="text-white">{formatNumberRO(stats.outputs.disposal.sent)} t</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Cantitate acceptată:</span>
                <span className="text-white">{formatNumberRO(stats.outputs.disposal.accepted)} t</span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={parseFloat(stats.outputs.disposal.acceptance_rate)} color="bg-purple-500" />
              <p className="text-xs text-gray-500 mt-1.5">
                Rata acceptare: {stats.outputs.disposal.acceptance_rate}%
              </p>
            </div>
          </div>

          {/* Stoc - CU HOVER */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-5
                        hover:bg-[#1e293b]/80 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <p className="text-sm text-gray-400 mb-4">Stoc/Diferență</p>
            <p className="text-3xl font-bold text-amber-400 mb-1">
              {formatNumberRO(stats.summary.stock_difference)} tone
            </p>
            <p className="text-xs text-gray-500">
              {((parseFloat(stats.summary.stock_difference) / parseFloat(stats.summary.total_tmb_input)) * 100).toFixed(2)}% din total TMB
            </p>
          </div>
        </div>

        {/* LINIA 3 */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Pie */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-6">
            <h3 className="text-base font-semibold text-white mb-6">
              Distribuția pe sectoare: deșeuri tratate vs. depozitate direct
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sectorPieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => `${formatNumberRO(value)} tone`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="tratate" name="Deseuri tratate" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depozitate" name="Deseuri depozitate" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabel */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-700 p-6">
            <h3 className="text-base font-semibold text-blue-400 mb-6">
              Cantități gestionate de operatori
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-700">
                  <tr className="text-left text-xs text-gray-400">
                    <th className="pb-3 font-medium">Sector</th>
                    <th className="pb-3 font-medium">Operator de salubritate</th>
                    <th className="pb-3 font-medium text-right">Cantitate trimisă la TMB</th>
                    <th className="pb-3 font-medium text-right">Cantitate depozitată direct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {stats.operators && stats.operators.slice(0, 6).map((op, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                      <td className="py-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br 
                                       from-purple-500 to-pink-500 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 text-white font-medium">{op.name}</td>
                      <td className="py-3 text-right">
                        <div className="text-emerald-400 font-bold">
                          {formatNumberRO(op.tmb_total_tons)} tone
                        </div>
                        <div className="text-xs text-gray-500">
                          {op.tmb_percent}% din total
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-red-400 font-bold">
                          {formatNumberRO(op.landfill_total_tons)} tone
                        </div>
                        <div className="text-xs text-gray-500">
                          {op.landfill_percent}% din total
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardTMB;