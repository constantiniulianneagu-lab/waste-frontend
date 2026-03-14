import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Plus, Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// ─── Helpers filtre secundare ────────────────────────────────────────────────
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SortIconTmb = ({ field, sortBy, sortDir, color = 'slate' }) => {
  const colorMap = { slate: 'text-slate-600', amber: 'text-amber-600' };
  const cls = colorMap[color] || 'text-slate-600';
  if (sortBy !== field) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp className={`w-3.5 h-3.5 ml-1 ${cls}`} />
    : <ChevronDown className={`w-3.5 h-3.5 ml-1 ${cls}`} />;
};
import ReportsFilters from './ReportsFilters';
import ReportsTmbSidebar from './ReportsTmbSidebar';
import RecyclingSidebar from './RecyclingSidebar';
import RecyclingReportView from './RecyclingReportView';
import RecoverySidebar from './RecoverySidebar';
import RecoveryReportView from './RecoveryReportView';
import DisposalSidebar from './DisposalSidebar';
import DisposalReportView from './DisposalReportView';
import RejectedSidebar from './RejectedSidebar';
import RejectedReportView from './RejectedReportView';
import ExportDropdown from './ExportDropdown';
import { 
  getTmbReports, 
  getRecyclingReports,
  getRecoveryReports,
  getDisposalReports,
  getRejectedReports,
  deleteTmbTicket,
  deleteRecyclingTicket,
  deleteRecoveryTicket,
  deleteDisposalTicket,
  deleteRejectedTicket,
  getAuxiliaryData 
} from '../../services/reportsService';
import { handleExport } from '../../services/exportService';

const ReportTMB = () => {
  const { canCreateData, canEditData, canDeleteData } = usePermissions();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('tmb');
  
  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      const viewToTab = {
        'recycling': 'recycling',
        'recovery': 'recovery',
        'disposal': 'disposal'
      };
      
      if (viewToTab[view]) {
        setActiveTab(viewToTab[view]);
        setSidebarOpen(true);
        setSidebarMode('create');
      }
    }
  }, [searchParams]);
  
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    year: currentYear,
    from: `${currentYear}-01-01`,
    to: new Date().toISOString().split('T')[0],
    sector_id: null,
    page: 1,
    per_page: 10
  });

  const [summaryData, setSummaryData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [wasteCodes, setWasteCodes] = useState([]);
  const [operators, setOperators] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('create');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ── Filtre secundare server-side (per tab) ──────────────────────────────
  const [secSearch, setSecSearch] = useState('');
  const [secSupplierId, setSecSupplierId] = useState('');
  const [secOperatorId, setSecOperatorId] = useState('');   // TMB: operator
  const [secRecipientId, setSecRecipientId] = useState(''); // Recycling/Recovery/Disposal: recipient
  const [secWasteCodeId, setSecWasteCodeId] = useState('');
  const [secGeneratorType, setSecGeneratorType] = useState('');
  const [secSortBy, setSecSortBy] = useState('ticket_date');
  const [secSortDir, setSecSortDir] = useState('desc');

  // Opțiuni dropdown populate din response
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);  // operator/recipient
  const [wasteCodeOptions, setWasteCodeOptions] = useState([]);
  const [generatorTypeOptions, setGeneratorTypeOptions] = useState([]);

  const secSearchDebounced = useDebounce(secSearch, 400);

  const resetSecondaryFilters = useCallback(() => {
    setSecSearch('');
    setSecSupplierId('');
    setSecOperatorId('');
    setSecRecipientId('');
    setSecWasteCodeId('');
    setSecGeneratorType('');
    setSecSortBy('ticket_date');
    setSecSortDir('desc');
  }, []);

  const hasSecFilters = secSearch || secSupplierId || secOperatorId || secRecipientId || secWasteCodeId || secGeneratorType;

  // Reset filtre secundare la schimbare tab sau filtre primare
  const prevTabRef = useRef(activeTab);
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const tabChanged = prevTabRef.current !== activeTab;
    const prev = prevFiltersRef.current;
    const primaryChanged = prev?.from !== filters?.from || prev?.to !== filters?.to ||
        prev?.sector_id !== filters?.sector_id || prev?.year !== filters?.year;
    if (tabChanged || primaryChanged) {
      resetSecondaryFilters();
    }
    prevTabRef.current = activeTab;
    prevFiltersRef.current = filters;
  }, [activeTab, filters, resetSecondaryFilters]);

  // Reset page când se schimbă search debounced
  const prevSearchRef = useRef(secSearchDebounced);
  useEffect(() => {
    if (prevSearchRef.current !== secSearchDebounced) {
      setFilters(prev => ({ ...prev, page: 1 }));
      prevSearchRef.current = secSearchDebounced;
    }
  }, [secSearchDebounced]);

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatted = num.toFixed(2);
    const [intPart, decPart] = formatted.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intWithDots},${decPart}`;
  };

  const groupRowsByNameWithCodes = (rows = []) => {
    const map = new Map();
    rows.forEach((row) => {
      const name = row?.name || row?.supplier_name || row?.client_name || 'N/A';
      const code = row?.code || row?.waste_code || row?.wasteCode || null;
      const qtyRaw = row?.total_tons ?? row?.total ?? row?.quantity ?? row?.tons ?? 0;
      const qty = Number(qtyRaw) || 0;
      if (!map.has(name)) {
        map.set(name, { name, total: 0, codes: [] });
      }
      const entry = map.get(name);
      entry.total += qty;
      if (code) {
        entry.codes.push({ code, quantity: qty });
      }
    });
    return Array.from(map.values()).map((e) => ({
      ...e,
      codes: (e.codes || []).sort((a, b) => (b.quantity || 0) - (a.quantity || 0)),
    }));
  };

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters, activeTab, secSearchDebounced, secSupplierId, secOperatorId, secRecipientId, secWasteCodeId, secGeneratorType, secSortBy, secSortDir]);

  const fetchAuxiliaryData = async () => {
    try {
      const response = await getAuxiliaryData();
      if (response.success && response.data) {
        setWasteCodes(response.data.waste_codes || []);
        setOperators(response.data.operators || []);
        setSuppliers(response.data.operators || []);
      }
    } catch (error) {
      console.error('Error fetching auxiliary data:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construim filtrele complete incluzând filtrele secundare
      const apiFilters = {
        ...filters,
        ...(secSearchDebounced?.trim() && { search: secSearchDebounced.trim() }),
        ...(secSupplierId && { supplier_id: secSupplierId }),
        ...(secWasteCodeId && { waste_code_id: secWasteCodeId }),
        sort_by: secSortBy,
        sort_dir: secSortDir,
      };

      // Parametri specifici per tab
      if (activeTab === 'tmb') {
        if (secOperatorId) apiFilters.operator_id = secOperatorId;
        if (secGeneratorType) apiFilters.generator_type = secGeneratorType;
      } else {
        if (secRecipientId) apiFilters.recipient_id = secRecipientId;
      }

      let response;
      switch (activeTab) {
        case 'tmb':
          response = await getTmbReports(apiFilters);
          break;
        case 'recycling':
          response = await getRecyclingReports(apiFilters);
          break;
        case 'recovery':
          response = await getRecoveryReports(apiFilters);
          break;
        case 'disposal':
          response = await getDisposalReports(apiFilters);
          break;
        case 'rejected':
          response = await getRejectedReports(filters);
          break;
        default:
          response = await getTmbReports(apiFilters);
      }
      
      if (response.success && response.data) {
        const ticketsList = response.data.items || response.data.tickets || [];
        setTickets(Array.isArray(ticketsList) ? ticketsList : []);
        const paginationData = response.data.pagination || {};
        setPagination({
          page: Number(paginationData.page || paginationData.current_page || 1),
          per_page: Number(paginationData.limit || paginationData.per_page || 10),
          total_pages: Number(paginationData.totalPages || paginationData.total_pages || 1),
          total_count: Number(paginationData.total || paginationData.total_records || 0),
        });
        
        // ✅ FIX: Pentru recycling, mapăm clients -> operators
        const operatorsData = activeTab === 'recycling' 
          ? (response.data.clients || [])
          : (response.data.operators || []);
        
        // ✅ FIX: Pentru recovery, adăugăm și clients
        const clientsData = (response.data.clients || []);
        
        // ✅ FIX: Găsim sectorul selectat din all_sectors după UUID
        const allSectorsFromResponse = response.data.all_sectors || [];
        const selectedSector = allSectorsFromResponse.find(s => s.sector_id === filters.sector_id);
        const sectorName = selectedSector?.sector_name || 'București';
        
        const summary = {
          total_quantity: response.data.summary?.total_tons || response.data.summary?.total_delivered || 0,
          total_delivered: response.data.summary?.total_delivered || 0,
          total_accepted: response.data.summary?.total_accepted || 0,
          total_tickets: response.data.summary?.total_tickets || ticketsList.length,
          year: filters.year,
          date_range: response.data.summary?.date_range || {
            from: filters.from,
            to: filters.to,
          },
          sector: sectorName,
          period: {
            year: filters.year,
            date_from: new Date(filters.from).toLocaleDateString('ro-RO'),
            date_to: new Date(filters.to).toLocaleDateString('ro-RO'),
            sector: sectorName
          },
          suppliers: groupRowsByNameWithCodes(response.data.suppliers || []),
          operators: groupRowsByNameWithCodes(operatorsData),
          clients: groupRowsByNameWithCodes(clientsData),
        };
        setSummaryData(summary);
        setAvailableYears(response.data.available_years || [currentYear]);
        const allSectors = response.data.all_sectors || [];
        setSectors(allSectors);

        // Populate dropdown options din datele contextuale returnate de API
        const suppliersRaw = response.data.suppliers || [];
        const uniqueSuppliers = [...new Map(suppliersRaw.map(s => [s.supplier_id || s.name, s])).values()]
          .sort((a, b) => a.name.localeCompare(b.name));
        setSupplierOptions(uniqueSuppliers);

        // Operatori/recipienți per tab
        if (activeTab === 'tmb') {
          const opsRaw = response.data.operators || [];
          const uniqueOps = [...new Map(opsRaw.map(o => [o.operator_id || o.name, o])).values()]
            .sort((a, b) => a.name.localeCompare(b.name));
          setOperatorOptions(uniqueOps);
          // Generator types din tichete
          const gtypes = [...new Set((response.data.items || []).map(t => t.generator_type).filter(Boolean))].sort();
          if (gtypes.length) setGeneratorTypeOptions(gtypes);
        } else {
          const recipRaw = response.data.clients || response.data.operators || [];
          const uniqueRecip = [...new Map(recipRaw.map(r => [r.recipient_id || r.operator_id || r.name, r])).values()]
            .sort((a, b) => a.name.localeCompare(b.name));
          setOperatorOptions(uniqueRecip);
        }

        // Coduri deșeuri
        const codesRaw = response.data.waste_codes || [];
        setWasteCodeOptions(codesRaw.map(wc => ({ id: wc.id || wc.code, label: wc.code || wc.waste_code })));
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'A apărut o eroare la încărcarea datelor');
      setTickets([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    // Reset filtre secundare la schimbare filtre primare
    resetSecondaryFilters();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.total_pages || 1)) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSecSort = (field) => {
    if (secSortBy === field) {
      setSecSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSecSortBy(field);
      setSecSortDir('asc');
    }
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handlePerPageChange = (newPerPage) => {
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }));
  };

  const handleCreate = () => {
    setSelectedTicket(null);
    setSidebarMode('create');
    setSidebarOpen(true);
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setSidebarMode('edit');
    setSidebarOpen(true);
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest tichet?')) return;
    try {
      let response;
      switch (activeTab) {
        case 'tmb':
          response = await deleteTmbTicket(ticketId);
          break;
        case 'recycling':
          response = await deleteRecyclingTicket(ticketId);
          break;
        case 'recovery':
          response = await deleteRecoveryTicket(ticketId);
          break;
        case 'disposal':
          response = await deleteDisposalTicket(ticketId);
          break;
        case 'rejected':
          response = await deleteRejectedTicket(ticketId);
          break;
        default:
          throw new Error('Delete not implemented for this tab');
      }
      if (response.success) {
        await fetchReports();
      } else {
        alert(response.message || 'Eroare la ștergerea tichetului');
      }
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('A apărut o eroare la ștergerea tichetului');
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedTicket(null);
  };

  const handleSidebarSuccess = () => {
    handleSidebarClose();
    fetchReports();
  };

  const toggleExpandRow = (ticketId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.clear();
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const handleExportClick = async (format) => {
    try {
      setExporting(true);
      console.log(`🚀 Exporting ${activeTab} as ${format}...`);

      // ✅ FETCH ALL DATA pentru export (fără paginare)
      const exportFilters = {
        year: filters.year,
        from: filters.from,
        to: filters.to,
        sector_id: filters.sector_id,
        page: 1,
        per_page: 100000  // Toate înregistrările
      };

      let exportResponse;
      switch (activeTab) {
        case 'tmb':
          exportResponse = await getTmbReports(exportFilters);
          break;
        case 'recycling':
          exportResponse = await getRecyclingReports(exportFilters);
          break;
        case 'recovery':
          exportResponse = await getRecoveryReports(exportFilters);
          break;
        case 'disposal':
          exportResponse = await getDisposalReports(exportFilters);
          break;
        case 'rejected':
          exportResponse = await getRejectedReports(exportFilters);
          break;
        default:
          exportResponse = await getTmbReports(exportFilters);
      }
      
      if (!exportResponse.success) {
        throw new Error(exportResponse.message || 'Eroare la obținerea datelor pentru export');
      }

      const allTickets = exportResponse.data.items || exportResponse.data.tickets || [];
      
      console.log(`📊 Exporting ${allTickets.length} tickets for ${activeTab}`);

      const result = await handleExport(format, allTickets, summaryData, filters, activeTab);

      if (result.success) {
        alert(`✅ Export ${format.toUpperCase()} realizat cu succes!\n\n${allTickets.length} înregistrări exportate.`);
      } else {
        alert(`❌ Eroare la export: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ Eroare la export: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const tabLabels = {
    tmb: 'Deșeuri trimise la tratare mecano-biologică',
    recycling: 'Deșeuri trimise la reciclare',
    recovery: 'Deșeuri trimise la valorificare',
    disposal: 'Deșeuri trimise la eliminare',
    rejected: 'Deșeuri refuzate/neacceptate',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Eroare</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }

  // Culori instituționale per tab
  const tabColors = {
    tmb: 'bg-slate-600 dark:bg-slate-500',
    recycling: 'bg-emerald-600 dark:bg-emerald-500',
    recovery: 'bg-rose-600 dark:bg-rose-500',
    disposal: 'bg-stone-600 dark:bg-stone-500',
    rejected: 'bg-zinc-600 dark:bg-zinc-500'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(tabLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === key
                  ? `${tabColors[key]} text-white shadow-md`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ReportsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        availableYears={availableYears}
        sectors={sectors}
        loading={loading}
      />

      {activeTab === 'tmb' && summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* CARD 1 - PERIOADA - Schema slate instituțional */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700/50 overflow-hidden h-[320px] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900/20 border-l-4 border-slate-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">Perioada analizată</h3>
                </div>
              </div>
            </div>
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">An:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{summaryData.period.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">De la:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{summaryData.period.date_from}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Până la:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{summaryData.period.date_to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">UAT:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{summaryData.period.sector}</span>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total cantitate</p>
                <p className="text-4xl font-bold text-slate-600 dark:text-slate-400">
                  {formatNumberRO(summaryData.total_quantity || 0)} <span className="text-xl font-medium">t</span>
                </p>
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Total tichete:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{summaryData.total_tickets || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700/50 overflow-hidden h-[320px] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900/20 border-l-4 border-slate-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">Furnizori deșeuri</h3>
                </div>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {(summaryData.suppliers || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există furnizori</p>
              ) : (
                <div className="space-y-4">
                  {summaryData.suppliers.slice(0, 10).map((supplier, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate flex-1">
                          {supplier.name}
                        </p>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-2">
                          {formatNumberRO(supplier.total)} t
                        </span>
                      </div>

                      {supplier.codes && supplier.codes.length > 0 && (
                        <div className="space-y-2">
                          {supplier.codes.map((code, codeIdx) => {
                            const percentage = summaryData.total_quantity > 0 
                              ? ((code.quantity / summaryData.total_quantity) * 100).toFixed(1)
                              : '0.0';
                            return (
                              <div key={codeIdx}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {code.code}
                                  </span>
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800/30 rounded-full h-1.5">
                                  <div 
                                    className="bg-slate-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-slate-700/50 overflow-hidden h-[320px] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-900/20 border-l-4 border-slate-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300">Prestatori TMB</h3>
                </div>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {(summaryData.operators || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există prestatori</p>
              ) : (
                <div className="space-y-3">
                  {summaryData.operators.slice(0, 10).map((operator, idx) => {
                    const operatorPercentage = summaryData.total_quantity > 0 
                      ? ((operator.total / summaryData.total_quantity) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate flex-1">
                            {operator.name}
                          </p>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-2">
                            {formatNumberRO(operator.total)} t
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-1">
                          <div className="w-full bg-slate-100 dark:bg-slate-800/30 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-slate-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${operatorPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {operatorPercentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABEL TMB */}
      {activeTab === 'tmb' && (() => {
        const thS = "px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";
        const selCls = "h-8 px-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-colors";
        const tmbTickets = tickets || [];

        return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* BARA TITLU + FILTRE SERVER-SIDE + BUTOANE */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              Tichete TMB
              <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({pagination?.total_count || 0})
              </span>
            </h3>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block mx-1" />
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={secSearch} onChange={e => setSecSearch(e.target.value)}
                placeholder="Nr. tichet / nr. auto..."
                className="h-8 pl-8 pr-3 w-[190px] text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 transition-colors" />
            </div>
            <select value={secSupplierId} onChange={e => { setSecSupplierId(e.target.value); setFilters(p=>({...p,page:1})); }} className={selCls}>
              <option value="">Toți furnizorii</option>
              {supplierOptions.map((s,i) => <option key={i} value={s.supplier_id || s.name}>{s.name}</option>)}
            </select>
            <select value={secGeneratorType} onChange={e => { setSecGeneratorType(e.target.value); setFilters(p=>({...p,page:1})); }} className={selCls}>
              <option value="">Toți generatorii</option>
              {generatorTypeOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={secOperatorId} onChange={e => { setSecOperatorId(e.target.value); setFilters(p=>({...p,page:1})); }} className={selCls}>
              <option value="">Toți prestatorii</option>
              {operatorOptions.map((o,i) => <option key={i} value={o.operator_id || o.name}>{o.name}</option>)}
            </select>
            {hasSecFilters && (
              <button onClick={resetSecondaryFilters}
                className="h-8 px-2.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 rounded-md bg-white dark:bg-gray-800 transition-colors">
                <X className="w-3 h-3" /> Reset
              </button>
            )}
            <div className="flex-1" />
            {canCreateData && (
              <button onClick={handleCreate} className="h-8 px-4 text-sm font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Adaugă tichet
              </button>
            )}
            <ExportDropdown onExport={handleExportClick} disabled={exporting || !tmbTickets.length} loading={exporting} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <th className={thS} onClick={()=>handleSecSort('ticket_number')}><span className="flex items-center">Tichet Cântar <SortIconTmb field="ticket_number" sortBy={secSortBy} sortDir={secSortDir} /></span></th>
                <th className={thS} onClick={()=>handleSecSort('ticket_date')}><span className="flex items-center">Data <SortIconTmb field="ticket_date" sortBy={secSortBy} sortDir={secSortDir} /></span></th>
                <th className="px-4 py-3 text-left">Furnizor</th>
                <th className="px-4 py-3 text-left">Cod Deșeu</th>
                <th className="px-4 py-3 text-left">Proveniență</th>
                <th className="px-4 py-3 text-left">Generator</th>
                <th className="px-4 py-3 text-left">Nr. Auto</th>
                <th className={thS} onClick={()=>handleSecSort('net_weight_tons')}><span className="flex items-center">Tone Net <SortIconTmb field="net_weight_tons" sortBy={secSortBy} sortDir={secSortDir} /></span></th>
                <th className="px-4 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tmbTickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {hasSecFilters ? 'Niciun rezultat pentru filtrele aplicate' : 'Nu există tichete în perioada selectată'}
                  </td>
                </tr>
              ) : (
                tmbTickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{ticket.ticket_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.supplier_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {ticket.waste_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.sector_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.generator_type || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.vehicle_number}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatNumberRO(ticket.net_weight_tons)} t</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleExpandRow(ticket.id)}
                          className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title={expandedRows.has(ticket.id) ? "Ascunde detalii" : "Arată detalii"}
                        >
                          <svg className={`w-5 h-5 transition-transform duration-200 ${expandedRows.has(ticket.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(ticket.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-800/30 transition-colors">
                        <td colSpan="9" className="px-4 py-4">
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                            {/* Row 1 */}
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Tichet Cântar:</span>
                              <p className="font-bold text-slate-600 dark:text-slate-400">{ticket.ticket_number}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Data:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Ora:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_time || 'N/A'}</p>
                            </div>

                            {/* Row 2 */}
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor Deșeuri:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.supplier_name || 'N/A'}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Prestator TMB:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.operator_name || 'N/A'}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență:</span>
                              <p className="font-medium text-gray-900 dark:text-white">Sector {ticket.sector_number || 'N/A'}</p>
                            </div>

                            {/* Row 3 */}
                            <div className="text-left col-span-2">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu complet:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.waste_code} - {ticket.waste_description}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Tip Generator:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.generator_type || 'N/A'}</p>
                            </div>

                            {/* Row 4 */}
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Nr. Auto:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.vehicle_number || 'N/A'}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Cantitate (tone):</span>
                              <p className="font-bold text-slate-600 dark:text-slate-400">{formatNumberRO(ticket.net_weight_tons)} t</p>
                            </div>
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.created_at).toLocaleString('ro-RO')}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4 justify-end border-t border-emerald-200 dark:border-emerald-800/30 pt-4">
                            {canEditData && (
                            <button
                              onClick={() => handleEdit(ticket)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editează
                            </button>
                            )}
                            {canDeleteData && (
                            <button
                              onClick={() => handleDelete(ticket.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Șterge
                            </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.total_pages > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pagina {pagination.page} din {pagination.total_pages}
                </p>
                <select
                  value={filters.per_page}
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="10">10 / pagină</option>
                  <option value="20">20 / pagină</option>
                  <option value="50">50 / pagină</option>
                  <option value="100">100 / pagină</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Următorul
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
        );
      })()}

      {/* RECYCLING VIEW */}
      {activeTab === 'recycling' && (
        <RecyclingReportView
          loading={loading}
          tickets={tickets}
          summaryData={summaryData}
          pagination={pagination}
          expandedRows={expandedRows}
          onToggleExpand={(id) => { setExpandedRows(prev => { const n=new Set(); if(!prev.has(id)) n.add(id); return n; }); }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onExport={handleExportClick}
          canCreate={canCreateData}
          canEdit={canEditData}
          canDelete={canDeleteData}
          exporting={exporting}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          filters={filters}
          sectors={sectors}
          formatNumberRO={formatNumberRO}
          groupRowsByNameWithCodes={groupRowsByNameWithCodes}
          secFilters={{
            search: secSearch, setSearch: setSecSearch,
            supplierId: secSupplierId, setSupplierId: setSecSupplierId,
            recipientId: secRecipientId, setRecipientId: setSecRecipientId,
            wasteCodeId: secWasteCodeId, setWasteCodeId: setSecWasteCodeId,
            sortBy: secSortBy, sortDir: secSortDir,
            handleSort: handleSecSort,
            hasActive: hasSecFilters, reset: resetSecondaryFilters,
            supplierOptions, operatorOptions, wasteCodeOptions,
            setPage: (p) => setFilters(prev => ({...prev, page: p})),
          }}
        />
      )}

      {/* RECOVERY VIEW */}
      {activeTab === 'recovery' && (
        <RecoveryReportView
          loading={loading}
          tickets={tickets}
          summaryData={summaryData}
          pagination={pagination}
          expandedRows={expandedRows}
          onToggleExpand={(id) => { setExpandedRows(prev => { const n=new Set(); if(!prev.has(id)) n.add(id); return n; }); }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onExport={handleExportClick}
          canCreate={canCreateData}
          canEdit={canEditData}
          canDelete={canDeleteData}
          exporting={exporting}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          filters={filters}
          sectors={sectors}
          formatNumberRO={formatNumberRO}
          groupRowsByNameWithCodes={groupRowsByNameWithCodes}
          secFilters={{
            search: secSearch, setSearch: setSecSearch,
            supplierId: secSupplierId, setSupplierId: setSecSupplierId,
            recipientId: secRecipientId, setRecipientId: setSecRecipientId,
            wasteCodeId: secWasteCodeId, setWasteCodeId: setSecWasteCodeId,
            sortBy: secSortBy, sortDir: secSortDir,
            handleSort: handleSecSort,
            hasActive: hasSecFilters, reset: resetSecondaryFilters,
            supplierOptions, operatorOptions, wasteCodeOptions,
            setPage: (p) => setFilters(prev => ({...prev, page: p})),
          }}
        />
      )}

      {/* DISPOSAL VIEW */}
      {activeTab === 'disposal' && (
        <DisposalReportView
          loading={loading}
          tickets={tickets}
          summaryData={summaryData}
          pagination={pagination}
          expandedRows={expandedRows}
          onToggleExpand={(id) => { setExpandedRows(prev => { const n=new Set(); if(!prev.has(id)) n.add(id); return n; }); }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onExport={handleExportClick}
          canCreate={canCreateData}
          canEdit={canEditData}
          canDelete={canDeleteData}
          exporting={exporting}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          filters={filters}
          sectors={sectors}
          formatNumberRO={formatNumberRO}
          groupRowsByNameWithCodes={groupRowsByNameWithCodes}
          secFilters={{
            search: secSearch, setSearch: setSecSearch,
            supplierId: secSupplierId, setSupplierId: setSecSupplierId,
            recipientId: secRecipientId, setRecipientId: setSecRecipientId,
            wasteCodeId: secWasteCodeId, setWasteCodeId: setSecWasteCodeId,
            sortBy: secSortBy, sortDir: secSortDir,
            handleSort: handleSecSort,
            hasActive: hasSecFilters, reset: resetSecondaryFilters,
            supplierOptions, operatorOptions, wasteCodeOptions,
            setPage: (p) => setFilters(prev => ({...prev, page: p})),
          }}
        />
      )}

      {/* REJECTED VIEW */}
      {activeTab === 'rejected' && (
        <RejectedReportView
          loading={loading}
          tickets={tickets}
          summaryData={summaryData}
          pagination={pagination}
          expandedRows={expandedRows}
          onToggleExpand={(id) => {
            setExpandedRows(prev => {
              const newSet = new Set();
              if (!prev.has(id)) {
                newSet.add(id);
              }
              return newSet;
            });
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onExport={handleExportClick}
          canCreate={canCreateData}
          canEdit={canEditData}
          canDelete={canDeleteData}
          exporting={exporting}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          filters={filters}
          sectors={sectors}
          formatNumberRO={formatNumberRO}
          groupRowsByNameWithCodes={groupRowsByNameWithCodes}
        />
      )}

      {activeTab === 'tmb' && (
        <ReportsTmbSidebar
          isOpen={sidebarOpen}
          mode={sidebarMode}
          ticket={selectedTicket}
          wasteCodes={wasteCodes}
          operators={operators}
          suppliers={suppliers}
          sectors={sectors}
          onClose={handleSidebarClose}
          onSuccess={handleSidebarSuccess}
        />
      )}

      {activeTab === 'recycling' && (
        <RecyclingSidebar
          isOpen={sidebarOpen}
          mode={sidebarMode}
          ticket={selectedTicket}
          wasteCodes={wasteCodes}
          clients={operators}
          suppliers={suppliers}
          sectors={sectors}
          onClose={handleSidebarClose}
          onSuccess={handleSidebarSuccess}
        />
      )}

      {activeTab === 'recovery' && (
        <RecoverySidebar
          isOpen={sidebarOpen}
          mode={sidebarMode}
          ticket={selectedTicket}
          wasteCodes={wasteCodes}
          clients={operators}
          suppliers={suppliers}
          sectors={sectors}
          onClose={handleSidebarClose}
          onSuccess={handleSidebarSuccess}
        />
      )}

      {activeTab === 'disposal' && (
        <DisposalSidebar
          isOpen={sidebarOpen}
          mode={sidebarMode}
          ticket={selectedTicket}
          wasteCodes={wasteCodes}
          clients={operators}
          suppliers={suppliers}
          sectors={sectors}
          onClose={handleSidebarClose}
          onSuccess={handleSidebarSuccess}
        />
      )}

      {activeTab === 'rejected' && (
        <RejectedSidebar
          isOpen={sidebarOpen}
          mode={sidebarMode}
          ticket={selectedTicket}
          wasteCodes={wasteCodes}
          operators={operators}
          suppliers={suppliers}
          sectors={sectors}
          onClose={handleSidebarClose}
          onSuccess={handleSidebarSuccess}
        />
      )}
    </div>
  );
};

export default ReportTMB;