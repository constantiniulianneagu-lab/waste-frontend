// src/components/reports/DisposalReportView.jsx
// Schema de culori: Amber (familie unică) - Maro Profesional
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import ExportDropdown from './ExportDropdown';

// ─── Helpers ────────────────────────────────────────────────────────────────

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const SortIcon = ({ field, sortConfig }) => {
  if (sortConfig.key !== field) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 opacity-30" />;
  return sortConfig.dir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-amber-600" />
    : <ChevronDown className="w-3.5 h-3.5 ml-1 text-amber-600" />;
};

// ─── Component ───────────────────────────────────────────────────────────────

const DisposalReportView = ({
  loading,
  tickets,
  summaryData,
  pagination,
  expandedRows,
  onToggleExpand,
  onEdit,
  onDelete,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  onPageChange,
  onPerPageChange,
  onCreate,
  onExport,
  exporting,
  filters,
  sectors,
  formatNumberRO,
  groupRowsByNameWithCodes,
  secFilters = null,
}) => {

  // ── Filtre secundare (client-side) ─────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterContractType, setFilterContractType] = useState('');
  const [filterWasteCode, setFilterWasteCode] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });

  const search = useDebounce(searchRaw, 400);
  const isControlled = secFilters !== null;

  // Reset filtre secundare când se schimbă filtrele primare
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    if (
      prevFiltersRef.current?.from !== filters?.from ||
      prevFiltersRef.current?.to !== filters?.to ||
      prevFiltersRef.current?.sector_id !== filters?.sector_id ||
      prevFiltersRef.current?.year !== filters?.year
    ) {
      setSearchRaw('');
      setFilterSupplier('');
      setFilterContractType('');
      setFilterWasteCode('');
      setSortConfig({ key: null, dir: 'asc' });
    }
    prevFiltersRef.current = filters;
  }, [filters]);

  // ── Opțiuni dropdown din datele curente ───────────────────────────────
  const supplierOptions = useMemo(() => {
    if (!tickets?.length) return [];
    const unique = [...new Map(tickets.map(t => [t.supplier_id, t.supplier_name])).entries()];
    return unique.sort((a, b) => a[1].localeCompare(b[1]));
  }, [tickets]);

  const contractTypeOptions = useMemo(() => {
    if (!tickets?.length) return [];
    const unique = [...new Set(tickets.map(t => t.contract_type).filter(Boolean))];
    return unique.sort();
  }, [tickets]);

  const wasteCodeOptions = useMemo(() => {
    if (!tickets?.length) return [];
    const unique = [...new Map(tickets.map(t => [t.waste_code_id || t.waste_code, t.waste_code])).entries()];
    return unique.sort((a, b) => a[1].localeCompare(b[1]));
  }, [tickets]);

  const hasActiveFilters = search || filterSupplier || filterContractType || filterWasteCode;

  // ── Filtrare + sortare client-side ────────────────────────────────────
  const processedTickets = useMemo(() => {
    if (!tickets?.length) return [];

    let result = [...tickets];

    // Search: tichet / nr cântar / nr auto
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        (t.ticket_number || '').toLowerCase().includes(q) ||
        (t.scale_number || '').toLowerCase().includes(q) ||
        (t.vehicle_number || '').toLowerCase().includes(q)
      );
    }

    if (filterSupplier) {
      result = result.filter(t => String(t.supplier_id) === filterSupplier);
    }

    if (filterContractType) {
      result = result.filter(t => t.contract_type === filterContractType);
    }

    if (filterWasteCode) {
      result = result.filter(t => t.waste_code === filterWasteCode);
    }

    // Sortare
    if (sortConfig.key) {
      result.sort((a, b) => {
        let va, vb;
        if (sortConfig.key === 'ticket_date') {
          va = new Date(a.ticket_date).getTime();
          vb = new Date(b.ticket_date).getTime();
        } else if (sortConfig.key === 'ticket_number') {
          va = a.ticket_number || '';
          vb = b.ticket_number || '';
        } else if (sortConfig.key === 'net_tons') {
          va = parseFloat(a.accepted_quantity_tons) || 0;
          vb = parseFloat(b.accepted_quantity_tons) || 0;
        }
        if (va < vb) return sortConfig.dir === 'asc' ? -1 : 1;
        if (va > vb) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tickets, search, filterSupplier, filterContractType, filterWasteCode, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const resetSecondaryFilters = () => {
    setSearchRaw('');
    setFilterSupplier('');
    setFilterContractType('');
    setFilterWasteCode('');
    setSortConfig({ key: null, dir: 'asc' });
  };

  // ── Stiluri ────────────────────────────────────────────────────────────
  const selectClass = "h-8 px-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors";
  const thSortClass = "px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";
  const thClass = "px-4 py-3 text-left";

  // ── Utils ─────────────────────────────────────────────────────────────
  const formatDateRO = (dateStr) => {
    if (!dateStr) return 'N/A';
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getUatName = () => {
    if (!filters?.sector_id) return 'București';
    const sector = sectors?.find(s => s.sector_id === filters.sector_id || s.id === filters.sector_id);
    return sector?.sector_name || sector?.name || 'București';
  };

  // ─────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  const delivered = summaryData?.total_delivered || 0;
  const accepted = summaryData?.total_accepted || 0;
  const difference = delivered - accepted;


  // Controlled (server-side) vs uncontrolled (client-side) filter vars
  const _search = isControlled ? secFilters.search : search;
  const _setSearch = isControlled ? secFilters.setSearch : setSearchRaw;
  const _supplierId = isControlled ? secFilters.supplierId : filterSupplier;
  const _setSupplierId = isControlled ? (v) => { secFilters.setSupplierId(v); secFilters.setPage(1); } : (v) => setFilterSupplier(v);
  const _recipientId = isControlled ? secFilters.recipientId : filterRecipient;
  const _setRecipientId = isControlled ? (v) => { secFilters.setRecipientId(v); secFilters.setPage(1); } : (v) => setFilterRecipient(v);
  const _wasteCodeId = isControlled ? secFilters.wasteCodeId : filterWasteCode;
  const _setWasteCodeId = isControlled ? (v) => { secFilters.setWasteCodeId(v); secFilters.setPage(1); } : (v) => setFilterWasteCode(v);
  const _sortBy = isControlled ? secFilters.sortBy : sortConfig.key;
  const _sortDir = isControlled ? secFilters.sortDir : sortConfig.dir;
  const _handleSort = isControlled ? secFilters.handleSort : handleSort;
  const _hasActive = isControlled ? secFilters.hasActive : hasActiveFilters;
  const _reset = isControlled ? secFilters.reset : resetSecondaryFilters;
  const _supplierOpts = isControlled ? secFilters.supplierOptions : supplierOptions;
  const _recipientOpts = isControlled ? secFilters.operatorOptions : supplierOptions;
  const _wasteCodeOpts = isControlled ? secFilters.wasteCodeOptions : wasteCodeOptions;
  const _tickets = isControlled ? (tickets || []) : processedTickets;
  const _total = isControlled ? (pagination?.total_count || 0) : processedTickets.length;
  const _totalLabel = isControlled
    ? `(${pagination?.total_count || 0})`
    : (processedTickets.length !== (pagination?.total_count || 0)
        ? `(${processedTickets.length} / ${pagination?.total_count || 0})`
        : `(${pagination?.total_count || 0})`);

  const _SortIcon = ({ field }) => {
    if (_sortBy !== field) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 opacity-30" />;
    return _sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-amber-600" />
      : <ChevronDown className="w-3.5 h-3.5 ml-1 text-amber-600" />;
  };

  return (
    <div className="space-y-6">

      {/* CARDURI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* CARD 1 - PERIOADA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Perioada analizată</h3>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="space-y-1 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">An:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{filters?.year || new Date().getFullYear()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">De la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatDateRO(filters?.from || summaryData?.date_range?.from)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Până la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatDateRO(filters?.to || summaryData?.date_range?.to)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">UAT:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{getUatName()}</span>
              </div>
            </div>
            <div className="text-center py-4 flex-1 flex flex-col justify-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cantitate livrată</p>
              <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">
                {formatNumberRO(delivered)} <span className="text-lg font-medium">t</span>
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total tichete:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{summaryData?.total_tickets || 0}</span>
            </div>
          </div>
        </div>

        {/* CARD 2 - FURNIZORI */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Furnizori</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(!summaryData?.suppliers || summaryData.suppliers.length === 0) ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">Nu există furnizori</p>
            ) : (
              summaryData.suppliers.map((supplier, idx) => {
                const supplierTotal = supplier.total || 0;
                return (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{supplier.name}</span>
                      <span className="text-base font-bold text-amber-700 dark:text-amber-400 ml-2">{formatNumberRO(supplierTotal)} t</span>
                    </div>
                    {supplier.codes?.length > 0 && (
                      <div className="space-y-2">
                        {supplier.codes.map((codeData, cIdx) => {
                          const codeQty = codeData.quantity || 0;
                          const codePercent = supplierTotal > 0 ? ((codeQty / supplierTotal) * 100).toFixed(1) : 0;
                          return (
                            <div key={cIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">{codeData.code}</span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  <span className="font-bold text-amber-500 dark:text-amber-400">{formatNumberRO(codeQty)} t</span> ({codePercent}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div className="bg-amber-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${codePercent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CARD 3 - OPERATORI DEPOZIT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Operatori Depozit</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(!summaryData?.clients || summaryData.clients.length === 0) ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">Nu există operatori</p>
            ) : (
              summaryData.clients.map((client, idx) => {
                const clientTotal = client.total || 0;
                return (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{client.name}</span>
                      <span className="text-base font-bold text-amber-700 dark:text-amber-400 ml-2">{formatNumberRO(clientTotal)} t</span>
                    </div>
                    {client.codes?.length > 0 && (
                      <div className="space-y-2">
                        {client.codes.map((codeData, cIdx) => {
                          const codeQty = codeData.quantity || 0;
                          const codePercent = clientTotal > 0 ? ((codeQty / clientTotal) * 100).toFixed(1) : 0;
                          return (
                            <div key={cIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">{codeData.code}</span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  <span className="font-bold text-amber-500 dark:text-amber-400">{formatNumberRO(codeQty)} t</span> ({codePercent}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div className="bg-amber-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${codePercent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* BARA TITLU + FILTRE + BUTOANE */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              Tichete Depozitare <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{_totalLabel}</span>
            </h3>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block mx-1" />
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={_search} onChange={e => _setSearch(e.target.value)}
                placeholder="Tichet / cântar / nr. auto..."
                className="h-8 pl-8 pr-3 w-[200px] text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors" />
            </div>
            <select value={_supplierId} onChange={e => _setSupplierId(e.target.value)} className={selectClass}>
              <option value="">Toți furnizorii</option>
              {(_supplierOpts||[]).map((s,i) => <option key={i} value={isControlled ? s.supplier_id : s[0]}>{isControlled ? s.name : s[1]}</option>)}
            </select>

            <select value={_wasteCodeId} onChange={e => _setWasteCodeId(e.target.value)} className={selectClass}>
              <option value="">Toate codurile</option>
              {(_wasteCodeOpts||[]).map((wc,i) => <option key={i} value={isControlled ? wc.id : wc[0]}>{isControlled ? wc.label : wc[1]}</option>)}
            </select>
            {_hasActive && (
              <button onClick={_reset} className="h-8 px-2.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 rounded-md bg-white dark:bg-gray-800 transition-colors">
                <X className="w-3 h-3" /> Reset
              </button>
            )}
            <div className="flex-1" />
            {canCreate && (
              <button onClick={onCreate} className="h-8 px-4 text-sm font-medium bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Adaugă tichet
              </button>
            )}
            <ExportDropdown onExport={onExport} disabled={exporting || !_tickets.length} loading={exporting} />
          </div>
        </div>

        {/* TABEL DATE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <th
                  className={thSortClass}
                  onClick={() => _handleSort('ticket_number')}
                >
                  <span className="flex items-center">
                    Tichet Cântar
                    <_SortIcon field="ticket_number" />
                  </span>
                </th>
                <th
                  className={thSortClass}
                  onClick={() => _handleSort('ticket_date')}
                >
                  <span className="flex items-center">
                    Data
                    <_SortIcon field="ticket_date" />
                  </span>
                </th>
                <th className={thClass}>Furnizor</th>
                <th className={thClass}>Cod Deșeu</th>
                <th className={thClass}>Nr. Auto</th>
                <th className="px-4 py-3 text-center">Cant. Livrată</th>
                <th
                  className="px-4 py-3 text-center cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => _handleSort('net_tons')}
                >
                  <span className="flex items-center justify-center">
                    Cant. Acceptată
                    <_SortIcon field="net_tons" />
                  </span>
                </th>
                <th className={thClass}>Proveniență</th>
                <th className="px-4 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {_tickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {_hasActive ? 'Niciun rezultat pentru filtrele aplicate' : 'Nu există date pentru perioada selectată'}
                  </td>
                </tr>
              ) : (
                _tickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-amber-500 dark:text-amber-400">{ticket.ticket_number || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.supplier_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {ticket.waste_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.vehicle_number || 'N/A'}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-amber-700 dark:text-amber-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-amber-600 dark:text-amber-500">{formatNumberRO(ticket.accepted_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.sector_name}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => onToggleExpand(ticket.id)} className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                          <svg className={`w-5 h-5 transition-transform duration-200 ${expandedRows.has(ticket.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(ticket.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-800/30">
                        <td colSpan="9" className="px-4 py-4">
                          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Tichet:</span>
                              <p className="font-semibold text-amber-500 dark:text-amber-400">{ticket.ticket_number || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Data:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Ora:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_time || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.supplier_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Operator Depozit:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.recipient_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.sector_name}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.waste_code} - {ticket.waste_description}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Nr. Auto:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.vehicle_number || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Livrată:</span>
                              <p className="font-bold text-amber-700 dark:text-amber-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Acceptată:</span>
                              <p className="font-bold text-amber-600 dark:text-amber-500">{formatNumberRO(ticket.accepted_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Diferență:</span>
                              <p className="font-bold text-slate-600 dark:text-slate-400">
                                {formatNumberRO(ticket.difference_tons)} t ({ticket.delivered_quantity_tons > 0 ? ((ticket.difference_tons / ticket.delivered_quantity_tons) * 100).toFixed(2) : 0}%)
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {ticket.created_at ? new Date(ticket.created_at).toLocaleString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 justify-end border-t border-amber-200 dark:border-amber-800/30 pt-4">
                            {canEdit && (
                              <button onClick={() => onEdit(ticket)} className="px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Editează
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => onDelete(ticket.id)} className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1">
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

        {/* PAGINARE */}
        {pagination && pagination.totalPages > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pagina {pagination.page} din {pagination.totalPages}</p>
                <select value={filters.per_page} onChange={(e) => onPerPageChange(parseInt(e.target.value))} className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-colors">
                  <option value="10">10 / pagină</option>
                  <option value="20">20 / pagină</option>
                  <option value="50">50 / pagină</option>
                  <option value="100">100 / pagină</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button>
                <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Următorul</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisposalReportView;