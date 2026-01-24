// src/components/institutions/InstitutionStats.jsx
/**
 * ============================================================================
 * INSTITUTION STATS - SUMMARY CARDS
 * ============================================================================
 * Design: Green/Teal theme
 * Updated: 2025-01-24
 * ============================================================================
 */

import { Building2, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const InstitutionStats = ({ stats = {}, loading = false }) => {
  const cards = [
    {
      label: 'Total Instituții',
      value: stats.total || 0,
      icon: Building2,
      gradient: 'from-teal-500 to-emerald-600',
      shadow: 'shadow-teal-500/30',
      bg: 'bg-teal-50 dark:bg-teal-500/10',
    },
    {
      label: 'Active',
      value: stats.active || 0,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      shadow: 'shadow-emerald-500/30',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Inactive',
      value: stats.inactive || 0,
      icon: XCircle,
      gradient: 'from-gray-400 to-gray-500',
      shadow: 'shadow-gray-400/30',
      bg: 'bg-gray-50 dark:bg-gray-500/10',
    },
    {
      label: 'Operatori',
      value: (stats.byType?.WASTE_COLLECTOR || 0) + 
             (stats.byType?.TMB_OPERATOR || 0) + 
             (stats.byType?.SORTING_OPERATOR || 0) +
             (stats.byType?.AEROBIC_OPERATOR || 0) +
             (stats.byType?.ANAEROBIC_OPERATOR || 0) +
             (stats.byType?.DISPOSAL_CLIENT || 0) +
             (stats.byType?.LANDFILL || 0),
      icon: TrendingUp,
      gradient: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/30',
      bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 
                     border border-gray-200 dark:border-gray-700/50
                     animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                     border border-gray-200 dark:border-gray-700/50
                     rounded-2xl p-5 shadow-sm
                     hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient}
                flex items-center justify-center shadow-lg ${card.shadow}
              `}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstitutionStats;
