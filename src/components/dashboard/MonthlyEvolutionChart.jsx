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
  const [chartType, setChartType] = useState("area");

  const hasData = Array.isArray(data) && data.length > 0;
  const yearLabel = hasData ? data[0]?.year : null;

  const chartModes = [
    { id: "area", label: "Area", icon: Activity },
    { id: "bar", label: "Bare", icon: BarChart3 },
    { id: "line", label: "Linie", icon: TrendingUp },
  ];

  // ─────────────────────────────────────────────────────────────
  // CUSTOM TOOLTIP COMPONENT (DARK/LIGHT ADAPTIVE)
  // ─────────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border-2 border-emerald-500 dark:border-emerald-400 rounded-xl p-3 shadow-xl">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            {label}
          </p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {Number(payload[0].value).toLocaleString("ro-RO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            tone
          </p>
        </div>
      );
    }
    return null;
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 xl:p-7 h-[430px] flex items-center justify-center">
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 xl:p-7 h-[430px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 xl:p-7 shadow-sm flex flex-col h-full">
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
        <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
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
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
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
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
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
                className="stroke-gray-200 dark:stroke-gray-700"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total_tons"
                radius={[8, 8, 0, 0]}
                fill="#10b981"
                animationDuration={900}
              />
            </BarChart>
          )}

          {chartType === "line" && (
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total_tons"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 3.5, strokeWidth: 0, fill: "#0ea5e9" }}
                activeDot={{ r: 6 }}
                animationDuration={900}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats footer */}
      <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Maximum */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Maximum
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.maximum?.value
              ? stats.maximum.value.toLocaleString("ro-RO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.maximum?.month || "N/A"}
          </p>
        </div>

        {/* Minimum - FIX: AFIȘEAZĂ VALOAREA CORECT */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Minimum
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.minimum?.value !== undefined && stats.minimum?.value !== null
              ? stats.minimum.value.toLocaleString("ro-RO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
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
              ? stats.average_monthly.toLocaleString("ro-RO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
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
                ? "text-rose-500 dark:text-rose-400"
                : "text-emerald-500 dark:text-emerald-400",
            ].join(" ")}
          >
            {stats.trending?.direction === "down" ? "↓" : "↑"}{" "}
            {Math.abs(stats.trending?.value || 0).toLocaleString("ro-RO", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            %
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