/**
 * ============================================================================
 * REPORTS LANDFILL COMPONENT - VERSIUNE ACTUALIZATĂ
 * ============================================================================
 * - Format românesc pentru numere (1.234,56)
 * - Cards scrollable cu dimensiune fixă
 * - Total alături de nume la furnizori
 * - Pagination dropdown (10/20/50/100)
 * - Traduceri corecte (TICHET, PROVENIENȚĂ)
 * - Expand button în dreapta (fără coloană Acțiuni)
 * - Gradient buttons
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import ReportsFilters from './ReportsFilters';
import ReportsSidebar from './ReportsSidebar';
import ExportDropdown from './ExportDropdown';
import { 
  getLandfillReports, 
  getAuxiliaryData,
  deleteLandfillTicket 
} from '../../services/reportsService';

const ReportsLandfill = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    from: `${new Date().getFullYear()}-01-01`,
    to: new Date().toISOString().split('T')[0],
    sector_id: '',
    page: 1,
    per_page: 10 // Default 10
  });

  // Data
  const [summaryData, setSummaryData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  
  // Auxiliary data
  const [sectors, setSectors] = useState([]);
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
    
    // Format cu 2 decimale
    const formatted = num.toFixed(2);
    
    // Split în parte întreagă și zecimale
    const [intPart, decPart] = formatted.split('.');
    
    // Adaugă punct la mii
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Returnează cu virgulă pentru zecimale
    return `${intWithDots},${decPart}`;
  };

  // ========================================================================
  // FETCH DATA
  // ========================================================================

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters.page, filters.per_page]);

  const fetchAuxiliaryData = async () => {
    try {
      const response = await getAuxiliaryData();
      if (response.success) {
        setSectors(response.data.sectors || []);
        setWasteCodes(response.data.waste_codes || []);
        setOperators(response.data.operators || []);
      }
    } catch (err) {
      console.error('❌ getAuxiliaryData error:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getLandfillReports(filters);
      
      if (response.success) {
        setSummaryData(response.data.summary);
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      console.error('❌ getLandfillReports error:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchReports();
  };

  const handleResetFilters = () => {
    const now = new Date();
    setFilters({
      year: now.getFullYear(),
      from: `${now.getFullYear()}-01-01`,
      to: now.toISOString().split('T')[0],
      sector_id: '',
      page: 1,
      per_page: 10
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handlePerPageChange = (newPerPage) => {
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }));
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

  const handleAddNew = () => {
    setSelectedTicket(null);
    setSidebarMode('create');
    setSidebarOpen(true);
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

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading && !summaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Se încarcă rapoartele...
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReportsFilters
        filters={filters}
        setFilters={setFilters}
        sectors={sectors}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
       {/* Card 1: Perioada analizată */}
<div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4">
    <div className="flex items-center gap-3 text-white">
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        {formatNumberRO(summaryData?.total_quantity || 0)} t
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">An:</span>
      <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period.year}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">Data început:</span>
      <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period.date_from}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">Data sfârșit:</span>
      <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period.date_to}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">Locație:</span>
      <span className="font-medium text-gray-900 dark:text-white">{summaryData?.period.sector}</span>
    </div>
  </div>
</div>

        {/* Card 2: Furnizori - SCROLLABLE cu total alături */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Furnizori (operatori)</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {summaryData?.suppliers.map((supplier, idx) => (
                <div key={idx} className="border-l-3 border-cyan-500 pl-3">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white flex-1 min-w-0">
                      {supplier.name}
                    </p>
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {formatNumberRO(supplier.total)} t
                    </span>
                  </div>
                  <div className="space-y-1">
                    {supplier.codes.map((code, codeIdx) => (
                      <div key={codeIdx} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-600 dark:text-gray-400 truncate flex-1">{code.code}</span>
                        <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {formatNumberRO(code.quantity)} t
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Tipuri deșeuri - SCROLLABLE */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Tipuri deșeuri depozitate</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              {summaryData?.waste_codes.map((code, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{code.code}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{code.description}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatNumberRO(code.quantity)} t
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Înregistrări detaliate ({pagination?.total_count || 0})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleAddNew}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-indigo-500 to-indigo-600 
                         hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg 
                         transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adaugă înregistrare
              </button>
              
              <ExportDropdown 
                filters={filters}
                summaryData={summaryData} 
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 whitespace-nowrap min-w-[130px]">Tichet Cântar</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Data</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[80px]">Ora</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Furnizor</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Cod Deșeu</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Proveniență</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">Generator</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Nr. Auto</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Tone Net</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Contract</th>
                <th className="px-4 py-3 text-center w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.ticket_time}
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
                      {ticket.sector_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.generator}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.vehicle_number}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatNumberRO(ticket.net_weight_tons)} t
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {ticket.contract}
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
                      <td colSpan="11" className="px-4 py-4">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Descriere deșeu:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.waste_description}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Operație:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.operation}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Tone brut:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatNumberRO(ticket.gross_weight_tons)} t
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Tone tară:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatNumberRO(ticket.tare_weight_tons)} t
                            </p>
                          </div>
                          <div className="text-left flex gap-2">
                            <button
                              onClick={() => handleEdit(ticket)}
                              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-indigo-500 to-indigo-600 
                                       hover:from-indigo-600 hover:to-indigo-700 text-white rounded 
                                       transition-all duration-200 shadow-md flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editează
                            </button>
                            <button
                              onClick={() => handleDelete(ticket.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-red-500 to-red-600 
                                       hover:from-red-600 hover:to-red-700 text-white rounded 
                                       transition-all duration-200 shadow-md flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Șterge
                            </button>
                          </div>
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
                  className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

      {/* Sidebar */}
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