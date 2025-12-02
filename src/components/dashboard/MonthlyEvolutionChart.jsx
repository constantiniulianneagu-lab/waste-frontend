// src/components/dashboard/MonthlyEvolutionChart.jsx
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
import { Activity, BarChart3, TrendingUp } from "lucide-react";

const MonthlyEvolutionChart = ({ data = [], stats = {}, loading = false }) => {
  const [chartType, setChartType] = useState("area"); // 'area' | 'bar' | 'line'

  const hasData = Array.isArray(data) && data.length > 0;
  const yearLabel = hasData ? data[0]?.year : null;

  const chartModes = [
    { id: "area", label: "Area", icon: Activity },
    { id: "bar", label: "Bare", icon: BarChart3 },
    { id: "line", label: "Linie", icon: TrendingUp },
  ];

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 xl:p-7 h-[430px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Se încarcă graficul...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 xl:p-7 h-[430px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nu există suficiente date pentru a afișa evoluția lunară.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 xl:p-7 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Evoluție lunară a cantităților depozitate
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cantități nete (tone) pe luni
            {yearLabel ? <> – <span className="font-medium">{yearLabel}</span></> : null}
          </p>
        </div>

        {/* Chart type switcher */}
        <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-1">
          {chartModes.map(({ id, label, icon: Icon }) => {
            const active = chartType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setChartType(id)}
                className={[
                  "inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70",
                ].join(" ")}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" && (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="landfillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  padding: 12,
                  color: "#e5e7eb",
                }}
                labelStyle={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                itemStyle={{
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `${Number(value).toLocaleString("ro-RO")} t`,
                  "Cantitate",
                ]}
              />
              <Area
                type="monotone"
                dataKey="total_tons"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#landfillArea)"
                animationDuration={900}
              />
            </AreaChart>
          )}

          {chartType === "bar" && (
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  padding: 12,
                  color: "#e5e7eb",
                }}
                labelStyle={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                itemStyle={{
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `${Number(value).toLocaleString("ro-RO")} t`,
                  "Cantitate",
                ]}
              />
              <Bar
                dataKey="total_tons"
                radius={[8, 8, 0, 0]}
                className="fill-emerald-500 dark:fill-emerald-400"
                animationDuration={900}
              />
            </BarChart>
          )}

          {chartType === "line" && (
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:stroke-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  padding: 12,
                  color: "#e5e7eb",
                }}
                labelStyle={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                itemStyle={{
                  fontSize: 12,
                }}
                formatter={(value) => [
                  `${Number(value).toLocaleString("ro-RO")} t`,
                  "Cantitate",
                ]}
              />
              <Line
                type="monotone"
                dataKey="total_tons"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 3.5, strokeWidth: 0, fill: "#38bdf8" }}
                activeDot={{ r: 6 }}
                animationDuration={900}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats footer */}
      <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Max */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Maximum
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.maximum?.value
              ? stats.maximum.value.toLocaleString("ro-RO")
              : "0"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.maximum?.month || "N/A"}
          </p>
        </div>

        {/* Min */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Minimum
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.minimum?.value
              ? stats.minimum.value.toLocaleString("ro-RO")
              : "0"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.minimum?.month || "N/A"}
          </p>
        </div>

        {/* Average */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Medie lunară
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.average_monthly
              ? stats.average_monthly.toLocaleString("ro-RO")
              : "0"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            tone / lună
          </p>
        </div>

        {/* Trending */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Trending
          </p>
          <p
            className={[
              "text-lg font-semibold",
              stats.trending?.direction === "down"
                ? "text-rose-500"
                : "text-emerald-500",
            ].join(" ")}
          >
            {stats.trending?.direction === "down" ? "↓" : "↑"}{" "}
            {Math.abs(stats.trending?.value || 0).toLocaleString("ro-RO")}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            vs {stats.trending?.vs_period || "--"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEvolutionChart;
