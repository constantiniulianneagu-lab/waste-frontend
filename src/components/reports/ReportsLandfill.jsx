// src/components/reports/ReportsLandfill.jsx
/**
 * ============================================================================
 * REPORTS LANDFILL - VERSIUNE COMPLETĂ 2026 - FIXED
 * ============================================================================
 * 
 * ✅ Fix toggle expand (când deschizi un row, celelalte se închid)
 * ✅ Tone Net cu culoare specială (emerald)
 * ✅ Fix pagination error
 * ✅ Delete confirmation dialog
 * ✅ Auto-refresh după CREATE/UPDATE/DELETE
 * ✅ Remove observations (not in DB)
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

  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    ticketId: null,
    ticketNumber: ''
  });

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
        setError(response.message || 'Nu s-au putut încărca rapoartele');
      }
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.response?.data?.message || err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setFilters((prev) => ({ ...prev, per_page: newPerPage, page: 1 }));
  };

  const toggleExpandRow = (ticketId) => {
    setExpandedRows((prev) => {
      const newSet = new Set();
      if (!prev.has(ticketId)) {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const handleAdd = () => {
    setSidebarMode('create');
    setSelectedTicket(null);
    setSidebarOpen(true);
  };

  const handleEdit = (ticket) => {
    setSidebarMode('edit');
    setSelectedTicket(ticket);
    setSidebarOpen(true);
  };

  const handleDeleteClick = (ticketId, ticketNumber) => {
    setDeleteConfirmation({
      open: true,
      ticketId,
      ticketNumber
    });
  };

  const handleDeleteConfirm = async () => {
    const { ticketId } = deleteConfirmation;
    
    try {
      setLoading(true);
      const response = await deleteLandfillTicket(ticketId);
      
      if (response?.success) {
        console.log('✅ Ticket deleted successfully');
        setDeleteConfirmation({ open: false, ticketId: null, ticketNumber: '' });
        
        // Refresh data
        await fetchReports();
      } else {
        setError(response?.message || 'Eroare la ștergere');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError(err?.response?.data?.message || err?.message || 'Eroare la ștergere');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ open: false, ticketId: null, ticketNumber: '' });
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedTicket(null);
  };

  const handleSidebarSuccess = async () => {
    console.log('✅ Sidebar success - refreshing data...');
    await fetchReports();
  };

  const handleExportClick = async (format) => {
    try {
      setExporting(true);
      await handleExport('landfill', format, filters);
    } catch (err) {
      console.error('Export error:', err);
      setError('Eroare la export');
    } finally {
      setExporting(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading && !tickets.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Se încarcă rapoartele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Rapoarte Depozitare
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Vizualizare și export rapoarte buletin depozitare deșeuri
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown onExport={handleExportClick} loading={exporting} />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 
                     hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 
                     shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adaugă Buletin
          </button>
        </div>
      </div>

      {/* Filters */}
      <ReportsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        availableYears={availableYears}
        sectors={sectors}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Eroare</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Quantity */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-emerald-100">Total Tone Depozitate</h3>
              <svg className="w-8 h-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{formatNumberRO(summaryData.total_quantity)} t</p>
            <p className="text-xs text-emerald-100 mt-2">
              {summaryData.period.date_from} - {summaryData.period.date_to}
            </p>
          </div>

          {/* Total Tickets */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-100">Total Buletine</h3>
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{summaryData.total_tickets.toLocaleString('ro-RO')}</p>
            <p className="text-xs text-blue-100 mt-2">
              {summaryData.period.sector}
            </p>
          </div>

          {/* Top Supplier */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-100">Top Furnizor</h3>
              <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {summaryData.suppliers && summaryData.suppliers.length > 0 ? (
              <>
                <p className="text-lg font-bold truncate">{summaryData.suppliers[0].name}</p>
                <p className="text-sm text-purple-100 mt-1">
                  {formatNumberRO(summaryData.suppliers[0].total)} tone
                </p>
              </>
            ) : (
              <p className="text-lg font-bold">N/A</p>
            )}
          </div>

          {/* Period */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-orange-100">Perioada</h3>
              <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-bold">Anul {summaryData.period.year}</p>
            <p className="text-xs text-orange-100 mt-1">
              {summaryData.period.date_from} - {summaryData.period.date_to}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Nr. Buletin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Furnizor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Cod Deșeu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Auto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Tone Net
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Detalii
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nu există buletine pentru filtrul selectat
                  </td>
                </tr>
              ) : null}

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
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
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
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Operație:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.operation_type || 'N/A'}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(ticket.created_at).toLocaleString('ro-RO')}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 justify-end">
                          <button
                            onClick={() => handleEdit(ticket)}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-blue-500 to-blue-600 
                                     hover:from-blue-600 hover:to-blue-700 text-white rounded 
                                     transition-all duration-200 shadow-md flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Editează
                          </button>
                          <button
                            onClick={() => handleDeleteClick(ticket.id, ticket.ticket_number)}
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

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmation.open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleDeleteCancel}
          />

          {/* Dialog */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-full max-w-md bg-white dark:bg-[#1a1f2e] rounded-xl shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Confirmare ștergere
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Ești sigur că vrei să ștergi buletinul <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirmation.ticketNumber}</span>?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  ⚠️ Această acțiune este permanentă și nu poate fi anulată!
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Se șterge...' : 'Șterge definitiv'}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                           text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

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