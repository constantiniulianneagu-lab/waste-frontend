// ============================================================================
// RAPORTARE TMB - COMPONENT COMPLET
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Factory, Trash2, Calendar, ChevronDown, ChevronUp,
  Download, Plus, Edit2, Trash, Filter, RotateCcw
} from 'lucide-react';

const ReportTMB = () => {
  const [activeTab, setActiveTab] = useState('tmb');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = new Date().toISOString().split('T')[0];
  
  const [filters, setFilters] = useState({
    year: currentYear.toString(),
    start_date: startOfYear,
    end_date: today,
    sector_id: '',
    page: 1,
    limit: 10
  });

  const [sectors] = useState([
    { id: '', name: 'București' },
    { id: '1', name: 'Sector 1' },
    { id: '2', name: 'Sector 2' },
    { id: '3', name: 'Sector 3' },
    { id: '4', name: 'Sector 4' },
    { id: '5', name: 'Sector 5' },
    { id: '6', name: 'Sector 6' }
  ]);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const tabs = [
    { id: 'tmb', label: 'Deșeuri trimise la tratare mecano-biologică', icon: Factory },
    { id: 'recycling', label: 'Deșeuri trimise la reciclare', icon: Trash2 },
    { id: 'recovery', label: 'Deșeuri trimise la valorificare energetică', icon: Trash2 },
    { id: 'disposal', label: 'Deșeuri trimise la depozitare', icon: Trash2 },
    { id: 'rejected', label: 'Deșeuri refuzate/neacceptate în instalația TMB', icon: Trash2 }
  ];

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatted = num.toFixed(2);
    const [intPart, decPart] = formatted.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intWithDots},${decPart}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO');
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, filters.page, filters.limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data pentru development
      const mockData = {
        summary: {
          total_tickets: 20,
          total_tons: '14114.14'
        },
        suppliers: [
          { id: 1, name: 'SUPERCOM S.A.', sector_name: 'Sector 2', code: '20 03 01', total_tons: '54.90' },
          { id: 2, name: 'URBAN S.A.', sector_name: 'Sector 6', code: '20 03 01', total_tons: '21.08' },
          { id: 3, name: 'UNITED WASTE SOLUTIONS SRL', sector_name: 'Sector 4', code: '20 03 01', total_tons: '20.92' },
          { id: 4, name: 'SALUBRIZARE SECTOR 5 S.A.', sector_name: 'Sector 5', code: '20 03 01', total_tons: '20.38' }
        ],
        operators: [
          { id: 21, name: 'ROM WASTE SOLUTIONS SA TMB-S2', total_tons: '30.98' },
          { id: 22, name: 'IRIDEX GROUP SRL TMB-S2', total_tons: '23.92' },
          { id: 23, name: 'ROM WASTE SOLUTIONS SA TMB-S4', total_tons: '20.92' },
          { id: 24, name: 'ECO SUD SA TMB-S5', total_tons: '20.38' },
          { id: 25, name: 'IRIDEX GROUP SRL TMB-S3', total_tons: '16.10' }
        ],
        tickets: [
          {
            id: 1,
            ticket_number: '4107260',
            ticket_date: '2025-01-02',
            ticket_time: '23:42:00',
            operator_name: 'ROM WASTE SOLUTIONS SA TMB-S1',
            waste_code: '20 03 01',
            waste_description: 'deșeuri municipale amestecate',
            sector_name: 'Sector 1',
            sector_number: 1,
            generator_type: 'NON-CASNIC',
            vehicle_number: 'B110FFC',
            net_weight_tons: '0.44',
            supplier_name: 'ROMPREST SERVICE SA'
          }
        ],
        pagination: {
          current_page: 1,
          per_page: 10,
          total_records: 20,
          total_pages: 2
        }
      };

      setData(mockData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setFilters({ ...filters, page: 1 });
    fetchData();
  };

  const handleResetFilters = () => {
    setFilters({
      year: currentYear.toString(),
      start_date: startOfYear,
      end_date: today,
      sector_id: '',
      page: 1,
      limit: 10
    });
  };

  const toggleRow = (ticketId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Raportare detaliată privind tratarea mecano-biologică a deșeurilor
          </h1>

          {/* Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
          <div className="grid grid-cols-4 gap-4">
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">An</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Data de început</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Data de sfârșit</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Locație</label>
              <select
                value={filters.sector_id}
                onChange={(e) => setFilters({ ...filters, sector_id: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium 
                       transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrează
            </button>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium 
                       transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetează
            </button>
          </div>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Card 1 - Perioada analizată */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Perioada analizată</h3>
            </div>
            
            <p className="text-4xl font-bold mb-6">
              {formatNumberRO(data?.summary?.total_tons || 0)} tone
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-100">An:</span>
                <span className="font-medium">{filters.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Data început:</span>
                <span className="font-medium">{formatDate(filters.start_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Data sfârșit:</span>
                <span className="font-medium">{formatDate(filters.end_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Locație:</span>
                <span className="font-medium">
                  {sectors.find(s => s.id === filters.sector_id)?.name || 'București'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 - Furnizori (colectori) */}
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Furnizori (colectori)</h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {data?.suppliers?.map((supplier, idx) => (
                <div key={idx} className="border-b border-white/10 pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{supplier.name}</p>
                      <p className="text-xs text-cyan-100">{supplier.sector_name}</p>
                    </div>
                    <p className="text-lg font-bold">{formatNumberRO(supplier.total_tons)} t</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 - Prestatori (operatori TMB) */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Factory className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Prestatori (operatori TMB)</h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {data?.operators?.map((operator, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0">
                  <p className="font-semibold text-sm flex-1">{operator.name}</p>
                  <p className="text-lg font-bold">{formatNumberRO(operator.total_tons)} t</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          
          {/* Table Header */}
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Deșeuri trimise la TMB ({data?.summary?.total_tickets || 0})
            </h2>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium 
                               transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adaugă înregistrare
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium 
                               transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export date
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Ticket Cântar</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Ora</th>
                  <th className="px-6 py-4 font-medium">Prestator</th>
                  <th className="px-6 py-4 font-medium">Cod Deșeu</th>
                  <th className="px-6 py-4 font-medium">Proveniență</th>
                  <th className="px-6 py-4 font-medium">Generator</th>
                  <th className="px-6 py-4 font-medium">Nr. Auto</th>
                  <th className="px-6 py-4 font-medium text-right">Tone Net</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data?.tickets?.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    {/* Main Row */}
                    <tr className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRow(ticket.id)}
                          className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                        >
                          {expandedRows.has(ticket.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {ticket.ticket_number}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatDate(ticket.ticket_date)}</td>
                      <td className="px-6 py-4 text-gray-300">{ticket.ticket_time}</td>
                      <td className="px-6 py-4 text-white font-medium">{ticket.operator_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium">
                          {ticket.waste_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{ticket.sector_name}</td>
                      <td className="px-6 py-4 text-gray-300">{ticket.generator_type}</td>
                      <td className="px-6 py-4 text-gray-300">{ticket.vehicle_number}</td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                        {formatNumberRO(ticket.net_weight_tons)} t
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRow(ticket.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {expandedRows.has(ticket.id) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows.has(ticket.id) && (
                      <tr className="bg-gray-900/50">
                        <td colSpan="10" className="px-6 py-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Furnizor:</p>
                              <p className="text-white font-medium">{ticket.supplier_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Cod deșeu complet:</p>
                              <p className="text-white font-medium">
                                {ticket.waste_code} - {ticket.waste_description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mt-6">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm 
                                             font-medium transition-colors flex items-center gap-2">
                              <Edit2 className="w-4 h-4" />
                              Editează
                            </button>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm 
                                             font-medium transition-colors flex items-center gap-2">
                              <Trash className="w-4 h-4" />
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
          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Afișare {((data?.pagination?.current_page - 1) * data?.pagination?.per_page) + 1}-
              {Math.min(data?.pagination?.current_page * data?.pagination?.per_page, data?.pagination?.total_records)} din {data?.pagination?.total_records} înregistrări
            </p>
            
            <div className="flex items-center gap-2">
              <button
                disabled={data?.pagination?.current_page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {Array.from({ length: Math.min(data?.pagination?.total_pages, 5) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setFilters({ ...filters, page })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === data?.pagination?.current_page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                disabled={data?.pagination?.current_page === data?.pagination?.total_pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Următorul
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportTMB;