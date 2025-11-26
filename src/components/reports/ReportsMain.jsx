/**
 * ============================================================================
 * REPORTS MAIN COMPONENT
 * ============================================================================
 * Container pentru rapoarte cu toggle Depozitare / TMB
 * ============================================================================
 */

import React, { useState } from 'react';
import ReportsLandfill from './ReportsLandfill';
// import ReportsTmb from './ReportsTmb'; // TODO: Implement

const ReportsMain = () => {
  const [activeTab, setActiveTab] = useState('landfill'); // 'landfill' | 'tmb'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header with Toggle */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Raportare detaliată privind depozitarea deșeurilor
        </h1>

        {/* Toggle Tabs */}
        <div className="flex gap-2 bg-white dark:bg-[#242b3d] rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('landfill')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 
              ${activeTab === 'landfill'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Depozitare
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tmb')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all duration-200 
              ${activeTab === 'tmb'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Tratare mecano-biologică
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'landfill' && <ReportsLandfill />}
      {activeTab === 'tmb' && (
        <div className="bg-white dark:bg-[#242b3d] rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              În curând
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Rapoartele pentru tratare mecano-biologică vor fi disponibile în curând.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsMain;