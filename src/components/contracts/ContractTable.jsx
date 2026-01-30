// src/components/contracts/ContractTable.jsx
/**
 * ============================================================================
 * CONTRACT TABLE - ALL 6 TYPES WITH PROPER COLUMNS
 * ============================================================================
 * Order: Colectare → Sortare → Aerobă → Anaerobă → TMB → Depozitare
 * ============================================================================
 */

import {
  Edit2, Trash2, Eye, FileText, CheckCircle, XCircle,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar, MapPin,
  AlertCircle, FileCheck, Users, Building2, Gavel,
} from 'lucide-react';

// Attribution types labels
const ATTRIBUTION_LABELS = {
  PUBLIC_TENDER: 'Licitație deschisă',
  DIRECT_NEGOTIATION: 'Negociere fără publicare',
};

const ContractTable = ({
  contracts = [],
  loading = false,
  contractType = 'DISPOSAL',
  onEdit,
  onDelete,
  onView,
  sortBy = 'contract_date_start',
  sortOrder = 'desc',
  onSort,
  canEdit = false,
  canDelete = false,
}) => {
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-teal-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-teal-500" />;
  };

  const SortableHeader = ({ column, children, className = '' }) => (
    <th
      className={`group px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {getSortIcon(column)}
      </div>
    </th>
  );

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isExpiringSoon = (dateEnd) => {
    if (!dateEnd) return false;
    const endDate = new Date(dateEnd);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (dateEnd) => {
    if (!dateEnd) return false;
    return new Date(dateEnd) < new Date();
  };

  // Check if contract should be displayed as active
  const isContractActive = (contract) => {
    const endDate = contract.effective_date_end || contract.contract_date_end;
    if (isExpired(endDate)) return false;
    return contract.is_active;
  };

  const getAttributionBadge = (type) => {
    if (!type) return <span className="text-sm text-gray-400">-</span>;
    
    const isPublicTender = type === 'PUBLIC_TENDER';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
        isPublicTender 
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
      }`}>
        <Gavel className="w-3 h-3" />
        {ATTRIBUTION_LABELS[type] || type}
      </span>
    );
  };

  // Show attribution column for DISPOSAL, TMB, AEROBIC, and ANAEROBIC
  const showAttributionColumn = ['DISPOSAL', 'TMB', 'AEROBIC', 'ANAEROBIC'].includes(contractType);
  
  // Show associate column for TMB, AEROBIC, and ANAEROBIC
  const showAssociateColumn = ['TMB', 'AEROBIC', 'ANAEROBIC'].includes(contractType);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Se încarcă contractele...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (contracts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Niciun contract găsit</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Modificați filtrele sau adăugați un contract nou.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
              <SortableHeader column="contract_number">Nr. Contract</SortableHeader>
              
              {/* ATTRIBUTION TYPE COLUMN - for DISPOSAL, TMB, AEROBIC, ANAEROBIC */}
              {showAttributionColumn && (
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tip Atribuire
                </th>
              )}
              
              {/* OPERATOR COLUMN */}
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Operator
              </th>
              
              <SortableHeader column="sector_number">U.A.T.</SortableHeader>
              <SortableHeader column="contract_date_start">Perioadă</SortableHeader>
              
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tarif
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cantitate / Valoare
              </th>

              {/* ASSOCIATE COLUMN - for TMB, AEROBIC, ANAEROBIC */}
              {showAssociateColumn && (
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Asociat
                </th>
              )}

              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acte Ad.
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
            {contracts.map((contract) => {
              const effectiveDateEnd = contract.effective_date_end || contract.contract_date_end;
              const expired = isExpired(effectiveDateEnd);
              const expiringSoon = isExpiringSoon(effectiveDateEnd);
              const effectiveTariff = contract.effective_tariff || contract.tariff_per_ton;
              const effectiveQuantity = contract.effective_quantity || contract.estimated_quantity_tons;
              const effectiveTotalValue = contract.effective_total_value || contract.total_value || contract.contract_value;
              
              return (
                <tr key={contract.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Contract Number */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {contract.contract_number || '-'}
                      </span>
                    </div>
                  </td>

                  {/* ATTRIBUTION TYPE - NEW COLUMN */}
                  {showAttributionColumn && (
                    <td className="px-4 py-4">
                      {getAttributionBadge(contract.attribution_type)}
                    </td>
                  )}

                  {/* OPERATOR */}
                  <td className="px-4 py-4">
                    {contract.institution_name ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]" title={contract.institution_name}>
                            {contract.institution_short_name || contract.institution_name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* Sector (U.A.T.) */}
                  <td className="px-4 py-4">
                    {contract.sector_number ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-sm font-medium">
                        <MapPin className="w-3 h-3" />
                        S{contract.sector_number}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* Period */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(contract.contract_date_start)}
                      </div>
                      {effectiveDateEnd && (
                        <div className={`flex items-center gap-1.5 text-sm ${
                          expired ? 'text-red-600 dark:text-red-400' 
                          : expiringSoon ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {expired && <AlertCircle className="w-3.5 h-3.5" />}
                          → {formatDate(effectiveDateEnd)}
                          {expired && <span className="text-xs">(expirat)</span>}
                          {expiringSoon && <span className="text-xs">(expiră curând)</span>}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Tariff */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(effectiveTariff)}/t
                    </div>
                    {contractType === 'DISPOSAL' && contract.effective_cec && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        CEC: {formatCurrency(contract.effective_cec)}/t
                      </div>
                    )}
                  </td>

                  {/* Quantity / Value */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(effectiveTotalValue)}
                    </div>
                    {effectiveQuantity && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {parseFloat(effectiveQuantity).toLocaleString('ro-RO')} t
                      </div>
                    )}
                  </td>

                  {/* ASSOCIATE - for TMB, AEROBIC, ANAEROBIC */}
                  {showAssociateColumn && (
                    <td className="px-4 py-4">
                      {contract.associate_name ? (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-violet-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]" title={contract.associate_name}>
                            {contract.associate_short_name || contract.associate_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  )}

                  {/* Amendments Count */}
                  <td className="px-4 py-4 text-center">
                    {contract.amendments_count > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                        <FileCheck className="w-3 h-3" />
                        {contract.amendments_count}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 text-center">
                    {isContractActive(contract) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Activ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <XCircle className="w-3 h-3" />
                        Inactiv
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(contract)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        title="Vizualizează"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {canEdit && (
                        <button
                          onClick={() => onEdit(contract)}
                          className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors"
                          title="Editează"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => onDelete(contract)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractTable;