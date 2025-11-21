/**
 * ============================================================================
 * MONTHLY EVOLUTION CHART COMPONENT
 * ============================================================================
 * 
 * Area chart showing monthly waste collection trends
 * with statistics (max, min, average, trending)
 * 
 * Library: Recharts
 * 
 * Props:
 * - data: Monthly evolution data
 * - stats: Monthly statistics (max, min, avg, trending)
 * - loading: Loading state
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { monthlyEvolutionConfig } from '../../utils/chartConfig';
import { formatNumber } from '../../utils/dashboardUtils';

const MonthlyEvolutionChart = ({ data = [], stats = {}, loading = false }) => {
  const { isDarkMode } = useTheme();
  const config = monthlyEvolutionConfig(isDarkMode);

  /**
   * Custom tooltip
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {data.month} {data.year}
          </p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatNumber(data.total_tons)} tone
          </p>
        </div>
      );
    }
    return null;
  };

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Nu există date de evoluție pentru perioada selectată
        </p>
      </div>
    );
  }

  /**
   * Get trending display
   */
  const getTrendingDisplay = () => {
    if (!stats.trending) return null;

    const { value, direction } = stats.trending;
    const isPositive = direction === 'up' && value > 0;
    const isNegative = direction === 'down' || value < 0;

    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400',
      bg: isPositive
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-red-50 dark:bg-red-900/20',
    };
  };

  const trending = getTrendingDisplay();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Evoluție lunară
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cantități depozitate pe categorii - {data[0]?.year}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Vizualizare
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={config.margin}>
          <defs>
            <linearGradient
              id={config.gradient.id}
              x1={config.gradient.x1}
              y1={config.gradient.y1}
              x2={config.gradient.x2}
              y2={config.gradient.y2}
            >
              {config.gradient.stops.map((stop, index) => (
                <stop
                  key={index}
                  offset={stop.offset}
                  stopColor={stop.stopColor}
                  stopOpacity={stop.stopOpacity}
                />
              ))}
            </linearGradient>
          </defs>

          <CartesianGrid {...config.grid} />
          
          <XAxis {...config.xAxis} />
          
          <YAxis {...config.yAxis} />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area {...config.area} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Statistics Footer */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {/* Maximum */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Maximum
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.maximum?.value || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stats.maximum?.month || 'N/A'}
            </p>
          </div>

          {/* Minimum */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Minimum
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.minimum?.value || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stats.minimum?.month || 'N/A'}
            </p>
          </div>

          {/* Average */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Medie lunară
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.average_monthly || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              tone/lună
            </p>
          </div>

          {/* Trending */}
          {trending && stats.trending && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Trending
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${trending.bg}`}>
                <trending.icon className={`w-4 h-4 ${trending.color}`} />
                <span className={`text-lg font-bold ${trending.color}`}>
                  {Math.abs(stats.trending.value).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                vs {stats.trending.vs_period}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyEvolutionChart;