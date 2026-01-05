/**
 * ============================================================================
 * REPORTS TMB COMPONENT - VERSIUNE FINALĂ REPARATĂ
 * ============================================================================
 * ✅ onFilterChange fix (ca la ReportsLandfill)
 * ✅ Păstrează toată logica de tabs
 * ✅ useEffect corect cu [filters]
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import ReportsFilters from './ReportsFilters';
import ReportsTmbSidebar from './ReportsTmbSidebar';
import RecyclingSidebar from './RecyclingSidebar';
import RecoverySidebar from './RecoverySidebar';
import DisposalSidebar from './DisposalSidebar';
import RejectedSidebar from './RejectedSidebar';
import { 
  getTmbReports, 
  getRecyclingReports,
  getRecoveryReports,
  getDisposalReports,
  getRejectedReports,
  deleteTmbTicket,
  deleteRecyclingTicket,
  getAuxiliaryData 
} from '../../services/reportsService';

const ReportTMB = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tmb');
  
  // Filters
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    year: currentYear,
    from: `${currentYear}-01-01`,
    to: new Date().toISOString().split('T')[0],
    sector_id: null,
    page: 1,
    per_page: 10
  });

  // Data
  const [summaryData, setSummaryData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [sectors, setSectors] = useState([]);
  
  // Auxiliary data
  const [wasteCodes, setWasteCodes] = useState([]);
  const [operators, setOperators] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

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
  // GROUPING
  // ========================================================================

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

  // ========================================================================
  // FETCH DATA
  // ========================================================================

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    console.log('⚡ Filters changed, fetching reports:', filters);
    fetchReports();
  }, [filters, activeTab]);

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

      console.log('📊 Fetching TMB reports with filters:', filters);

      let response;
      switch (activeTab) {
        case 'tmb':
          response = await getTmbReports(filters);
          break;
        case 'recycling':
          response = await getRecyclingReports(filters);
          break;
        case 'recovery':
          response = await getRecoveryReports(filters);
          break;
        case 'disposal':
          response = await getDisposalReports(filters);
          break;
        case 'rejected':
          response = await getRejectedReports(filters);
          break;
        default:
          response = await getTmbReports(filters);
      }

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
          total_quantity: response.data.summary?.total_tons || response.data.summary?.total_delivered || response.data.summary?.total_accepted || response.data.summary?.total_rejected_tons || 0,
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
          clients: groupRowsByNameWithCodes(response.data.clients || [])
        };

        setSummaryData(summary);

        setAvailableYears(response.data.available_years || [currentYear]);
        
        const allSectors = response.data.all_sectors || [];
        setSectors(allSectors);

      } else {
        setError(response.message || 'Eroare la încărcarea datelor');
      }
    } catch (err) {
      console.error('❌ fetchReports error:', err);
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
      let response;
      
      switch (activeTab) {
        case 'recycling':
          response = await deleteRecyclingTicket(ticketId);
          break;
        case 'tmb':
        default:
          response = await deleteTmbTicket(ticketId);
          break;
      }

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
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('tmb')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'tmb'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Deșeuri trimise la tratare mecano-biologică
        </button>
        
        <button
          onClick={() => setActiveTab('recycling')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'recycling'
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Deșeuri trimise la reciclare
        </button>
        
        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'recovery'
              ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Deșeuri trimise la valorificare energetică
        </button>
        
        <button
          onClick={() => setActiveTab('disposal')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'disposal'
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md'
              : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Deșeuri trimise la depozitare
        </button>
        
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === 'rejected'
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md'
              : 'bg-white dark:bg-[#242b3d] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          Deșeuri refuzate/neacceptate în instalația TMB
        </button>
      </div>

      {/* Filters - FIX: onFilterChange în loc de setFilters */}
      <ReportsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        sectors={sectors}
        availableYears={availableYears}
        loading={loading}
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

        {/* Card 2 - Furnizori SAU Prestatori based on tab */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className={`bg-gradient-to-br ${
            activeTab === 'rejected' ? 'from-purple-500 to-purple-600' : 'from-cyan-500 to-cyan-600'
          } p-4 flex-shrink-0`}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">
                {activeTab === 'rejected' 
                  ? 'Prestatori (operatori TMB)' 
                  : 'Furnizori (colectori)'}
              </h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {(activeTab === 'rejected' ? summaryData?.operators : summaryData?.suppliers)?.map((item, idx) => (
                <div
                  key={idx}
                  className={`border-l-3 pl-3 ${
                    activeTab === 'rejected' ? 'border-purple-500' : 'border-cyan-500'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white flex-1 min-w-0">
                      {item.name}
                    </p>
                    <span className={`text-sm font-bold whitespace-nowrap ${
                      activeTab === 'rejected'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {formatNumberRO(item.total)} t
                    </span>
                  </div>
                  {item.codes && (
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

        {/* Card 3 - Prestatori SAU Clienți based on tab */}
        <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className={`bg-gradient-to-br ${
            activeTab === 'tmb' ? 'from-pink-500 to-pink-600' : 'from-orange-500 to-orange-600'
          } p-4 flex-shrink-0`}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">
                {activeTab === 'tmb' 
                  ? 'Prestatori (operatori TMB)' 
                  : activeTab === 'rejected'
                  ? 'Furnizori (colectori)'
                  : `Clienți (${activeTab === 'recycling' ? 'reciclatori' : activeTab === 'recovery' ? 'valorificatori' : 'operator depozitare'})`}
              </h3>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="space-y-3">
              {(activeTab === 'tmb'
                ? summaryData?.operators
                : activeTab === 'rejected'
                ? summaryData?.suppliers
                : summaryData?.clients
              )?.map((item, idx) => (
                <div
                  key={idx}
                  className={`border-l-3 pl-3 ${
                    activeTab === 'tmb' ? 'border-pink-500' : 'border-orange-500'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white flex-1 min-w-0">
                      {item.name}
                    </p>
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${
                        activeTab === 'tmb'
                          ? 'text-pink-600 dark:text-pink-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {formatNumberRO(item.total)} t
                    </span>
                  </div>

                  {item.codes && item.codes.length > 0 && (
                    <div className="space-y-1">
                      {item.codes.map((code, codeIdx) => (
                        <div key={codeIdx} className="flex justify-between text-xs gap-2">
                          <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                            {code.code}
                          </span>
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
      </div>

      {/* Table Section - păstrează exact cum era */}
      <div className="bg-white dark:bg-[#242b3d] rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'tmb' && `Deșeuri trimise la TMB (${pagination?.total_count || 0})`}
              {activeTab === 'recycling' && `Deșeuri trimise la reciclare (${pagination?.total_count || 0})`}
              {activeTab === 'recovery' && `Deșeuri trimise la valorificare energetică (${pagination?.total_count || 0})`}
              {activeTab === 'disposal' && `Deșeuri trimise la depozitare (${pagination?.total_count || 0})`}
              {activeTab === 'rejected' && `Deșeuri refuzate (${pagination?.total_count || 0})`}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleAddNew}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white rounded-lg 
                         transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adaugă înregistrare
              </button>
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

        {/* Tabelul rămâne exact cum era - păstrez logica originală pentru tabs */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 whitespace-nowrap min-w-[130px]">Tichet Cântar</th>
                <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Data</th>
                {activeTab === 'tmb' && (
                  <>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[80px]">Ora</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Prestator</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Cod Deșeu</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Proveniență</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[150px]">Generator</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Nr. Auto</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Tone Net</th>
                  </>
                )}
                {(activeTab === 'recycling' || activeTab === 'recovery' || activeTab === 'disposal') && (
                  <>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Client</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Furnizor</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Cod Deșeu</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Nr. Auto</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Cant. Livrată</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Cant. Acceptată</th>
                  </>
                )}
                {activeTab === 'rejected' && (
                  <>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Prestator</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Furnizor</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Cod Deșeu</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Proveniență</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Generator</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[100px]">Nr. Auto</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Cant. Refuzată</th>
                  </>
                )}
                <th className="px-4 py-3 text-center w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}
                    </td>
                    
                    {activeTab === 'tmb' && (
                      <>
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
                      </>
                    )}

                    {(activeTab === 'recycling' || activeTab === 'recovery' || activeTab === 'disposal') && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {ticket.recipient_name || ticket.client_name}
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
                          {ticket.vehicle_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {formatNumberRO(ticket.delivered_quantity_tons)} t
                        </td>
                        <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatNumberRO(ticket.accepted_quantity_tons)} t
                        </td>
                      </>
                    )}

                    {activeTab === 'rejected' && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {ticket.operator_name}
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
                          {ticket.generator_type}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {ticket.vehicle_number}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                          {formatNumberRO(ticket.rejected_quantity_tons)} t
                        </td>
                      </>
                    )}
                    
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleExpandRow(ticket.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

                  {/* Expanded rows păstrate exact cum erau */}
                  {expandedRows.has(ticket.id) && (
                    <tr className="bg-gray-50 dark:bg-gray-800/30">
                      <td colSpan="11" className="px-4 py-4">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm mb-3">
                          <div className="text-left">
                            <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu complet:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {ticket.waste_code} - {ticket.waste_description}
                            </p>
                          </div>
                          {activeTab === 'tmb' && (
                            <div className="text-left">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor:</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {ticket.supplier_name}
                              </p>
                            </div>
                          )}
                          {activeTab === 'recycling' && (
                            <>
                              <div className="text-left">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {ticket.sector_name}
                                </p>
                              </div>
                              <div className="text-left">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">Diferență:</span>
                                <p className="font-medium text-red-600 dark:text-red-400">
                                  {formatNumberRO(ticket.difference_tons || 0)} t
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(ticket)}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                                     hover:from-emerald-600 hover:to-emerald-700 text-white rounded 
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

      {/* Sidebars per tab */}
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