// src/components/reports/RecyclingReportView.jsx
// Schema de culori: Emerald (familie unică) - Instituțional Modern
import React from 'react';

const RecyclingReportView = ({
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
  onCreate,
  onExport,
  exporting,
  filters,
  formatNumberRO,
  groupRowsByNameWithCodes
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  const delivered = summaryData?.total_delivered || 0;
  const accepted = summaryData?.total_accepted || 0;
  const difference = delivered - accepted;
  const differencePercent = delivered > 0 ? ((difference / delivered) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      
      {/* CARDURI - Design instituțional cu accent emerald */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CARD 1 - PERIOADA ANALIZATĂ (stil TMB) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Perioada analizată</h3>
              </div>
            </div>
          </div>
          
          <div className="p-4 flex flex-col justify-between flex-1">
            {/* Info perioadă - ca la TMB */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">An:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summaryData?.year || new Date().getFullYear()}</span>
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

            {/* Cantitate livrată - MARE */}
            <div className="text-center py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cantitate livrată</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumberRO(delivered)} <span className="text-lg font-medium">t</span>
              </p>
            </div>

            {/* Acceptată + Diferență - mai mic */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Acceptată:</span>
                <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                  {formatNumberRO(accepted)} t
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Diferență:</span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {formatNumberRO(difference)} t ({differencePercent}%)
                </span>
              </div>
            </div>

            {/* Total tichete */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Total tichete:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{summaryData?.total_tickets || 0}</span>
            </div>
          </div>
        </div>

        {/* CARD 2 - FURNIZORI (cu breakdown pe coduri ca la TMB) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Furnizori</h3>
              </div>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.suppliers || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există furnizori</p>
            ) : (
              <div className="space-y-4">
                {(summaryData?.suppliers || []).slice(0, 10).map((supplier, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">
                        {supplier.name}
                      </p>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 ml-2">
                        {formatNumberRO(supplier.total)} t
                      </span>
                    </div>

                    {supplier.codes && supplier.codes.length > 0 && (
                      <div className="space-y-2">
                        {supplier.codes.slice(0, 3).map((code, codeIdx) => {
                          const codePercentage = delivered > 0 
                            ? ((code.quantity / delivered) * 100).toFixed(1)
                            : '0.0';
                          return (
                            <div key={codeIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {code.code}
                                </span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  {codePercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(parseFloat(codePercentage), 100)}%` }}
                                ></div>
                              </div>
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

        {/* CARD 3 - OPERATORI RECICLARE (cu breakdown pe coduri) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800/50 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Operatori Reciclare</h3>
              </div>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.clients || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există operatori</p>
            ) : (
              <div className="space-y-4">
                {(summaryData?.clients || []).slice(0, 10).map((client, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">
                        {client.name}
                      </p>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 ml-2">
                        {formatNumberRO(client.total)} t
                      </span>
                    </div>

                    {client.codes && client.codes.length > 0 && (
                      <div className="space-y-2">
                        {client.codes.slice(0, 3).map((code, codeIdx) => {
                          const codePercentage = accepted > 0 
                            ? ((code.quantity / accepted) * 100).toFixed(1)
                            : '0.0';
                          return (
                            <div key={codeIdx}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {code.code}
                                </span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  {codePercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(parseFloat(codePercentage), 100)}%` }}
                                ></div>
                              </div>
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
      </div>

      {/* TABEL */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* HEADER CU BUTOANE */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tichete Reciclare ({pagination?.total || 0})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={onCreate}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adaugă tichet
              </button>
              <button
                onClick={onExport}
                disabled={exporting || !tickets || tickets.length === 0}
                className="px-4 py-2 text-sm font-medium bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Se exportă...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export date
                  </>
                )}
              </button>
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
                <th className="px-4 py-3 text-right">Cant. Livrată</th>
                <th className="px-4 py-3 text-right">Cant. Acceptată</th>
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
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.waste_code}</td>
                      {/* Cantități colorate - accent emerald */}
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-500 dark:text-emerald-500">{formatNumberRO(ticket.accepted_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.sector_name}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onToggleExpand(ticket.id)}
                          className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
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
                            {/* Cantități în detalii - păstrăm accentul emerald dar cu etichete neutre */}
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Livrată:</span>
                              <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Acceptată:</span>
                              <p className="font-bold text-emerald-500 dark:text-emerald-500">{formatNumberRO(ticket.accepted_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Diferență:</span>
                              <p className="font-bold text-slate-600 dark:text-slate-400">
                                {formatNumberRO(ticket.difference_tons)} t ({ticket.delivered_quantity_tons > 0 ? ((ticket.difference_tons / ticket.delivered_quantity_tons) * 100).toFixed(2) : 0}%)
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 justify-end">
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
                <select value={filters.per_page} onChange={(e) => onPerPageChange(parseInt(e.target.value))} className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors">
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

export default RecyclingReportView;