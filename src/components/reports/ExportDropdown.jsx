// src/components/reports/ExportDropdown.jsx
/**
 * ============================================================================
 * EXPORT DROPDOWN COMPONENT
 * ============================================================================
 * 
 * Dropdown modern pentru export în:
 * - Excel (.xlsx)
 * - PDF (.pdf)
 * - CSV (.csv)
 * 
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';

const ExportDropdown = ({ onExport, disabled = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown când dai click în afară
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = (format) => {
    setIsOpen(false);
    onExport(format);
  };

  const exportOptions = [
    {
      format: 'excel',
      label: 'Export Excel',
      description: 'Fișier .xlsx',
      icon: FileSpreadsheet,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    },
    {
      format: 'pdf',
      label: 'Export PDF',
      description: 'Document .pdf',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgHover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    },
    {
      format: 'csv',
      label: 'Export CSV',
      description: 'Fișier .csv',
      icon: File,
      color: 'text-blue-600 dark:text-blue-400',
      bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Buton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg 
                 transition-all duration-200 shadow-md flex items-center gap-2
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {loading ? 'Se exportă...' : 'Export date'}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                      border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Selectează format
            </p>
          </div>

          {/* Options */}
          <div className="py-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExportClick(option.format)}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-colors ${option.bgHover}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${option.color}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Se va descărca automat
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;