/**
 * ============================================================================
 * WASTE CATEGORY CARDS COMPONENT
 * ============================================================================
 * 
 * Displays 5 large colored cards for waste categories:
 * - 20 03 01 (Deșeuri municipale)
 * - 20 03 03 (Reziduuri străzi)
 * - 19 * * (Deșeuri de sortare - aggregated)
 * - 17 09 04 (Construcții)
 * - ALTELE (Other categories)
 * 
 * Props:
 * - categories: Array of waste category data
 * - loading: Loading state
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React from 'react';
import { formatTons, formatPercent, getWasteCodeIcon } from '../utils/dashboardUtils';

const WasteCategoryCards = ({ categories = [], loading = false }) => {
  /**
   * Get card color classes by waste code
   */
  const getCardClasses = (wasteCode) => {
    const colorMap = {
      '20 03 01': {
        bg: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
        icon: 'bg-purple-600 dark:bg-purple-700',
        progress: 'bg-purple-700 dark:bg-purple-800',
      },
      '20 03 03': {
        bg: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
        icon: 'bg-emerald-600 dark:bg-emerald-700',
        progress: 'bg-emerald-700 dark:bg-emerald-800',
      },
      '19 * *': {
        bg: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
        icon: 'bg-orange-600 dark:bg-orange-700',
        progress: 'bg-orange-700 dark:bg-orange-800',
      },
      '17 09 04': {
        bg: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700',
        icon: 'bg-pink-600 dark:bg-pink-700',
        progress: 'bg-pink-700 dark:bg-pink-800',
      },
      'ALTELE': {
        bg: 'from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700',
        icon: 'bg-cyan-600 dark:bg-cyan-700',
        progress: 'bg-cyan-700 dark:bg-cyan-800',
      },
    };
    return colorMap[wasteCode] || colorMap['ALTELE'];
  };

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 animate-pulse"
          />
        ))}
      </div>
    );
  }

  /**
   * Empty state
   */
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Nu există date pentru perioada selectată
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {categories.map((category) => {
        const colors = getCardClasses(category.waste_code);
        const icon = getWasteCodeIcon(category.waste_code);

        return (
          <div
            key={category.waste_code}
            className={`
              relative overflow-hidden rounded-2xl shadow-lg 
              hover:shadow-xl transition-all duration-300 hover:scale-105
              bg-gradient-to-br ${colors.bg}
            `}
          >
            {/* Card Content */}
            <div className="relative p-6 text-white">
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-xl ${colors.icon} 
                flex items-center justify-center mb-4
                shadow-lg
              `}>
                <span className="text-2xl">{icon}</span>
              </div>

              {/* Waste Code */}
              <div className="mb-1">
                <p className="text-xs font-medium opacity-90">
                  {category.waste_code}
                </p>
              </div>

              {/* Description */}
              <h3 className="text-sm font-semibold mb-4 line-clamp-2">
                {category.waste_description}
              </h3>

              {/* Total Tons - Large Display */}
              <div className="mb-4">
                <p className="text-3xl font-bold">
                  {category.total_tons_formatted}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {category.ticket_count} {category.ticket_count === 1 ? 'tichet' : 'tichete'}
                </p>
              </div>

              {/* Percentage from Total */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium opacity-90">
                    DIN TOTAL
                  </span>
                  <span className="text-sm font-bold">
                    {formatPercent(category.percentage_of_total)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.progress} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(category.percentage_of_total, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Decorative Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="white" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WasteCategoryCards;