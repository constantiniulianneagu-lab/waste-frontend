// src/components/dashboard/DashboardLandfill.jsx

/**
 * ============================================================================
 * DASHBOARD LANDFILL - MAIN COMPONENT (Samsung 2026 Style)
 * ============================================================================
 *
 * Features:
 * - Filters (Year, Date Range, Sector)
 * - Summary Cards (4 carduri mari)
 * - Waste Category Cards
 * - Monthly Evolution Chart
 * - Sector Statistics Table
 * - Top Operators Table
 * - Recent Tickets Table
 *
 * API: GET /api/dashboard/landfill/stats
 * ============================================================================
 */

import { useState, useEffect } from "react";
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  MapPin,
} from "lucide-react";

// ✅ Services & Utils - cu extensii .js (compatibil cu exemplul tău)
import { getLandfillStats } from "../../services/dashboardLandfillService.js";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

// ✅ Dashboard Components - cu extensii .jsx (compatibil cu exemplul tău)
import DashboardFilters from "./DashboardFilters.jsx";
import WasteCategoryCards from "./WasteCategoryCards.jsx";
import MonthlyEvolutionChart from "./MonthlyEvolutionChart.jsx";
import SectorStatsTable from "./SectorStatsTable.jsx";
import TopOperatorsTable from "./TopOperatorsTable.jsx";
import RecentTicketsTable from "./RecentTicketsTable.jsx";

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
    sector_id: "",
  });

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Fetching dashboard data with filters:", filterParams);

      const response = await getLandfillStats(filterParams);
      console.log("✅ Dashboard raw data received:", response);

      // 🔧 NORMALIZARE RĂSPUNS:
      // dacă backend-ul răspunde cu { success, data, filters_applied }
      // folosim doar response.data; dacă nu, folosim obiectul direct
      let stats = null;

      if (response && typeof response === "object") {
        if ("success" in response && "data" in response) {
          stats = response.data;
        } else {
          stats = response;
        }
      }

      if (!stats || !stats.summary) {
        console.warn("⚠️ No data or no summary field in response");
      }

      setData(stats);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters) => {
    console.log("🔄 Filters changed:", newFilters);
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleRefresh = () => {
    console.log("🔄 Refreshing dashboard...");
    fetchDashboardData(filters);
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Se încarcă datele...
          </p>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Vă rugăm așteptați
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                  Eroare la încărcarea datelor
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4 font-medium">
                  {error}
                </p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 
                             hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl 
                             transition-all shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  Încearcă din nou
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sectoare pentru filtrare
  const sectors = data?.per_sector || [];

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 border-b border-gray-700 dark:border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                Dashboard Depozitare
              </h1>
              <p className="text-gray-300 dark:text-gray-400 text-lg font-medium flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Monitorizare și analiză deșeuri depozitate
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 
                         hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl 
                         transition-all shadow-lg hover:shadow-2xl transform hover:scale-105
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8">
          <DashboardFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            sectors={sectors}
            loading={loading}
          />
        </div>

        {/* Debug Info - doar în dev */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-mono text-blue-900 dark:text-blue-200">
              DEBUG: Has data: {data ? "YES" : "NO"} | Has summary:{" "}
              {data?.summary ? "YES" : "NO"} | Total tons:{" "}
              {data?.summary?.total_tons || 0}
            </p>
          </div>
        )}

        {/* Summary Cards */}
        {data?.summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              title="Total Deșeuri"
              value={data.summary.total_tons_formatted || "0"}
              subtitle="tone depozitate"
              icon={<TrendingUp className="w-7 h-7" />}
              color="emerald"
            />
            <SummaryCard
              title="Total Tichete"
              value={
                data.summary.total_tickets?.toLocaleString("ro-RO") || "0"
              }
              subtitle="înregistrări"
              icon={<Calendar className="w-7 h-7" />}
              color="blue"
            />
            <SummaryCard
              title="Medie per Tichet"
              value={
                data.summary.avg_weight_per_ticket?.toFixed(2) || "0"
              }
              subtitle="tone/tichet"
              icon={<TrendingUp className="w-7 h-7" />}
              color="purple"
            />
            <SummaryCard
              title="Perioada"
              value={data.summary.date_range?.days || 0}
              subtitle="zile analizate"
              icon={<Calendar className="w-7 h-7" />}
              color="orange"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Nu există date pentru perioada selectată
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Încearcă să selectezi o perioadă diferită sau verifică
              disponibilitatea datelor.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 
                         hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Reîncarcă
            </button>
          </div>
        )}

        {/* Rest of Components - doar dacă avem summary */}
        {data?.summary && (
          <>
            <WasteCategoryCards
              categories={data?.waste_categories || []}
              loading={loading}
            />

            <MonthlyEvolutionChart
              data={data?.monthly_evolution || []}
              stats={data?.monthly_stats || {}}
              loading={loading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <SectorStatsTable
                data={data?.per_sector || []}
                loading={loading}
              />

              <TopOperatorsTable
                data={data?.top_operators || []}
                loading={loading}
              />
            </div>

            <RecentTicketsTable
              data={data?.recent_tickets || []}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * SUMMARY CARD COMPONENT
 * ============================================================================
 */

const SummaryCard = ({ title, value, subtitle, icon, color = "emerald" }) => {
  const colorClasses = {
    emerald: "bg-gradient-to-br from-emerald-500 to-teal-600",
    blue: "bg-gradient-to-br from-blue-500 to-cyan-600",
    purple: "bg-gradient-to-br from-purple-500 to-pink-600",
    orange: "bg-gradient-to-br from-orange-500 to-red-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <div
          className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-xl`}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLandfill;
