// src/components/reports/RecyclingReportView.jsx
/**
 * ============================================================================
 * RECYCLING REPORT VIEW - COMPLETE
 * ============================================================================
 * Tabel + Carduri + Expand Row pentru Deșeuri Trimise la Reciclare
 * ============================================================================
 */

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
  filters,
  formatNumberRO,
  groupRowsByNameWithCodes
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      
      {/* CARDURI - STIL TMB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CARD 1 - PERIOADA ANALIZATĂ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[420px] flex flex-col">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
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
          
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="space-y-1 text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">De la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summaryData?.date_range?.from || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Până la:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summaryData?.date_range?.to || 'N/A'}
                </span>
              </div>
            </div>

            {/* Cantitate Livrată */}
            <div className="text-center py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Cantitate livrată
              </p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {formatNumberRO(delivered)} <span className="text-lg">t</span>
              </p>
            </div>

            {/* Cantitate Acceptată */}
            <div className="text-center py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-2 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                Cantitate acceptată
              </p>
              <p className="text-3xl font-black text-cyan-700 dark:text-cyan-400">
                {formatNumberRO(accepted)} <span className="text-lg">t</span>
              </p>
            </div>

            {/* DIFERENȚĂ */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-2 font-semibold text-center">
                ⚠️ Diferență
              </p>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-700 dark:text-orange-400">
                  {formatNumberRO(difference)} <span className="text-base">t</span>
                </p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-500 mt-1">
                  ({differencePercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
              <span className="text-gray-500 dark:text-gray-400">Total tichete:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {summaryData?.total_tickets || 0}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2 - FURNIZORI */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[420px] flex flex-col">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Furnizori</h3>
              </div>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.suppliers || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există furnizori</p>
            ) : (
              <div className="space-y-4">
                {groupRowsByNameWithCodes(summaryData?.suppliers || []).slice(0, 10).map((supplier, idx) => {
                  const percentage = delivered > 0 ? ((supplier.total / delivered) * 100).toFixed(1) : '0.0';
                  return (
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
                          {supplier.codes.map((code, codeIdx) => {
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
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${codePercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CARD 3 - OPERATORI RECICLARE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[420px] flex flex-col">
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Operatori Reciclare</h3>
              </div>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.clients || []).length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există operatori</p>
            ) : (
              <div className="space-y-4">
                {groupRowsByNameWithCodes(summaryData?.clients || []).slice(0, 10).map((client, idx) => {
                  const percentage = accepted > 0 ? ((client.total / accepted) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">
                          {client.name}
                        </p>
                        <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 ml-2">
                          {formatNumberRO(client.total)} t
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Procent din total:</span>
                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      {client.codes && client.codes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {client.codes.map((code, cIdx) => (
                            <span key={cIdx} className="text-xs px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                              {code.code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[24px] border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 dark:from-cyan-600/20 dark:to-blue-700/20 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tichet Cântar</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Furnizor</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Cod Deșeu</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Cant. Livrată</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Cant. Acceptată</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Proveniență</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Detalii</th>
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
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-sm font-bold text-cyan-700 dark:text-cyan-400">{formatNumberRO(ticket.accepted_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.sector_name}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onToggleExpand(ticket.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          title={expandedRows.has(ticket.id) ? "Ascunde detalii" : "Arată detalii"}
                        >
                          <svg className={`w-5 h-5 transition-transform duration-200 ${expandedRows.has(ticket.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {/* EXPAND ROW */}
                    {expandedRows.has(ticket.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-800/30 transition-colors">
                        <td colSpan="9" className="px-4 py-4">
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                            {/* Row 1 */}
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Tichet Cântar:</span>
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

                            {/* Row 2 */}
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.supplier_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Operator Reciclare:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.recipient_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.sector_name}</p>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-2">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu complet:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.waste_code} - {ticket.waste_description}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Nr. Auto:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{ticket.vehicle_number || 'N/A'}</p>
                            </div>

                            {/* Row 4 - Cantități */}
                            <div>
                              <span className="text-emerald-600 dark:text-emerald-400 block mb-1">Cantitate Livrată:</span>
                              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{formatNumberRO(ticket.delivered_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-cyan-600 dark:text-cyan-400 block mb-1">Cantitate Acceptată:</span>
                              <p className="font-bold text-cyan-700 dark:text-cyan-400 text-lg">{formatNumberRO(ticket.accepted_quantity_tons)} t</p>
                            </div>
                            <div>
                              <span className="text-orange-600 dark:text-orange-400 block mb-1">Diferență:</span>
                              <p className="font-bold text-orange-700 dark:text-orange-400 text-lg">
                                {formatNumberRO(ticket.difference_tons)} t
                              </p>
                              <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
                                ({((ticket.difference_tons / ticket.delivered_quantity_tons) * 100).toFixed(2)}%)
                              </p>
                            </div>

                            {/* Row 5 */}
                            <div className="col-span-3">
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">Creat la:</span>
                              <p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.created_at).toLocaleString('ro-RO')}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => onEdit(ticket)}
                              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded transition-all duration-200 shadow-md flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editează
                            </button>
                            <button
                              onClick={() => onDelete(ticket.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded transition-all duration-200 shadow-md flex items-center gap-1"
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

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pagina {pagination.page} din {pagination.totalPages}
                </p>
                <select
                  value={filters.per_page}
                  onChange={(e) => onPerPageChange(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                >
                  <option value="10">10 / pagină</option>
                  <option value="20">20 / pagină</option>
                  <option value="50">50 / pagină</option>
                  <option value="100">100 / pagină</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Următor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecyclingReportView;