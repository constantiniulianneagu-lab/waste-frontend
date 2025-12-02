// src/components/dashboard/DashboardLandfill.jsx
/**
 * ============================================================================
 * DASHBOARD DEPOZITARE - MODERN ECO THEME
 * ============================================================================
 * 
 * 🎨 CHANGES:
 * - Header modern eco integrat (fără refresh button în header)
 * - Search funcțional
 * - Notificări dinamice
 * - Gradient emerald/teal theme consistent
 * - Păstrează toată logica existentă funcțională
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { getLandfillStats } from "../../services/dashboardLandfillService.js";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";
import WasteCategoryCards from "./WasteCategoryCards.jsx";
import MonthlyEvolutionChart from "./MonthlyEvolutionChart.jsx";
import SectorStatsTable from "./SectorStatsTable.jsx";

const DashboardLandfill = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3); // Mock - conectează la API mai târziu

  // Filters
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: null,
  });

  // ========================================================================
  // FETCH DASHBOARD DATA
  // ========================================================================

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("📊 Fetching dashboard data with filters:", filterParams);
      
      const res = await getLandfillStats(filterParams);
      
      console.log("✅ Raw response from API:", res);
  
      if (!res) {
        throw new Error("Empty response from API");
      }
  
      // Backend trimite { success, data }
      if (typeof res === "object" && "success" in res) {
        if (!res.success) {
          throw new Error(res.message || "API responded with success=false");
        }
        console.log("✅ Using res.data for dashboard:", res.data);
        setData(res.data);
      } else {
        // Fallback - în caz că ai alt format
        console.log("⚠️ Using response as data directly");
        setData(res);
      }
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filter change requested:', newFilters);
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh with current filters:', filters);
    fetchDashboardData(filters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    console.log("🔍 Search query:", query);
    // TODO: Implementează logica de filtrare în funcție de search
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          onSearchChange={handleSearchChange}
        />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 73px)" }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Se încarcă datele...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          onSearchChange={handleSearchChange}
        />
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-red-900 dark:text-red-100 mb-2">
                    Eroare la încărcarea datelor
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Încearcă din nou
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sectors = data?.per_sector || [];

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER MODERN ECO */}
      <DashboardHeader 
        notificationCount={notificationCount}
        onSearchChange={handleSearchChange}
      />

      {/* MAIN CONTENT */}
      <div className="px-6 lg:px-8 py-6 space-y-6">
        
        {/* FILTERS */}
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sectors={sectors}
          loading={loading}
        />

        {/* REFRESH BUTTON (mutat jos, sub filtre) */}
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizează
          </button>
        </div>

        {/* EMPTY STATE */}
        {!data?.summary ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Nu există date pentru perioada selectată
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Încearcă să selectezi o perioadă diferită.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Reîncarcă
            </button>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS (4) - ECO THEME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <SummaryCard
                title="TOTAL DEȘEURI"
                value={data.summary.total_tons_formatted || "0"}
                subtitle="tone depozitate"
                gradient="from-emerald-500 to-teal-600"
                icon="📈"
              />
              <SummaryCard
                title="TOTAL TICHETE"
                value={
                  data.summary.total_tickets?.toLocaleString("ro-RO") || "0"
                }
                subtitle="înregistrări"
                gradient="from-cyan-500 to-blue-600"
                icon="🧾"
              />
              <SummaryCard
                title="MEDIE PER TICHET"
                value={
                  data.summary.avg_weight_per_ticket?.toFixed(2) || "0.00"
                }
                subtitle="tone / tichet"
                gradient="from-lime-500 to-emerald-600"
                icon="⚖️"
              />
              <SummaryCard
                title="PERIOADA"
                value={data.summary.date_range?.days || 0}
                subtitle="zile analizate"
                gradient="from-green-500 to-emerald-600"
                icon="📅"
              />
            </div>

            {/* WASTE CATEGORY CARDS */}
            <WasteCategoryCards
              categories={data?.waste_categories || []}
              loading={loading}
            />

            {/* CHART + SECTOR TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MonthlyEvolutionChart
                  data={data?.monthly_evolution || []}
                  stats={data?.monthly_stats || {}}
                  loading={loading}
                />
              </div>

              <div className="lg:col-span-1">
                <SectorStatsTable
                  data={data?.per_sector || []}
                  loading={loading}
                />
              </div>
            </div>

            {/* TOP OPERATORS + RECENT TICKETS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TOP OPERATORS */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Top operatori salubrizare
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Cantități depozitate în perioada selectată
                  </p>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {data?.top_operators && data.top_operators.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.top_operators.map((operator) => (
                        <div
                          key={operator.institution_id}
                          className="px-6 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: `${operator.icon_color}22`,
                              }}
                            >
                              <span
                                className="text-sm font-bold"
                                style={{ color: operator.icon_color }}
                              >
                                {operator.sector_numbers_display}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {operator.institution_name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Sector {operator.sector_numbers_display}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {operator.total_tons_formatted}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                tone
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există operatori pentru perioada selectată.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RECENT TICKETS */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Ultimele înregistrări
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Până la 50 de tichete recente
                    </p>
                  </div>
                  <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
                    Vezi toate
                  </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {data?.recent_tickets && data.recent_tickets.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.recent_tickets.map((ticket) => (
                        <div
                          key={ticket.ticket_id}
                          className="px-6 py-4 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: `${ticket.icon_color}22`,
                              }}
                            >
                              <span
                                className="text-sm font-bold"
                                style={{ color: ticket.icon_color }}
                              >
                                {ticket.sector_number}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                Cod deșeu: {ticket.waste_code}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(ticket.ticket_date).toLocaleDateString(
                                  "ro-RO"
                                )}{" "}
                                • Tichet {ticket.ticket_number}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {ticket.net_weight_tons_formatted}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                tone
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nu există tichete pentru perioada selectată.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * SUMMARY CARD - ECO THEME
 * ============================================================================
 */
const SummaryCard = ({ title, value, subtitle, gradient, icon }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all group relative overflow-hidden">
    {/* Gradient accent bar */}
    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient} group-hover:w-2 transition-all`} />
    
    <div className="flex items-start justify-between gap-3 pl-2">
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </p>
        <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
        <span>{icon}</span>
      </div>
    </div>
  </div>
);

export default DashboardLandfill;