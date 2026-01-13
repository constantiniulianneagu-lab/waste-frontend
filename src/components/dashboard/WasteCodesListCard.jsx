/**
 * ============================================================================
 * WASTE CODES LIST CARD - LISTĂ CODURI DEȘEURI
 * ============================================================================
 * Design Samsung One UI 7.0 / Apple iOS 18 - MODEL TopOperatorsTable
 * ============================================================================
 */

import React from 'react';
import { Trash2, Leaf, Recycle, TreeDeciduous, Droplet, Package } from 'lucide-react';

const formatNumberRO = (number) => {
  if (!number && number !== 0) return '0,00';
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return num.toLocaleString('ro-RO', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Iconuri și culori bazate pe PREFIX cod
const getCodeIconAndColor = (code) => {
  const prefix = code.substring(0, 2);
  
  if (prefix === '17') {
    // Construcții și demolări
    return {
      Icon: Package,
      badge: 'bg-gradient-to-br from-pink-500 to-rose-600',
      text: 'text-pink-600 dark:text-pink-400',
      progress: 'bg-gradient-to-r from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/20 dark:shadow-pink-400/20',
    };
  } else if (prefix === '19') {
    // Deșeuri din instalații de tratare
    return {
      Icon: Recycle,
      badge: 'bg-gradient-to-br from-amber-500 to-orange-600',
      text: 'text-amber-600 dark:text-amber-400',
      progress: 'bg-gradient-to-r from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20 dark:shadow-amber-400/20',
    };
  } else if (prefix === '20') {
    // Deșeuri municipale
    if (code.includes('03 01')) {
      return {
        Icon: Trash2,
        badge: 'bg-gradient-to-br from-violet-500 to-purple-600',
        text: 'text-violet-600 dark:text-violet-400',
        progress: 'bg-gradient-to-r from-violet-500 to-purple-500',
        glow: 'shadow-violet-500/20 dark:shadow-violet-400/20',
      };
    } else if (code.includes('03 03')) {
      return {
        Icon: TreeDeciduous,
        badge: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        text: 'text-emerald-600 dark:text-emerald-400',
        progress: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        glow: 'shadow-emerald-500/20 dark:shadow-emerald-400/20',
      };
    } else if (code.includes('02 01')) {
      return {
        Icon: Leaf,
        badge: 'bg-gradient-to-br from-lime-500 to-green-600',
        text: 'text-lime-600 dark:text-lime-400',
        progress: 'bg-gradient-to-r from-lime-500 to-green-500',
        glow: 'shadow-lime-500/20 dark:shadow-lime-400/20',
      };
    } else {
      return {
        Icon: Trash2,
        badge: 'bg-gradient-to-br from-cyan-500 to-blue-600',
        text: 'text-cyan-600 dark:text-cyan-400',
        progress: 'bg-gradient-to-r from-cyan-500 to-blue-500',
        glow: 'shadow-cyan-500/20 dark:shadow-cyan-400/20',
      };
    }
  } else {
    // Default
    return {
      Icon: Trash2,
      badge: 'bg-gradient-to-br from-slate-500 to-gray-600',
      text: 'text-slate-600 dark:text-slate-400',
      progress: 'bg-gradient-to-r from-slate-500 to-gray-500',
      glow: 'shadow-slate-500/20 dark:shadow-slate-400/20',
    };
  }
};

const WasteCodesListCard = ({ codes = [], loading }) => {
  
  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <div className="flex h-[600px] flex-col rounded-[28px] 
                    border border-gray-200 dark:border-gray-700/50 
                    bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                    p-6 shadow-sm dark:shadow-none">
        <div className="mb-6 flex-shrink-0 space-y-2">
          <div className="h-5 w-52 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700/50" />
          <div className="h-3 w-72 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700/30" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-[20px] bg-gray-100 dark:bg-gray-700/30"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ========================================================================
  // CALCULATE TOTAL
  // ========================================================================
  const totalTons = codes.reduce((sum, c) => sum + (c.total_tons || 0), 0);

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  return (
    <div className="flex h-[600px] flex-col rounded-[28px] 
                  border border-gray-200 dark:border-gray-700/50 
                  bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                  p-6 shadow-sm dark:shadow-none">
      
      {/* HEADER */}
      <div className="mb-5 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Coduri deșeuri
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Cantități depozitate în perioada selectată
            </p>
          </div>
          
          {/* Stats badge */}
          {codes.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full px-3 py-1.5 
                          border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {codes.length} {codes.length === 1 ? 'cod' : 'coduri'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden 
                    pr-2 max-h-[470px] custom-scrollbar">
        
        {codes.map((code, idx) => {
          const { Icon, badge, text, progress, glow } = getCodeIconAndColor(code.waste_code);
          const percentage = totalTons > 0 
            ? ((code.total_tons || 0) / totalTons) * 100 
            : 0;

          return (
            <div key={idx} className="group relative">
              <div className="relative flex flex-col gap-2.5 rounded-[20px] 
                          border border-gray-200 dark:border-gray-700/50 
                          bg-gray-50 dark:bg-gray-900/30 
                          px-4 py-3.5 
                          hover:bg-white dark:hover:bg-gray-900/50
                          hover:border-gray-300 dark:hover:border-gray-600
                          hover:shadow-md dark:hover:shadow-lg
                          transition-all duration-300 ease-out
                          hover:-translate-y-0.5">
                
                {/* Accent Line */}
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-[20px] 
                            bg-gradient-to-b from-emerald-500 to-teal-500 
                            opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300" />

                {/* ROW 1: ICON + INFO + AMOUNT */}
                <div className="flex items-center gap-3 pl-1">
                  
                  {/* Icon Badge */}
                  <div className="flex-shrink-0">
                    <div className={`flex items-center justify-center 
                                  w-10 h-10 rounded-[14px] ${badge} 
                                  shadow-sm ${glow}
                                  group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Code Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white 
                                truncate leading-tight mb-0.5">
                      {code.waste_code}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 
                                truncate">
                      {code.waste_description}
                    </p>
                  </div>

                  {/* Amount Display */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-lg font-bold ${text} leading-tight`}>
                      {formatNumberRO(code.total_tons)}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                      tone
                    </div>
                  </div>
                </div>

                {/* ROW 2: TICKETS + PROGRESS BAR */}
                <div className="flex items-center gap-2 pl-1">
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {code.ticket_count?.toLocaleString('ro-RO')} tichete • {code.percentage_of_total}%
                    </p>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 
                                rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progress} rounded-full 
                                  shadow-sm ${glow}
                                  transition-all duration-1000 ease-out`}
                        style={{ 
                          width: `${percentage}%`,
                          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {codes.length === 0 && (
          <div className="flex flex-1 items-center justify-center flex-col gap-3 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700/50 
                          flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Nu există coduri pentru perioada selectată
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteCodesListCard;