// src/components/reports/ReportsLandfill.jsx
/**
 * ============================================================================
 * REPORTS LANDFILL - VERSIUNE COMPLETĂ 2026 - CORECTAT
 * ============================================================================
 * 
 * ✅ Fix toggle expand (când deschizi un row, celelalte se închid)
 * ✅ Tone Net cu culoare specială (emerald)
 * ✅ Fix pagination error
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

import ReportsFilters from './ReportsFilters';
import ReportsSidebar from './ReportsSidebar';
import ExportDropdown from './ExportDropdown';

import { 
  getLandfillReports, 
  getAuxiliaryData,
  deleteLandfillTicket 
} from '../../services/reportsService';

import { handleExport } from '../../services/exportService';

const ReportsLandfill = () => {
  // ========================================================================
  // STATE
  // ========================================================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    year: currentYear,
    from: `${currentYear}-01-01`,
    to: new Date().toISOString().split('T')[0],
    sector_id: null,
    page: 1,
    per_page: 10,
  });

  // Data
  const [summaryData, setSummaryData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [wasteCodesDepozitate, setWasteCodesDepozitate] = useState([]);
  
  // Auxiliary data
  const [wasteCodes, setWasteCodes] = useState([]);
  const [operators, setOperators] = useState([]);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('create');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ========================================================================
  // FORMAT ROMÂNESC
  // ========================================================================

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatted = num.toFixed(2);
    const [intPart, decPart] = formatted.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intWithDots},${decPart}`;
  };

  // ========================================================================
  // GROUPING PENTRU CARDS
  // ========================================================================

  const groupRowsByNameWithCodes = (rows = []) => {
    const map = new Map();
    rows.forEach((row) => {
      const name = row?.name || row?.supplier_name || 'N/A';
      const code = row?.code || row?.waste_code || null;
      const qtyRaw = row?.total_tons ?? row?.total ?? 0;
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

  // ========================================================================
  // FETCH DATA
  // ========================================================================

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);  

  const fetchAuxiliaryData = async () => {
    try {
      const response = await getAuxiliaryData();
      if (response.success && response.data) {
        setWasteCodes(response.data.waste_codes || []);
        setOperators(response.data.operators || []);
      }
    } catch (err) {
      console.error('Error fetching auxiliary data:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching Landfill reports with filters:', filters);
      
      const response = await getLandfillReports(filters);
      
      console.log('✅ Raw response from API:', response);

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

        const summary = {
          total_quantity: response.data.summary?.total_tons || 0,
          total_tickets: response.data.summary?.total_tickets || ticketsList.length,
          period: {
            year: filters.year,
            date_from: new Date(filters.from).toLocaleDateString('ro-RO'),
            date_to: new Date(filters.to).toLocaleDateString('ro-RO'),
            sector: sectors.find(s => s.sector_number === filters.sector_id)?.sector_name || 'București'
          },
          suppliers: groupRowsByNameWithCodes(response.data.suppliers || []),
          operators: (response.data.operators || []).map(operator => ({
            name: operator.name,
            total: operator.total_tons
          })),
        };

        setSummaryData(summary);

        setAvailableYears(response.data.available_years || [currentYear]);
        
        const allSectors = response.data.all_sectors || [];
        setSectors(allSectors);
        
        setWasteCodesDepozitate(response.data.waste_codes || []);

      } else {
        setError(response.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      console.error('❌ Fetch reports error:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filter change requested:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handlePerPageChange = (newPerPage) => {
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }));
  };

  // ✅ FIX: Când deschizi un row, celelalte se închid
  const toggleExpandRow = (ticketId) => {
    setExpandedRows(prev => {
      const newSet = new Set();
      if (!prev.has(ticketId)) {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const handleAddNew = () => {
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
    if (!window.confirm('Sigur vrei să ștergi această înregistrare?')) {
      return;
    }

    try {
      const response = await deleteLandfillTicket(ticketId);
      if (response.success) {
        alert('Înregistrare ștearsă cu succes!');
        fetchReports();
      } else {
        alert('Eroare la ștergere: ' + response.message);
      }
    } catch (err) {
      alert('Eroare la ștergere: ' + err.message);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedTicket(null);
  };

  const handleSidebarSuccess = () => {
    setSidebarOpen(false);
    setSelectedTicket(null);
    fetchReports();
  };

  const handleExportData = async (format) => {
    try {
      setExporting(true);
      console.log(`🚀 Exporting as ${format}...`);

      // ✅ FETCH ALL DATA pentru export (fără paginare)
      const exportFilters = {
        year: filters.year,
        from: filters.from,
        to: filters.to,
        sector_id: filters.sector_id,
        page: 1,
        per_page: 100000  // Toate înregistrările
      };

      const exportResponse = await getLandfillReports(exportFilters);
      
      if (!exportResponse.success) {
        throw new Error(exportResponse.message || 'Eroare la obținerea datelor pentru export');
      }

      const allTickets = exportResponse.data.items || exportResponse.data.tickets || [];
      
      console.log(`📊 Exporting ${allTickets.length} tickets`);

      const result = await handleExport(format, allTickets, summaryData, filters, 'landfill');

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

  // ========================================================================
  // RENDER - LOADING
  // ========================================================================

  if (loading && !summaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Se încarcă rapoartele...
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER - ERROR
  // ========================================================================

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Eroare la încărcarea datelor
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                     text-white rounded-lg transition-all duration-200 shadow-md"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER - MAIN
  // ========================================================================

  // Helper pentru a obține numele locației
  const getLocationName = () => {
    // Prioritate 1: nume din backend (summaryData.period.sector)
    if (summaryData?.period?.sector) {
      return summaryData.period.sector;
    }
    
    // Prioritate 2: găsește sectorul din lista sectors bazat pe filters.sector_id
    if (filters.sector_id && sectors.length > 0) {
      const selectedSector = sectors.find(s => s.id === filters.sector_id || s.sector_id === filters.sector_id);
      if (selectedSector) {
        return `Sectorul ${selectedSector.sector_number}`;
      }
    }
    
    // Default: București (când sector_id e null)
    return 'București';
  };

  return (
    <div className="space-y-6">
      
      {/* FILTERS */}
      <ReportsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        sectors={sectors}
        availableYears={availableYears}
        loading={loading}
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Perioada analizată - FĂRĂ SCROLL */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Perioada analizată</h3>
              </div>
            </div>
          </div>
          
          <div className="p-4 flex flex-col justify-between flex-1">
            
            {/* Perioada - compact */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">An:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.period?.year || currentYear}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">De la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.period?.date_from || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Până la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.period?.date_to || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">UAT:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{getLocationName()}</span>
              </div>
            </div>
            
            {/* Total cantitate - FONT MARE */}
            <div className="text-center py-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total cantitate</p>
              <p className="text-4xl font-black text-gray-700 dark:text-white">
                {formatNumberRO(summaryData?.total_quantity || 0)} <span className="text-xl">t</span>
              </p>
            </div>
            
            {/* Total tichete */}
            <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Total tichete:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{summaryData?.total_tickets || 0}</span>
            </div>
            
          </div>
        </div>

        {/* Card 2: Furnizori deșeuri - DESIGN NOU */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Furnizori deșeuri</h3>
              </div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.suppliers || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există furnizori</p>
            ) : (
              <div className="space-y-4">
                {summaryData.suppliers.slice(0, 10).map((supplier, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    {/* Header furnizor */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">
                        {supplier.name}
                      </p>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 ml-2">
                        {formatNumberRO(supplier.total)} t
                      </span>
                    </div>
                    
                    {/* Lista coduri */}
                    {supplier.codes && supplier.codes.length > 0 && (
                      <div className="space-y-1.5">
                        {supplier.codes.map((code, codeIdx) => {
                          const percentage = supplier.total > 0 ? ((code.quantity / supplier.total) * 100).toFixed(0) : 0;
                          return (
                            <div key={codeIdx} className="flex items-center gap-2">
                              {/* Progress bar */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {code.code}
                                  </span>
                                  <span className="text-xs font-semibold text-gray-900 dark:text-white ml-2">
                                    {formatNumberRO(code.quantity)} t
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              {/* Procent */}
                              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 w-10 text-right">
                                {percentage}%
                              </span>
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

        {/* Card 3: Coduri deșeuri depozitate - NESCHIMBAT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Coduri deșeuri depozitate</h3>
              </div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {(wasteCodesDepozitate || []).length === 0 ? (
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
                      <p className="text-purple-600 dark:text-purple-400 font-semibold">
                        {formatNumberRO(wc.total_tons)} t
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {wc.percent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tichete Depozitare
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleAddNew}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white rounded-lg 
                         transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adaugă tichet
              </button>
              <ExportDropdown 
                onExport={handleExportData}
                disabled={tickets.length === 0}
                loading={exporting}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 whitespace-nowrap min-w-[130px]">Tichet Cântar</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Data</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Furnizor</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Cod Deșeu</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Tip Contract</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Sector</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Nr. Auto</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Tone Net</th>
                <th className="px-4 py-3 text-center w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.supplier_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {ticket.waste_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.contract_type || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.sector_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.vehicle_number}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatNumberRO(ticket.net_weight_tons)} t
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleExpandRow(ticket.id)}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={expandedRows.has(ticket.id) ? "Ascunde detalii" : "Arată detalii"}
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${expandedRows.has(ticket.id) ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(ticket.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-800/30">
                      <td colSpan="9" className="px-4 py-4">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                          {/* Row 1 */}
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Tichet Cântar:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_number}</p>
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
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Operator Depozitar:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.operator_name || 'N/A'}</p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.sector_name || 'N/A'}</p>
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
                            <p className="font-bold text-indigo-600 dark:text-indigo-400">{formatNumberRO(ticket.net_weight_tons)} t</p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Tip Contract:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.contract_type || 'N/A'}</p>
                          </div>

                          {/* Row 5 */}
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Operație:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{ticket.operation_type || 'N/A'}</p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span>
                            <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.created_at).toLocaleString('ro-RO')}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 justify-end">
                          <button
                            onClick={() => handleEdit(ticket)}
                            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editează
                          </button>
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Șterge
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pagina {pagination.page} din {pagination.total_pages}
                </p>
                <select
                  value={filters.per_page}
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Următorul
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
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