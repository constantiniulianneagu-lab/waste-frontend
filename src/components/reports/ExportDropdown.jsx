/**
 * ============================================================================
 * EXPORT DROPDOWN COMPONENT - VERSIUNE ACTUALIZATĂ
 * ============================================================================
 * - Exportă TOATE înregistrările filtrate (nu doar pagina curentă)
 * - Warning dacă > 10.000 înregistrări
 * ============================================================================
 */

import React, { useState } from 'react';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { exportLandfillReports } from '../../services/reportsService';

const ExportDropdown = ({ filters, summaryData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setIsOpen(false);

      console.log('📥 Fetching ALL filtered data for export...');

      // Fetch ALL filtered data from backend
      const response = await exportLandfillReports(filters);
      
      if (!response.success) {
        throw new Error(response.message || 'Eroare la export');
      }

      const allTickets = response.data.tickets;
      const totalCount = response.data.total_count;

      console.log(`📊 Found ${totalCount} records for export`);

      // Warning dacă > 10.000 înregistrări
      if (totalCount > 10000) {
        const confirmed = window.confirm(
          `⚠️ ATENȚIE!\n\n` +
          `Vei exporta ${totalCount.toLocaleString('ro-RO')} înregistrări.\n\n` +
          `Procesarea poate dura câteva minute și fișierul va fi mare.\n\n` +
          `Dorești să continui?`
        );
        
        if (!confirmed) {
          setIsExporting(false);
          return;
        }
      }

      // Export bazat pe format
      if (format === 'excel') {
        exportToExcel(allTickets, summaryData);
      } else if (format === 'csv') {
        exportToCSV(allTickets, summaryData);
      } else if (format === 'pdf') {
        exportToPDF(allTickets, summaryData);
      }

      console.log('✅ Export completed successfully');
    } catch (error) {
      console.error('❌ Export error:', error);
      alert('Eroare la export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg 
                 transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Exportare...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export date
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#242b3d] rounded-lg shadow-lg 
                        border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium">Excel (.xlsx)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Format complet</p>
              </div>
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 
                       border-t border-gray-200 dark:border-gray-700"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium">CSV</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Format universal</p>
              </div>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 
                       border-t border-gray-200 dark:border-gray-700"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium">PDF</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Document portabil</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportDropdown;