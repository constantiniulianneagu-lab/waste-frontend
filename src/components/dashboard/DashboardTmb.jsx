// ============================================================================
// DASHBOARD TMB COMPONENT - VERSIUNE CORECTATĂ
// ============================================================================
// Corecții:
// - Filtre cu operator_id (nu tmb_association_id)
// - Format românesc pentru numere (1.234,56)
// - Cards actualizate cu etichetele corecte
// - Gradient buttons ca la Landfill
// - Dark mode support
// ============================================================================

import React, { useState, useEffect } from 'react';
import { getTmbStats, getOutputDetails, getTmbOperatorsBySector } from "../../services/dashboardTmbService";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Factory, Trash2, Recycle, Zap, TrendingUp, 
  Calendar, Filter, Download, AlertCircle 
} from 'lucide-react';

const DashboardTmb = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: `${new Date().getFullYear()}-01-01`,
    end_date: new Date().toISOString().split('T')[0],
    sector_id: '',
    operator_id: '' // ← CORECTAT: operator_id în loc de tmb_association_id
  });

  const [sectors, setSectors] = useState([]);
  const [operators, setOperators] = useState([]);

  // ========================================================================
  // FORMAT ROMÂNESC
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
  useEffect(() => {
    fetchStats();
    fetchSectors();
  }, []);

  useEffect(() => {
    if (filters.sector_id) {
      fetchOperators(filters.sector_id);
    } else {
      setOperators([]);
    }
  }, [filters.sector_id]);

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

  const fetchSectors = async () => {
    try {
      // Fetch sectors 1-6
      const sectorsList = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        name: `Sector ${i + 1}`
      }));
      setSectors(sectorsList);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const fetchOperators = async (sectorId) => {
    try {
      // Aici ar trebui un API call pentru a lua operatorii din tmb_associations
      // Pentru moment, lasă gol până facem endpoint-ul
      setOperators([]);
    } catch (err) {
      console.error('Error fetching operators:', err);
    }
  };

  const handleApplyFilters = () => {
    fetchStats();
  };

  const handleResetFilters = () => {
    setFilters({
      start_date: `${new Date().getFullYear()}-01-01`,
      end_date: new Date().toISOString().split('T')[0],
      sector_id: '',
      operator_id: ''
    });
  };

  // ========================================================================
  // LOADING & ERROR STATES
  // ========================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Se încarcă statisticile TMB...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Eroare la încărcarea datelor
            </h3>
          </div>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                     text-white rounded-lg transition-all duration-200 shadow-md"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // ========================================================================
  // PREPARE CHART DATA
  // ========================================================================
  const outputsChartData = [
    { 
      name: 'Reciclare', 
      value: parseFloat(stats.outputs.recycling.sent),
      color: '#10b981' 
    },
    { 
      name: 'Valorificare', 
      value: parseFloat(stats.outputs.recovery.sent),
      color: '#3b82f6' 
    },
    { 
      name: 'Eliminare', 
      value: parseFloat(stats.outputs.disposal.sent),
      color: '#ef4444' 
    }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard TMB
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tratare Mecano-Biologică - Statistici și raportare
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtre
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Data început */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Data început
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                       rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Data sfârșit */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Data sfârșit
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                       rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Sector
            </label>
            <select
              value={filters.sector_id}
              onChange={(e) => setFilters({ ...filters, sector_id: e.target.value, operator_id: '' })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                       rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Toate sectoarele</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Operator TMB
            </label>
            <select
              value={filters.operator_id}
              onChange={(e) => setFilters({ ...filters, operator_id: e.target.value })}
              disabled={!filters.sector_id || operators.length === 0}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                       rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent
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

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2 text-sm font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                       hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg 
                       transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrează
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                       hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Reset filtre"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Colectat */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Colectat</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumberRO(stats.summary.total_collected)} t
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div>Depozit direct: {formatNumberRO(stats.summary.total_landfill_direct)} t</div>
            <div>Intrări TMB: {formatNumberRO(stats.summary.total_tmb_input)} t</div>
          </div>
        </div>

        {/* TMB Net */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">TMB Net Procesat</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumberRO(stats.summary.tmb_net)} t
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Respins: {formatNumberRO(stats.summary.total_rejected)} t
          </div>
        </div>

        {/* Reciclare */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reciclare</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumberRO(stats.outputs.recycling.sent)} t
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {stats.outputs.percentages.recycling}% din TMB Net
          </div>
        </div>

        {/* Stock */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Diferență Stoc</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumberRO(stats.summary.stock_difference)} t
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            TMB Net - Ieșiri totale
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outputs Pie Chart */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Destinații Ieșiri TMB
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outputsChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {outputsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${formatNumberRO(value)} t`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Reciclare</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumberRO(stats.outputs.recycling.sent)} t
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Valorificare</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {formatNumberRO(stats.outputs.recovery.sent)} t
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Eliminare</p>
              <p className="font-bold text-red-600 dark:text-red-400">
                {formatNumberRO(stats.outputs.disposal.sent)} t
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Evolution */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evoluție Lunară
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthly_evolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${formatNumberRO(value)} t`} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total (t)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operators Table */}
      {stats.operators && stats.operators.length > 0 && (
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Operatori TMB
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3">Asociație</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Tichete</th>
                  <th className="px-4 py-3">Total Tone</th>
                  <th className="px-4 py-3">Procent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.operators.map((op, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {op.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {op.association_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${op.role === 'primary' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                        {op.role === 'primary' ? 'Primar' : 'Secundar'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {op.ticket_count}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumberRO(op.tmb_total_tons)} t
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {op.tmb_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTmb;