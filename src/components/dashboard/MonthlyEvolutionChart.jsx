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
 * 🌓 LIGHT/DARK MODE:
 * - Light: Clean whites, vibrant chart colors, soft shadows
 * - Dark: Deep backgrounds, glowing accents, muted grid
 * - Adaptive text colors throughout
 * 
 * 📊 FEATURES:
 * - 3 chart types: Area, Bar, Line
 * - Interactive tooltips with Romanian formatting
 * - Stats summary: Maximum, Minimum, Average, Trending
 * - Smooth animations & transitions
 * - Responsive design
 * 
 * ============================================================================
 */

import { useState } from "react";
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
import { Activity, BarChart3, TrendingUp, TrendingDown, Zap } from "lucide-react";

const MonthlyEvolutionChart = ({ data = [], stats = {}, loading = false }) => {
  const [chartType, setChartType] = useState("area");

  const hasData = Array.isArray(data) && data.length > 0;
  const yearLabel = hasData ? data[0]?.year : null;

  // Chart type configurations
  const chartModes = [
    { id: "area", label: "Area", icon: Activity, color: "emerald" },
    { id: "bar", label: "Bare", icon: BarChart3, color: "emerald" },
    { id: "line", label: "Linie", icon: TrendingUp, color: "sky" },
  ];

  // ========================================================================
  // CUSTOM TOOLTIP - GLASSMORPHISM PREMIUM STYLE
  // ========================================================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl 
                      border border-gray-200 dark:border-gray-700/50 
                      rounded-[16px] px-4 py-3 
                      shadow-xl">
          {/* Month label */}
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 
                      uppercase tracking-wider mb-1.5">
            {label}
          </p>
          
          {/* Amount */}
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 
                        bg-clip-text text-transparent">
              {Number(payload[0].value).toLocaleString("ro-RO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              tone
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // ========================================================================
  // LOADING STATE - SAMSUNG STYLE
  // ========================================================================
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                    border border-gray-200 dark:border-gray-700/50 
                    rounded-[28px] p-6 xl:p-7 h-[480px] 
                    shadow-sm dark:shadow-none
                    flex items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
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
  // EMPTY STATE - MINIMAL & ELEGANT
  // ========================================================================
  if (!hasData) {
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
  // MAIN RENDER - 2026 PREMIUM DESIGN
  // ========================================================================
  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                  border border-gray-200 dark:border-gray-700/50 
                  rounded-[28px] p-6 xl:p-7 
                  shadow-sm dark:shadow-none
                  flex flex-col h-full">
      
      {/* ====================================================================
          HEADER SECTION
      ==================================================================== */}
      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 flex-wrap">
        
        {/* Title & Description */}
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

        {/* Chart Type Switcher - Samsung One UI style */}
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

      {/* ====================================================================
          CHART SECTION - ENLARGED
      ==================================================================== */}
      <div className="w-full h-[300px] sm:h-[340px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          
          {/* AREA CHART */}
          {chartType === "area" && (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{ 
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ 
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
              <Area
                type="monotone"
                dataKey="total_tons"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#areaGradient)"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          )}

          {/* BAR CHART */}
          {chartType === "bar" && (
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{ 
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ 
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
              <Bar
                dataKey="total_tons"
                radius={[10, 10, 0, 0]}
                fill="#10b981"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </BarChart>
          )}

          {/* LINE CHART */}
          {chartType === "line" && (
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{ 
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ 
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500
                }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
              <Line
                type="monotone"
                dataKey="total_tons"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ 
                  r: 4, 
                  strokeWidth: 0, 
                  fill: "#0ea5e9" 
                }}
                activeDot={{ 
                  r: 7,
                  strokeWidth: 2,
                  stroke: "#fff",
                  fill: "#0ea5e9"
                }}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ====================================================================
          STATS FOOTER - PREMIUM CARDS
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
              {stats.maximum?.value
                ? stats.maximum.value.toLocaleString("ro-RO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0"}
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
              {stats.average_monthly
                ? stats.average_monthly.toLocaleString("ro-RO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0"}
            </p>
            
            {/* Unit */}
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
              tone / lună
            </p>
          </div>
        </div>

        {/* Trending Card */}
        <div className="relative group">
          <div className={`
            p-4 rounded-[20px] 
            hover:shadow-md transition-all duration-300
            ${stats.trending?.direction === "down"
              ? "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10 border border-rose-200 dark:border-rose-500/20"
              : "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20"
            }
          `}>
            
            {/* Icon badge */}
            <div className={`
              w-8 h-8 rounded-[12px] 
              flex items-center justify-center mb-3
              shadow-md
              ${stats.trending?.direction === "down"
                ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
              }
            `}>
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Label */}
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 
                        uppercase tracking-wider mb-2">
              Trending
            </p>
            
            {/* Value with arrow */}
            <p className={`
              text-xl font-bold mb-1
              ${stats.trending?.direction === "down"
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
              }
            `}>
              {stats.trending?.direction === "down" ? "↓" : "↑"}{" "}
              {Math.abs(stats.trending?.value || 0).toLocaleString("ro-RO", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}%
            </p>
            
            {/* Comparison period */}
            <p className={`
              text-xs font-medium
              ${stats.trending?.direction === "down"
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