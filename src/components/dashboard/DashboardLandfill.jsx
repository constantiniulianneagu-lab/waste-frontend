// src/components/dashboard/DashboardLandfill.jsx
/**
 * ============================================================================
 * DASHBOARD DEPOZITARE - FINAL WITH MODERN SUMMARY CARDS
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle, Download } from "lucide-react";

import { getLandfillStats } from "../../services/dashboardLandfillService.js";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";
import WasteCategoryCards from "./WasteCategoryCards.jsx";
import MonthlyEvolutionChart from "./MonthlyEvolutionChart.jsx";
import SectorStatsTable from "./SectorStatsTable.jsx";
import RecentTicketsTable from "./RecentTicketsTable.jsx";
import TopOperatorsTable from "./TopOperatorsTable.jsx";

const DashboardLandfill = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: getYearStart(),
    to: getTodayDate(),
    sector_id: null,
  });

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
  
      if (typeof res === "object" && "success" in res) {
        if (!res.success) {
          throw new Error(res.message || "API responded with success=false");
        }
        console.log("✅ Using res.data for dashboard:", res.data);
        setData(res.data);
      } else {
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
  }, []);

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filter change requested:', newFilters);
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    console.log("🔍 Search query:", query);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Build query params from current filters
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.sector_id) params.append('sectorId', filters.sector_id);

      const API_URL = 'https://waste-backend-3u9c.onrender.com';
      const token = localStorage.getItem('wasteAccessToken');
      
      const response = await fetch(
        `${API_URL}/api/dashboard/landfill/export?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raport-depozitare-${filters.year || 'current'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export error:', error);
      alert('Eroare la generarea raportului PDF. Vă rugăm încercați din nou.');
    } finally {
      setExporting(false);
    }
  };

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
                    onClick={() => fetchDashboardData()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
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

  // ✅ SINGURA MODIFICARE: folosește all_sectors pentru dropdown, păstrează per_sector pentru tabel
  const sectors = data?.all_sectors || data?.per_sector || [];
  const availableYears = data?.available_years || [new Date().getFullYear()];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <DashboardHeader 
        notificationCount={notificationCount}
        onSearchChange={handleSearchChange}
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sectors={sectors}
          availableYears={availableYears}
          loading={loading}
        />

        {/* Export PDF Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={exporting || loading || !data}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
          >
            <Download className="w-5 h-5" />
            {exporting ? 'Generare PDF...' : 'Export PDF'}
          </button>
        </div>

        {!data?.summary ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Nu există date pentru perioada selectată
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Încearcă să selectezi o perioadă diferită.
            </p>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
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
                value={data.summary.total_tickets?.toLocaleString("ro-RO") || "0"}
                subtitle="înregistrări"
                gradient="from-cyan-500 to-blue-600"
                icon="🧾"
              />
              <SummaryCard
                title="MEDIE PER TICHET"
                value={data.summary.avg_weight_per_ticket?.toFixed(2) || "0.00"}
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
              
              {/* TOP OPERATORS - MODERN COMPONENT */}
              <TopOperatorsTable 
                data={data?.top_operators || []}
                loading={loading}
              />

              {/* RECENT TICKETS - MODERN COMPONENT */}
              <RecentTicketsTable 
                data={data?.recent_tickets || []}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * SUMMARY CARD - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * Modern premium card with glassmorphism, gradients, and perfect light/dark mode
 */
const SummaryCard = ({ title, value, subtitle, gradient, icon }) => (
  <div className="group relative">
    {/* Card Container - Samsung One UI rounded style */}
    <div className="relative h-full
                  bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  border border-gray-200 dark:border-gray-700/50
                  rounded-[24px] p-6
                  shadow-sm dark:shadow-none
                  hover:shadow-lg dark:hover:shadow-xl
                  hover:border-gray-300 dark:hover:border-gray-600
                  hover:-translate-y-1
                  transition-all duration-300 ease-out
                  overflow-hidden">
      
      {/* Accent line - left edge with gradient */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]
                    bg-gradient-to-b ${gradient}
                    group-hover:w-1.5 transition-all duration-300`} />
      
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} 
                    opacity-[0.02] dark:opacity-[0.04] 
                    group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08]
                    transition-opacity duration-500`} />

      {/* Content wrapper */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Title - uppercase label */}
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 
                      uppercase tracking-widest mb-3">
            {title}
          </p>
          
          {/* Value - large gradient number */}
          <p className={`text-3xl sm:text-4xl font-bold 
                       bg-gradient-to-r ${gradient} 
                       bg-clip-text text-transparent 
                       mb-2 leading-tight`}>
            {value}
          </p>
          
          {/* Subtitle - description */}
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Icon badge - Samsung soft circles */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-[18px]
                      bg-gradient-to-br ${gradient}
                      flex items-center justify-center
                      shadow-lg
                      group-hover:scale-110 group-hover:rotate-3
                      transition-all duration-300`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>

      {/* Status indicator dot */}
      <div className={`absolute top-4 left-4 w-1.5 h-1.5 rounded-full
                    bg-gradient-to-br ${gradient}
                    opacity-40 dark:opacity-60 animate-pulse`} />
    </div>
  </div>
);

export default DashboardLandfill;