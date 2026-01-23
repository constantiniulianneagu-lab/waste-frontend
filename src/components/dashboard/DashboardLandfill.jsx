// src/components/dashboard/DashboardLandfill.jsx
/**
 * ============================================================================
 * DASHBOARD DEPOZITARE - FINAL WITH MODERN SUMMARY CARDS
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { getLandfillStats } from "../../services/dashboardService.js";

import DashboardSidebarLandfill from "./DashboardSidebarLandfill.jsx";
import SummaryCardsLandfill from "./SummaryCardsLandfill.jsx";
import WasteCategoriesLandfill from "./WasteCategoriesLandfill.jsx";
import PerSectorChartLandfill from "./PerSectorChartLandfill.jsx";
import MonthlyEvolutionChart from "./MonthlyEvolutionChart.jsx";
import TopOperatorsLandfill from "./TopOperatorsLandfill.jsx";
import RecentTicketsLandfill from "./RecentTicketsLandfill.jsx";

const DashboardLandfill = () => {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    sector_id: "all",
    from: null,
    to: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getLandfillStats(filters);

      if (response?.success) {
        setData(response.data);
      } else {
        setError(response?.message || "Eroare la încărcarea datelor");
      }
    } catch (err) {
      console.error("❌ Error fetching landfill dashboard:", err);
      setError("Eroare de conexiune. Verifică serverul.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters.year, filters.sector_id, filters.from, filters.to]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Eroare</h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition"
          >
            Reîncearcă
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Main Content */}
      <div className="space-y-6">
        <SummaryCardsLandfill data={data?.summary} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <WasteCategoriesLandfill data={data?.waste_categories || []} loading={loading} />

          <div className="xl:col-span-2">
            <PerSectorChartLandfill data={data?.per_sector || []} loading={loading} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
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

          <div className="xl:col-span-1">
            <TopOperatorsLandfill data={data?.top_operators || []} loading={loading} />
          </div>
        </div>

        <RecentTicketsLandfill data={data?.recent_tickets || []} loading={loading} />
      </div>

      {/* Sidebar */}
      <DashboardSidebarLandfill
        data={data}
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
      />
    </div>
  );
};

export default DashboardLandfill;
