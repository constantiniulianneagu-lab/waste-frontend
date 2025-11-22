// src/components/dashboard/DashboardLandfill.jsx

/**
 * ============================================================================
 * DASHBOARD DEPOZITARE - REDESIGN COMPLET
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

import { getLandfillStats } from "../../services/dashboardLandfillService.js";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

import DashboardFilters from "./DashboardFilters.jsx";
import WasteCategoryCards from "./WasteCategoryCards.jsx";
import MonthlyEvolutionChart from "./MonthlyEvolutionChart.jsx";
import SectorStatsTable from "./SectorStatsTable.jsx";

const DashboardLandfill = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: "",
  });

  // Fetch data
  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Fetching landfill dashboard data:", filterParams);
      const response = await getLandfillStats(filterParams);
      console.log("✅ Landfill dashboard response:", response);

      let stats = null;
      if (response && typeof response === "object") {
        if ("success" in response && "data" in response) {
          stats = response.data;
        } else {
          stats = response;
        }
      }

      if (!stats || !stats.summary) {
        console.warn("⚠️ No summary in dashboard response");
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
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleRefresh = () => {
    fetchDashboardData(filters);
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-400">
            Se încarcă datele...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1419] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-900/40 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-200 mb-2">
                  Eroare la încărcarea datelor
                </h3>
                <p className="text-sm text-red-300 mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
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

  const sectors = data?.per_sector || [];

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* HEADER */}
      <div className="bg-[#1a1f2e] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                Dashboard Depozitare
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Monitorizare și analiză deșeuri depozitate
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* FILTERS CARD */}
          <div className="bg-[#0f1419] rounded-xl border border-gray-800 p-4">
            <DashboardFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              sectors={sectors}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {!data?.summary ? (
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-12 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Nu există date pentru perioada selectată
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Încearcă să selectezi o perioadă diferită.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Reîncarcă
            </button>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="TOTAL DEȘEURI"
                value={data.summary.total_tons_formatted || "0"}
                subtitle="tone depozitate"
                color="emerald"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <SummaryCard
                title="TOTAL TICHETE"
                value={
                  data.summary.total_tickets?.toLocaleString("ro-RO") || "0"
                }
                subtitle="înregistrări"
                color="blue"
                icon={<Calendar className="w-5 h-5" />}
              />
              <SummaryCard
                title="MEDIE PER TICHET"
                value={
                  data.summary.avg_weight_per_ticket?.toFixed(2) || "0"
                }
                subtitle="tone / tichet"
                color="purple"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <SummaryCard
                title="PERIOADA"
                value={data.summary.date_range?.days || 0}
                subtitle="zile analizate"
                color="orange"
                icon={<Calendar className="w-5 h-5" />}
              />
            </div>

            {/* WASTE CATEGORY CARDS (3 mari, colorate) */}
            <WasteCategoryCards
              categories={data?.waste_categories || []}
              loading={loading}
            />

            {/* CHART + SECTOR STATS */}
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

            {/* TOP OPERATORS + RECENT TICKETS cu SCROLL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TOP OPERATORS */}
              <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Top operatori salubrizare
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Cantități depozitate în perioada selectată
                    </p>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {data?.top_operators && data.top_operators.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                      {data.top_operators.map((op, index) => {
                        const color = op.icon_color || "#22c55e";
                        const sectorLabel =
                          op.sector_numbers_display || op.sector_number || "-";

                        return (
                          <div
                            key={`${op.institution_id}-${index}`}
                            className="px-6 py-4 hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: color + "33",
                                  }}
                                >
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color }}
                                  >
                                    {sectorLabel}
                                  </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {op.institution_name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Sector {sectorLabel}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-sm font-bold text-white">
                                  {op.total_tons_formatted ||
                                    `${op.total_tons?.toFixed(2) || 0} t`}
                                </p>
                                <p className="text-xs text-gray-400">tone</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        Nu există operatori pentru perioada selectată
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RECENT TICKETS */}
              <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Ultimele înregistrări
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {data?.recent_tickets?.length || 0} înregistrări recente
                    </p>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {data?.recent_tickets && data.recent_tickets.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                      {data.recent_tickets.map((t) => {
                        const color = t.icon_color || "#3b82f6";
                        const sector = t.sector_number || "-";
                        const dateLabel = t.ticket_date
                          ? new Date(t.ticket_date).toLocaleDateString("ro-RO")
                          : "";
                        const weight =
                          t.net_weight_tons_formatted ||
                          `${t.net_weight_tons?.toFixed(2) || 0} t`;
                        const timeAgo = t.time_ago || "";

                        return (
                          <div
                            key={t.id}
                            className="px-6 py-4 hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: color + "33",
                                  }}
                                >
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color }}
                                  >
                                    {sector}
                                  </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    Cod deșeu: {t.waste_code}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {dateLabel} • Tichet {t.ticket_number}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-sm font-bold text-white">
                                  {weight}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {timeAgo}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <p className="text-sm text-gray-500">
                        Nu există tichete pentru perioada selectată
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

/* SUMMARY CARD */
const SummaryCard = ({ title, value, subtitle, icon, color = "emerald" }) => {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    orange: "bg-orange-500/10 text-orange-400",
  };

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.16em] mb-1">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-white tabular-nums mb-1">
            {value}
          </p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardLandfill;
