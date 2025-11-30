/**
 * ============================================================================
 * REPORTS TMB COMPONENT - VERSIUNE FINALĂ
 * ============================================================================
 * - Format românesc pentru numere (1.234,56)
 * - Cards scrollable cu dimensiune fixă
 * - Total alături de nume la furnizori/operatori
 * - Pagination dropdown (10/20/50/100)
 * - Traduceri corecte
 * - Expand button în dreapta (fără coloană Acțiuni)
 * - Gradient buttons
 * - API REAL conectat
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import ReportsFilters from './ReportsFilters';

const ReportTMB = () => {
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
    per_page: 10
  });

  // Data
  const [summaryData, setSummaryData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  
  // Auxiliary data
  const [sectors, setSectors] = useState([]);

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
  // FETCH DATA
  // ========================================================================

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters.page, filters.per_page]);

  const fetchSectors = async () => {
    setSectors([
      { id: '', name: 'București' },
      { id: '1', name: 'Sector 1' },
      { id: '2', name: 'Sector 2' },
      { id: '3', name: 'Sector 3' },
      { id: '4', name: 'Sector 4' },
      { id: '5', name: 'Sector 5' },
      { id: '6', name: 'Sector 6' }
    ]);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      // Build query params
      const params = new URLSearchParams({
        year: filters.year,
        start_date: filters.from,
        end_date: filters.to,
        page: filters.page,
        limit: filters.per_page
      });

      if (filters.sector_id) {
        params.append('sector_id', filters.sector_id);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/tmb/tmb?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      
      if (result.success) {
        // Transform data pentru summary cards
        const summary = {
          total_quantity: result.data.summary.total_tons,
          period: {
            year: filters.year,
            date_from: new Date(filters.from).toLocaleDateString('ro-RO'),
            date_to: new Date(filters.to).toLocaleDateString('ro-RO'),
            sector: sectors.find(s => s.id === filters.sector_id)?.name || 'București'
          },
          suppliers: result.data.suppliers.map(supplier => ({
            name: supplier.name,
            total: supplier.total_tons,
            codes: [{ 
              code: supplier.code || supplier.waste_code || '20 03 01', 
              quantity: supplier.total_tons 
            }]
          })),
          operators: result.data.operators.map(operator => ({
            name: operator.name,
            total: operator.total_tons
          }))
        };

        setSummaryData(summary);
        setTickets(result.data.tickets);
        setPagination({
          page: result.data.pagination.current_page,
          per_page: result.data.pagination.per_page,
          total_pages: result.data.pagination.total_pages,
          total_count: result.data.pagination.total_records
        });
      } else {
        setError(result.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      console.error('❌ getTmbReports error:', err);
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
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Se încarcă rapoartele TMB...
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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Perioada analizată</h3>
                <p className="text-2xl font-bold truncate">{formatNumberRO(summaryData?.total_quantity || 0)} tone</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2 text-sm overflow-y-auto flex-1">
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

        {/* Card 2: Furnizori (colectori) - SCROLLABLE cu total alături */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Furnizori (colectori)</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {summaryData?.suppliers?.map((supplier, idx) => (
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
                    {supplier.codes?.map((code, codeIdx) => (
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

        {/* Card 3: Prestatori (operatori TMB) - SCROLLABLE */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Prestatori (operatori TMB)</h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              {summaryData?.operators?.map((operator, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{operator.name}</p>
                  </div>
                  <span className="text-sm font-bold text-pink-600 dark:text-pink-400 whitespace-nowrap">
                    {formatNumberRO(operator.total)} t
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
              Deșeuri trimise la TMB ({pagination?.total_count || 0})
            </h3>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                         hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg 
                         transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export date
              </button>
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
                <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Prestator</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Cod Deșeu</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Proveniență</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">Generator</th>
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
                      {ticket.ticket_time}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {ticket.operator_name}
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
                      {ticket.generator_type}
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
                      <td colSpan="10" className="px-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.supplier_name}
                            </p>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu complet:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.waste_code} - {ticket.waste_description}
                            </p>
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
    </div>
  );
};

export default ReportTMB;