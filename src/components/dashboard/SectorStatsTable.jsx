/**
 * ============================================================================
 * SECTOR STATS TABLE COMPONENT
 * ============================================================================
 * 
 * Table showing waste quantities per sector with:
 * - Colored circular icons with sector numbers
 * - Total tons per sector
 * - Percentage of total
 * - Year-over-year variation
 * 
 * Props:
 * - data: Array of sector statistics
 * - loading: Loading state
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatTons, formatPercent, getSectorIconClasses } from '../utils/dashboardUtils';

const SectorStatsTable = ({ data = [], loading = false }) => {
  /**
   * Get variation icon and color
   */
  const getVariationDisplay = (variation, direction) => {
    if (variation === 0) {
      return {
        icon: Minus,
        color: 'text-gray-500 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-800',
      };
    }

    const isPositive = direction === 'up';
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

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Nu există date per sector pentru perioada selectată
        </p>
      </div>
    );
  }

  /**
   * Calculate total for footer
   */
  const totalTons = data.reduce((sum, sector) => sum + sector.total_tons, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Cantități per sector
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Distribuție pe sectoare
        </p>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-4">Sector</div>
        <div className="col-span-3 text-right">Cantitate (tone)</div>
        <div className="col-span-3 text-right">Variație</div>
        <div className="col-span-2 text-right">%</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((sector) => {
          const variation = getVariationDisplay(sector.variation_percent, sector.variation_direction);
          const VariationIcon = variation.icon;

          return (
            <div
              key={sector.sector_id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {/* Sector Name with Icon */}
              <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                {/* Circular Icon with Number */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-bold text-lg
                  ${getSectorIconClasses(sector.sector_number)}
                `}>
                  {sector.sector_number}
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {sector.sector_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sector.city}
                  </p>
                </div>
              </div>

              {/* Total Tons */}
              <div className="col-span-1 md:col-span-3 flex md:justify-end items-center">
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {sector.total_tons_formatted}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sector.ticket_count} {sector.ticket_count === 1 ? 'tichet' : 'tichete'}
                  </p>
                </div>
              </div>

              {/* Variation */}
              <div className="col-span-1 md:col-span-3 flex md:justify-end items-center">
                <div className={`
                  inline-flex items-center gap-2 px-3 py-1 rounded-full
                  ${variation.bg}
                `}>
                  <VariationIcon className={`w-4 h-4 ${variation.color}`} />
                  <span className={`text-sm font-semibold ${variation.color}`}>
                    {Math.abs(sector.variation_percent).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Percentage */}
              <div className="col-span-1 md:col-span-2 flex md:justify-end items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {formatPercent(sector.percentage_of_total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Total */}
      <div className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4">
          <div className="col-span-1 md:col-span-4">
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              Total
            </p>
          </div>
          <div className="col-span-1 md:col-span-3 md:text-right">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatTons(totalTons)}
            </p>
          </div>
          <div className="col-span-1 md:col-span-5" />
        </div>
      </div>
    </div>
  );
};

export default SectorStatsTable;