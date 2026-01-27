// src/components/contracts/ExportButton.jsx
/**
 * ============================================================================
 * EXPORT BUTTON WITH DROPDOWN - PDF, EXCEL, CSV
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, File, ChevronDown } from 'lucide-react';

const ExportButton = ({ onExport, exporting = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExportClick = (format) => {
    setIsOpen(false);
    onExport(format);
  };

  const exportOptions = [
    { 
      format: 'pdf', 
      label: 'Export PDF', 
      icon: FileText, 
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-500/20'
    },
    { 
      format: 'xlsx', 
      label: 'Export Excel', 
      icon: FileSpreadsheet, 
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-500/20'
    },
    { 
      format: 'csv', 
      label: 'Export CSV', 
      icon: File, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-500/20'
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || exporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export contracte"
      >
        <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
        <span>{exporting ? 'Se exportă...' : 'Export'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !exporting && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.format}
                onClick={() => handleExportClick(option.format)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${option.hoverColor} first:rounded-t-xl last:rounded-b-xl`}
              >
                <div className={`w-8 h-8 rounded-lg ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${option.color}`} />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExportButton;