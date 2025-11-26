/**
 * ============================================================================
 * REPORTS LANDFILL COMPONENT - VERSIUNE FINALĂ
 * ============================================================================
 * Include sidebar pentru add/edit și export functionality
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import ReportsFilters from './ReportsFilters';
import ReportsSidebar from './ReportsSidebar';
import { ExportDropdown } from '../../utils/exportUtils';
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
    per_page: 20
  });

  // Data
  const [summaryData, setSummaryData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  
  // Auxiliary data (for dropdowns)
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
  // FETCH DATA
  // ========================================================================

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters.page]);

  const fetchAuxiliaryData = async () => {
    try {
      const response = await getAuxiliaryData();
      if (response.success) {
        setSectors(response.data.sectors || []);
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

      const response = await getLandfillReports(filters);
      
      if (response.success) {
        setSummaryData(response.data.summary);
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
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
      per_page: 20
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
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
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Perioada analizată */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Perioada analizată
            </h3>
          </div>
          
          <div className="mb-4">
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {summaryData?.total_quantity || '0.00'} tone
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>An:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {summaryData?.period.year}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Data început:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {summaryData?.period.date_from}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Data sfârșit:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {summaryData?.period.date_to}
              </span>
            </div>
            <div className="flex justify-between">
              <span>U.A.T.:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {summaryData?.period.sector}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Furnizori */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Furnizori (operatori)
            </h3>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {summaryData?.suppliers.map((supplier, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {supplier.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Total: {supplier.total} t
                </p>
                <div className="space-y-1">
                  {supplier.codes.map((code, codeIdx) => (
                    <div key={codeIdx} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {code.code}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {code.quantity} t
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Tipuri deșeuri */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tipuri deșeuri depozitate
            </h3>
          </div>
          
          <div className="space-y-2">
            {summaryData?.waste_codes.map((code, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {code.code}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {code.description}
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {code.quantity} t
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Înregistrări detaliate ({pagination?.total_count || 0})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg 
                         transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adaugă înregistrare
              </button>
              
              <ExportDropdown 
                tickets={tickets} 
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
                <th className="px-6 py-3">Ticket Cântar</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Ora</th>
                <th className="px-6 py-3">Furnizor</th>
                <th className="px-6 py-3">Tip Produs</th>
                <th className="px-6 py-3">Provenință</th>
                <th className="px-6 py-3">Generator</th>
                <th className="px-6 py-3">Nr. Auto</th>
                <th className="px-6 py-3">Tone Net</th>
                <th className="px-6 py-3">Contract</th>
                <th className="px-6 py-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  {/* Main Row */}
                  <tr 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => toggleExpandRow(ticket.id)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ticket.ticket_time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ticket.supplier_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {ticket.waste_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ticket.sector_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ticket.generator}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {ticket.vehicle_number}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.net_weight_tons} t
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                      {ticket.contract}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(ticket);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Editează"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ticket.id);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Șterge"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(ticket.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-800/30">
                      <td colSpan="11" className="px-6 py-4">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tip produs complet:</span>
                            <p className="font-medium text-gray-900 dark:text-white mt-1">
                              {ticket.waste_description}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Operație:</span>
                            <p className="font-medium text-gray-900 dark:text-white mt-1">
                              {ticket.operation}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tone brut:</span>
                            <p className="font-medium text-gray-900 dark:text-white mt-1">
                              {ticket.gross_weight_tons} t
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Tone tară:</span>
                            <p className="font-medium text-gray-900 dark:text-white mt-1">
                              {ticket.tare_weight_tons} t
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
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pagina {pagination.page} din {pagination.total_pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
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