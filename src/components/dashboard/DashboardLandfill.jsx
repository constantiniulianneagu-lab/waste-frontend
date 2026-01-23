// src/components/dashboard/DashboardLandfill.jsx
/**
 * ============================================================================
 * DASHBOARD DEPOZITARE - FINAL WITH MODERN SUMMARY CARDS
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { getLandfillStats } from "../../services/dashboardLandfillService.js";
import { getTodayDate, getYearStart } from "../../utils/dashboardUtils.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";
import WasteCodesListCard from "./WasteCodesListCard.jsx";
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
      if (filters.sector_id) params.append('sector_id', filters.sector_id);

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
        onExport={handleExport}
        exporting={exporting}
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sectors={sectors}
          availableYears={availableYears}
          loading={loading}
        />

        {!data?.summary ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nu există date disponibile
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nu am găsit date pentru perioada și filtrele selectate. 
              Încercați să modificați criteriile de căutare.
            </p>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS + WASTE CODES (2 SECȚIUNI MARI) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* STÂNGA: 6 CARDURI SUMMARY - ocupă 5 coloane - HEIGHT FIXED 600px */}
              <div className="lg:col-span-5 flex flex-col gap-4 h-[600px]">
                
                {/* Carduri 1-4 - Grid 2x2 cu înălțime egală */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {/* CARD 1 - EVIDENȚIAT */}
                  <SummaryCard
                    title="TOTAL DEȘEURI"
                    value={data.summary.total_tons_formatted || "0"}
                    subtitle="tone depozitate"
                    gradient="from-emerald-500 to-teal-600"
                    icon="📈"
                    highlighted={true}
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

                {/* Carduri NOI 5 și 6 - CU PROGRESS BAR */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {/* CARD 5 - DEȘEURI TRATATE DEPOZITATE */}
                  <SummaryCard
                    title="DEȘEURI TRATATE DEPOZITATE"
                    value={data.summary.treated_waste_formatted || "0"}
                    subtitle="tone deșeuri din instalații de tratare"
                    gradient="from-amber-500 to-orange-600"
                    icon="♻️"
                    showProgressBar={true}
                    percentage={data.summary.treated_waste_percentage || 0}
                  />
                  
                  {/* CARD 6 - DEȘEURI DEPOZITATE DIRECT */}
                  <SummaryCard
                    title="DEȘEURI DEPOZITATE DIRECT"
                    value={data.summary.direct_waste_formatted || "0"}
                    subtitle="tone deșeuri fără prelucrare"
                    gradient="from-violet-500 to-purple-600"
                    icon="🗑️"
                    showProgressBar={true}
                    percentage={data.summary.direct_waste_percentage || 0}
                  />
                </div>
              </div>

              {/* DREAPTA: LISTA CODURI DEȘEURI - ocupă 7 coloane - HEIGHT FIXED 600px */}
              <div className="lg:col-span-7">
                <WasteCodesListCard
                  codes={data?.waste_categories || []}
                  loading={loading}
                />
              </div>
            </div>

            {/* CHART + SECTOR TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MonthlyEvolutionChart
                  data={data?.monthly_evolution || []}
                  stats={data?.monthly_stats || {}}
                  loading={loading}
                  sectorsData={data?.monthly_evolution_sectors || []}
                  sectorKeys={data?.monthly_sector_keys || []}
                  codesData={data?.monthly_evolution_codes || []}
                  codeKeys={data?.monthly_code_keys || []}
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
 * SUMMARY CARD - 2026 SAMSUNG/APPLE STYLE - IMPROVED
 * ============================================================================
 * Enhanced with highlighted mode and progress bars for cards 5,6
 */
const SummaryCard = ({ title, value, subtitle, gradient, icon, highlighted = false, showProgressBar = false, percentage = 0 }) => (
  <div className="group relative h-full">
    
    {/* Background colorat VIZIBIL pentru card evidențiat */}
    {highlighted && (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 
                      dark:from-emerald-500/15 dark:to-teal-500/15 
                      rounded-[24px] blur-md" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 
                      dark:from-emerald-500/10 dark:to-teal-500/10 
                      rounded-[24px]" />
      </>
    )}
    
    {/* Card Container */}
    <div className={`relative h-full
                  bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  ${highlighted 
                    ? 'border-2 border-emerald-400/60 dark:border-emerald-500/50' 
                    : 'border border-gray-200 dark:border-gray-700/50'}
                  rounded-[24px] p-5
                  shadow-sm dark:shadow-none
                  hover:shadow-lg dark:hover:shadow-xl
                  ${highlighted 
                    ? 'hover:border-emerald-500/80 dark:hover:border-emerald-400/70' 
                    : 'hover:border-gray-300 dark:hover:border-gray-600'}
                  hover:-translate-y-1
                  transition-all duration-300 ease-out
                  overflow-hidden
                  flex flex-col justify-between`}>

      {/* Gradient accent line - Top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header: Title + Icon */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase leading-tight">
            {title}
          </p>
          
          {/* Icon Badge */}
          <div className={`w-11 h-11 rounded-[14px] bg-gradient-to-br ${gradient} 
                        flex items-center justify-center flex-shrink-0
                        shadow-md group-hover:shadow-lg
                        group-hover:scale-110 transition-all duration-300`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>

        {/* Value - Bigger for highlighted card */}
        <div className="flex-1 flex items-center">
          <p className={`${highlighted ? 'text-3xl' : 'text-2xl'} font-black 
                      text-gray-900 dark:text-white leading-none
                      group-hover:scale-105 transition-transform duration-300`}>
            {value}
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-2">
          {subtitle}
        </p>

        {/* Progress Bar - DOAR pentru carduri 5 și 6 */}
        {showProgressBar && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-end">
              <span className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradient} rounded-full 
                          shadow-sm transition-all duration-1000 ease-out`}
                style={{ 
                  width: `${percentage}%`,
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Glassmorphism overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent 
                    pointer-events-none rounded-[24px]" />
    </div>
  </div>
);

export default DashboardLandfill;