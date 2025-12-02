// src/components/dashboard/DashboardLandfill.jsx
/**
 * ============================================================================
 * DASHBOARD LANDFILL - VERSIUNE FINALĂ V2
 * ============================================================================
 * 
 * MODIFICĂRI:
 * - Header: Logo SAMD + Profil utilizator + Light/Dark + Search + Notificări
 * - Filtre: Format românesc + Ani cu date + Locație ordonată
 * - Dropdown coduri deșeuri → recalculează medie per tichet
 * - Toate componentele optimize conform specificațiilor
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { getLandfillStats } from '../../services/dashboardLandfillService';
import { getTodayDate, getYearStart, formatNumber } from '../../utils/dashboardUtils';

// Components
import DashboardFilters from './DashboardFilters';
import WasteCategoryCards from './WasteCategoryCards';
import MonthlyEvolutionChart from './MonthlyEvolutionChart';
import SectorStatsTable from './SectorStatsTable';
import TopOperatorsTable from './TopOperatorsTable';
import RecentTicketsTable from './RecentTicketsTable';

// Icons
import { Search, Bell, Sun, Moon, TrendingUp, Users, BarChart3, Calendar } from 'lucide-react';

const DashboardLandfill = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Filtre
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: null,
  });

  // Dropdown coduri deșeuri pentru medie per tichet
  const [selectedWasteCode, setSelectedWasteCode] = useState('all');
  const [filteredAverage, setFilteredAverage] = useState(null);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching dashboard data with filters:', filters);

      const response = await getLandfillStats(filters);

      if (response.success) {
        setDashboardData(response.data);
        console.log('✅ Dashboard data loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filters changed:', newFilters);
    setFilters(newFilters);
    // Trigger refetch
    fetchDashboardData();
  };

  // ========================================================================
  // WASTE CODE FILTER LOGIC
  // ========================================================================

  useEffect(() => {
    if (!dashboardData?.stats) return;

    if (selectedWasteCode === 'all') {
      setFilteredAverage(dashboardData.stats.average_per_ticket);
    } else {
      // Calculate average for selected waste code
      const wasteCodeData = dashboardData.waste_categories?.find(
        (cat) => cat.waste_code === selectedWasteCode
      );

      if (wasteCodeData && wasteCodeData.ticket_count > 0) {
        const avg = Number(wasteCodeData.total_tons) / Number(wasteCodeData.ticket_count);
        setFilteredAverage(avg);
      } else {
        setFilteredAverage(0);
      }
    }
  }, [selectedWasteCode, dashboardData]);

  // ========================================================================
  // GET USER INITIALS
  // ========================================================================

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors">
      
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}
      
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#1a1f2e]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo + Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                
                {/* Title */}
                <div>
                  <h1 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                    SAMD București
                  </h1>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Sistem Avansat de Monitorizare Deșeuri
                  </p>
                </div>
              </div>

              {/* Page Title */}
              <div className="ml-8 pl-8 border-l border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Dashboard Depozitarea deșeurilor
                </h2>
              </div>
            </div>

            {/* Right side: Search + Notifications + Theme + Profile */}
            <div className="flex items-center gap-3">
              
              {/* Search */}
              <button
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                title="Caută"
              >
                <Search className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Notifications */}
              <button
                className="relative w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                title="Notificări"
              >
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                title={isDarkMode ? 'Mod luminos' : 'Mod întunecat'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* User Profile */}
              <div className="ml-2 pl-3 border-l border-gray-200 dark:border-gray-700 flex items-center gap-3">
                {/* Initials Avatar */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}

      <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        
        {/* Filters */}
        <div className="mb-8">
          <DashboardFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            sectors={dashboardData?.sectors || []}
            loading={loading}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-600 dark:text-red-400 font-medium">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Deșeuri */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(dashboardData?.stats?.total_quantity || 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total deșeuri (tone)
            </p>
          </div>

          {/* Total Tichete */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.stats?.total_tickets?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total tichete
            </p>
          </div>

          {/* Medie per Tichet + Dropdown Cod Deșeu */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              
              {/* Dropdown Cod Deșeu */}
              <select
                value={selectedWasteCode}
                onChange={(e) => setSelectedWasteCode(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Toate</option>
                {dashboardData?.waste_categories?.map((cat) => (
                  <option key={cat.waste_code} value={cat.waste_code}>
                    {cat.waste_code}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(filteredAverage || 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Medie per tichet (tone)
            </p>
          </div>

          {/* Perioada */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.stats?.period_days || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Zile analizate
            </p>
          </div>
        </div>

        {/* Waste Category Cards */}
        <WasteCategoryCards
          categories={dashboardData?.waste_categories || []}
          loading={loading}
        />

        {/* Monthly Evolution Chart */}
        <div className="mb-8">
          <MonthlyEvolutionChart
            data={dashboardData?.monthly_evolution || []}
            stats={dashboardData?.monthly_stats || {}}
            loading={loading}
          />
        </div>

        {/* Bottom Grid: Sectors + Operators + Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sector Stats */}
          <div>
            <SectorStatsTable
              data={dashboardData?.sector_stats || []}
              loading={loading}
            />
          </div>

          {/* Top Operators */}
          <div>
            <TopOperatorsTable
              data={dashboardData?.top_operators || []}
              loading={loading}
            />
          </div>

          {/* Recent Tickets */}
          <div>
            <RecentTicketsTable
              data={dashboardData?.recent_tickets || []}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLandfill;