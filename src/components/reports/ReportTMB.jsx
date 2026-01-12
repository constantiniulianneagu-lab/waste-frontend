/**
 * ============================================================================
 * REPORTS TMB COMPONENT - VERSIUNE ACTUALIZATĂ 2026
 * ============================================================================
 * ✅ Dark/Light Mode Fix - toate componentele
 * ✅ Bug Fix - filtrare corectă pe an 2024
 * ✅ Card 1 - Model ca la Depozitare (Perioada analizată)
 * ✅ Card 2 - Furnizori deșeuri (cu cantitate + procent)
 * ✅ Card 3 - Prestatori TMB (cu cantitate + procent)
 * ✅ Tabel restructurat: Tichet Cântar | Data | Furnizor | Cod Deșeu | Proveniență | Generator | Nr. Auto | Tone Net
 * ✅ Restul datelor în Expand Row
 * ✅ Culori diferite: Tichet Cântar (albastru) | Tone Net (verde)
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Plus } from 'lucide-react';
import ReportsFilters from './ReportsFilters';
import ReportsTmbSidebar from './ReportsTmbSidebar';
import RecyclingSidebar from './RecyclingSidebar';
import RecoverySidebar from './RecoverySidebar';
import DisposalSidebar from './DisposalSidebar';
import RejectedSidebar from './RejectedSidebar';
import ExportDropdown from './ExportDropdown';
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
import { handleExport } from '../../services/exportService';

const ReportTMB = () => {
  const [searchParams] = useSearchParams();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('tmb');
  
  // Detectează ?view= din URL și deschide sidebar-ul corespunzător
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
  // GROUPING PENTRU CARDS
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

        // ✅ SUMMARY DATA - MODEL CA LA DEPOZITARE
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
          operators: groupRowsByNameWithCodes(response.data.operators || []),
        };

        setSummaryData(summary);
        setAvailableYears(response.data.available_years || [currentYear]);
        
        const allSectors = response.data.all_sectors || [];
        setSectors(allSectors);
      } else {
        throw new Error(response.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.message || 'A apărut o eroare la încărcarea datelor');
      setTickets([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleFilterChange = (newFilters) => {
    console.log('🔄 handleFilterChange called with:', newFilters);
    setFilters(prev => {
      const updated = { 
        ...prev, 
        ...newFilters,
        page: 1  // Reset to first page on filter change
      };
      console.log('📝 Updated filters:', updated);
      return updated;
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.total_pages || 1)) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
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
        newSet.clear(); // Close other rows
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const handleExportClick = async (format) => {
    try {
      setExporting(true);
      const endpoint = `/api/reports/tmb/${activeTab}`;
      await handleExport(endpoint, filters, format, `raport-tmb-${activeTab}`);
    } catch (err) {
      console.error('Export error:', err);
      alert('Eroare la export');
    } finally {
      setExporting(false);
    }
  };

  // ========================================================================
  // TAB LABELS
  // ========================================================================

  const tabLabels = {
    tmb: 'Deșeuri trimise la tratare mecano-biologică',
    recycling: 'Deșeuri trimise la reciclare',
    recovery: 'Deșeuri trimise la valorificare',
    disposal: 'Deșeuri trimise la eliminare',
    rejected: 'Deșeuri respinse',
  };

  // ========================================================================
  // RENDER
  // ========================================================================

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
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 
                     text-white rounded-lg font-medium transition-colors"
          >
            Reîncarcă pagina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rapoarte TMB
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Gestionează și vizualizează rapoartele de tratare mecano-biologică
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(tabLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === key
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* FILTERS */}
        <ReportsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          availableYears={availableYears}
          sectors={sectors}
        />

        {/* SUMMARY CARDS - DOAR PENTRU TAB TMB */}
        {activeTab === 'tmb' && summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* CARD 1 - PERIOADA ANALIZATĂ (MODEL DEPOZITARE) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Perioada analizată
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">An</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{summaryData.period.year}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">De la</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{summaryData.period.date_from}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Până la</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{summaryData.period.date_to}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sector</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{summaryData.period.sector}</span>
                </div>
              </div>
            </div>

            {/* CARD 2 - FURNIZORI DEȘEURI */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Furnizori deșeuri
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {summaryData.suppliers && summaryData.suppliers.length > 0 ? (
                  summaryData.suppliers.map((supplier, idx) => {
                    const percentage = summaryData.total_quantity > 0 
                      ? ((supplier.total / summaryData.total_quantity) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{supplier.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatNumberRO(supplier.total)} t
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există date disponibile</p>
                )}
              </div>
            </div>

            {/* CARD 3 - PRESTATORI TMB */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Prestatori TMB
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {summaryData.operators && summaryData.operators.length > 0 ? (
                  summaryData.operators.map((operator, idx) => {
                    const percentage = summaryData.total_quantity > 0 
                      ? ((operator.total / summaryData.total_quantity) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{operator.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatNumberRO(operator.total)} t
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există date disponibile</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS BAR */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 
                       hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-500 dark:to-emerald-600 
                       dark:hover:from-emerald-600 dark:hover:to-emerald-700 text-white rounded-lg 
                       font-medium shadow-md transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Tichet nou</span>
            </button>
          </div>

          <ExportDropdown
            onExport={handleExportClick}
            disabled={exporting || !tickets || tickets.length === 0}
            loading={exporting}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Tichet Cântar
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
                    Proveniență
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Generator
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Nr. Auto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Tone Net
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Detalii
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Nu există tichete în perioada selectată
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <React.Fragment key={ticket.id}>
                      {/* Main Row */}
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {/* Tichet Cântar - CULOARE ALBASTRU */}
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
                          {ticket.sector_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {ticket.generator_type || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                          {ticket.vehicle_number}
                        </td>
                        {/* Tone Net - CULOARE VERDE */}
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

                      {/* Expanded Row - TOATE DATELE RĂMASE */}
                      {expandedRows.has(ticket.id) && (
                        <tr className="bg-gray-50 dark:bg-gray-800/30 transition-colors">
                          <td colSpan="9" className="px-4 py-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                              <div className="text-left">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu complet:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {ticket.waste_code} - {ticket.waste_description}
                                </p>
                              </div>
                              <div className="text-left">
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">Prestator TMB:</span>
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
                                <span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(ticket.created_at).toLocaleString('ro-RO')}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(ticket)}
                                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 
                                         hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 
                                         dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white rounded 
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
                                         hover:from-red-600 hover:to-red-700 dark:from-red-400 dark:to-red-500 
                                         dark:hover:from-red-500 dark:hover:to-red-600 text-white rounded 
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
                    className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 
                             rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                             transition-colors"
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