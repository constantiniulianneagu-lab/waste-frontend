// src/components/ProfileContracts.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/apiClient';
import {
  Truck, Layers, Wind, Flame, Factory, Trash2,
  LayoutGrid, CheckCircle2, Download, FileSpreadsheet,
  FileText, FileDown, ChevronDown, Calendar, AlertCircle,
  MapPin, Building2, Users, Gavel, ExternalLink, TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DejaVuSans from '../assets/fonts/DejaVuSans';

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
  teal:    { tab: 'bg-teal-500 text-white',    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',        count: 'text-teal-600 dark:text-teal-400'     },
  blue:    { tab: 'bg-blue-500 text-white',    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',        count: 'text-blue-600 dark:text-blue-400'     },
  purple:  { tab: 'bg-purple-500 text-white',  badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', count: 'text-purple-600 dark:text-purple-400' },
  green:   { tab: 'bg-green-500 text-white',   badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',    count: 'text-green-600 dark:text-green-400'   },
  orange:  { tab: 'bg-orange-500 text-white',  badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', count: 'text-orange-600 dark:text-orange-400' },
  emerald: { tab: 'bg-emerald-500 text-white', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', count: 'text-emerald-600 dark:text-emerald-400' },
  red:     { tab: 'bg-red-500 text-white',     badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',            count: 'text-red-600 dark:text-red-400'       },
};

const ATTRIBUTION_LABELS = {
  PUBLIC_TENDER:      'Licitație deschisă',
  DIRECT_NEGOTIATION: 'Negociere fără publicare',
};

const TYPE_LABELS = {
  WASTE_COLLECTOR: 'Colectare',
  SORTING:         'Sortare',
  AEROBIC:         'Aerobă',
  ANAEROBIC:       'Anaerobă',
  TMB:             'TMB',
  DISPOSAL:        'Depozitare',
};

// Tip atribuire badge (identic cu ContractTable)
const getAttributionBadge = (type) => {
  if (!type) return <span className="text-sm text-gray-400">—</span>;
  const isPublic = type === 'PUBLIC_TENDER';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
      ${isPublic
        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
      }`}>
      <Gavel className="w-3 h-3" />
      {ATTRIBUTION_LABELS[type] || type}
    </span>
  );
};

const ENDPOINTS = {
  WASTE_COLLECTOR: '/api/institutions/0/waste-contracts',
  SORTING:         '/api/institutions/0/sorting-contracts',
  AEROBIC:         '/api/institutions/0/aerobic-contracts',
  ANAEROBIC:       '/api/institutions/0/anaerobic-contracts',
  TMB:             '/api/institutions/0/tmb-contracts',
  DISPOSAL:        '/api/institutions/0/disposal-contracts',
};

// Tip → route param pentru pagina contracte
const TYPE_TO_ROUTE = {
  WASTE_COLLECTOR: 'WASTE_COLLECTOR',
  SORTING:         'SORTING',
  AEROBIC:         'AEROBIC',
  ANAEROBIC:       'ANAEROBIC',
  TMB:             'TMB',
  DISPOSAL:        'DISPOSAL',
};

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatNum = (v, decimals = 2) => {
  if (v === null || v === undefined || isNaN(parseFloat(v))) return '—';
  return parseFloat(v).toLocaleString('ro-RO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const isContractActive = (c) => {
  const endDate = c.effective_date_end || c.contract_date_end;
  const expired = endDate ? new Date(endDate) < new Date() : false;
  return c.is_active && !expired;
};

const isExpiringSoon = (dateEnd) => {
  if (!dateEnd) return false;
  const diff = new Date(dateEnd) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

// ============================================================================
// EXPORT HELPERS
// ============================================================================

const buildExportRows = (contracts) =>
  contracts.map(c => ({
    'Nr. Contract':      c.contract_number || '—',
    'Tip':               TYPE_LABELS[c.contract_type] || c.contract_type || '—',
    'Tip Atribuire':     ATTRIBUTION_LABELS[c.attribution_type] || '—',
    'Operator':          c.institution_short_name || c.institution_name || '—',
    'Sector':            c.sector_number ? `S${c.sector_number}` : '—',
    'Data început':      formatDate(c.contract_date_start),
    'Data sfârșit':      formatDate(c.effective_date_end || c.contract_date_end),
    'Tarif (RON/t)':     formatNum(c.effective_tariff || c.tariff_per_ton),
    'Cantitate est. (t)': formatNum(c.effective_quantity || c.estimated_quantity_tons || c.contracted_quantity_tons, 1),
    'Asociat':           c.associate_short_name || c.associate_name || '—',
  }));

const exportCSV = (contracts, filename) => {
  const rows = buildExportRows(contracts);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(';'), ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g,'""')}"`).join(';'))].join('\r\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })),
    download: `${filename}.csv`,
  });
  a.click(); URL.revokeObjectURL(a.href);
};

const exportExcel = (contracts, filename) => {
  const rows = buildExportRows(contracts);
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [16,12,24,28,8,14,14,16,18,22].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contracte');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportPDF = (contracts, filename, tabLabel) => {
  const rows = buildExportRows(contracts);
  if (!rows.length) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.width;
  const pageH = doc.internal.pageSize.height;

  // Font cu suport diacritice românești
  doc.addFileToVFS('DejaVuSans.ttf', DejaVuSans);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.setFont('DejaVuSans', 'normal');

  // ── Header ──
  doc.setFontSize(15);
  doc.setTextColor(17, 94, 89); // teal-900
  doc.text('Contracte Active - ADIGIDMB', 14, 16);

  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Categorie: ${tabLabel}   |   Generat: ${new Date().toLocaleDateString('ro-RO')}   |   Total: ${rows.length} contracte`,
    14, 23
  );

  // Linie separator header
  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(0.5);
  doc.line(14, 26, pageW - 14, 26);
  doc.setTextColor(0, 0, 0);

  // ── Tabel ──
  // Lățimi coloane adaptate după câmpurile disponibile
  // Totală disponibilă: 297 - 28 margini = 269mm
  // Nr(22) Tip(22) TipAtr(44) Operator(40) Sector(14) DataÎnc(23) DataSf(23) Tarif(23) Cant(23) Asociat(35) = 269
  const colWidths = { 0:22, 1:22, 2:44, 3:40, 4:14, 5:23, 6:23, 7:23, 8:23, 9:35 };

  autoTable(doc, {
    startY: 30,
    head: [Object.keys(rows[0])],
    body: rows.map(r => Object.values(r)),
    styles: {
      font: 'DejaVuSans',
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 30, 30],
      overflow: 'linebreak',
      halign: 'left',
    },
    headStyles: {
      font: 'DejaVuSans',
      fillColor: [20, 184, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 250, 249],
    },
    columnStyles: Object.fromEntries(Object.entries(colWidths).map(([k,w]) => [k, { cellWidth: w }])),
    margin: { left: 14, right: 14 },
  });

  // ── Footer pe fiecare pagină ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('DejaVuSans', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);

    // Stânga: SAMD
    doc.text(
      'SAMD - Sistem Avansat de Monitorizare a Deșeurilor din Municipiul București',
      14,
      pageH - 8
    );

    // Dreapta: număr pagină
    doc.text(
      `Pagina ${i} din ${totalPages}`,
      pageW - 14,
      pageH - 8,
      { align: 'right' }
    );
  }

  doc.save(`${filename}.pdf`);
};

// ============================================================================
// EXPORT DROPDOWN
// ============================================================================

const ExportButton = ({ contracts, tabLabel, disabled }) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filename = `contracte-active-${tabLabel.toLowerCase().replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}`;

  const handleExport = async (type) => {
    setExporting(type); setOpen(false);
    await new Promise(r => setTimeout(r, 50));
    try {
      if (type === 'csv')   exportCSV(contracts, filename);
      if (type === 'excel') exportExcel(contracts, filename);
      if (type === 'pdf')   exportPDF(contracts, filename, tabLabel);
    } finally { setExporting(null); }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled || !!exporting}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-bold border transition-all duration-200
          ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-700/50 text-gray-400 border-transparent'
                     : 'bg-white dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'}`}
      >
        {exporting
          ? <><div className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /><span>Export...</span></>
          : <><Download className="w-3.5 h-3.5" /><span>Export</span><ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} /></>
        }
      </button>
      {open && !disabled && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-gray-800 rounded-[14px] border border-gray-200 dark:border-gray-700 shadow-xl min-w-[180px] overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exportă {contracts.length} contracte</p>
          </div>
          {[
            { type: 'excel', icon: FileSpreadsheet, label: 'Excel (.xlsx)', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
            { type: 'csv',   icon: FileDown,        label: 'CSV (.csv)',    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-500/10'  },
            { type: 'pdf',   icon: FileText,        label: 'PDF (.pdf)',    color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-500/10'   },
          ].map(({ type, icon: Icon, label, color, bg }) => (
            <button key={type} onClick={() => handleExport(type)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className={`w-7 h-7 rounded-[8px] ${bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SKELETON ROW
// ============================================================================

const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700/50">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" style={{ width: `${50 + (i*11)%40}%` }} />
      </td>
    ))}
  </tr>
);

// ============================================================================
// CONTRACT ROW
// ============================================================================

const ContractRow = ({ contract, showAttribution, showAssociate, onDetails }) => {
  const effectiveDateEnd = contract.effective_date_end || contract.contract_date_end;
  const expired      = effectiveDateEnd ? new Date(effectiveDateEnd) < new Date() : false;
  const expiringSoon = isExpiringSoon(effectiveDateEnd);
  const effectiveTariff   = contract.effective_tariff   || contract.tariff_per_ton;
  const effectiveQuantity = contract.effective_quantity || contract.estimated_quantity_tons || contract.contracted_quantity_tons;

  return (
    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-200 dark:border-gray-700/50">

      {/* Nr. Contract */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{contract.contract_number || '—'}</span>
        </div>
      </td>

      {/* Tip Atribuire */}
      {showAttribution && (
        <td className="px-4 py-4">{getAttributionBadge(contract.attribution_type)}</td>
      )}

      {/* Operator */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]"
                title={contract.institution_name}>
            {contract.institution_short_name || contract.institution_name || '—'}
          </span>
        </div>
      </td>

      {/* Sector */}
      <td className="px-4 py-4">
        {contract.sector_number ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-sm font-medium">
            <MapPin className="w-3 h-3" />S{contract.sector_number}
          </span>
        ) : <span className="text-sm text-gray-400">—</span>}
      </td>

      {/* Perioadă */}
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(contract.contract_date_start)}
          </div>
          {effectiveDateEnd && (
            <div className={`flex items-center gap-1.5 text-sm ${
              expired ? 'text-red-600 dark:text-red-400'
              : expiringSoon ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-500 dark:text-gray-500'
            }`}>
              {expired && <AlertCircle className="w-3.5 h-3.5" />}
              → {formatDate(effectiveDateEnd)}
              {expired     && <span className="text-xs">(expirat)</span>}
              {expiringSoon && <span className="text-xs">(expiră curând)</span>}
            </div>
          )}
        </div>
      </td>

      {/* Tarif */}
      <td className="px-4 py-4">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {effectiveTariff ? `${formatNum(effectiveTariff)} RON/t` : '—'}
        </div>
        {contract.effective_cec && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            CEC: {formatNum(contract.effective_cec)} RON/t
          </div>
        )}
      </td>

      {/* Cantitate estimată */}
      <td className="px-4 py-4">
        {effectiveQuantity
          ? <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNum(effectiveQuantity, 1)} t</span>
          : <span className="text-sm text-gray-400">—</span>
        }
      </td>

      {/* Asociat */}
      {showAssociate && (
        <td className="px-4 py-4">
          {contract.associate_name ? (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]"
                    title={contract.associate_name}>
                {contract.associate_short_name || contract.associate_name}
              </span>
            </div>
          ) : <span className="text-sm text-gray-400">—</span>}
        </td>
      )}

      {/* Detalii link */}
      <td className="px-4 py-4 text-right">
        <button
          onClick={() => onDetails(contract)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                     text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10
                     border border-teal-200 dark:border-teal-500/30 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Detalii
        </button>
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProfileContracts = ({ userRole }) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Fetch (identic cu ContractsPage) ──
  useEffect(() => {
    if (userRole === 'REGULATOR_VIEWER') return;
    const load = async () => {
      setLoading(true);
      try {
        const [wasteRes, sortRes, aeroRes, anaeroRes, tmbRes, dispRes] = await Promise.all([
          apiGet(ENDPOINTS.WASTE_COLLECTOR),
          apiGet(ENDPOINTS.SORTING),
          apiGet(ENDPOINTS.AEROBIC),
          apiGet(ENDPOINTS.ANAEROBIC),
          apiGet(ENDPOINTS.TMB),
          apiGet(ENDPOINTS.DISPOSAL),
        ]);

        const all = [
          ...(wasteRes.success  && Array.isArray(wasteRes.data)  ? wasteRes.data.map(c  => ({ ...c, contract_type: 'WASTE_COLLECTOR' })) : []),
          ...(sortRes.success   && Array.isArray(sortRes.data)   ? sortRes.data.map(c   => ({ ...c, contract_type: 'SORTING'         })) : []),
          ...(aeroRes.success   && Array.isArray(aeroRes.data)   ? aeroRes.data.map(c   => ({ ...c, contract_type: 'AEROBIC'         })) : []),
          ...(anaeroRes.success && Array.isArray(anaeroRes.data) ? anaeroRes.data.map(c => ({ ...c, contract_type: 'ANAEROBIC'       })) : []),
          ...(tmbRes.success    && Array.isArray(tmbRes.data)    ? tmbRes.data.map(c    => ({ ...c, contract_type: 'TMB'             })) : []),
          ...(dispRes.success   && Array.isArray(dispRes.data)   ? dispRes.data.map(c   => ({ ...c, contract_type: 'DISPOSAL'        })) : []),
        ];

        // Deduplicare (disposal returnează duplicate din JOIN cu sectoare)
        const seen = new Set();
        setContracts(all.filter(c => {
          const key = `${c.contract_type}-${c.id}`;
          if (seen.has(key)) return false;
          seen.add(key); return true;
        }));
      } catch (err) {
        console.error('ProfileContracts error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userRole]);

  // Reset page on tab change
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  // ── Active only ──
  const activeContracts = useMemo(() => contracts.filter(isContractActive), [contracts]);

  // ── Counts ──
  const countsByCategory = useMemo(() => {
    const counts = { ALL: activeContracts.length };
    for (const cat of CONTRACT_CATEGORIES.slice(1)) {
      counts[cat.key] = activeContracts.filter(c => c.contract_type === cat.key).length;
    }
    return counts;
  }, [activeContracts]);

  // ── Filter by tab ──
  const filtered = useMemo(() =>
    activeTab === 'ALL' ? activeContracts : activeContracts.filter(c => c.contract_type === activeTab),
    [activeContracts, activeTab]
  );

  // ── Sort: sector → date desc ──
  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const sA = a.sector_number || 99, sB = b.sector_number || 99;
      if (sA !== sB) return sA - sB;
      return new Date(b.contract_date_start) - new Date(a.contract_date_start);
    }), [filtered]
  );

  // ── Pagination ──
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  const currentCategory = CONTRACT_CATEGORIES.find(c => c.key === activeTab) || CONTRACT_CATEGORIES[0];
  const exportLabel = activeTab === 'ALL' ? 'Toate' : currentCategory.label;

  // Show attribution only for types that have it
  const showAttribution = ['DISPOSAL','TMB','AEROBIC','ANAEROBIC','ALL'].includes(activeTab);
  // Show associate only for types that have it
  const showAssociate = ['TMB','AEROBIC','ANAEROBIC','ALL'].includes(activeTab);

  const colCount = 5 + (showAttribution ? 1 : 0) + (showAssociate ? 1 : 0) + 1; // +1 detalii

  // ── Navigate to contracts page ──
  const handleDetails = (contract) => {
    navigate(`/contracts?type=${TYPE_TO_ROUTE[contract.contract_type] || 'ALL'}`);
  };

  if (userRole === 'REGULATOR_VIEWER') return null;

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[28px] border border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-none overflow-hidden">

      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Contracte active</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {loading ? 'Se încarcă...' : `${activeContracts.length} contracte active din ${contracts.length} total`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats chips */}
            {!loading && (
              <div className="hidden lg:flex items-center gap-1.5">
                {CONTRACT_CATEGORIES.slice(1).map(cat => {
                  const count = countsByCategory[cat.key];
                  if (!count) return null;
                  const colors = COLOR_MAP[cat.color];
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${colors.badge}`}>
                      <Icon className="w-3 h-3" /><span>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && (
              <ExportButton contracts={sorted} tabLabel={exportLabel} disabled={sorted.length === 0} />
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
              <button key={cat.key} onClick={() => setActiveTab(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all duration-200 border
                  ${isActive ? colors.tab + ' border-transparent shadow-sm'
                             : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
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
            <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={colCount} />)}</tbody>
          </table>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-[18px] bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {activeTab === 'ALL' ? 'Nu există contracte active' : `Nu există contracte active de tip ${currentCategory.label}`}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nr. Contract</th>
                  {showAttribution && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tip Atribuire</th>}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operator</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sector</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perioadă</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarif</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantitate est.</th>
                  {showAssociate && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asociat</th>}
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detalii</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                {paginated.map((contract, idx) => (
                  <ContractRow
                    key={`${contract.contract_type}-${contract.id || idx}`}
                    contract={contract}
                    showAttribution={showAttribution}
                    showAssociate={showAssociate}
                    onDetails={handleDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination (identic ContractsPage) ── */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Afișează <span className="font-semibold text-gray-900 dark:text-white">{Math.min((currentPage-1)*itemsPerPage+1, sorted.length)}–{Math.min(currentPage*itemsPerPage, sorted.length)}</span> din{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{sorted.length} contracte</span>
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[2.5rem] px-3 py-1.5 text-sm font-medium rounded-lg transition-all
                            ${currentPage === pageNum
                              ? 'bg-teal-500 text-white shadow-md'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  Următor
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Date actualizate în timp real</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileContracts;