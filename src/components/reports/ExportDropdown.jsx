/**
 * ============================================================================
 * EXPORT DROPDOWN COMPONENT
 * ============================================================================
 * Dropdown pentru selecție format export (Excel, CSV, PDF)
 * ============================================================================
 */

import React, { useState } from 'react';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';

const ExportDropdown = ({ tickets, summaryData, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format) => {
    setIsOpen(false);
    
    switch (format) {
      case 'excel':
        exportToExcel(tickets, summaryData);
        break;
      case 'csv':
        exportToCSV(tickets, summaryData);
        break;
      case 'pdf':
        exportToPDF(tickets, summaryData);
        break;
      default:
        console.error('Unknown export format:', format);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg 
                 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export date
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#242b3d] rounded-lg shadow-lg 
                        border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportDropdown;