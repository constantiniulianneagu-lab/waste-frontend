// src/components/ProfileContracts.jsx
/**
 * ============================================================================
 * PROFILE CONTRACTS - Contracte active vizibile utilizatorului
 * ============================================================================
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Truck, Layers, Wind, Flame, Factory, Trash2,
  Calendar, TrendingUp, Package, ChevronRight,
  AlertCircle, LayoutGrid, CheckCircle2,
  Download, FileSpreadsheet, FileText, FileDown, ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// CONFIG
// ============================================================================

const CONTRACT_CATEGORIES = [
  { key: 'ALL',             label: 'Toate',      icon: LayoutGrid, color: 'teal'    },
  { key: 'WASTE_COLLECTOR', label: 'Colectare',  icon: Truck,      color: 'blue'    },
  { key: 'SORTING',         label: 'Sortare',    icon: Layers,     color: 'purple'  },
  { key: 'AEROBIC',         label: 'Aerobă',     icon: Wind,       color: 'green'   },
  { key: 'ANAEROBIC',       label: 'Anaerobă',   icon: Flame,      color: 'orange'  },
  { key: 'TMB',             label: 'TMB',        icon: Factory,    color: 'emerald' },
  { key: 'DISPOSAL',        label: 'Depozitare', icon: Trash2,     color: 'red'     },
];

const COLOR_MAP = {
  teal:    { tab: 'bg-teal-500 text-white',    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',       count: 'text-teal-600 dark:text-teal-400'    },
  blue:    { tab: 'bg-blue-500 text-white',    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',       count: 'text-blue-600 dark:text-blue-400'    },
  purple:  { tab: 'bg-purple-500 text-white',  badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', count: 'text-purple-600 dark:text-purple-400' },
  green:   { tab: 'bg-green-500 text-white',   badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',   count: 'text-green-600 dark:text-green-400'  },
  orange:  { tab: 'bg-orange-500 text-white',  badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', count: 'text-orange-600 dark:text-orange-400' },
  emerald: { tab: 'bg-emerald-500 text-white', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', count: 'text-emerald-600 dark:text-emerald-400' },
  red:     { tab: 'bg-red-500 text-white',     badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',           count: 'text-red-600 dark:text-red-400'      },
};

const typeToCategory = {
  WASTE_COLLECTOR:   'WASTE_COLLECTOR',
  SORTING_OPERATOR:  'SORTING',
  TMB_OPERATOR:      'TMB',
  DISPOSAL_OPERATOR: 'DISPOSAL',
  AEROBIC_OPERATOR:  'AEROBIC',
  ANAEROBIC_OPERATOR:'ANAEROBIC',
};

const CATEGORY_LABEL = {
  WASTE_COLLECTOR: 'Colectare',
  SORTING:         'Sortare',
  AEROBIC:         'Aerobă',
  ANAEROBIC:       'Anaerobă',
  TMB:             'TMB',
  DISPOSAL:        'Depozitare',
};

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatQty = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v) + ' t';
};

const isExpired = (dateEnd) => {
  if (!dateEnd) return false;
  return new Date(dateEnd) < new Date();
};

const isContractActive = (c) => {
  if (isExpired(c.contract_date_end)) return false;
  return c.is_active;
};

const flattenContracts = (operators) => {
  const result = [];
  const seen = new Set();

  for (const op of (operators || [])) {
    const type = op.operator_type;
    for (const c of (op.contracts || [])) {
      // Disposal: fiecare sector e un rând separat → cheie unică pe contract_id + sector_id
      // TMB: un contract per sector → cheie pe contract_id
      const key = type === 'DISPOSAL_OPERATOR'
        ? `${type}-${c.contract_id}-${c.sector_id}`
        : `${type}-${c.contract_id}`;

      if (seen.has(key)) continue;
      seen.add(key);

      const operatorName = type === 'TMB_OPERATOR'
        ? [c.primary_operator, c.secondary_operator].filter(Boolean).join(' + ')
        : type === 'DISPOSAL_OPERATOR'
        ? (op.institution_name || op.name)
        : op.name;

      result.push({ ...c, operator_name: operatorName, operator_id: op.id, contract_type: type });
    }
  }

  return result;
};

const getTariffDisplay = (contract) => {
  if (contract.tariff_per_ton)
    return `${parseFloat(contract.tariff_per_ton).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON/t`;
  if (contract.total_per_ton)
    return `${parseFloat(contract.total_per_ton).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON/t`;
  return '—';
};

const getQtyDisplay = (contract) => {
  if (contract.estimated_quantity_tons) return formatQty(contract.estimated_quantity_tons);
  if (contract.contracted_quantity_tons) return formatQty(contract.contracted_quantity_tons);
  return '—';
};

// ============================================================================
// EXPORT LOGIC
// ============================================================================

const buildExportRows = (contracts) =>
  contracts.map(c => ({
    'Nr. Contract':    c.contract_number || '—',
    'Tip':             CATEGORY_LABEL[typeToCategory[c.contract_type]] || c.contract_type,
    'Operator':        c.operator_name || '—',
    'Sector':          c.sector_number ? `S${c.sector_number}` : '—',
    'Data început':    formatDate(c.contract_date_start),
    'Data sfârșit':    formatDate(c.contract_date_end),
    'Tarif':           getTariffDisplay(c),
    'Cantitate':       getQtyDisplay(c),
    'Status':          isContractActive(c) ? 'Activ' : 'Inactiv',
  }));

const exportCSV = (contracts, filename) => {
  const rows = buildExportRows(contracts);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(';'),
    ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(';')),
  ].join('\r\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};

const exportExcel = (contracts, filename) => {
  const rows = buildExportRows(contracts);
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  // Column widths
  ws['!cols'] = [16, 12, 30, 8, 14, 14, 18, 16, 10].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contracte');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportPDF = (contracts, filename, tabLabel) => {
  const rows = buildExportRows(contracts);
  if (!rows.length) return;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Contracte Active - ADIGIDMB', 14, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Categorie: ${tabLabel}   |   Generat: ${new Date().toLocaleDateString('ro-RO')}   |   Total: ${rows.length} contracte`, 14, 23);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 28,
    head: [Object.keys(rows[0])],
    body: rows.map(r => Object.values(r)),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [20, 184, 166], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { cellWidth: 14 },
      4: { cellWidth: 24 },
      5: { cellWidth: 24 },
      6: { cellWidth: 28 },
      7: { cellWidth: 24 },
      8: { cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
};

// ============================================================================
// EXPORT DROPDOWN BUTTON
// ============================================================================

const ExportButton = ({ contracts, tabLabel, disabled }) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filename = `contracte-active-${tabLabel.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}`;

  const handleExport = async (type) => {
    setExporting(type);
    setOpen(false);
    // Small delay so UI updates before potentially blocking export
    await new Promise(r => setTimeout(r, 50));
    try {
      if (type === 'csv')   exportCSV(contracts, filename);
      if (type === 'excel') exportExcel(contracts, filename);
      if (type === 'pdf')   exportPDF(contracts, filename, tabLabel);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled || !!exporting}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-bold
                   border transition-all duration-200
                   ${disabled
                     ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-700/50 text-gray-400 border-transparent'
                     : 'bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm'
                   }`}
      >
        {exporting ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span>Export...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute right-0 top-full mt-1.5 z-50
                       bg-white dark:bg-gray-800 rounded-[14px]
                       border border-gray-200 dark:border-gray-700
                       shadow-xl dark:shadow-black/30
                       overflow-hidden min-w-[180px]
                       animate-in fade-in slide-in-from-top-1 duration-150">

          {/* Header info */}
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Exportă {contracts.length} contracte
            </p>
          </div>

          {/* Options */}
          {[
            { type: 'excel', icon: FileSpreadsheet, label: 'Excel (.xlsx)', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
            { type: 'csv',   icon: FileDown,        label: 'CSV (.csv)',    color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-500/10'  },
            { type: 'pdf',   icon: FileText,        label: 'PDF (.pdf)',    color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-500/10'   },
          ].map(({ type, icon: Icon, label, color, bg }) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              className="w-full flex items-center gap-3 px-3 py-2.5
                        hover:bg-gray-50 dark:hover:bg-gray-700/50
                        transition-colors duration-150 group"
            >
              <div className={`w-7 h-7 rounded-[8px] ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SKELETON
// ============================================================================

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 dark:border-gray-700/30">
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
             style={{ width: `${55 + (i * 7) % 35}%` }} />
      </td>
    ))}
  </tr>
);

// ============================================================================
// CONTRACT ROW
// ============================================================================

const ContractRow = ({ contract, categoryColor }) => {
  const active = isContractActive(contract);
  const colors = COLOR_MAP[categoryColor] || COLOR_MAP.teal;

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
          <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
            {contract.contract_number}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {contract.operator_name}
        </span>
      </td>
      <td className="px-4 py-3">
        {contract.sector_number ? (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${colors.badge}`}>
            S{contract.sector_number}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{formatDate(contract.contract_date_start)}</span>
          </div>
          <div className={`flex items-center gap-1 ${isExpired(contract.contract_date_end) ? 'text-red-500 dark:text-red-400' : ''}`}>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span>{formatDate(contract.contract_date_end)}</span>
            {isExpired(contract.contract_date_end) && <span className="font-medium">(exp.)</span>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-semibold ${colors.count}`}>
          {getTariffDisplay(contract)}
        </span>
        {contract.cec_tax_per_ton && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            CEC: {parseFloat(contract.cec_tax_per_ton).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON/t
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">{getQtyDisplay(contract)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {active ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Activ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Inactiv
          </span>
        )}
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProfileContracts = ({ operators = [], loading = false, userRole }) => {
  const [activeTab, setActiveTab] = useState('ALL');

  const allContracts    = useMemo(() => flattenContracts(operators), [operators]);
  const activeContracts = useMemo(() => allContracts.filter(isContractActive), [allContracts]);

  const countsByCategory = useMemo(() => {
    const counts = { ALL: activeContracts.length };
    for (const cat of CONTRACT_CATEGORIES.slice(1)) {
      counts[cat.key] = activeContracts.filter(c => typeToCategory[c.contract_type] === cat.key).length;
    }
    return counts;
  }, [activeContracts]);

  const displayedContracts = useMemo(() => {
    if (activeTab === 'ALL') return activeContracts;
    return activeContracts.filter(c => typeToCategory[c.contract_type] === activeTab);
  }, [activeContracts, activeTab]);

  const sortedContracts = useMemo(() => {
    return [...displayedContracts].sort((a, b) => {
      const sA = a.sector_number || 99, sB = b.sector_number || 99;
      if (sA !== sB) return sA - sB;
      return new Date(b.contract_date_start) - new Date(a.contract_date_start);
    });
  }, [displayedContracts]);

  const currentCategory = CONTRACT_CATEGORIES.find(c => c.key === activeTab) || CONTRACT_CATEGORIES[0];

  if (userRole === 'REGULATOR_VIEWER') return null;

  const exportTabLabel = activeTab === 'ALL' ? 'Toate' : currentCategory.label;

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    rounded-[28px] border border-gray-200 dark:border-gray-700/50
                    shadow-sm dark:shadow-none overflow-hidden">

      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-5">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Contracte active</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {loading ? 'Se încarcă...' : `${activeContracts.length} contracte active din ${allContracts.length} total`}
              </p>
            </div>
          </div>

          {/* Right side: stats chips + export button */}
          <div className="flex items-center gap-3">
            {/* Stats chips - hidden on small screens */}
            {!loading && (
              <div className="hidden lg:flex items-center gap-1.5">
                {CONTRACT_CATEGORIES.slice(1).map(cat => {
                  const count = countsByCategory[cat.key];
                  if (!count) return null;
                  const colors = COLOR_MAP[cat.color];
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${colors.badge}`}>
                      <Icon className="w-3 h-3" />
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Export button */}
            {!loading && (
              <ExportButton
                contracts={sortedContracts}
                tabLabel={exportTabLabel}
                disabled={sortedContracts.length === 0}
              />
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CONTRACT_CATEGORIES.map(cat => {
            const isActive = activeTab === cat.key;
            const count    = countsByCategory[cat.key] ?? 0;
            const colors   = COLOR_MAP[cat.color];
            const Icon     = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold
                           transition-all duration-200 border
                           ${isActive
                             ? colors.tab + ' border-transparent shadow-sm'
                             : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                           }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                   ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/30">
                {['Nr. Contract','Operator','Sector','Perioadă','Tarif','Cantitate','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      ) : sortedContracts.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-[18px] bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {activeTab === 'ALL' ? 'Nu există contracte active' : `Nu există contracte active de tip ${currentCategory.label}`}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Contractele vor apărea automat când sunt înregistrate</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-900/20">
                {['Nr. Contract','Operator','Sector','Perioadă','Tarif','Cantitate','Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedContracts.map((contract, idx) => (
                <ContractRow
                  key={`${contract.contract_type}-${contract.contract_id || idx}`}
                  contract={contract}
                  categoryColor={
                    activeTab === 'ALL'
                      ? (CONTRACT_CATEGORIES.find(c => c.key === typeToCategory[contract.contract_type])?.color || 'teal')
                      : currentCategory.color
                  }
                />
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/30
                         flex items-center justify-between
                         bg-gray-50/50 dark:bg-gray-900/20">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {sortedContracts.length} {sortedContracts.length === 1 ? 'contract activ' : 'contracte active'}
              {activeTab !== 'ALL' && ` · ${currentCategory.label}`}
            </span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Date actualizate în timp real
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContracts;