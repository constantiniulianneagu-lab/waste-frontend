// src/components/reports/RecoveryReportView.jsx
import React from 'react';

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
  formatNumberRO,
  groupRowsByNameWithCodes
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      
      {/* 3 CARDURI h-[320px] */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* CARD 1 - PERIOADA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="min-w-0"><h3 className="text-sm font-semibold">Perioada analizată</h3></div>
            </div>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between"><span className="text-gray-500 dark:text-gray-400">De la:</span><span className="font-semibold text-gray-900 dark:text-white">{summaryData?.date_range?.from || 'N/A'}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-500 dark:text-gray-400">Până la:</span><span className="font-semibold text-gray-900 dark:text-white">{summaryData?.date_range?.to || 'N/A'}</span></div>
            </div>
            <div className="text-center py-4"><p className="text-xs text-purple-600 dark:text-purple-400 mb-2">● Cantitate livrată</p><p className="text-3xl font-black text-purple-700 dark:text-purple-400">{formatNumberRO(delivered)} <span className="text-base">t</span></p></div>
            <div className="text-center py-2"><p className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">● Cantitate acceptată</p><p className="text-3xl font-black text-indigo-700 dark:text-indigo-400">{formatNumberRO(accepted)} <span className="text-base">t</span></p></div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center"><p className="text-xs text-orange-600 dark:text-orange-400 mb-1">⚠️ Diferență</p><p className="text-xl font-black text-orange-700 dark:text-orange-400">{formatNumberRO(difference)} t <span className="text-xs">({differencePercent}%)</span></p></div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Total tichete:</span><span className="text-xl font-bold text-gray-900 dark:text-white">{summaryData?.total_tickets || 0}</span></div>
          </div>
        </div>

        {/* CARD 2 - FURNIZORI */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div className="min-w-0"><h3 className="text-sm font-semibold">Furnizori</h3></div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.suppliers || []).length === 0 ? (<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există furnizori</p>) : (
              <div className="space-y-4">
                {groupRowsByNameWithCodes(summaryData?.suppliers || []).slice(0, 10).map((supplier, idx) => {
                  const percentage = delivered > 0 ? ((supplier.total / delivered) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">{supplier.name}</p>
                        <span className="text-lg font-black text-purple-600 dark:text-purple-400 ml-2">{formatNumberRO(supplier.total)} t</span>
                      </div>
                      {supplier.codes && supplier.codes.length > 0 && (
                        <div className="space-y-2">
                          {supplier.codes.map((code, codeIdx) => {
                            const codePercentage = delivered > 0 ? ((code.quantity / delivered) * 100).toFixed(1) : '0.0';
                            return (<div key={codeIdx}><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-gray-700 dark:text-gray-300">{code.code}</span><span className="text-xs font-bold text-purple-600 dark:text-purple-400">{codePercentage}%</span></div><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300" style={{width: `${codePercentage}%`}}></div></div></div>);
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

        {/* CARD 3 - OPERATORI VALORIFICARE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[320px] flex flex-col">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="min-w-0"><h3 className="text-sm font-semibold">Operatori Valorificare</h3></div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {(summaryData?.clients || []).length === 0 ? (<p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nu există operatori</p>) : (
              <div className="space-y-4">
                {groupRowsByNameWithCodes(summaryData?.clients || []).slice(0, 10).map((client, idx) => {
                  const percentage = accepted > 0 ? ((client.total / accepted) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate flex-1">{client.name}</p>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 ml-2">{formatNumberRO(client.total)} t</span>
                      </div>
                      <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500 dark:text-gray-400">Procent din total:</span><span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span></div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{width: `${percentage}%`}}></div></div>
                      {client.codes && client.codes.length > 0 && (<div className="mt-2 flex flex-wrap gap-1">{client.codes.map((code, cIdx) => (<span key={cIdx} className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">{code.code}</span>))}</div>)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABEL UNIC */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* HEADER CU BUTOANE */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tichete Valorificare ({pagination?.total || 0})
            </h3>
            <div className="flex gap-3">
              <button
                onClick={onCreate}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adaugă tichet
              </button>
              <button
                onClick={onExport}
                disabled={exporting || !tickets || tickets.length === 0}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <thead>
              <tr className="bg-gradient-to-r from-purple-500/10 to-indigo-600/10 dark:from-purple-600/20 dark:to-indigo-700/20 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Tichet</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Furnizor</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Cod Deșeu</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Cant. Livrată</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase">Cant. Acceptată</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Proveniență</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Detalii</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tickets.length === 0 ? (<tr><td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Nu există date pentru perioada selectată</td></tr>) : (
                tickets.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.ticket_number || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.recipient_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ticket.supplier_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.waste_code}</td>
                      <td className="px-4 py-3 text-sm font-bold text-purple-700 dark:text-purple-400">{formatNumberRO(ticket.delivered_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-400">{formatNumberRO(ticket.accepted_quantity_tons)} t</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ticket.sector_name}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => onToggleExpand(ticket.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"><svg className={`w-5 h-5 transition-transform duration-200 ${expandedRows.has(ticket.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                      </td>
                    </tr>
                    {expandedRows.has(ticket.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-800/30">
                        <td colSpan="9" className="px-4 py-4">
                          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Tichet:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_number || 'N/A'}</p></div>
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Data:</span><p className="font-medium text-gray-900 dark:text-white">{new Date(ticket.ticket_date).toLocaleDateString('ro-RO')}</p></div>
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Ora:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.ticket_time || 'N/A'}</p></div>
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Furnizor:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.supplier_name}</p></div>
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Client:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.recipient_name}</p></div>
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Proveniență:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.sector_name}</p></div>
                            <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400 block mb-1">Cod deșeu:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.waste_code} - {ticket.waste_description}</p></div>
                            <div><span className="text-gray-500 dark:text-gray-400 block mb-1">Nr. Auto:</span><p className="font-medium text-gray-900 dark:text-white">{ticket.vehicle_number || 'N/A'}</p></div>
                            <div><span className="text-purple-600 dark:text-purple-400 block mb-1">Livrată:</span><p className="font-bold text-purple-700 dark:text-purple-400 text-lg">{formatNumberRO(ticket.delivered_quantity_tons)} t</p></div>
                            <div><span className="text-indigo-600 dark:text-indigo-400 block mb-1">Acceptată:</span><p className="font-bold text-indigo-700 dark:text-indigo-400 text-lg">{formatNumberRO(ticket.accepted_quantity_tons)} t</p></div>
                            <div><span className="text-orange-600 dark:text-orange-400 block mb-1">Diferență:</span><p className="font-bold text-orange-700 dark:text-orange-400 text-lg">{formatNumberRO(ticket.difference_tons)} t ({ticket.delivered_quantity_tons > 0 ? ((ticket.difference_tons / ticket.delivered_quantity_tons) * 100).toFixed(2) : 0}%)</p></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => onEdit(ticket)} className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded shadow-md">Editează</button>
                            <button onClick={() => onDelete(ticket.id)} className="px-3 py-1.5 text-xs font-medium bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded shadow-md">Șterge</button>
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
                <select value={filters.per_page} onChange={(e) => onPerPageChange(parseInt(e.target.value))} className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
                  <option value="10">10 / pagină</option><option value="20">20 / pagină</option><option value="50">50 / pagină</option><option value="100">100 / pagină</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50">Anterior</button>
                <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50">Următorul</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecoveryReportView;