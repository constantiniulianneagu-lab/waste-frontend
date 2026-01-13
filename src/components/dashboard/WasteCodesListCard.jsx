/**
 * ============================================================================
 * WASTE CODES LIST CARD - LISTĂ CODURI DEȘEURI
 * ============================================================================
 * Afișează toate codurile de deșeuri cu cantități, tichete, procente
 * Design modern, cu scroll dacă nu încap
 * ============================================================================
 */

import React from 'react';
import { Trash2 } from 'lucide-react';

const formatNumberRO = (number) => {
  if (!number && number !== 0) return '0,00';
  const num = typeof number === 'string' ? parseFloat(number) : number;
  const formatted = num.toFixed(2);
  const [intPart, decPart] = formatted.split('.');
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intWithDots},${decPart}`;
};

// Culori pentru coduri (extins)
const getCodeColor = (code) => {
  const colors = {
    '20 03 01': { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600 dark:text-purple-400', bar: 'from-purple-500 to-purple-600' },
    '20 03 03': { bg: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', bar: 'from-emerald-500 to-teal-500' },
    '19 12 12': { bg: 'from-orange-500 to-orange-600', text: 'text-orange-600 dark:text-orange-400', bar: 'from-orange-500 to-amber-500' },
    '17 09 04': { bg: 'from-pink-500 to-pink-600', text: 'text-pink-600 dark:text-pink-400', bar: 'from-pink-500 to-rose-500' },
    '19 12 12': { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600 dark:text-blue-400', bar: 'from-blue-500 to-cyan-500' },
  };
  
  return colors[code] || { 
    bg: 'from-gray-500 to-gray-600', 
    text: 'text-gray-600 dark:text-gray-400', 
    bar: 'from-gray-500 to-gray-600' 
  };
};

const WasteCodesListCard = ({ codes = [], loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-[24px] border border-gray-200 dark:border-gray-700 p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Se încarcă...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!codes || codes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-[24px] border border-gray-200 dark:border-gray-700 p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nu există coduri de deșeuri</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[24px] border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Coduri deșeuri ({codes.length})
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Toate codurile cu cantități înregistrate
        </p>
      </div>

      {/* List cu scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {codes.map((code, idx) => {
          const colors = getCodeColor(code.waste_code);
          
          return (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-200 dark:border-gray-700
                       hover:shadow-md dark:hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600
                       transition-all duration-200"
            >
              {/* Cod + Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${colors.text}`}>
                    {code.waste_code}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {code.waste_description}
                  </p>
                </div>
              </div>

              {/* Cantitate + Tichete */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatNumberRO(code.total_tons)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">tone</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {code.ticket_count?.toLocaleString('ro-RO')} tichete
                  </p>
                </div>
              </div>

              {/* Progress bar + Procent */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">DIN TOTAL</span>
                  <span className={`font-bold ${colors.text}`}>
                    {code.percentage_of_total}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${colors.bar} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${code.percentage_of_total}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WasteCodesListCard;