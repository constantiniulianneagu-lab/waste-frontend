// src/components/dashboard/DashboardLandfill.jsx
/**
 * ============================================================================
 * DASHBOARD DEPOZITARE - FIXED VERSION
 * ============================================================================
 * 
 * ✅ FIXES:
 * - Uses all_sectors from API for dropdown (not just sectors with data)
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

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

  // ✅ FIX #2: Use all_sectors for dropdown (not per_sector)
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
            <WasteCategoryCards 
              categories={data.waste_categories || []}
              summary={data.summary}
              monthlyStats={data.monthly_stats}
            />

            <MonthlyEvolutionChart 
              data={data.monthly_evolution || []}
              title="Evoluție lunară"
            />

            <SectorStatsTable 
              sectors={data.per_sector || []}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopOperatorsTable 
                operators={data.top_operators || []}
              />

              <RecentTicketsTable 
                tickets={data.recent_tickets || []}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardLandfill;