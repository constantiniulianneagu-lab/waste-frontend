// src/components/institutions/InstitutionStats.jsx
/**
 * ============================================================================
 * INSTITUTION STATS - SUMMARY CARDS
 * ============================================================================
 * Design: Amber/Orange theme - consistent cu stilul aplicației
 */

import { 
    Building2, 
    Building, 
    Truck, 
    Factory, 
    Recycle, 
    Zap, 
    Mountain,
    Shield,
    CheckCircle,
    XCircle 
  } from 'lucide-react';
  
  const StatCard = ({ title, value, icon: Icon, gradient, iconBg }) => (
    <div className="group relative">
      <div className={`
        relative overflow-hidden
        bg-white dark:bg-gray-800/50 backdrop-blur-xl
        border border-gray-200 dark:border-gray-700/50
        rounded-[20px] p-5
        shadow-sm dark:shadow-none
        hover:shadow-lg dark:hover:shadow-xl
        hover:-translate-y-1
        transition-all duration-300 ease-out
      `}>
        {/* Gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
          
          <div className={`w-12 h-12 rounded-[14px] ${iconBg} 
                          flex items-center justify-center
                          shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
  
  const InstitutionStats = ({ stats = {}, loading = false }) => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800/50 rounded-[20px] p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          ))}
        </div>
      );
    }
  
    const cards = [
      {
        title: 'Total',
        value: stats.total || 0,
        icon: Building2,
        gradient: 'from-amber-500 to-orange-600',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
      },
      {
        title: 'Active',
        value: stats.active || 0,
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-600',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600'
      },
      {
        title: 'Inactive',
        value: stats.inactive || 0,
        icon: XCircle,
        gradient: 'from-gray-400 to-gray-500',
        iconBg: 'bg-gradient-to-br from-gray-400 to-gray-500'
      },
      {
        title: 'Municipii',
        value: stats.byType?.MUNICIPIU || stats.municipalities || 0,
        icon: Building,
        gradient: 'from-blue-500 to-indigo-600',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600'
      },
      {
        title: 'Operatori',
        value: stats.byType?.OPERATOR || stats.collectors || 0,
        icon: Truck,
        gradient: 'from-emerald-500 to-green-600',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600'
      },
      {
        title: 'TMB',
        value: stats.byType?.TMB || stats.tmb_operators || 0,
        icon: Factory,
        gradient: 'from-cyan-500 to-blue-600',
        iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600'
      },
    ];
  
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    );
  };
  
  export default InstitutionStats;