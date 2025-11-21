/**
 * ============================================================================
 * DASHBOARD LANDFILL - MAIN COMPONENT
 * ============================================================================
 * 
 * Main dashboard page for landfill waste management
 * 
 * Features:
 * - Filters (Year, Date Range, Sector)
 * - Waste Category Cards (5 large cards)
 * - Monthly Evolution Chart (Area chart)
 * - Sector Statistics Table
 * - Top Operators Table
 * - Recent Tickets Table
 * 
 * API: GET /api/dashboard/landfill/stats
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { getLandfillStats } from '../services/dashboardLandfillService';
import { getTodayDate, getYearStart } from '../utils/dashboardUtils';

// Components
import DashboardFilters from '../components/dashboard/DashboardFilters';
import WasteCategoryCards from '../components/dashboard/WasteCategoryCards';
import MonthlyEvolutionChart from '../components/dashboard/MonthlyEvolutionChart';
import SectorStatsTable from '../components/dashboard/SectorStatsTable';
import TopOperatorsTable from '../components/dashboard/TopOperatorsTable';
import RecentTicketsTable from '../components/dashboard/RecentTicketsTable';

const DashboardLandfill = () => {
  // ========================================================================
  // STATE
  // ========================================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: '',
  });

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      const stats = await getLandfillStats(filterParams);
      setData(stats);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchDashboardData(filters);
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  /**
   * Render error state
   */
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                  Eroare la încărcarea datelor
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  {error}
                </p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                           text-white font-medium rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Încearcă din nou
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get sectors from data for filter dropdown
  const sectors = data?.per_sector || [];

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard Depozitare
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitorizare și analiză deșeuri depozitate
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 
                       dark:bg-emerald-500 dark:hover:bg-emerald-600
                       text-white font-medium rounded-lg transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Se încarcă...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sectors={sectors}
          loading={loading}
        />

        {/* Summary Cards - Top Stats */}
        {data?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              title="Total Deșeuri"
              value={data.summary.total_tons_formatted}
              subtitle="tone"
              icon={<TrendingUp className="w-6 h-6" />}
              color="emerald"
            />
            <SummaryCard
              title="Total Tichete"
              value={data.summary.total_tickets}
              subtitle="înregistrări"
              icon={<TrendingUp className="w-6 h-6" />}
              color="blue"
            />
            <SummaryCard
              title="Medie per Tichet"
              value={data.summary.avg_weight_per_ticket?.toFixed(2)}
              subtitle="tone/tichet"
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
            />
            <SummaryCard
              title="Perioada"
              value={data.summary.date_range?.days || 0}
              subtitle="zile"
              icon={<TrendingUp className="w-6 h-6" />}
              color="orange"
            />
          </div>
        )}

        {/* Waste Category Cards (5 large colored cards) */}
        <WasteCategoryCards
          categories={data?.waste_categories || []}
          loading={loading}
        />

        {/* Monthly Evolution Chart */}
        <MonthlyEvolutionChart
          data={data?.monthly_evolution || []}
          stats={data?.monthly_stats || {}}
          loading={loading}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sector Statistics */}
          <SectorStatsTable
            data={data?.per_sector || []}
            loading={loading}
          />

          {/* Top Operators */}
          <TopOperatorsTable
            data={data?.top_operators || []}
            loading={loading}
          />
        </div>

        {/* Recent Tickets Table */}
        <RecentTicketsTable
          data={data?.recent_tickets || []}
          loading={loading}
        />
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * SUMMARY CARD COMPONENT
 * ============================================================================
 */
const SummaryCard = ({ title, value, subtitle, icon, color = 'emerald' }) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardLandfill;