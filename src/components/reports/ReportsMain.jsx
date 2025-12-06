// src/components/reports/ReportsMain.jsx
/**
 * ============================================================================
 * REPORTS MAIN - CU DASHBOARD HEADER UNIFORM
 * ============================================================================
 * 
 * ✅ DashboardHeader uniform (title="Rapoarte")
 * ✅ Tab-uri moderne (Depozitare / TMB)
 * ✅ Design consistent cu Dashboard
 * 
 * ============================================================================
 */

import { useState } from 'react';
import DashboardHeader from '../dashboard/DashboardHeader.jsx';
import ReportsLandfill from './ReportsLandfill.jsx';
import ReportTMB from './ReportTMB.jsx';

const ReportsMain = () => {
  const [activeTab, setActiveTab] = useState('landfill');
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    console.log("🔍 Search query:", query);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER UNIFORM */}
      <DashboardHeader 
        notificationCount={notificationCount}
        onSearchChange={handleSearchChange}
        title="Rapoarte"
      />

      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-[1920px] mx-auto">
          
          {/* Subtitle */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Generează și vizualizează rapoarte detaliate
          </p>

          {/* Tab Buttons */}
          <div className="flex gap-3 mb-6">
            
            {/* Tab Depozitare */}
            <button
              onClick={() => setActiveTab('landfill')}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'landfill'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Depozitare
            </button>

            {/* Tab TMB */}
            <button
              onClick={() => setActiveTab('tmb')}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${activeTab === 'tmb'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Tratare Mecano-Biologică
            </button>
          </div>

          {/* Tab Content */}
          <div className="transition-opacity duration-200">
            {activeTab === 'landfill' && <ReportsLandfill />}
            {activeTab === 'tmb' && <ReportTMB />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsMain;