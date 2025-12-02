// src/components/dashboard/MonthlyEvolutionChart.jsx
/**
 * ============================================================================
 * MONTHLY EVOLUTION CHART - VERSIUNE FINALĂ V2
 * ============================================================================
 * 
 * MODIFICĂRI:
 * - FIX MINIMUM: Afișează valoarea Minimum în stats footer (lipsea)
 * - FIX HOVER: Tooltip mai discret (fundal transparent, culoare ajustată)
 * - FIX GRIDLINES LIGHT MODE: Linii subțiri strokeDasharray 3 3, culoare #e5e7eb
 * - FIX TEXT TOOLTIP: Culori lizibile pe dark mode (#e5e7eb)
 * - Stats footer: Maximum, Minimum, Medie lunară, Trending
 * 
 * ============================================================================
 */

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

const MonthlyEvolutionChart = ({ data = [], loading, isDarkMode = false }) => {
  // ========================================================================
  // PROCESARE DATE
  // ========================================================================

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      month: item.month || "N/A",
      monthName: item.month_name || "N/A",
      quantity: parseFloat(item.total_quantity) || 0,
    }));
  }, [data]);

  // ========================================================================
  // CALCULE STATISTICI
  // ========================================================================

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        max: { value: 0, month: "N/A" },
        min: { value: 0, month: "N/A" },
        avg: 0,
        trend: 0,
      };
    }

    const quantities = chartData.map((d) => d.quantity);
    const maxValue = Math.max(...quantities);
    const minValue = Math.min(...quantities);

    const maxItem = chartData.find((d) => d.quantity === maxValue);
    const minItem = chartData.find((d) => d.quantity === minValue);

    const avg = quantities.reduce((sum, val) => sum + val, 0) / quantities.length;

    // Trending: compară ultimele 3 luni cu primele 3 luni
    let trend = 0;
    if (chartData.length >= 6) {
      const firstThree = chartData.slice(0, 3).reduce((sum, d) => sum + d.quantity, 0) / 3;
      const lastThree = chartData.slice(-3).reduce((sum, d) => sum + d.quantity, 0) / 3;
      trend = firstThree > 0 ? ((lastThree - firstThree) / firstThree) * 100 : 0;
    }

    return {
      max: { value: maxValue, month: maxItem?.monthName || "N/A" },
      min: { value: minValue, month: minItem?.monthName || "N/A" },
      avg,
      trend,
    };
  }, [chartData]);

  // ========================================================================
  // FORMAT NUMERE
  // ========================================================================

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return new Intl.NumberFormat("ro-RO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // ========================================================================
  // CUSTOM TOOLTIP
  // ========================================================================

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {data.monthName}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {formatNumber(data.quantity)} tone
          </span>
        </div>
      </div>
    );
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse"></div>
      </div>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nu există date lunare pentru perioada selectată
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-gray-50 dark:bg-[#252d3d] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Evoluție lunară a cantităților depozitate
        </h3>
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Gridlines - FIX LIGHT MODE: Subțiri și discrete */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? "#374151" : "#e5e7eb"}
              strokeWidth={1}
              vertical={false}
            />

            <XAxis
              dataKey="monthName"
              tick={{
                fill: isDarkMode ? "#9ca3af" : "#6b7280",
                fontSize: 12,
              }}
              axisLine={{ stroke: isDarkMode ? "#374151" : "#d1d5db" }}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: isDarkMode ? "#9ca3af" : "#6b7280",
                fontSize: 12,
              }}
              axisLine={{ stroke: isDarkMode ? "#374151" : "#d1d5db" }}
              tickLine={false}
              tickFormatter={(value) => `${formatNumber(value)}t`}
            />

            {/* Tooltip - FIX: Mai discret */}
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />

            <Area
              type="monotone"
              dataKey="quantity"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorQuantity)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer - FIX: Afișează și MINIMUM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        
        {/* MAXIMUM */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Maximum
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.max.value)}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
              tone
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {stats.max.month}
          </p>
        </div>

        {/* MINIMUM - FIX: Adăugat */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Minimum
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.min.value)}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
              tone
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {stats.min.month}
          </p>
        </div>

        {/* MEDIE LUNARĂ */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Medie lunară
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.avg)}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
              tone/lună
            </span>
          </p>
        </div>

        {/* TRENDING */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            {stats.trend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Trending
            </span>
          </div>
          <p
            className={`text-lg font-bold ${
              stats.trend >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stats.trend >= 0 ? "↑" : "↓"} {Math.abs(stats.trend).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            vs perioada anterioară
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEvolutionChart;