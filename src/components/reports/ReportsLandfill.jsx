// src/components/reports/ReportsLandfill.jsx
/**
 * Filtrele secundare (furnizor, tip contract, cod deșeu, search, sort)
 * sunt trimise la API → filtrează TOATE înregistrările, nu doar pagina curentă.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Plus, Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

import ReportsFilters from './ReportsFilters';
import ReportsSidebar from './ReportsSidebar';
import ExportDropdown from './ExportDropdown';

import {
  getLandfillReports,
  getAuxiliaryData,
  deleteLandfillTicket,
} from '../../services/reportsService';

import { handleExport } from '../../services/exportService';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SortIcon = ({ field, sortBy, sortDir }) => {
  if (sortBy !== field) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-amber-600" />
    : <ChevronDown className="w-3.5 h-3.5 ml-1 text-amber-600" />;
};

const ReportsLandfill = () => {
  const { canCreateData, canEditData, canDeleteData } = usePermissions();
  const currentYear = new Date().getFullYear();

  // ── Filtre primare ─────────────────────────────────────────────────────
  const [primaryFilters, setPrimaryFilters] = useState({
    year: currentYear,
    from: `${currentYear}-01-01`,
    to: new Date().toISOString().split('T')[0],
    sector_id: null,
  });

  // ── Filtre secundare (server-side) ────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');
  const [wasteCodeFilter, setWasteCodeFilter] = useState('');
  const [sortBy, setSortBy] = useState('ticket_date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const searchDebounced = useDebounce(searchRaw, 400);

  // ── State date ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [wasteCodesDepozitate, setWasteCodesDepozitate] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [wasteCodeOptions, setWasteCodeOptions] = useState([]);
  const [wasteCodes, setWasteCodes] = useState([]);
  const [operators, setOperators] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('create');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ── Build API filters ─────────────────────────────────────────────────
  const buildApiFilters = useCallback(() => {
    const f = {
      ...primaryFilters,
      page,
      per_page: perPage,
      sort_by: sortBy,
      sort_dir: sortDir,
    };
    if (searchDebounced?.trim()) f.search = searchDebounced.trim();
    if (supplierFilter) f.supplier_id = supplierFilter;
    if (contractTypeFilter) f.contract_type = contractTypeFilter;
    if (wasteCodeFilter) f.waste_code_id = wasteCodeFilter;
    return f;
  }, [primaryFilters, page, perPage, searchDebounced, supplierFilter, contractTypeFilter, wasteCodeFilter, sortBy, sortDir]);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLandfillReports(buildApiFilters());

      if (response.success && response.data) {
        const ticketsList = response.data.items || [];
        setTickets(ticketsList);

        const pg = response.data.pagination || {};
        setPagination({
          page: Number(pg.page || 1),
          per_page: Number(pg.limit || perPage),
          total_pages: Number(pg.totalPages || 1),
          total_count: Number(pg.total || 0),
        });

        setSectors(response.data.all_sectors || []);
        setAvailableYears(response.data.available_years || [currentYear]);
        setWasteCodesDepozitate(response.data.waste_codes || []);

        setSummaryData({
          total_quantity: response.data.summary?.total_tons || 0,
          total_tickets: response.data.summary?.total_tickets || 0,
          period: {
            year: primaryFilters.year,
            date_from: new Date(primaryFilters.from).toLocaleDateString('ro-RO'),
            date_to: new Date(primaryFilters.to).toLocaleDateString('ro-RO'),
          },
          suppliers: groupRowsByNameWithCodes(response.data.suppliers || []),
        });

        // Populate dropdown options from response data
        const suppliersRaw = response.data.suppliers || [];
        const uniqueSuppliers = [...new Map(suppliersRaw.map(s => [s.supplier_id, s])).values()]
          .sort((a, b) => a.name.localeCompare(b.name));
        setSupplierOptions(uniqueSuppliers);

        const codesRaw = response.data.waste_codes || [];
        setWasteCodeOptions(codesRaw.map(wc => ({ id: wc.code, label: wc.code })));

        // Contract types from current page — preserved if empty
        const ctypes = [...new Set(ticketsList.map(t => t.contract_type).filter(Boolean))].sort();
        if (ctypes.length) setContractTypeOptions(ctypes);

      } else {
        setError(response.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, [buildApiFilters]);

  useEffect(() => {
    const fetchAux = async () => {
      try {
        const response = await getAuxiliaryData();
        if (response.success && response.data) {
          setWasteCodes(response.data.waste_codes || []);
          setOperators(response.data.operators || []);
          // Contract types din aux data
          if (response.data.contract_types?.length) {
            setContractTypeOptions(response.data.contract_types);
          }
        }
      } catch (err) { console.error('aux data error:', err); }
    };
    fetchAux();
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Reset page când se schimbă search debounced
  const prevSearchRef = useRef(searchDebounced);
  useEffect(() => {
    if (prevSearchRef.current !== searchDebounced) {
      setPage(1);
      prevSearchRef.current = searchDebounced;
    }
  }, [searchDebounced]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handlePrimaryFilterChange = (newFilters) => {
    setPrimaryFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setSearchRaw('');
    setSupplierFilter('');
    setContractTypeFilter('');
    setWasteCodeFilter('');
    setSortBy('ticket_date');
    setSortDir('desc');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const resetSecondaryFilters = () => {
    setSearchRaw('');
    setSupplierFilter('');
    setContractTypeFilter('');
    setWasteCodeFilter('');
    setSortBy('ticket_date');
    setSortDir('desc');
    setPage(1);
  };

  const hasActiveFilters = searchRaw || supplierFilter || contractTypeFilter || wasteCodeFilter;

  const toggleExpandRow = (id) => {
    setExpandedRows(prev => { const n = new Set(); if (!prev.has(id)) n.add(id); return n; });
  };

  const handleAddNew = () => { setSelectedTicket(null); setSidebarMode('create'); setSidebarOpen(true); };
  const handleEdit = (ticket) => { setSelectedTicket(ticket); setSidebarMode('edit'); setSidebarOpen(true); };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Sigur vrei să ștergi această înregistrare?')) return;
    try {
      const r = await deleteLandfillTicket(ticketId);
      if (r.success) fetchReports();
      else alert('Eroare la ștergere: ' + r.message);
    } catch (err) { alert('Eroare la ștergere: ' + err.message); }
  };

  const handleSidebarClose = () => { setSidebarOpen(false); setSelectedTicket(null); };
  const handleSidebarSuccess = () => { setSidebarOpen(false); setSelectedTicket(null); fetchReports(); };

  const handleExportData = async (format) => {
    try {
      setExporting(true);
      const exportFilters = { ...buildApiFilters(), page: 1, per_page: 100000 };
      const exportResponse = await getLandfillReports(exportFilters);
      if (!exportResponse.success) throw new Error(exportResponse.message);
      const allTickets = exportResponse.data.items || [];
      const result = await handleExport(format, allTickets, summaryData, primaryFilters, 'landfill', sectors);
      if (result.success) alert(`✅ Export ${format.toUpperCase()} realizat!\n${allTickets.length} înregistrări exportate.`);
      else alert(`❌ Eroare la export: ${result.error}`);
    } catch (err) { alert(`❌ Eroare la export: ${err.message}`); }
    finally { setExporting(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const formatNumberRO = (n) => {
    if (!n && n !== 0) return '0,00';
    const num = typeof n === 'string' ? parseFloat(n) : n;
    const [i, d] = num.toFixed(2).split('.');
    return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${d}`;
  };

  const groupRowsByNameWithCodes = (rows = []) => {
    const map = new Map();
    rows.forEach(row => {
      const name = row?.name || 'N/A';
      const code = row?.code || null;
      const qty = Number(row?.total_tons ?? row?.total ?? 0) || 0;
      if (!map.has(name)) map.set(name, { name, total: 0, codes: [] });
      const e = map.get(name);
      e.total += qty;
      if (code) e.codes.push({ code, quantity: qty });
    });
    return Array.from(map.values()).map(e => ({ ...e, codes: e.codes.sort((a, b) => b.quantity - a.quantity) }));
  };

  const getLocationName = () => {
    if (primaryFilters.sector_id && sectors.length > 0) {
      const s = sectors.find(s => s.id === primaryFilters.sector_id || s.sector_id === primaryFilters.sector_id);
      if (s) return `Sectorul ${s.sector_number}`;
    }
    return 'București';
  };

  const selectCls = "h-8 px-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors";
  const thS = "px-4 py-3 whitespace-nowrap text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";
  const th = "px-4 py-3 whitespace-nowrap text-left";

  // ── Loading / Error ───────────────────────────────────────────────────
  if (loading && !summaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Se încarcă rapoartele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Eroare la încărcarea datelor</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button onClick={fetchReports} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg">Încearcă din nou</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <ReportsFilters
        filters={primaryFilters}
        onFilterChange={handlePrimaryFilterChange}
        sectors={sectors}
        availableYears={availableYears}
        loading={loading}
      />

      {/* CARDURI SUMAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1 - Perioada */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Perioada analizată</h3>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between"><span className="text-gray-500 dark:text-gray-400">An:</span><span className="font-semibold text-gray-900 dark:text-white">{summaryData?.period?.year || currentYear}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500 dark:text-gray-400">De la:</span><span className="font-semibold text-gray-900 dark:text-white">{summaryData?.period?.date_from || '-'}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500 dark:text-gray-400">Până la:</span><span className="font-semibold text-gray-900 dark:text-white">{summaryData?.period?.date_to || '-'}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500 dark:text-gray-400">UAT:</span><span className="font-semibold text-gray-900 dark:text-white">{getLocationName()}</span></div>
            </div>
            <div className="text-center py-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total cantitate</p>
              <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">{formatNumberRO(summaryData?.total_quantity || 0)} <span className="text-xl font-medium">t</span></p>
            </div>
            <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Total tichete:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{summaryData?.total_tickets || 0}</span>
            </div>
          </div>
        </div>

        {/* Card 2 - Furnizori */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Furnizori deșeuri</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {!(summaryData?.suppliers?.length) ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există furnizori</p>
            ) : (
              <div className="space-y-3">
                {summaryData.suppliers.slice(0, 10).map((supplier, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate flex-1">{supplier.name}</p>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400 ml-2">{formatNumberRO(supplier.total)} t</span>
                    </div>
                    {supplier.codes?.length > 0 && (
                      <div className="space-y-2">
                        {supplier.codes.map((code, cIdx) => {
                          const pct = supplier.total > 0 ? ((code.quantity / supplier.total) * 100).toFixed(1) : '0.0';
                          return (
                            <div key={cIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">{code.code}</span>
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{formatNumberRO(code.quantity)} t <span className="text-slate-500">({pct}%)</span></span>
                              </div>
                              <div className="w-full bg-amber-100 dark:bg-amber-800/30 rounded-full h-1.5">
                                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
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

        {/* Card 3 - Coduri deșeuri */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Coduri deșeuri depozitate</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {!(wasteCodesDepozitate?.length) ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există coduri</p>
            ) : (
              <div className="space-y-2 text-sm">
                {wasteCodesDepozitate.slice(0, 10).map((wc, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{wc.code}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{wc.description}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-amber-700 dark:text-amber-400 font-semibold">{formatNumberRO(wc.total_tons)} t</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{wc.percent}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

        {/* BARA TITLU + FILTRE + BUTOANE */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              Tichete Depozitare
              <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">({pagination?.total_count || 0})</span>
            </h3>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block mx-1" />

            {/* Search → API cu debounce 400ms */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={searchRaw} onChange={e => setSearchRaw(e.target.value)}
                placeholder="Tichet / cântar / nr. auto..."
                className="h-8 pl-8 pr-3 w-[200px] text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors" />
            </div>

            {/* Furnizor → API */}
            <select value={supplierFilter} onChange={e => { setSupplierFilter(e.target.value); setPage(1); }} className={selectCls}>
              <option value="">Toți furnizorii</option>
              {supplierOptions.map((s, i) => <option key={i} value={s.supplier_id}>{s.name}</option>)}
            </select>

            {/* Tip contract → API */}
            <select value={contractTypeFilter} onChange={e => { setContractTypeFilter(e.target.value); setPage(1); }} className={selectCls}>
              <option value="">Toate tipurile</option>
              {contractTypeOptions.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>

            {/* Cod deșeu → API */}
            <select value={wasteCodeFilter} onChange={e => { setWasteCodeFilter(e.target.value); setPage(1); }} className={selectCls}>
              <option value="">Toate codurile</option>
              {wasteCodeOptions.map(wc => <option key={wc.id} value={wc.id}>{wc.label}</option>)}
            </select>

            {hasActiveFilters && (
              <button onClick={resetSecondaryFilters}
                className="h-8 px-2.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 rounded-md bg-white dark:bg-gray-800 transition-colors">
                <X className="w-3 h-3" /> Reset
              </button>
            )}

            <div className="flex-1" />

            {canCreateData && (
              <button onClick={handleAddNew}
                className="h-8 px-4 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Adaugă tichet
              </button>
            )}
            <ExportDropdown onExport={handleExportData} disabled={!tickets.length} loading={exporting} />
          </div>
        </div>

        {/* Loading overlay subtil */}
        <div className="relative">
          {loading && summaryData && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className={thS} onClick={() => handleSort('ticket_number')}><span className="flex items-center">Tichet Cântar <SortIcon field="ticket_number" sortBy={sortBy} sortDir={sortDir} /></span></th>
                  <th className={thS} onClick={() => handleSort('ticket_date')}><span className="flex items-center">Data <SortIcon field="ticket_date" sortBy={sortBy} sortDir={sortDir} /></span></th>
                  <th className={th}>Furnizor</th>
                  <th className={th}>Cod Deșeu</th>
                  <th className={th}>Tip Contract</th>
                  <th className={th}>Sector</th>
                  <th className={th}>Nr. Auto</th>
                  <th className={thS} onClick={() => handleSort('net_weight_tons')}><span className="flex items-center">Tone Net <SortIcon field="net_weight_tons" sortBy={sortBy} sortDir={sortDir} /></span></th>
                  <th className="px-4 py-3 text-center w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {hasActiveFilters ? 'Niciun rezultat pentru filtrele aplicate' : 'Nu există date pentru perioada selectată'}
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <React.Fragment key={ticket.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap">{ticket.ticket_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.supplier_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">{ticket.waste_code}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.contract_type || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.sector_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{ticket.vehicle_number}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">{formatNumberRO(ticket.net_weight_tons)} t</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleExpandRow(ticket.id)} className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <svg className={`w-5 h-5 transition-transform duration-200 ${expandedRows.has(ticket.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(ticket.id) && (
                        <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                          <td colSpan="9" className="px-4 py-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Tichet Cântar:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_number}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Data:</span><p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Ora:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_time || 'N/A'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Nr. Auto:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.vehicle_number || 'N/A'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor Deșeuri:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.supplier_name || 'N/A'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Operator Depozit:</span><p className="font-medium text-amber-700 dark:text-amber-400">{ticket.operator_name || 'ECOSUD SA'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență (Sector):</span><p className="font-medium text-gray-900 dark:text-white">{ticket.sector_name || 'N/A'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Tip Generator:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.generator_type || 'N/A'}</p></div>
                              <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400 block mb-1">Cod Deșeu:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.waste_code} - {ticket.waste_description}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Tip Contract:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.contract_type || 'N/A'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Operație:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.operation_type || 'N/A'}</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Greutate Brut:</span><p className="font-semibold text-gray-900 dark:text-white">{formatNumberRO((ticket.gross_weight_kg || 0) / 1000)} t</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Greutate Tară:</span><p className="font-semibold text-gray-900 dark:text-white">{formatNumberRO((ticket.tare_weight_kg || 0) / 1000)} t</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Greutate Net:</span><p className="font-semibold text-amber-700 dark:text-amber-400">{formatNumberRO(ticket.net_weight_tons)} t</p></div>
                              <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span><p className="font-medium text-gray-900 dark:text-white text-xs">{new Date(ticket.created_at).toLocaleString('ro-RO')}</p></div>
                            </div>
                            <div className="flex gap-2 mt-4 justify-end border-t border-amber-200 dark:border-amber-800/30 pt-4">
                              {canEditData && (
                                <button onClick={() => handleEdit(ticket)} className="px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  Editează
                                </button>
                              )}
                              {canDeleteData && (
                                <button onClick={() => handleDelete(ticket.id)} className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        </div>

        {/* PAGINARE */}
        {pagination && pagination.total_pages > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pagina {pagination.page} din {pagination.total_pages}</p>
                <select value={perPage} onChange={e => { setPerPage(parseInt(e.target.value, 10)); setPage(1); }}
                  className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option value="10">10 / pagină</option>
                  <option value="20">20 / pagină</option>
                  <option value="50">50 / pagină</option>
                  <option value="100">100 / pagină</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button>
                <button onClick={() => setPage(p => p + 1)} disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Următorul</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReportsSidebar
        isOpen={sidebarOpen}
        mode={sidebarMode}
        ticket={selectedTicket}
        wasteCodes={wasteCodes}
        operators={operators}
        sectors={sectors}
        onClose={handleSidebarClose}
        onSuccess={handleSidebarSuccess}
      />
    </div>
  );
};

export default ReportsLandfill;