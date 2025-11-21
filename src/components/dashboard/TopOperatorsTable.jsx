/**
 * ============================================================================
 * TOP OPERATORS TABLE COMPONENT
 * ============================================================================
 * 
 * Table showing ALL operators sorted by waste volume (descending)
 * with:
 * - Colored circular icons with sector numbers
 * - Operator name and sectors
 * - Total tons collected
 * - Percentage of total
 * 
 * Props:
 * - data: Array of operator statistics
 * - loading: Loading state
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React, { useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { formatTons, formatPercent, getSectorIconClasses } from '../../utils/dashboardUtils.js';

const TopOperatorsTable = ({ data = [], loading = false }) => {
  const [showAll, setShowAll] = useState(false);

  // Show top 10 by default, or all if showAll is true
  const displayData = showAll ? data : data.slice(0, 10);

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
        <Building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Nu există date despre operatori pentru perioada selectată
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Top operatori salubrizare
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cantități depozitate în perioada selectată
        </p>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Operator</div>
        <div className="col-span-3 text-right">Cantitate (tone)</div>
        <div className="col-span-3 text-right">Din total</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayData.map((operator, index) => (
          <div
            key={operator.institution_id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Rank */}
            <div className="hidden md:flex col-span-1 items-center">
              <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
                {index + 1}
              </span>
            </div>

            {/* Operator Info with Sector Icons */}
            <div className="col-span-1 md:col-span-5 flex items-center gap-3">
              {/* Sector Icons (can be multiple) */}
              <div className="flex -space-x-2">
                {operator.sector_numbers.map((sectorNum, idx) => (
                  <div
                    key={idx}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      font-bold text-sm border-2 border-white dark:border-gray-800
                      ${getSectorIconClasses(sectorNum)}
                    `}
                    title={`Sector ${sectorNum}`}
                  >
                    {sectorNum}
                  </div>
                ))}
              </div>

              {/* Operator Name */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {operator.institution_name}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    Sector {operator.sector_numbers_display}
                  </span>
                  <span className="ml-2">
                    • {operator.ticket_count} {operator.ticket_count === 1 ? 'tichet' : 'tichete'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Tons */}
            <div className="col-span-1 md:col-span-3 flex md:justify-end items-center">
              <div className="text-left md:text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {operator.total_tons_formatted}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  tone
                </p>
              </div>
            </div>

            {/* Percentage */}
            <div className="col-span-1 md:col-span-3 flex md:justify-end items-center">
              <div className="flex items-center gap-2">
                {/* Percentage Bar */}
                <div className="hidden md:block w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(operator.percentage_of_total, 100)}%` }}
                  />
                </div>
                
                {/* Percentage Text */}
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                  {formatPercent(operator.percentage_of_total)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {data.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 
                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20 
                     rounded-lg transition-colors"
          >
            {showAll ? (
              <>Arată mai puțin ({data.length - 10} ascunși)</>
            ) : (
              <>Arată toți ({data.length - 10} mai mult)</>
            )}
          </button>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between px-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total operatori
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total cantitate
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatTons(data.reduce((sum, op) => sum + op.total_tons, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopOperatorsTable;