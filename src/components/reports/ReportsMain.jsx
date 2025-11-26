/**
 * ============================================================================
 * REPORTS MAIN COMPONENT - VERSIUNE ACTUALIZATĂ
 * ============================================================================
 * Tab-uri separate (butoane individuale, nu în chenar)
 * ============================================================================
 */

import React, { useState } from 'react';
import ReportsLandfill from './ReportsLandfill';

const ReportsMain = () => {
  const [activeTab, setActiveTab] = useState('landfill');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1f2e] p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Rapoarte
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generează și vizualizează rapoarte detaliate
          </p>
        </div>

        {/* Tab Buttons - Separate (nu în chenar) */}
        <div className="flex gap-3 mb-6">
          {/* Tab Depozitare */}
          <button
            onClick={() => setActiveTab('landfill')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'landfill'
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d3548] border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Depozitare
            </div>
          </button>

          {/* Tab TMB */}
          <button
            onClick={() => setActiveTab('tmb')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'tmb'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d3548] border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Tratare Mecano-Biologică
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-opacity duration-200">
          {activeTab === 'landfill' && <ReportsLandfill />}
          
          {activeTab === 'tmb' && (
            <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  În curând
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rapoartele pentru tratare mecano-biologică vor fi disponibile în curând.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsMain;