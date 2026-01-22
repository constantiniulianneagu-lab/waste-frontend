// src/components/reports/RecoveryReportView.jsx
// Schema de culori: Rose (familie unică) - Roșu-Cărămiziu Profesionist
import React from 'react';
import { Plus } from 'lucide-react';
import ExportDropdown from './ExportDropdown';

const RecoveryReportView = ({
  loading,
  tickets,
  summaryData,
  pagination,
  expandedRows,
  onToggleExpand,
  onEdit,
  onDelete,
  onPageChange,
  onPerPageChange,
  onExport,
  onCreate,
  exporting,
  filters,
  sectors,
  formatNumberRO,
  groupRowsByNameWithCodes
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  const delivered = summaryData?.total_delivered || 0;
  const accepted = summaryData?.total_accepted || 0;
  const difference = delivered - accepted;
  const differencePercent = delivered > 0 ? ((difference / delivered) * 100).toFixed(2) : 0;

  // Obținere nume UAT din sectors
  const getUatName = () => {
    if (!filters?.sector_id) return 'Toate';
    const sector = sectors?.find(s => s.sector_id === filters.sector_id || s.id === filters.sector_id);
    if (!sector) return 'Toate';
    
    // Dacă sector_name conține "Sector" înseamnă că e un sector din București
    const sectorName = sector.sector_name || sector.name;
    if (sectorName && sectorName.includes('Sector')) {
      return 'București';
    }
    return sectorName || 'Toate';
  };

  return (
    <div className="space-y-6">
      
      {/* CARDURI - Design instituțional cu accent teal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CARD 1 - PERIOADA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-rose-200 dark:border-rose-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Perioada analizată</h3>
              </div>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="space-y-1 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">An:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{filters?.year || summaryData?.date_range?.from?.split('-')[0] || new Date().getFullYear()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">De la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.date_range?.from || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Până la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.date_range?.to || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">UAT:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.sector || 'București'}</span>
              </div>
            </div>
            
            <div className="text-center py-4 flex-1 flex flex-col justify-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cantitate livrată</p>
              <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-rose-200 dark:border-rose-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Furnizori</h3>
              </div>
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
                    {/* Nume furnizor + total - FONT MAI MARE */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {supplier.name}
                      </span>
                      <span className="text-base font-bold text-rose-600 dark:text-rose-400 ml-2">
                        {formatNumberRO(supplierTotal)} t
                      </span>
                    </div>
                    
                    {/* Coduri cu progress bar */}
                    {supplier.codes && supplier.codes.length > 0 && (
                      <div className="space-y-2">
                        {supplier.codes.map((codeData, cIdx) => {
                          const codeQty = codeData.quantity || 0;
                          const codePercent = supplierTotal > 0 ? ((codeQty / supplierTotal) * 100).toFixed(1) : 0;
                          return (
                            <div key={cIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {codeData.code}
                                </span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  <span className="font-bold">{formatNumberRO(codeQty)} t</span> <span className="text-gray-600 dark:text-gray-400">({codePercent}%)</span>
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${codePercent}%` }}
                                />
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

        {/* CARD 3 - OPERATORI VALORIFICARE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-rose-200 dark:border-rose-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-300">Operatori Valorificare</h3>
              </div>
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
                    {/* Nume operator valorificare + total - FONT MAI MARE */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {client.name}
                      </span>
                      <span className="text-base font-bold text-rose-600 dark:text-rose-400 ml-2">
                        {formatNumberRO(clientTotal)} t
                      </span>
                    </div>
                    
                    {/* Coduri deșeuri cu progress bar */}
                    {client.codes && client.codes.length > 0 && (
                      <div className="space-y-2">
                        {client.codes.map((codeData, cIdx) => {
                          const codeQty = codeData.quantity || 0;
                          const codePercent = clientTotal > 0 ? ((codeQty / clientTotal) * 100).toFixed(1) : 0;
                          return (
                            <div key={cIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {codeData.code}
                                </span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  <span className="font-bold">{formatNumberRO(codeQty)} t</span> <span className="text-gray-600 dark:text-gray-400">({codePercent}%)</span>
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${codePercent}%` }}
                                />
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tichete Valorificare ({pagination?.total_count || 0})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={onCreate}
                className="px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adaugă tichet
              </button>
              <ExportDropdown
                onExport={onExport}
                disabled={exporting || !tickets || tickets.length === 0}
                loading={exporting}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Tichet Cântar</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Furnizor</th>
                <th className="px-4 py-3 text-left">Cod Deșeu</th>
                <th className="px-4 py-3 text-center">Cant. Livrată</th>
                <th className="px-4 py-3 text-center">Cant. Acceptată</th>
                <th className="px-4 py-3 text-left">Proveniență</th>
                <th className="px-4 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nu există date pentru perioada selectată
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.ticket_number || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.recipient_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.supplier_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {ticket.waste_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-rose-600 dark:text-rose-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-rose-500 dark:text-rose-500">{formatNumberRO(ticket.accepted_quantity_tons)} t</td>
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
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_number || 'N/A'}</p>
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
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Client:</span>
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
                              <p className="font-bold text-rose-600 dark:text-rose-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Acceptată:</span>
                              <p className="font-bold text-rose-500 dark:text-rose-500">{formatNumberRO(ticket.accepted_quantity_tons)} t</p>
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
                                {ticket.created_at ? new Date(ticket.created_at).toLocaleString('ro-RO', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 justify-end">
                            <button
                              onClick={() => onEdit(ticket)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors shadow-sm flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editează
                            </button>
                            <button
                              onClick={() => onDelete(ticket.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pagination && pagination.totalPages > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pagina {pagination.page} din {pagination.totalPages}</p>
                <select value={filters.per_page} onChange={(e) => onPerPageChange(parseInt(e.target.value))} className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors">
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

export default RecoveryReportView;