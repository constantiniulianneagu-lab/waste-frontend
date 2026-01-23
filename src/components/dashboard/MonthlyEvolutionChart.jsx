// src/components/dashboard/MonthlyEvolutionChart.jsx
/**
 * ============================================================================
 * MONTHLY EVOLUTION CHART - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 *
 * 🎨 DESIGN PHILOSOPHY:
 * - Samsung One UI 7.0 modern chart design
 * - Apple-style chart type switcher with smooth transitions
 * - Perfect light/dark mode with adaptive colors
 * - Glassmorphism tooltip with backdrop blur
 * - Premium stats cards with gradients
 *
 * 📊 FEATURES:
 * - 3 chart types: Area, Bar, Line
 * - Breakdown switch: Sectoare / Coduri deșeu
 * - Interactive tooltips with Romanian formatting
 * - Stats summary: Maximum, Minimum, Average, Trending (pe total)
 *
 * ============================================================================
 */

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, BarChart3, TrendingUp, TrendingDown, Zap, Layers } from "lucide-react";

const SECTOR_COLORS = {
  1: "#7C3AED",
  2: "#9CA3AF",
  3: "#10B981",
  4: "#F59E0B",
  5: "#EC4899",
  6: "#06B6D4",
};

const CODE_COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#EC4899", "#06B6D4", "#0EA5E9", "#64748B"];

const MonthlyEvolutionChart = ({
  data = [],
  stats = {},
  loading = false,

  // NEW (breakdown datasets)
  sectorsData = [],
  sectorKeys = [],
  codesData = [],
  codeKeys = [],
}) => {
  const [chartType, setChartType] = useState("area");
  const [breakdownMode, setBreakdownMode] = useState("sectors"); // "sectors" | "codes"

  const hasTotalData = Array.isArray(data) && data.length > 0;

  const chartModes = [
    { id: "area", label: "Area", icon: Activity },
    { id: "bar", label: "Bare", icon: BarChart3 },
    { id: "line", label: "Linie", icon: TrendingUp },
  ];

  const breakdownModes = [
    { id: "sectors", label: "Sectoare", icon: Layers },
    { id: "codes", label: "Coduri deșeu", icon: Activity },
  ];

  const activeDataset = useMemo(() => {
    if (breakdownMode === "codes") return Array.isArray(codesData) ? codesData : [];
    return Array.isArray(sectorsData) ? sectorsData : [];
  }, [breakdownMode, codesData, sectorsData]);

  const activeKeys = useMemo(() => {
    if (breakdownMode === "codes") return Array.isArray(codeKeys) ? codeKeys : [];
    return Array.isArray(sectorKeys) ? sectorKeys : [];
  }, [breakdownMode, codeKeys, sectorKeys]);

  // Fallback: dacă nu avem breakdown data, folosim total (single series)
  const chartData = activeDataset.length ? activeDataset : (Array.isArray(data) ? data : []);
  const hasChartData = chartData.length > 0;

  const yearLabel = useMemo(() => (hasChartData ? chartData[0]?.year : null), [hasChartData, chartData]);

  const series = useMemo(() => {
    if (activeKeys.length) {
      if (breakdownMode === "sectors") {
        return activeKeys.map((k) => {
          const n = Number(String(k).replace("sector_", ""));
          return { key: k, label: `Sector ${n}`, color: SECTOR_COLORS[n] || "#6B7280" };
        });
      }
      return activeKeys.map((k, idx) => ({
        key: k,
        label: k === "ALTELE" ? "ALTELE" : String(k),
        color: CODE_COLORS[idx % CODE_COLORS.length],
      }));
    }

    // total only
    return [{ key: "total_tons", label: "Total", color: "#10b981" }];
  }, [activeKeys, breakdownMode]);

  // ========================================================================
  // CUSTOM TOOLTIP - GLASSMORPHISM PREMIUM STYLE (multi-series)
  // ========================================================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const monthLabel = payload?.[0]?.payload?.month_label || label;
    const rows = [...payload].sort((a, b) => Number(b.value || 0) - Number(a.value || 0));

    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
                      border border-gray-200 dark:border-gray-700/50
                      rounded-[16px] px-4 py-3
                      shadow-xl min-w-[220px]">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400
                      uppercase tracking-wider mb-2">
          {monthLabel}
        </p>

        <div className="space-y-1.5">
          {rows.map((p) => (
            <div key={p.dataKey} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color || "#10b981" }} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
                  {p.name}
                </span>
              </div>

              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {Number(p.value || 0).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                <span className="font-medium text-gray-500 dark:text-gray-400">t</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    border border-gray-200 dark:border-gray-700/50
                    rounded-[28px] p-6 xl:p-7 h-[480px]
                    shadow-sm dark:shadow-none
                    flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4
                        border-emerald-200 dark:border-emerald-900/30
                        border-t-emerald-600 dark:border-t-emerald-400
                        animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Se încarcă graficul...
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // EMPTY STATE
  // ========================================================================
  if (!hasChartData && !hasTotalData) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    border border-gray-200 dark:border-gray-700/50
                    rounded-[28px] p-6 xl:p-7 h-[480px]
                    shadow-sm dark:shadow-none
                    flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl
                        bg-gray-100 dark:bg-gray-700/50
                        flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Nu există suficiente date pentru a afișa evoluția lunară
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                  border border-gray-200 dark:border-gray-700/50
                  rounded-[28px] p-6 xl:p-7
                  shadow-sm dark:shadow-none
                  flex flex-col h-full">

      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Evoluție lunară a cantităților depozitate
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400
                      flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Cantități nete (tone) pe luni
            {yearLabel && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {yearLabel}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Breakdown Switcher */}
          <div className="inline-flex items-center rounded-full
                        border border-gray-200 dark:border-gray-700/50
                        bg-gray-50 dark:bg-gray-900/50
                        p-1 shadow-sm">
            {breakdownModes.map(({ id, label, icon: Icon }) => {
              const active = breakdownMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBreakdownMode(id)}
                  className={`
                    inline-flex items-center gap-1.5
                    px-3 sm:px-4 py-2 rounded-full
                    text-xs font-bold
                    transition-all duration-300
                    ${active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Type Switcher */}
          <div className="inline-flex items-center rounded-full
                        border border-gray-200 dark:border-gray-700/50
                        bg-gray-50 dark:bg-gray-900/50
                        p-1 shadow-sm">
            {chartModes.map(({ id, label, icon: Icon }) => {
              const active = chartType === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChartType(id)}
                  className={`
                    inline-flex items-center gap-1.5
                    px-3 sm:px-4 py-2 rounded-full
                    text-xs font-bold
                    transition-all duration-300
                    ${active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[340px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" && (
            <AreaChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month_name"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />

              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={s.color}
                  fillOpacity={0.12}
                  stackId={activeKeys.length ? "1" : undefined}
                  animationDuration={900}
                  animationEasing="ease-in-out"
                />
              ))}
            </AreaChart>
          )}

          {chartType === "bar" && (
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month_name"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />

              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  stackId={activeKeys.length ? "1" : undefined}
                  radius={[10, 10, 0, 0]}
                  animationDuration={900}
                  animationEasing="ease-in-out"
                />
              ))}
            </BarChart>
          )}

          {chartType === "line" && (
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month_name"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />

              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0, fill: s.color }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff", fill: s.color }}
                  animationDuration={900}
                  animationEasing="ease-in-out"
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ====================================================================
          STATS SECTION (pe total)
      ==================================================================== */}
      <div className="pt-5 border-t border-gray-200 dark:border-gray-700/50 
                    grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Maximum Card */}
        <div className="relative group">
          <div className="p-4 rounded-[20px] 
                        bg-gradient-to-br from-emerald-50 to-teal-50 
                        dark:from-emerald-500/10 dark:to-teal-500/10
                        border border-emerald-200 dark:border-emerald-500/20
                        hover:shadow-md transition-all duration-300">
            
            {/* Icon badge */}
            <div className="w-8 h-8 rounded-[12px] 
                          bg-gradient-to-br from-emerald-500 to-teal-600 
                          flex items-center justify-center mb-3
                          shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 
                        uppercase tracking-wider mb-2">
              Maximum
            </p>
            
            {/* Value */}
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.maximum?.value?.toLocaleString("ro-RO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0"}
            </p>
            
            {/* Month */}
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {stats.maximum?.month || "N/A"}
            </p>
          </div>
        </div>

        {/* Minimum Card */}
        <div className="relative group">
          <div className="p-4 rounded-[20px] 
                        bg-gradient-to-br from-blue-50 to-cyan-50 
                        dark:from-blue-500/10 dark:to-cyan-500/10
                        border border-blue-200 dark:border-blue-500/20
                        hover:shadow-md transition-all duration-300">
            
            {/* Icon badge */}
            <div className="w-8 h-8 rounded-[12px] 
                          bg-gradient-to-br from-blue-500 to-cyan-600 
                          flex items-center justify-center mb-3
                          shadow-md shadow-blue-500/20">
              <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 
                        uppercase tracking-wider mb-2">
              Minimum
            </p>
            
            {/* Value - Fixed to show 0 */}
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {typeof stats.minimum?.value === 'number'
                ? stats.minimum.value.toLocaleString("ro-RO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "N/A"}
            </p>
            
            {/* Month */}
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {stats.minimum?.month || "N/A"}
            </p>
          </div>
        </div>

        {/* Average Card */}
        <div className="relative group">
          <div className="p-4 rounded-[20px] 
                        bg-gradient-to-br from-purple-50 to-violet-50 
                        dark:from-purple-500/10 dark:to-violet-500/10
                        border border-purple-200 dark:border-purple-500/20
                        hover:shadow-md transition-all duration-300">
            
            {/* Icon badge */}
            <div className="w-8 h-8 rounded-[12px] 
                          bg-gradient-to-br from-purple-500 to-violet-600 
                          flex items-center justify-center mb-3
                          shadow-md shadow-purple-500/20">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 
                        uppercase tracking-wider mb-2">
              Medie lunară
            </p>
            
            {/* Value */}
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.average_monthly?.toLocaleString("ro-RO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0"}
            </p>
            
            {/* Unit */}
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
              tone / lună
            </p>
          </div>
        </div>

        {/* Trending Card */}
        <div className="relative group">
          <div className={`p-4 rounded-[20px] 
                        ${stats.trending?.direction === "down"
                ? "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10 border border-rose-200 dark:border-rose-500/20"
                : "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20"
              }
                        hover:shadow-md transition-all duration-300`}>
            
            {/* Icon badge */}
            <div className={`w-8 h-8 rounded-[12px] 
                          ${stats.trending?.direction === "down"
                ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/20"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20"
              }
                          flex items-center justify-center mb-3`}>
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 
                        uppercase tracking-wider mb-2">
              Trending
            </p>
            
            {/* Value */}
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.trending?.value ? `${stats.trending.value}%` : "0%"}
            </p>
            
            {/* Compared to */}
            <p className={`text-xs font-medium ${
              stats.trending?.direction === "down"
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
              }
            `}>
              vs {stats.trending?.vs_period || "anterior"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEvolutionChart;
