// src/components/reports/ReportsLandfill.jsx
/**
 * ============================================================================
 * REPORTS LANDFILL - VERSIUNE COMPLETĂ 2026
 * ============================================================================
 * 
 * ✅ Design modern consistent cu Dashboard
 * ✅ Filtrare identică Dashboard (ani + sectoare din API)
 * ✅ 3 Summary Cards cu statistici
 * ✅ Export functional (Excel, PDF, CSV)
 * ✅ Edit/Delete personalizat
 * ✅ Sidebar specializat Depozitare
 * ✅ Pagination 10/20/50/100
 * ✅ Format RO pentru numere
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
        // ✅ FIX: Backend returnează 'items' nu 'tickets'
        const ticketsList = response.data.items || response.data.tickets || [];
        setTickets(Array.isArray(ticketsList) ? ticketsList : []);

        // ✅ FIX: Pagination structure
        const paginationData = response.data.pagination || {};
        setPagination({
          page: Number(paginationData.page || paginationData.current_page || 1),
          per_page: Number(paginationData.limit || paginationData.per_page || 10),
          total_pages: Number(paginationData.totalPages || paginationData.total_pages || 1),
          total_count: Number(paginationData.total || paginationData.total_records || 0),
        });

        // ✅ Summary data
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

        // ✅ Available years și sectors din API
        setAvailableYears(response.data.available_years || [currentYear]);
        
        const allSectors = response.data.all_sectors || [];
        setSectors(allSectors);
        
        // ✅ Waste codes depozitate pentru Card 3
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

  const toggleExpandRow = (ticketId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
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

      const result = await handleExport(format, tickets, summaryData, filters, 'landfill');

      if (result.success) {
        alert(`Export ${format.toUpperCase()} realizat cu succes!`);
      } else {
        alert(`Eroare la export: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Eroare la export: ${error.message}`);
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
        
        {/* Card 1: Perioada analizată */}
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
          <div className="p-4 space-y-2 text-sm overflow-y-auto flex-1">
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumberRO(summaryData?.total_quantity || 0)} t
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">An:</span>
              <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period?.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data început:</span>
              <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period?.date_from}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data sfârșit:</span>
              <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period?.date_to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Locație:</span>
              <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period?.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total tichete:</span>
              <span className="font-medium text-gray-900 dark:text-white">{summaryData?.total_tickets || 0}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Furnizori */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Furnizori (operatori salubrizare)</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {summaryData?.suppliers?.map((item, idx) => (
                <div key={idx} className="border-l-3 border-cyan-500 pl-3">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white flex-1 min-w-0">
                      {item.name}
                    </p>
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {formatNumberRO(item.total)} t
                    </span>
                  </div>
                  {item.codes && item.codes.length > 0 && (
                    <div className="space-y-1">
                      {item.codes.map((code, codeIdx) => (
                        <div key={codeIdx} className="flex justify-between text-xs gap-2">
                          <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{code.code}</span>
                          <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {formatNumberRO(code.quantity)} t
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Coduri deșeuri depozitate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Coduri deșeuri depozitate</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {wasteCodesDepozitate.map((item, idx) => (
                <div key={idx} className="border-l-3 border-orange-500 pl-3">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {item.code}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {formatNumberRO(item.total_tons)} t
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.percent}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tichete Depozitare ({pagination?.total_count || 0})
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
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatNumberRO(ticket.net_weight_tons)} t
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleExpandRow(ticket.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu complet:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.waste_code} - {ticket.waste_description}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Operator depozitar:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.operator_name || 'N/A'}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Ora:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.ticket_time || 'N/A'}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Generator:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.generator_type || 'N/A'}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Tone brut:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatNumberRO((ticket.gross_weight_kg || 0) / 1000)} t
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Tone tară:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatNumberRO((ticket.tare_weight_kg || 0) / 1000)} t
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(ticket)}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                                     hover:from-emerald-600 hover:to-emerald-700 text-white rounded 
                                     transition-all duration-200 shadow-md flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Editează
                          </button>
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-red-500 to-red-600 
                                     hover:from-red-600 hover:to-red-700 text-white rounded 
                                     transition-all duration-200 shadow-md flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
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