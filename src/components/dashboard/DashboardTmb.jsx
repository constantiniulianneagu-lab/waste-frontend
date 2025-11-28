// ============================================================================
// DASHBOARD TMB - LIGHT + DARK MODE COMPLET
// ============================================================================

import React, { useState, useEffect } from 'react';
import { getTmbStats, getTmbOperatorsBySector } from '../../services/dashboardTmbService';
import {
  ComposedChart, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
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
  const [chartType, setChartType] = useState('bar');
  
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
      const response = await getTmbStats(filters);
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      console.error('Error fetching TMB stats:', err);
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
    setTimeout(() => fetchStats(), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0f172a]">
        <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-red-200 dark:border-red-800 p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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

  const monthlyChartData = stats.monthly_evolution?.map(item => ({
    month: item.month,
    'Deseuri tratate': parseFloat(item.tmb_total) || 0,
    'Deseuri depozitate': parseFloat(item.landfill_total) || 0
  })) || [];

  const sectorPieData = stats.sector_distribution?.map(item => ({
    name: item.sector_name,
    tratate: parseFloat(item.tmb_tons) || 0,
    depozitate: parseFloat(item.landfill_tons) || 0
  })).filter(item => (item.tratate + item.depozitate) > 0) || [];

  const ProgressBar = ({ value, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
      <div
        className={`h-1 rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  const renderChart = () => {
    const commonProps = {
      data: monthlyChartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const chartComponents = {
      bar: (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#111827'
            }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} iconType="circle" />
          <Bar dataKey="Deseuri tratate" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Deseuri depozitate" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      ),
      line: (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#111827'
            }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} iconType="circle" />
          <Line type="monotone" dataKey="Deseuri tratate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
          <Line type="monotone" dataKey="Deseuri depozitate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
        </LineChart>
      ),
      area: (
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tick={{ fill: '#6b7280' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#111827'
            }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} iconType="circle" />
          <Area type="monotone" dataKey="Deseuri tratate" stroke="#10b981" strokeWidth={2} fill="url(#colorTratate)" />
          <Area type="monotone" dataKey="Deseuri depozitate" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepozitate)" />
        </AreaChart>
      )
    };

    return chartComponents[chartType];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Dashboard - Tratarea mecano-biologică a deșeurilor
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-7 gap-4">
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Anul</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Data de început</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Data de sfârșit</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">U.A.T.</label>
              <select
                value={filters.sector_id}
                onChange={(e) => setFilters({ ...filters, sector_id: e.target.value, operator_id: '' })}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Operator TMB</label>
              <select
                value={filters.operator_id}
                onChange={(e) => setFilters({ ...filters, operator_id: e.target.value })}
                disabled={!filters.sector_id || loadingOperators || operators.length === 0}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700 
                         rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full px-4 py-2.5 text-sm font-medium bg-gray-200 dark:bg-gray-700 
                         text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg 
                         transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Resetează
              </button>
            </div>
          </div>
        </div>

        {/* LINIA 1: 1/4 Cards + 3/4 Grafic */}
        <div className="grid grid-cols-4 gap-6">
          
          {/* Cards Stack */}
          <div className="space-y-4">
            
            {/* Total */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-4 
                          hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20
                          transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Deșeuri total colectate</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {formatNumberRO(stats.summary.total_collected)} tone
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Cod deșeu: 20 03 01</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">100% din total</p>
            </div>

            {/* Depozitate */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-red-200 dark:border-red-500/30 p-4
                          hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20
                          transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Deșeuri depozitate</p>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                {formatNumberRO(stats.summary.total_landfill_direct)} tone
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Cod deșeu: 20 03 01</p>
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{stats.summary.landfill_percent}% din total deșeuri colectate</p>
            </div>

            {/* TMB */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-cyan-200 dark:border-cyan-500/30 p-4
                          hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20
                          transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Factory className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Trimise la TMB</p>
                </div>
                <button className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg 
                                 transition-colors flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                  </svg>
                  Raport
                </button>
              </div>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                {formatNumberRO(stats.summary.total_tmb_input)} tone
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Cod deșeu: 20 03 01</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">{stats.summary.tmb_percent}% din total deșeuri colectate</p>
            </div>
          </div>

          {/* Grafic */}
          <div className="col-span-3 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Evoluția cantităților de deșeuri colectate în amestec și trimise la tratare mecano-biologică vs la depozitare
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    chartType === 'bar' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z"/>
                  </svg>
                  Bare
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    chartType === 'line' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Linii
                </button>
                <button 
                  onClick={() => setChartType('area')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    chartType === 'area' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Arie
                </button>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINIA 2 - Cards */}
        <div className="grid grid-cols-4 gap-6">
          
          {/* Reciclabil */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-5
                        hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-400">Reciclabile</p>
              <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
                Raport
              </button>
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {formatNumberRO(stats.outputs.recycling.sent)} tone
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              {stats.outputs.percentages.recycling}% din total TMB
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Cantitate trimisă:</span>
                <span className="text-gray-900 dark:text-white">{formatNumberRO(stats.outputs.recycling.sent)} t</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Cantitate acceptată:</span>
                <span className="text-gray-900 dark:text-white">{formatNumberRO(stats.outputs.recycling.accepted)} t</span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={parseFloat(stats.outputs.recycling.acceptance_rate)} color="bg-emerald-500" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                Rata acceptare: {stats.outputs.recycling.acceptance_rate}%
              </p>
            </div>
          </div>

          {/* Valorificare */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-5
                        hover:border-red-300 dark:hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-400">Valorificare energetică</p>
              <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
                Raport
              </button>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {formatNumberRO(stats.outputs.recovery.sent)} tone
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              {stats.outputs.percentages.recovery}% din total TMB
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Cantitate trimisă:</span>
                <span className="text-gray-900 dark:text-white">{formatNumberRO(stats.outputs.recovery.sent)} t</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Cantitate acceptată:</span>
                <span className="text-gray-900 dark:text-white">{formatNumberRO(stats.outputs.recovery.accepted)} t</span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={parseFloat(stats.outputs.recovery.acceptance_rate)} color="bg-red-500" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                Rata acceptare: {stats.outputs.recovery.acceptance_rate}%
              </p>
            </div>
          </div>

          {/* Depozitat */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-5
                        hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-400">Depozitat</p>
              <button className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors">
                Raport
              </button>
            </div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {formatNumberRO(stats.outputs.disposal.sent)} tone
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
              {stats.outputs.percentages.disposal}% din total TMB
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Cantitate trimisă:</span>
                <span className="text-gray-900 dark:text-white">{formatNumberRO(stats.outputs.disposal.sent)} t</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Cantitate acceptată:</span>
                <span className="text-gray-900 dark:text-white">{formatNumberRO(stats.outputs.disposal.accepted)} t</span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={parseFloat(stats.outputs.disposal.acceptance_rate)} color="bg-purple-500" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">
                Rata acceptare: {stats.outputs.disposal.acceptance_rate}%
              </p>
            </div>
          </div>

          {/* Stoc */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-5
                        hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20
                        transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">Stoc/Diferență</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {formatNumberRO(stats.summary.stock_difference)} tone
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {((parseFloat(stats.summary.stock_difference) / parseFloat(stats.summary.total_tmb_input)) * 100).toFixed(2)}% din total TMB
            </p>
          </div>
        </div>

        {/* LINIA 3 */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Distribuție */}
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
              Distribuția pe sectoare: deșeuri tratate vs. depozitate direct
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sectorPieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
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
          <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 mb-6">
              Cantități gestionate de operatori
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                    <th className="pb-3 font-medium">Sector</th>
                    <th className="pb-3 font-medium">Operator de salubritate</th>
                    <th className="pb-3 font-medium text-right">Cantitate trimisă la TMB</th>
                    <th className="pb-3 font-medium text-right">Cantitate depozitată direct</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.operators && stats.operators.slice(0, 6).map((op, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br 
                                       from-purple-500 to-pink-500 text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white font-medium">{op.name}</td>
                      <td className="py-3 text-right">
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatNumberRO(op.tmb_total_tons)} tone
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {op.tmb_percent}% din total
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="text-red-600 dark:text-red-400 font-bold">
                          {formatNumberRO(op.landfill_total_tons)} tone
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
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