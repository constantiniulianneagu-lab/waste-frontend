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
      
      {/* CARDURI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1 - PERIOADA ANALIZATĂ + DIFERENȚĂ */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[24px] border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
            📅 Perioada Analizată
          </h3>
          
          <div className="space-y-4">
            {/* Total Tichete */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total tichete</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {summaryData?.total_tickets?.toLocaleString('ro-RO') || 0}
              </p>
            </div>

            {/* Cantitate Livrată */}
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Cantitate livrată
              </p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatNumberRO(delivered)} tone
              </p>
            </div>

            {/* Cantitate Acceptată */}
            <div>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                Cantitate acceptată
              </p>
              <p className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
                {formatNumberRO(accepted)} tone
              </p>
            </div>

            {/* DIFERENȚĂ */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-orange-600 dark:text-orange-400 mb-1 font-semibold">
                ⚠️ Diferență
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-xl font-black text-orange-700 dark:text-orange-400">
                  {formatNumberRO(difference)} tone
                </p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-500">
                  ({differencePercent}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2 - FURNIZORI */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[24px] border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
            🏢 Furnizori
          </h3>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {groupRowsByNameWithCodes(summaryData?.suppliers || []).slice(0, 10).map((supplier, idx) => {
              const percent = delivered > 0 ? ((supplier.total / delivered) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {supplier.name}
                    </p>
                    {supplier.codes.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {supplier.codes.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {formatNumberRO(supplier.total)} t
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {percent}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3 - OPERATORI RECICLARE */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[24px] border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
            ♻️ Operatori Reciclare
          </h3>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {groupRowsByNameWithCodes(summaryData?.clients || []).slice(0, 10).map((client, idx) => {
              const percent = accepted > 0 ? ((client.total / accepted) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {client.name}
                    </p>
                    {client.codes.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {client.codes.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-cyan-700 dark:text-cyan-400">
                      {formatNumberRO(client.total)} t
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {percent}%
                    </p>
                  </div>
                </div>
              );
            })}
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