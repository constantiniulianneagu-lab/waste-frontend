// src/components/contracts/ContractViewModal.jsx
/**
 * ============================================================================
 * CONTRACT VIEW MODAL - ELEGANT & MODERN DESIGN
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import {
  X, FileText, Calendar, MapPin, Building2, Users,
  Percent, FileCheck, ChevronDown, ChevronUp,
  Clock, DollarSign, Package, AlertCircle, Eye,
} from 'lucide-react';
import { apiGet } from '../../api/apiClient';
import PDFViewerModal from '../common/PDFViewerModal';

const ContractViewModal = ({
  isOpen,
  onClose,
  contract,
  contractType = 'DISPOSAL',
}) => {
  const [amendments, setAmendments] = useState([]);
  const [loadingAmendments, setLoadingAmendments] = useState(false);
  const [showAmendments, setShowAmendments] = useState(false);

  // PDF Viewer state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState('');
  const [pdfViewerFileName, setPdfViewerFileName] = useState('');

  useEffect(() => {
    if (isOpen && contract?.id) {
      // For WASTE_COLLECTOR, amendments come with the contract
      if (contractType === 'WASTE_COLLECTOR' && contract.amendments) {
        setAmendments(contract.amendments);
      } else {
        loadAmendments();
      }
    }
  }, [isOpen, contract?.id]);

  const loadAmendments = async () => {
    if (!contract?.id) return;
    
    setLoadingAmendments(true);
    try {
      let endpoint = '';
      switch (contractType) {
        case 'DISPOSAL':
          endpoint = `/api/institutions/${contract.institution_id}/disposal-contracts/${contract.id}/amendments`;
          break;
        case 'TMB':
          endpoint = `/api/institutions/0/tmb-contracts/${contract.id}/amendments`;
          break;
        case 'SORTING':
          endpoint = `/api/institutions/0/sorting-contracts/${contract.id}/amendments`;
          break;
        case 'AEROBIC':
          endpoint = `/api/institutions/0/aerobic-contracts/${contract.id}/amendments`;
          break;
        case 'ANAEROBIC':
          endpoint = `/api/institutions/0/anaerobic-contracts/${contract.id}/amendments`;
          break;
        case 'WASTE_COLLECTOR':
          // For waste collector, amendments come with the contract, no separate endpoint
          // This function won't be called for WASTE_COLLECTOR due to useEffect check
          return;
        default:
          return;
      }
      
      const response = await apiGet(endpoint);
      if (response.success) {
        setAmendments(response.data || []);
      }
    } catch (err) {
      console.error('Error loading amendments:', err);
    } finally {
      setLoadingAmendments(false);
    }
  };

  const handleViewPDF = (url, fileName) => {
    setPdfViewerUrl(url);
    setPdfViewerFileName(fileName);
    setPdfViewerOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('ro-RO').format(value);
  };

  const isExpired = () => {
    const endDate = contract?.effective_date_end || contract?.contract_date_end;
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isExpiringSoon = () => {
    const endDate = contract?.effective_date_end || contract?.contract_date_end;
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    const daysUntil = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  };

  // Contract is active if NOT expired and is_active flag is true
  const isContractActive = () => {
    if (isExpired()) return false; // Expired contracts are always inactive
    return contract?.is_active; // Otherwise use manual flag
  };

  if (!isOpen || !contract) return null;

  const effectiveDateEnd = contract.effective_date_end || contract.contract_date_end;
  const effectiveTariff = contract.effective_tariff || contract.tariff_per_ton;
  const effectiveQuantity = contract.effective_quantity || contract.estimated_quantity_tons || contract.contracted_quantity_tons;
  const effectiveTotalValue = contract.effective_total_value || contract.total_value;
  const effectiveCecTax = contract.effective_cec || contract.cec_tax_per_ton; // Added for CEC tax
  const expired = isExpired();
  const expiringSoon = isExpiringSoon();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Gradient */}
          <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 px-8 py-6">
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Contract badge */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-teal-100 uppercase tracking-wider">
                    Contract {contractType === 'DISPOSAL' ? 'Depozitare' : contractType === 'TMB' ? 'TMB' : contractType === 'WASTE_COLLECTOR' ? 'Colectare' : contractType === 'SORTING' ? 'Sortare' : contractType === 'AEROBIC' ? 'Aerobă' : contractType === 'ANAEROBIC' ? 'Anaerobă' : contractType}
                  </span>
                  {isContractActive() ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100">
                      Activ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-400/20 text-gray-200">
                      Inactiv
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {contract.contract_number}
                </h2>
                {contract.institution_name && (
                  <p className="text-teal-100 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {contract.institution_name}
                  </p>
                )}
              </div>
            </div>

            {/* Status indicator */}
            {(expired || expiringSoon) && (
              <div className={`mt-4 px-4 py-2 rounded-xl ${
                expired 
                  ? 'bg-red-500/20 border border-red-400/30' 
                  : 'bg-amber-500/20 border border-amber-400/30'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${expired ? 'text-red-200' : 'text-amber-200'}`} />
                  <span className={`text-sm font-medium ${expired ? 'text-red-100' : 'text-amber-100'}`}>
                    {expired ? 'Contract expirat' : 'Expiră curând'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Period */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Perioadă</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(contract.contract_date_start)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  → {formatDate(effectiveDateEnd)}
                </p>
              </div>

              {/* Tariff */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tarif</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(effectiveTariff)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">per tonă</p>
              </div>

              {/* Quantity */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cantitate</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatNumber(effectiveQuantity)} t
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">estimat</p>
              </div>
            </div>

            {/* Total Value Highlight */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-500/10 dark:to-emerald-500/10 rounded-2xl p-5 mb-8 border border-teal-100 dark:border-teal-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valoare Totală Contract</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {amendments.length > 0 ? 'Include modificările din actele adiționale' : 'Conform contractului inițial'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                  {formatCurrency(effectiveTotalValue)}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-6">
              {/* Section: General Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Informații Generale
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem 
                    icon={MapPin} 
                    label="U.A.T." 
                    value={contract.sector_name ? `Sectorul ${contract.sector_number}` : `Sectorul ${contract.sector_number}`}
                  />
                  <InfoItem 
                    icon={Building2} 
                    label="Operator" 
                    value={contract.institution_name || '-'}
                  />
                  {contractType === 'TMB' && contract.associate_name && (
                    <InfoItem 
                      icon={Users} 
                      label="Operator Asociat" 
                      value={contract.associate_name}
                      iconColor="text-violet-500"
                    />
                  )}
                  {contractType === 'DISPOSAL' && effectiveCecTax && (
                    <InfoItem 
                      icon={DollarSign} 
                      label="Taxa CEC" 
                      value={`${formatCurrency(effectiveCecTax)}/t`}
                    />
                  )}
                </div>
              </div>

              {/* Section: TMB Performance Indicators */}
              {contractType === 'TMB' && (contract.indicator_recycling_percent || contract.indicator_energy_recovery_percent || contract.indicator_disposal_percent) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-teal-500" />
                    Indicatori de Performanță
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <IndicatorCard 
                      label="Reciclare" 
                      value={contract.indicator_recycling_percent} 
                      color="emerald"
                    />
                    <IndicatorCard 
                      label="Valorificare Energetică" 
                      value={contract.indicator_energy_recovery_percent} 
                      color="amber"
                    />
                    <IndicatorCard 
                      label="Depozitare" 
                      value={contract.indicator_disposal_percent} 
                      color="slate"
                    />
                  </div>
                </div>
              )}

              {/* Section: Performance Indicator (Aerobic/Anaerobic) - Unified */}
              {(contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (contract.indicator_disposal_percent !== null && contract.indicator_disposal_percent !== undefined) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-teal-500" />
                    Indicator (reziduu la depozitare)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <IndicatorCard
                      label="Depozitare"
                      value={contract.indicator_disposal_percent}
                      color="slate"
                    />
                    <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                      Procent estimat al reziduului direcționat la depozitare (conform indicatorului din contract).
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Waste Codes (Informative) */}
              {(contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-500" />
                    Coduri Deșeuri (Informativ)
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {contractType === 'TMB' && 'Cod deșeu: 20 03 01'}
                          {contractType === 'AEROBIC' && 'Cod deșeu: 20 02 01'}
                          {contractType === 'ANAEROBIC' && 'Coduri deșeuri: 20 01 08, 20 03 02'}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {contractType === 'TMB' && 'Deșeuri municipale amestecate'}
                          {contractType === 'AEROBIC' && 'Deșeuri biodegradabile'}
                          {contractType === 'ANAEROBIC' && 'Deșeuri biodegradabile din bucătărie și deșeuri biodegradabile'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Contract Document */}
              {contract.contract_file_url && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Document Contract
                  </h3>
                  <button
                    onClick={() => handleViewPDF(contract.contract_file_url, contract.contract_file_name || 'Contract.pdf')}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 rounded-xl border border-red-100 dark:border-red-500/20 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {contract.contract_file_name || 'Contract.pdf'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click pentru vizualizare
                      </p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
              )}

              {/* Section: Notes */}
              {contract.notes && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Observații
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                    {contract.notes}
                  </p>
                </div>
              )}

              {/* Section: Amendments */}
              {(contractType === 'DISPOSAL' || contractType === 'TMB' || contractType === 'WASTE_COLLECTOR' || contractType === 'SORTING' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <button
                    onClick={() => setShowAmendments(!showAmendments)}
                    className="w-full flex items-center justify-between py-2 group"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Acte Adiționale
                      </span>
                      {amendments.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                          {amendments.length}
                        </span>
                      )}
                    </div>
                    {showAmendments 
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </button>

                  {showAmendments && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-2">
                      {loadingAmendments ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                      ) : amendments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          Niciun act adițional
                        </p>
                      ) : (
                        amendments.map((amendment, idx) => (
                          <AmendmentCard 
                            key={amendment.id} 
                            amendment={amendment} 
                            index={idx + 1} 
                            onViewPDF={handleViewPDF}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Actualizat: {contract.updated_at ? formatDate(contract.updated_at) : formatDate(contract.created_at)}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        url={pdfViewerUrl}
        fileName={pdfViewerFileName}
      />
    </>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const InfoItem = ({ icon: Icon, label, value, iconColor = 'text-gray-400' }) => (
  <div className="flex items-start gap-3">
    <Icon className={`w-4 h-4 mt-0.5 ${iconColor}`} />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const IndicatorCard = ({ label, value, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
    slate: 'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 text-slate-700 dark:text-slate-400',
  };

  return (
    <div className={`rounded-xl p-3 border ${colorClasses[color]}`}>
      <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
      <p className="text-lg font-bold">{value ? `${value}%` : '-'}</p>
    </div>
  );
};

const AmendmentCard = ({ amendment, index, onViewPDF }) => {
  const AMENDMENT_TYPE_LABELS = {
    EXTENSION: 'Modificare perioadă',
    TARIFF_CHANGE: 'Modificare tarif',
    QUANTITY_CHANGE: 'Modificare cantitate',
    MULTIPLE: 'Multiple',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ro-RO');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
            {index}
          </span>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {amendment.amendment_number}
          </span>
        </div>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
          {AMENDMENT_TYPE_LABELS[amendment.amendment_type] || amendment.amendment_type}
        </span>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Data: {formatDate(amendment.amendment_date)}
      </p>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {amendment.new_contract_date_end && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-2 py-1.5">
            <span className="text-gray-500 dark:text-gray-400">Nouă dată:</span>
            <span className="font-medium text-gray-900 dark:text-white ml-1">{formatDate(amendment.new_contract_date_end)}</span>
          </div>
        )}
        {amendment.new_tariff_per_ton && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-2 py-1.5">
            <span className="text-gray-500 dark:text-gray-400">Nou tarif:</span>
            <span className="font-medium text-gray-900 dark:text-white ml-1">{amendment.new_tariff_per_ton} LEI/t</span>
          </div>
        )}
        {(amendment.new_contracted_quantity_tons || amendment.new_estimated_quantity_tons) && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-2 py-1.5">
            <span className="text-gray-500 dark:text-gray-400">Nouă cant.:</span>
            <span className="font-medium text-gray-900 dark:text-white ml-1">
              {parseFloat(amendment.new_contracted_quantity_tons || amendment.new_estimated_quantity_tons).toLocaleString('ro-RO')} t
            </span>
          </div>
        )}
      </div>

      {/* PDF Button for Amendment */}
      {amendment.amendment_file_url && (
        <button
          onClick={() => onViewPDF(
            amendment.amendment_file_url,
            amendment.amendment_file_name || `Act_Aditional_${index}.pdf`
          )}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:shadow-sm transition group"
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Vezi document act adițional
          </span>
          <Eye className="w-4 h-4 ml-auto text-red-400 group-hover:text-red-500 transition-colors" />
        </button>
      )}

      {amendment.changes_description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
          {amendment.changes_description}
        </p>
      )}
    </div>
  );
};

export default ContractViewModal;