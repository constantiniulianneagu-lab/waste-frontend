// src/components/contracts/ContractSidebar.jsx
/**
 * ============================================================================
 * CONTRACT SIDEBAR - WITH ATTRIBUTION TYPE + PDF UPLOAD + VALIDATION + AMENDMENTS
 * ============================================================================
 * Updated: Added attribution_type field as first field for DISPOSAL and TMB
 */

import { useState, useEffect } from 'react';
import {
  X, Save, Trash2, FileText, AlertTriangle, Plus,
  ChevronDown, ChevronUp, Calendar, FileCheck, Users,
  Percent, AlertCircle, CheckCircle, Gavel,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/apiClient';
import PDFUpload from '../common/PDFUpload';
import PDFViewerModal from '../common/PDFViewerModal';

// ============================================================================
// HELPER: Calculează zilele reale ale perioadei și cantitatea contractuală
// yearDays = 365 + numărul de 29 feb din intervalul [start, end]
// Astfel: un contract care nu include 29 feb ÷ 365, chiar dacă anul e bisect
// ============================================================================
const getContractDays = (startDate, endDate) => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  if (!start || !end || isNaN(start) || isNaN(end) || end <= start) return 365;
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const countFeb29InRange = (startDate, endDate) => {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  if (!start || !end || isNaN(start) || isNaN(end)) return 0;
  let count = 0;
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (isLeap) {
      const feb29 = new Date(year, 1, 29); // feb = luna 1 (0-indexed)
      if (feb29 >= start && feb29 <= end) count++;
    }
  }
  return count;
};

// Calculează cantitatea contractuală: cant_anuala × zile_reale / (365 + feb29_in_interval)
const calcContractQty = (annualQty, startDate, endDate) => {
  const days = getContractDays(startDate, endDate);
  const feb29Count = countFeb29InRange(startDate, endDate);
  const yearDays = 365 + feb29Count;
  return annualQty * days / yearDays;
};

// Calculează cantitatea anuală din cantitatea contractuală (inversul calcContractQty)
// cant_anuala = cant_contract / zile_reale × (365 + feb29_in_interval)
const calcAnnualQty = (contractQty, startDate, endDate) => {
  const days = getContractDays(startDate, endDate);
  const feb29Count = countFeb29InRange(startDate, endDate);
  const yearDays = 365 + feb29Count;
  if (!days || days <= 0) return 0;
  return contractQty * yearDays / days;
};


const AMENDMENT_TYPES = [
  { value: 'EXTENSION', label: 'Modificare perioadă / Prelungire' },
  { value: 'TERMINATION', label: 'Încetare contract' },
  { value: 'TARIFF_CHANGE', label: 'Modificare tarif' },
  { value: 'QUANTITY_CHANGE', label: 'Modificare cantitate' },
  { value: 'MULTIPLE', label: 'Modificări multiple' },
  { value: 'OTHER', label: 'Alte modificări' },
];

// Attribution types for contracts
const ATTRIBUTION_TYPES = [
  { value: 'PUBLIC_TENDER', label: 'Licitație deschisă' },
  { value: 'DIRECT_NEGOTIATION', label: 'Negociere fără publicare' },
];

// ============================================================================
// VALIDATION MODAL COMPONENT
// ============================================================================
const ValidationModal = ({ isOpen, onClose, onConfirm, errors, warnings, loading }) => {
  if (!isOpen) return null;

  const hasErrors = errors && errors.length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[130] p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 ${hasErrors ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                hasErrors 
                  ? 'bg-red-100 dark:bg-red-500/20' 
                  : 'bg-amber-100 dark:bg-amber-500/20'
              }`}>
                {hasErrors 
                  ? <AlertCircle className="w-5 h-5 text-red-600" />
                  : <AlertTriangle className="w-5 h-5 text-amber-600" />
                }
              </div>
              <div>
                <h3 className={`text-lg font-bold ${hasErrors ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'}`}>
                  {hasErrors ? 'Eroare la Validare' : 'Atenție'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {hasErrors ? 'Contractul nu poate fi salvat' : 'Verificați înainte de salvare'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {hasErrors && (
              <div className="space-y-2">
                {errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error.message}</p>
                  </div>
                ))}
              </div>
            )}

            {hasWarnings && (
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{warning.message}</p>
                      {warning.details && (
                        <div className="mt-1 text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                          {warning.details.contract_number && (
                            <p>Contract: <span className="font-semibold">{warning.details.contract_number}</span></p>
                          )}
                          {warning.details.period && (
                            <p>Perioadă: <span className="font-semibold">{warning.details.period}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                {hasErrors ? 'Închide' : 'Anulează'}
              </button>
              
              {!hasErrors && hasWarnings && (
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {loading ? 'Se salvează...' : 'Continuă și Salvează'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================
const ContractSidebar = ({
  isOpen,
  onClose,
  mode = 'add',
  contract = null,
  contractType = 'DISPOSAL',
  onSave,
  onDelete,
  saving = false,
  institutions = [],
  sectors = [],
}) => {
  // Form state
  const [formData, setFormData] = useState({
    attribution_type: '', // NEW: first field
    institution_id: '',
    contract_number: '',
    contract_date_start: '',
    contract_date_end: '',
    service_start_date: '',
    notes: '',
    is_active: true,
    sector_id: '',
    tariff_per_ton: '',
    cec_tax_per_ton: '',
    contracted_quantity_tons: '',
    estimated_quantity_tons: '',
    associate_institution_id: '',
    indicator_recycling_percent: '',
    indicator_energy_recovery_percent: '',
    indicator_disposal_percent: '',
    // PDF fields
    contract_file_url: '',
    contract_file_name: '',
    // TMB specific
    estimated_quantity_annual: '',
    service_order_file_url: '',
    service_order_file_name: '',
  });

  const [errors, setErrors] = useState({});
  // Când true, câmpul "Cant. estimată contract" a fost editat manual
  // și nu se mai suprascrie automat până la schimbarea cant. anuale sau datelor
  const [contractQtyOverride, setContractQtyOverride] = useState(false);
  const [amendments, setAmendments] = useState([]);
  const [amendmentsExpanded, setAmendmentsExpanded] = useState(false);
  const [loadingAmendments, setLoadingAmendments] = useState(false);
  const [amendmentForm, setAmendmentForm] = useState(null);
  const [savingAmendment, setSavingAmendment] = useState(false);
  
  // Validation
  const [validating, setValidating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  
  // PDF Viewer
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState('');
  const [pdfViewerFileName, setPdfViewerFileName] = useState('');

  // Delete amendment confirm modal
  const [deleteAmendConfirm, setDeleteAmendConfirm] = useState(null); // { id, number }

  // Filter institutions by type
  const filteredInstitutions = institutions.filter(i => {
    if (contractType === 'DISPOSAL') {
      return i.type === 'DISPOSAL_CLIENT' || i.type === 'LANDFILL';
    }
    if (contractType === 'TMB') {
      return i.type === 'TMB_OPERATOR';
    }
    if (contractType === 'AEROBIC') {
      return i.type === 'AEROBIC_OPERATOR';
    }
    if (contractType === 'ANAEROBIC') {
      return i.type === 'ANAEROBIC_OPERATOR';
    }
    if (contractType === 'WASTE_COLLECTOR') {
      return i.type === 'WASTE_COLLECTOR';
    }
    return true;
  });

  // TMB operators for associate field (exclude selected operator)
  const tmbOperatorsForAssociate = institutions.filter(i => 
    i.type === 'TMB_OPERATOR' && i.id !== formData.institution_id
  );
  
  // AEROBIC operators for associate field (exclude selected operator)
  const aerobicOperatorsForAssociate = institutions.filter(i => 
    i.type === 'AEROBIC_OPERATOR' && i.id !== formData.institution_id
  );
  
  // ANAEROBIC operators for associate field (exclude selected operator)
  const anaerobicOperatorsForAssociate = institutions.filter(i => 
    i.type === 'ANAEROBIC_OPERATOR' && i.id !== formData.institution_id
  );

  // Load contract data when editing/viewing
  useEffect(() => {
    if (!isOpen) return;

    if (contract && (mode === 'edit' || mode === 'view' || mode === 'delete')) {

      setFormData({
        attribution_type: contract.attribution_type || '',
        institution_id: contract.institution_id || '',
        contract_number: contract.contract_number || '',
        contract_date_start: contract.contract_date_start?.split('T')[0] || '',
        contract_date_end: contract.contract_date_end?.split('T')[0] || '',
        service_start_date: contract.service_start_date?.split('T')[0] || '',
        notes: contract.notes || '',
        is_active: contract.is_active ?? true,
        sector_id: contract.sector_id || '',
        tariff_per_ton: contract.tariff_per_ton || '',
        cec_tax_per_ton: contract.cec_tax_per_ton || '',
        contracted_quantity_tons: contract.contracted_quantity_tons || '',
        estimated_quantity_tons: contract.estimated_quantity_tons || '',
        associate_institution_id: contract.associate_institution_id || '',
        indicator_recycling_percent: contract.indicator_recycling_percent || '',
        indicator_energy_recovery_percent: contract.indicator_energy_recovery_percent || '',
        indicator_disposal_percent: contract.indicator_disposal_percent || '',
        contract_file_url: contract.contract_file_url || '',
        contract_file_name: contract.contract_file_name || '',
        estimated_quantity_annual: contract.estimated_quantity_annual || '',
        service_order_file_url: contract.service_order_file_url || '',
        service_order_file_name: contract.service_order_file_name || '',
      });
      
      if (mode === 'edit' || mode === 'view') {
        loadAmendments();
        setContractQtyOverride(false); // nu mai e nevoie de detecție complexă
      }
    } else {
      // Reset form for add mode
      setFormData({
        attribution_type: '',
        institution_id: '',
        contract_number: '',
        contract_date_start: '',
        contract_date_end: '',
        notes: '',
        is_active: true,
        sector_id: '',
        tariff_per_ton: '',
        cec_tax_per_ton: '',
        contracted_quantity_tons: '',
        estimated_quantity_tons: '',
        associate_institution_id: '',
        indicator_recycling_percent: '',
        indicator_energy_recovery_percent: '',
        indicator_disposal_percent: '',
        contract_file_url: '',
        contract_file_name: '',
        estimated_quantity_annual: '',
        service_order_file_url: '',
        service_order_file_name: '',
        service_start_date: '',
      });
      setAmendments([]);
    }
    setErrors({});
    setAmendmentForm(null);
  }, [contract?.id, contractType, mode, isOpen]);

  // Load amendments for existing contract
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
          endpoint = `/api/institutions/${contract.institution_id}/tmb-contracts/${contract.id}/amendments`;
          break;
        case 'AEROBIC':
          endpoint = `/api/institutions/${contract.institution_id}/aerobic-contracts/${contract.id}/amendments`;
          break;
        case 'ANAEROBIC':
          endpoint = `/api/institutions/${contract.institution_id}/anaerobic-contracts/${contract.id}/amendments`;
          break;
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // TMB: estimated_quantity_tons = cant. contract (principal, introdus manual)
    //      estimated_quantity_annual = derivat automat; se resetează când se schimbă cant. contract sau datele
    if (['estimated_quantity_tons', 'contract_date_start', 'contract_date_end'].includes(name)) {
      setContractQtyOverride(false);
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        estimated_quantity_annual: '',
        contracted_quantity_tons: '',
      }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
      return;
    }

    // Dacă utilizatorul editează direct câmpul anual → activăm override (valoarea rămâne salvată)
    if (name === 'contracted_quantity_tons' || name === 'estimated_quantity_annual') {
      setContractQtyOverride(true);
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle PDF upload
  const handlePDFChange = (fileData) => {
    if (fileData) {
      setFormData(prev => ({
        ...prev,
        contract_file_url: fileData.url,
        contract_file_name: fileData.fileName,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        contract_file_url: '',
        contract_file_name: '',
      }));
    }
  };

  // Handle service order PDF upload (TMB)
  const handleServiceOrderPDFChange = (fileData) => {
    if (fileData) {
      setFormData(prev => ({
        ...prev,
        service_order_file_url: fileData.url,
        service_order_file_name: fileData.fileName,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        service_order_file_url: '',
        service_order_file_name: '',
      }));
    }
  };

  // Handle view PDF
  const handleViewPDF = (url, fileName) => {
    setPdfViewerUrl(url);
    setPdfViewerFileName(fileName);
    setPdfViewerOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.attribution_type && (contractType === 'DISPOSAL' || contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC')) {
      newErrors.attribution_type = 'Selectați tipul de atribuire';
    }
    if (!formData.institution_id) {
      newErrors.institution_id = 'Selectați operatorul';
    }
    if (!formData.contract_number) {
      newErrors.contract_number = 'Introduceți numărul contractului';
    }
    if (!formData.contract_date_start) {
      newErrors.contract_date_start = 'Selectați data contractului';
    }
    if (!formData.sector_id) {
      newErrors.sector_id = 'Selectați sectorul';
    }
    if (contractType === 'DISPOSAL' && !formData.tariff_per_ton) {
      newErrors.tariff_per_ton = 'Introduceți tariful';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Server-side validation
  const validateServer = async () => {
    setValidating(true);
    try {
      let endpoint = '';
      switch (contractType) {
        case 'DISPOSAL':
          // Skip server validation for DISPOSAL (endpoint not implemented yet)
          return true;
        case 'TMB':
          // Skip server validation for TMB (endpoint not implemented)
          return true;
        default:
          return true;
      }

      const response = await apiPost(endpoint, {
        id: contract?.id,
        ...formData,
      });

      if (response.success) {
        const { errors: serverErrors, warnings: serverWarnings } = response;
        
        if (serverErrors?.length > 0) {
          setValidationErrors(serverErrors);
          setValidationWarnings(serverWarnings || []);
          setShowValidationModal(true);
          return false;
        }
        
        if (serverWarnings?.length > 0) {
          setValidationErrors([]);
          setValidationWarnings(serverWarnings);
          setShowValidationModal(true);
          return false;
        }
        
        return true;
      }
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      return true;
    } finally {
      setValidating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Ensure contract_number keeps the required prefix (D- / TMB-)
    const normalizeContractNumber = (type, num) => {
      const raw = (num || '').trim();
      if (!raw) return raw;

      // Enforce prefixes for all contract types
      const expectedPrefix = 
        type === 'TMB' ? 'TMB-' : 
        type === 'DISPOSAL' ? 'D-' : 
        type === 'AEROBIC' ? 'TA-' :
        type === 'ANAEROBIC' ? 'TAN-' :
        null;
      
      if (!expectedPrefix) return raw;

      // If already correct, keep
      if (raw.startsWith(expectedPrefix)) return raw;

      // If user typed another known prefix, strip it then add the expected one
      const base = raw.replace(/^(D-|TMB-|TA-|TAN-|C-)/, '');
      return `${expectedPrefix}${base}`;
    };

    const normalizedFormData = {
      ...formData,
      contract_number: normalizeContractNumber(contractType, formData.contract_number),
    };

    // DISPOSAL: calculează contracted_quantity_tons = cant_anuala × zile_reale / zile_an (365 sau 366)
    if (contractType === 'DISPOSAL') {
      if (contractQtyOverride && formData.contracted_quantity_tons) {
        normalizedFormData.contracted_quantity_tons = parseFloat(formData.contracted_quantity_tons) || null;
      } else {
        const annualQty = parseFloat(formData.estimated_quantity_tons) || 0;
        normalizedFormData.contracted_quantity_tons = annualQty > 0
          ? calcContractQty(annualQty, formData.contract_date_start, formData.contract_date_end)
          : null;
      }
    }

    // AEROBIC / ANAEROBIC: același calcul
    if (contractType === 'AEROBIC' || contractType === 'ANAEROBIC') {
      if (contractQtyOverride && formData.contracted_quantity_tons) {
        normalizedFormData.contracted_quantity_tons = parseFloat(formData.contracted_quantity_tons) || null;
      } else {
        const annualQty = parseFloat(formData.estimated_quantity_tons) || 0;
        normalizedFormData.contracted_quantity_tons = annualQty > 0
          ? calcContractQty(annualQty, formData.contract_date_start, formData.contract_date_end)
          : null;
      }
    }

    // TMB: estimated_quantity_tons = cant. pe contract (introdusă manual, baza calculelor)
    //      estimated_quantity_annual = cant. anuală — dacă override activ → valoarea manuală, altfel calculată
    if (contractType === 'TMB') {
      if (contractQtyOverride && formData.estimated_quantity_annual && parseFloat(formData.estimated_quantity_annual) > 0) {
        normalizedFormData.estimated_quantity_annual = parseFloat(formData.estimated_quantity_annual);
      } else {
        const contractQty = parseFloat(formData.estimated_quantity_tons) || 0;
        normalizedFormData.estimated_quantity_annual = contractQty > 0 && formData.contract_date_start && formData.contract_date_end
          ? calcAnnualQty(contractQty, formData.contract_date_start, formData.contract_date_end)
          : null;
      }
    }
    
    const canProceed = await validateServer();
    if (canProceed) {
      onSave(normalizedFormData);
    }
  };

  // Handle confirm from validation modal
  const handleConfirmSave = () => {
    setShowValidationModal(false);

    // Keep required prefixes (D- / TMB- / TA- / TAN-) on confirm save as well
    const expectedPrefix = 
      contractType === 'TMB' ? 'TMB-' : 
      contractType === 'DISPOSAL' ? 'D-' :
      contractType === 'AEROBIC' ? 'TA-' :
      contractType === 'ANAEROBIC' ? 'TAN-' :
      null;
    const raw = (formData.contract_number || '').trim();
    const base = raw.replace(/^(D-|TMB-|TA-|TAN-)/, '');
    const contract_number = expectedPrefix ? (raw.startsWith(expectedPrefix) ? raw : `${expectedPrefix}${base}`) : raw;

    onSave({
      ...formData,
      contract_number,
      // DISPOSAL / AEROBIC / ANAEROBIC: respectă override manual, altfel calculează
      ...(['DISPOSAL', 'AEROBIC', 'ANAEROBIC'].includes(contractType) && (() => {
        if (contractQtyOverride && formData.contracted_quantity_tons) {
          return { contracted_quantity_tons: parseFloat(formData.contracted_quantity_tons) || null };
        }
        const annualQty = parseFloat(formData.estimated_quantity_tons) || 0;
        return { contracted_quantity_tons: annualQty > 0
          ? calcContractQty(annualQty, formData.contract_date_start, formData.contract_date_end)
          : null };
      })()),
      // TMB: estimated_quantity_annual = cant. anuală derivată; trimite manual dacă override, altfel calculează
      ...(contractType === 'TMB' && (() => {
        if (contractQtyOverride && formData.estimated_quantity_annual && parseFloat(formData.estimated_quantity_annual) > 0) {
          return { estimated_quantity_annual: parseFloat(formData.estimated_quantity_annual) };
        }
        const contractQty = parseFloat(formData.estimated_quantity_tons) || 0;
        return { estimated_quantity_annual: contractQty > 0 && formData.contract_date_start && formData.contract_date_end
          ? calcAnnualQty(contractQty, formData.contract_date_start, formData.contract_date_end)
          : null };
      })()),
    });
  };

  // Amendment handlers
  const handleAddAmendment = () => {
    const lastNum = amendments.length > 0
      ? Math.max(...amendments.map(a => {
          const m = a.amendment_number?.match(/-(\d+)$/);
          return m ? parseInt(m[1]) : 0;
        }))
      : 0;
    
    const baseNumber = formData.contract_number.replace(/^(D-|TMB-|TA-|TAN-|C-)/, '');
    const prefix = 
      contractType === 'TMB' ? 'TMB' : 
      contractType === 'DISPOSAL' ? 'D' :
      contractType === 'AEROBIC' ? 'TA' :
      contractType === 'ANAEROBIC' ? 'TAN' :
      'C';
    
    setAmendmentForm({
      amendment_number: `${prefix}-${baseNumber}-${lastNum + 1}`,
      amendment_date: new Date().toISOString().split('T')[0],
      effective_date: new Date().toISOString().split('T')[0],
      amendment_type: 'EXTENSION',
      new_contract_date_end: '',
      // Pre-populate cu valorile curente efective ale contractului
      new_tariff_per_ton: contract.effective_tariff ?? contract.tariff_per_ton ?? '',
      new_cec_tax_per_ton: contract.effective_cec ?? contract.cec_tax_per_ton ?? '',
      new_contracted_quantity_tons: contract.contracted_quantity_tons ?? '',
      new_estimated_quantity_tons: contract.estimated_quantity_tons ?? '',
      changes_description: '',
      amendment_file_url: '',
      amendment_file_name: '',
      amendment_file_size: null,
    });
  };

  const handleEditAmendment = (a) => {
    // Format date to YYYY-MM-DD for input[type="date"]
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0]; // Takes only YYYY-MM-DD part
    };

    setAmendmentForm({
      id: a.id,
      amendment_number: a.amendment_number || '',
      amendment_date: formatDateForInput(a.amendment_date),
      effective_date: formatDateForInput(a.effective_date || a.amendment_date),
      amendment_type: a.amendment_type || 'EXTENSION',
      new_contract_date_start: formatDateForInput(a.new_contract_date_start),
      new_contract_date_end: formatDateForInput(a.new_contract_date_end),
      new_tariff_per_ton: a.new_tariff_per_ton || '',
      new_cec_tax_per_ton: a.new_cec_tax_per_ton || '',
      new_contracted_quantity_tons: a.new_contracted_quantity_tons || '',
      new_estimated_quantity_tons: a.new_estimated_quantity_tons || '',
      // TMB specific indicators
      new_indicator_recycling_percent: a.new_indicator_recycling_percent || '',
      new_indicator_energy_recovery_percent: a.new_indicator_energy_recovery_percent || '',
      new_indicator_disposal_percent: a.new_indicator_disposal_percent || '',
      // Other fields
      changes_description: a.changes_description || '',
      reason: a.reason || '',
      notes: a.notes || '',
      amendment_file_url: a.amendment_file_url || '',
      amendment_file_name: a.amendment_file_name || '',
      // amendment_file_size removed - doesn't exist in DB
      reference_contract_id: a.reference_contract_id || '',
      quantity_adjustment_auto: a.quantity_adjustment_auto || '',
    });
  };

  const handleAmendmentInputChange = async (e) => {
    const { name, value } = e.target;
    
    // Update field
    setAmendmentForm(prev => {
      const updated = { ...prev, [name]: value };
      // Dacă se schimbă amendment_date și effective_date era identică, sincronizează automat
      if (name === 'amendment_date' && prev.effective_date === prev.amendment_date) {
        updated.effective_date = value;
      }
      // Când se schimbă tipul, golește câmpurile care nu aparțin noului tip
      if (name === 'amendment_type') {
        const isExtOrTerm = value === 'EXTENSION' || value === 'TERMINATION';
        const isTariff = value === 'TARIFF_CHANGE';
        const isQty = value === 'QUANTITY_CHANGE';
        const isMultiple = value === 'MULTIPLE';
        // Golește data dacă noul tip nu are câmp dată
        if (!isExtOrTerm && !isMultiple) {
          updated.new_contract_date_end = '';
        }
        // Golește tariful dacă noul tip nu modifică tariful
        if (!isTariff && !isMultiple) {
          updated.new_tariff_per_ton = '';
          updated.new_cec_tax_per_ton = '';
        }
        // Golește cantitatea dacă noul tip nu modifică cantitatea
        if (!isQty && !isExtOrTerm && !isMultiple) {
          updated.new_estimated_quantity_tons = '';
          updated.new_contracted_quantity_tons = '';
        }
      }
      return updated;
    });
    
    // CALCUL PROPORȚIONAL ÎN TIMP REAL
    // Când user schimbă new_contract_date_end pentru EXTENSION sau TERMINATION
    if (name === 'new_contract_date_end' && 
        (amendmentForm.amendment_type === 'EXTENSION' || amendmentForm.amendment_type === 'TERMINATION') && 
        value && 
        contract.contract_date_start && 
        contract.contract_date_end) {
      
      const isTermination = amendmentForm.amendment_type === 'TERMINATION';

      // Calculează cantitatea proporțional
      const calculateProportional = () => {
        try {
          const originalStart = new Date(contract.contract_date_start);
          const originalEnd = new Date(contract.contract_date_end);
          const newEnd = new Date(value);
          
          // Validare
          if (isNaN(originalStart.getTime()) || isNaN(originalEnd.getTime()) || isNaN(newEnd.getTime())) {
            return null;
          }

          const MS_PER_DAY = 1000 * 60 * 60 * 24;

          if (isTermination) {
            // INCETARE: calculează cantitatea de la start până la noua dată de încetare
            // Folosim effective_date_end dacă există (prelungiri anterioare)
            const effectiveEnd = amendments
              .filter(a => (a.amendment_type === 'EXTENSION' || a.amendment_type === 'PRELUNGIRE') && a.new_contract_date_end)
              .map(a => new Date(a.new_contract_date_end))
              .filter(d => !isNaN(d.getTime()))
              .sort((a, b) => b - a)[0] || originalEnd;

            // Rata zilnică din contractul original
            const totalDays = Math.round((originalEnd - originalStart) / MS_PER_DAY);
            const actualDays = Math.round((newEnd - originalStart) / MS_PER_DAY);

            if (totalDays <= 0 || actualDays <= 0) return null;
            if (newEnd >= effectiveEnd) return null; // nu are sens să încetem după data efectivă

            const originalQty = contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC'
              ? parseFloat(contract.estimated_quantity_tons || 0)
              : parseFloat(contract.contracted_quantity_tons || 0);

            if (originalQty <= 0) return null;

            const dailyRate = originalQty / totalDays;
            const newQty = dailyRate * actualDays;

            console.log(`📊 Calcul INCETARE: ${actualDays} zile × ${dailyRate.toFixed(4)} t/zi = ${newQty.toFixed(3)}t`);
            return Math.round(newQty * 1000) / 1000;
          }
          
          // Găsește ultima dată de prelungire din amendments existente
          const lastExtensionEnd = amendments
            .filter(a => a.amendment_type === 'EXTENSION' || a.amendment_type === 'PRELUNGIRE')
            .filter(a => a.new_contract_date_end)
            .map(a => new Date(a.new_contract_date_end))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => b - a)[0]; // Ultima dată (cea mai recentă)
          
          // Începutul prelungirii = ultima prelungire SAU data originală
          const extensionStartDate = lastExtensionEnd || originalEnd;
          
          if (newEnd <= extensionStartDate) {
            return null; // Data nouă trebuie să fie după ultima prelungire
          }
          
          // IMPORTANT: totalDays = perioada ORIGINALĂ (pentru rate zilnic)
          const totalDays = Math.round((originalEnd - originalStart) / MS_PER_DAY);
          
          // extensionDays = zile de la ultima prelungire până la noua dată
          const extensionDays = Math.round((newEnd - extensionStartDate) / MS_PER_DAY);
          
          if (totalDays <= 0 || extensionDays <= 0) return null;
          
          // Cantitate originală (ÎNTOTDEAUNA din contract inițial)
          const originalQty = contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC'
            ? parseFloat(contract.estimated_quantity_tons || 0)
            : parseFloat(contract.contracted_quantity_tons || 0);
          
          if (originalQty <= 0) return null;
          
          // Formula: (cantitate_originală / zile_originale) × zile_noi_prelungire
          const dailyRate = originalQty / totalDays;
          const proportionalQty = dailyRate * extensionDays;
          
          console.log('📊 Calcul Proporțional:');
          console.log(`  - Perioadă originală: ${totalDays} zile (${originalQty}t)`);
          console.log(`  - Rate zilnic: ${dailyRate.toFixed(4)} t/zi`);
          console.log(`  - Prelungire de la: ${extensionStartDate.toISOString().split('T')[0]}`);
          console.log(`  - Prelungire până la: ${newEnd.toISOString().split('T')[0]}`);
          console.log(`  - Zile adăugate: ${extensionDays} zile`);
          console.log(`  - Cantitate calculată: ${proportionalQty.toFixed(3)}t`);
          
          return Math.round(proportionalQty * 1000) / 1000; // 3 decimale
        } catch (err) {
          console.error('Proportional calculation error:', err);
          return null;
        }
      };
      
      const calculatedQty = calculateProportional();
      
      if (calculatedQty !== null) {
        // Auto-populează cantitatea calculată
        const qtyField = contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC'
          ? 'new_estimated_quantity_tons'
          : 'new_contracted_quantity_tons';
        
        setAmendmentForm(prev => ({ 
          ...prev, 
          [name]: value,
          [qtyField]: calculatedQty.toString()
        }));
        
        console.log(`💡 Cantitate calculată automat: ${calculatedQty}t pentru ${calculatedQty} zile de prelungire`);
      }
    }
  };

  const handleAmendmentPDFChange = (fileData) => {
    if (fileData) {
      setAmendmentForm(prev => ({
        ...prev,
        amendment_file_url: fileData.url,
        amendment_file_name: fileData.fileName,
        amendment_file_size: fileData.fileSize || null,
      }));
    } else {
      setAmendmentForm(prev => ({
        ...prev,
        amendment_file_url: '',
        amendment_file_name: '',
        amendment_file_size: null,
      }));
    }
  };

  // Generate amendment details for preview
  const getAmendmentDetails = (a) => {
    const details = [];
    
    // Extension - new end date
    if (a.new_contract_date_end && (a.amendment_type === 'EXTENSION' || a.amendment_type === 'PRELUNGIRE')) {
      details.push(`Prelungire până: ${formatDate(a.new_contract_date_end)}`);
    }
    
    // Tariff change
    if (a.new_tariff_per_ton) {
      details.push(`Nou tarif: ${a.new_tariff_per_ton} lei/t`);
    }
    
    // CEC tax change (DISPOSAL)
    if (a.new_cec_tax_per_ton) {
      details.push(`Nou CEC: ${a.new_cec_tax_per_ton} lei/t`);
    }
    
    // Quantity change
    const qtyField = (contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') 
      ? a.new_estimated_quantity_tons 
      : a.new_contracted_quantity_tons;
    if (qtyField) {
      details.push(`Nouă cantitate: ${qtyField} t`);
    }
    
    // TMB indicators
    if (a.new_indicator_recycling_percent) {
      details.push(`Reciclare: ${a.new_indicator_recycling_percent}%`);
    }
    if (a.new_indicator_energy_recovery_percent) {
      details.push(`Recuperare energetică: ${a.new_indicator_energy_recovery_percent}%`);
    }
    if (a.new_indicator_disposal_percent) {
      details.push(`Depozitare: ${a.new_indicator_disposal_percent}%`);
    }
    
    return details.length > 0 ? details.join(' • ') : null;
  };

  const handleSaveAmendment = async () => {
    if (!amendmentForm.amendment_number || !amendmentForm.amendment_date) {
      alert('Numărul și data sunt obligatorii');
      return;
    }
    
    setSavingAmendment(true);
    try {
      let endpoint = '';
      switch (contractType) {
        case 'DISPOSAL':
          endpoint = `/api/institutions/${contract.institution_id}/disposal-contracts/${contract.id}/amendments`;
          break;
        case 'TMB':
          endpoint = `/api/institutions/${contract.institution_id}/tmb-contracts/${contract.id}/amendments`;
          break;
        case 'AEROBIC':
          endpoint = `/api/institutions/${contract.institution_id}/aerobic-contracts/${contract.id}/amendments`;
          break;
        case 'ANAEROBIC':
          endpoint = `/api/institutions/${contract.institution_id}/anaerobic-contracts/${contract.id}/amendments`;
          break;
        default:
          return;
      }
      
      // Map amendment types for contracts with Romanian validation
      let payload = { ...amendmentForm };
      
      // Type mapping (English → Romanian)
      const typeMap = {
        'EXTENSION': 'PRELUNGIRE',
        'TARIFF_CHANGE': 'MODIFICARE_TARIF',
        'QUANTITY_CHANGE': 'MODIFICARE_CANTITATE',
        'MULTIPLE': 'MANUAL',
        'TERMINATION': 'INCETARE'
      };
      
      // Apply mapping for all contract types (some may use Romanian types in DB)
      if (typeMap[payload.amendment_type]) {
        payload.amendment_type = typeMap[payload.amendment_type];
      }
      
      const response = amendmentForm.id
        ? await apiPut(`${endpoint}/${amendmentForm.id}`, payload)
        : await apiPost(endpoint, payload);
      
      if (response.success) {
        // Show message if quantity was auto-calculated
        if (response.quantity_auto_calculated) {
          const qtyField = (contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') 
            ? 'new_estimated_quantity_tons' 
            : 'new_contracted_quantity_tons';
          const calculatedQty = response.data[qtyField];
          alert(`✅ Act adițional salvat cu succes!\n\n💡 Cantitate calculată automat: ${calculatedQty} tone\n(proporțional cu perioada de prelungire)`);
        }
        
        setAmendmentForm(null);
        loadAmendments();
      } else {
        alert(response.message || 'Eroare la salvare');
      }
    } catch (err) {
      console.error('Save amendment error:', err);
      alert('Eroare la salvare');
    } finally {
      setSavingAmendment(false);
    }
  };

  const handleDeleteAmendment = (id, number) => {
    setDeleteAmendConfirm({ id, number });
  };

  const handleConfirmDeleteAmendment = async () => {
    const { id } = deleteAmendConfirm;
    setDeleteAmendConfirm(null);
    try {
      let endpoint = '';
      switch (contractType) {
        case 'DISPOSAL':
          endpoint = `/api/institutions/${contract.institution_id}/disposal-contracts/${contract.id}/amendments/${id}`;
          break;
        case 'TMB':
          endpoint = `/api/institutions/${contract.institution_id}/tmb-contracts/${contract.id}/amendments/${id}`;
          break;
        case 'AEROBIC':
          endpoint = `/api/institutions/${contract.institution_id}/aerobic-contracts/${contract.id}/amendments/${id}`;
          break;
        case 'ANAEROBIC':
          endpoint = `/api/institutions/${contract.institution_id}/anaerobic-contracts/${contract.id}/amendments/${id}`;
          break;
        default:
          return;
      }
      
      const response = await apiDelete(endpoint);
      if (response.success) {
        loadAmendments();
      } else {
        alert(response.message || 'Eroare la ștergere');
      }
    } catch (err) {
      console.error('Delete amendment error:', err);
    }
  };

  // Helpers
  const isReadOnly = mode === 'view' || mode === 'delete';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ro-RO') : '-';
  
  const calculateTotalValue = () => {
    if (contractType === 'TMB') {
      const t = parseFloat(formData.tariff_per_ton) || 0;
      const q = parseFloat(formData.estimated_quantity_tons) || 0;
      return t * q;
    } else if (contractType === 'AEROBIC' || contractType === 'ANAEROBIC') {
      const t = parseFloat(formData.tariff_per_ton) || 0;
      const q = parseFloat(formData.estimated_quantity_tons) || 0;
      return t * q;
    } else {
      const t = parseFloat(formData.tariff_per_ton) || 0;
      const c = parseFloat(formData.cec_tax_per_ton) || 0;
      const q = parseFloat(formData.contracted_quantity_tons) || 0;
      return (t + c) * q;
    }
  };

  const getTitle = () => {
    const labels = { 
      DISPOSAL: 'Depozitare', 
      WASTE_COLLECTOR: 'Colectare', 
      TMB: 'TMB',
      AEROBIC: 'Aerobă',
      ANAEROBIC: 'Anaerobă',
      SORTING: 'Sortare'
    };
    const l = labels[contractType] || '';
    switch (mode) {
      case 'add':
      case 'create': return `Adaugă Contract ${l}`;
      case 'edit': return `Editează Contract ${l}`;
      case 'view': return `Detalii Contract ${l}`;
      case 'delete': return 'Șterge Contract';
      default: return 'Contract';
    }
  };

  const getAttributionLabel = (value) => {
    const found = ATTRIBUTION_TYPES.find(t => t.value === value);
    return found ? found.label : value || '-';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={onClose} />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-[110] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mode === 'delete' 
                ? 'bg-red-100 dark:bg-red-500/20' 
                : 'bg-gradient-to-br from-teal-500 to-emerald-600'
            }`}>
              {mode === 'delete' 
                ? <AlertTriangle className="w-5 h-5 text-red-600" /> 
                : <FileText className="w-5 h-5 text-white" />
              }
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{getTitle()}</h2>
              {contract && mode !== 'add' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{contract.contract_number}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'delete' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmare ștergere</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ștergeți contractul <strong>{contract?.contract_number}</strong>?
              </p>
              {amendments.length > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                  Atenție: {amendments.length} acte adiționale vor fi șterse!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* ===================================================================
                  TMB CONTRACT FORM - 2 COLUMN COMPACT LAYOUT
                  =================================================================== */}
              {contractType === 'TMB' ? (
                <div className="space-y-3">

                  {/* ROW 1: Tip Atribuire - full width */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      <Gavel className="w-3 h-3 inline mr-1" />
                      Tip Atribuire <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="attribution_type"
                      value={formData.attribution_type}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.attribution_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    >
                      <option value="">Selectează tipul de atribuire...</option>
                      {ATTRIBUTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.attribution_type && <p className="mt-1 text-xs text-red-600">{errors.attribution_type}</p>}
                  </div>

                  {/* ROW 2: Operator TMB | Asociat */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Operator TMB <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="institution_id"
                        value={formData.institution_id}
                        onChange={handleInputChange}
                        disabled={isReadOnly || mode === 'edit'}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.institution_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează...</option>
                        {filteredInstitutions.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                      {errors.institution_id && <p className="mt-1 text-xs text-red-600">{errors.institution_id}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Asociat <span className="text-gray-400 font-normal">(opțional)</span>
                      </label>
                      <select
                        name="associate_institution_id"
                        value={formData.associate_institution_id}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      >
                        <option value="">Fără asociat</option>
                        {tmbOperatorsForAssociate.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ROW 3: Număr Contract | Data Contract */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Număr Contract <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contract_number"
                        value={formData.contract_number}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        placeholder="TMB-123"
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      />
                      {errors.contract_number && <p className="mt-1 text-xs text-red-600">{errors.contract_number}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Data Contract <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="contract_date_start"
                        value={formData.contract_date_start}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_date_start ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      />
                      {errors.contract_date_start && <p className="mt-1 text-xs text-red-600">{errors.contract_date_start}</p>}
                    </div>
                  </div>

                  {/* ROW 4: Durată (Data Sfârșit) | Data Începere Serviciu */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Durată (Data Sfârșit)
                      </label>
                      <input
                        type="date"
                        name="contract_date_end"
                        value={formData.contract_date_end}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Data Începere Serviciu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="service_start_date"
                        value={formData.service_start_date}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.service_start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      />
                      {errors.service_start_date && <p className="mt-1 text-xs text-red-600">{errors.service_start_date}</p>}
                    </div>
                  </div>

                  {/* ROW 5: U.A.T. (Sector) | Tarif (LEI/t) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        U.A.T. (Sector) <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sector_id"
                        value={formData.sector_id}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează...</option>
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.sector_name}</option>
                        ))}
                      </select>
                      {errors.sector_id && <p className="mt-1 text-xs text-red-600">{errors.sector_id}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Tarif (LEI/t)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="tariff_per_ton"
                        value={formData.tariff_per_ton}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.tariff_per_ton ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      />
                      {errors.tariff_per_ton && <p className="mt-1 text-xs text-red-600">{errors.tariff_per_ton}</p>}
                    </div>
                  </div>

                  {/* ROW 6: Cant. estimată contract (manual) | Cant. estimată anual (calculată, editabilă) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Cant. estimată contract (tone)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="estimated_quantity_tons"
                        value={formData.estimated_quantity_tons}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <p className="mt-1 text-xs text-gray-400">Introdus manual</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Cant. estimată anual (tone)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="estimated_quantity_annual"
                        value={
                          formData.estimated_quantity_annual !== '' && formData.estimated_quantity_annual != null
                            ? formData.estimated_quantity_annual
                            : (() => {
                                const qty = parseFloat(formData.estimated_quantity_tons) || 0;
                                if (!qty || !formData.contract_date_start || !formData.contract_date_end) return '';
                                return calcAnnualQty(qty, formData.contract_date_start, formData.contract_date_end).toFixed(2);
                              })()
                        }
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        placeholder="Calculat automat"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                      <p className="mt-1 text-xs text-gray-400">= cant. contract × zile an / zile contract</p>
                    </div>
                  </div>

                  {/* Valoare Totală — bazată direct pe cantitatea contract */}
                  {(formData.tariff_per_ton && formData.estimated_quantity_tons) && (() => {
                    const contractQty = parseFloat(formData.estimated_quantity_tons) || 0;
                    const val = (parseFloat(formData.tariff_per_ton) || 0) * contractQty;
                    if (val <= 0) return null;
                    return (
                      <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-lg border border-teal-200 dark:border-teal-500/20 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Valoare Totală Estimată:</span>
                        <span className="text-base font-bold text-teal-700 dark:text-teal-400">
                          {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(val)}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Indicatori de Performanță - 3 coloane */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-3">
                      <Percent className="w-3 h-3 text-teal-500" />
                      Indicatori de Performanță
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1 leading-tight">
                          % Reciclare
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            name="indicator_recycling_percent"
                            value={formData.indicator_recycling_percent}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white disabled:opacity-60"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1 leading-tight">
                          % Val. energetică
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            name="indicator_energy_recovery_percent"
                            value={formData.indicator_energy_recovery_percent}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white disabled:opacity-60"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1 leading-tight">
                          % Depozitare
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            name="indicator_disposal_percent"
                            value={formData.indicator_disposal_percent}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white disabled:opacity-60"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROW: Document Contract | Document Ordin Începere */}
                  <div className="grid grid-cols-2 gap-3">
                    <PDFUpload
                      label="Document Contract"
                      value={formData.contract_file_url ? { url: formData.contract_file_url, fileName: formData.contract_file_name } : null}
                      onChange={handlePDFChange}
                      onView={handleViewPDF}
                      disabled={isReadOnly}
                      contractType={contractType}
                      contractNumber={formData.contract_number}
                      compact={true}
                    />
                    <PDFUpload
                      label="Ordin de Începere"
                      value={formData.service_order_file_url ? { url: formData.service_order_file_url, fileName: formData.service_order_file_name } : null}
                      onChange={handleServiceOrderPDFChange}
                      onView={(url, name) => { setPdfViewerUrl(url); setPdfViewerFileName(name); setPdfViewerOpen(true); }}
                      disabled={isReadOnly}
                      contractType={contractType}
                      contractNumber={formData.contract_number ? formData.contract_number + '_ordin' : ''}
                      compact={true}
                    />
                  </div>

                  {/* Observații */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Observații
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                      placeholder="Observații adiționale..."
                    />
                  </div>

                  {/* Contract activ */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contract activ</label>
                  </div>

                </div>
              ) : (
                <div className="space-y-5">

                {/* ================================================================
                    DISPOSAL FORM - 2 COLUMN COMPACT LAYOUT
                    ================================================================ */}
                {contractType === 'DISPOSAL' ? (
                  <div className="space-y-3">

                    {/* ROW 1: Tip Atribuire - full width */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        <Gavel className="w-3 h-3 inline mr-1" />
                        Tip Atribuire <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="attribution_type"
                        value={formData.attribution_type}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.attribution_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează tipul de atribuire...</option>
                        {ATTRIBUTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.attribution_type && <p className="mt-1 text-xs text-red-600">{errors.attribution_type}</p>}
                    </div>

                    {/* ROW 2: Operator Depozitare - full width */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Operator Depozitare <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="institution_id"
                        value={formData.institution_id}
                        onChange={handleInputChange}
                        disabled={isReadOnly || mode === 'edit'}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.institution_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează...</option>
                        {filteredInstitutions.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                      {errors.institution_id && <p className="mt-1 text-xs text-red-600">{errors.institution_id}</p>}
                    </div>

                    {/* ROW 3: Număr Contract | Data Contract */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Număr Contract <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contract_number"
                          value={formData.contract_number}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="D-123"
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.contract_number && <p className="mt-1 text-xs text-red-600">{errors.contract_number}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Data Contract <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="contract_date_start"
                          value={formData.contract_date_start}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_date_start ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.contract_date_start && <p className="mt-1 text-xs text-red-600">{errors.contract_date_start}</p>}
                      </div>
                    </div>

                    {/* ROW 4: Durată (Data Sfârșit) | Data Începere Serviciu */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Durată (Data Sfârșit)
                        </label>
                        <input
                          type="date"
                          name="contract_date_end"
                          value={formData.contract_date_end}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Data Începere Serviciu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="service_start_date"
                          value={formData.service_start_date}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.service_start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.service_start_date && <p className="mt-1 text-xs text-red-600">{errors.service_start_date}</p>}
                      </div>
                    </div>

                    {/* ROW 5: U.A.T. (Sector) - full width */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        U.A.T. (Sector) <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sector_id"
                        value={formData.sector_id}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează...</option>
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.sector_name}</option>
                        ))}
                      </select>
                      {errors.sector_id && <p className="mt-1 text-xs text-red-600">{errors.sector_id}</p>}
                    </div>

                    {/* ROW 6: Tarif | Taxa CEC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Tarif (LEI/t) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number" step="0.01"
                          name="tariff_per_ton"
                          value={formData.tariff_per_ton}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.tariff_per_ton ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.tariff_per_ton && <p className="mt-1 text-xs text-red-600">{errors.tariff_per_ton}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Taxa CEC (LEI/t)
                        </label>
                        <input
                          type="number" step="0.01"
                          name="cec_tax_per_ton"
                          value={formData.cec_tax_per_ton}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* ROW 7: Cant. estimată contract (manual) | Cant. estimată anual (calculată, editabilă) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Cant. estimată contract (tone)
                        </label>
                        <input
                          type="number" step="0.01"
                          name="estimated_quantity_tons"
                          value={formData.estimated_quantity_tons}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">Introdus manual</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Cant. estimată anual (tone)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="estimated_quantity_annual"
                          value={
                            formData.estimated_quantity_annual !== '' && formData.estimated_quantity_annual != null
                              ? formData.estimated_quantity_annual
                              : (() => {
                                  const qty = parseFloat(formData.estimated_quantity_tons) || 0;
                                  if (!qty || !formData.contract_date_start || !formData.contract_date_end) return '';
                                  return calcAnnualQty(qty, formData.contract_date_start, formData.contract_date_end).toFixed(2);
                                })()
                          }
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="Calculat automat"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">= cant. contract × zile an / zile contract</p>
                      </div>
                    </div>

                    {/* Valoare Totală */}
                    {(formData.estimated_quantity_tons && formData.tariff_per_ton) && (() => {
                      const contractQty = parseFloat(formData.estimated_quantity_tons) || 0;
                      const tarif = parseFloat(formData.tariff_per_ton) || 0;
                      const valTarif = tarif * contractQty;
                      if (valTarif <= 0) return null;
                      const fmt = (v) => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(v);
                      return (
                        <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-lg border border-teal-200 dark:border-teal-500/20 flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Valoare Totală Estimată:</span>
                          <span className="text-base font-bold text-teal-700 dark:text-teal-400">{fmt(valTarif)}</span>
                        </div>
                      );
                    })()}

                    {/* ROW: Document Contract | Ordin de Începere */}
                    <div className="grid grid-cols-2 gap-3">
                      <PDFUpload
                        label="Document Contract"
                        value={formData.contract_file_url ? { url: formData.contract_file_url, fileName: formData.contract_file_name } : null}
                        onChange={handlePDFChange}
                        onView={handleViewPDF}
                        disabled={isReadOnly}
                        contractType={contractType}
                        contractNumber={formData.contract_number}
                        compact={true}
                      />
                      <PDFUpload
                        label="Ordin de Începere"
                        value={formData.service_order_file_url ? { url: formData.service_order_file_url, fileName: formData.service_order_file_name } : null}
                        onChange={handleServiceOrderPDFChange}
                        onView={(url, name) => { setPdfViewerUrl(url); setPdfViewerFileName(name); setPdfViewerOpen(true); }}
                        disabled={isReadOnly}
                        contractType={contractType}
                        contractNumber={formData.contract_number ? formData.contract_number + '_ordin' : ''}
                        compact={true}
                      />
                    </div>

                    {/* Observații */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Observații
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                        placeholder="Observații adiționale..."
                      />
                    </div>

                    {/* Contract activ */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contract activ</label>
                    </div>

                  </div>
                ) : contractType === 'ANAEROBIC' ? (
                  /* ================================================================
                     ANAEROBIC FORM - 2 COLUMN COMPACT LAYOUT
                     ================================================================ */
                  <div className="space-y-3">

                    {/* ROW 1: Tip Atribuire - full width */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        <Gavel className="w-3 h-3 inline mr-1" />
                        Tip Atribuire <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="attribution_type"
                        value={formData.attribution_type}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.attribution_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează tipul de atribuire...</option>
                        {ATTRIBUTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.attribution_type && <p className="mt-1 text-xs text-red-600">{errors.attribution_type}</p>}
                    </div>

                    {/* ROW 2: Operator Anaerob - full width */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Operator Anaerob <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="institution_id"
                        value={formData.institution_id}
                        onChange={handleInputChange}
                        disabled={isReadOnly || mode === 'edit'}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.institution_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează...</option>
                        {filteredInstitutions.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                      {errors.institution_id && <p className="mt-1 text-xs text-red-600">{errors.institution_id}</p>}
                    </div>

                    {/* ROW 3: Număr Contract | Data Contract */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Număr Contract <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contract_number"
                          value={formData.contract_number}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="TAN-123"
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.contract_number && <p className="mt-1 text-xs text-red-600">{errors.contract_number}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Data Contract <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="contract_date_start"
                          value={formData.contract_date_start}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_date_start ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.contract_date_start && <p className="mt-1 text-xs text-red-600">{errors.contract_date_start}</p>}
                      </div>
                    </div>

                    {/* ROW 4: Durată | Data Începere Serviciu */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Durată (Data Sfârșit)
                        </label>
                        <input
                          type="date"
                          name="contract_date_end"
                          value={formData.contract_date_end}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Data Începere Serviciu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="service_start_date"
                          value={formData.service_start_date}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.service_start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.service_start_date && <p className="mt-1 text-xs text-red-600">{errors.service_start_date}</p>}
                      </div>
                    </div>

                    {/* ROW 5: U.A.T. (Sector) | Tarif */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          U.A.T. (Sector) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="sector_id"
                          value={formData.sector_id}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        >
                          <option value="">Selectează...</option>
                          {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.sector_name}</option>
                          ))}
                        </select>
                        {errors.sector_id && <p className="mt-1 text-xs text-red-600">{errors.sector_id}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Tarif (LEI/t)
                        </label>
                        <input
                          type="number" step="0.01"
                          name="tariff_per_ton"
                          value={formData.tariff_per_ton}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* ROW 6: Cant. estimată contract (manual) | Cant. estimată anual (calculată, editabilă) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Cant. estimată contract (tone)
                        </label>
                        <input
                          type="number" step="0.01"
                          name="estimated_quantity_tons"
                          value={formData.estimated_quantity_tons}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">Introdus manual</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Cant. estimată anual (tone)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="estimated_quantity_annual"
                          value={
                            formData.estimated_quantity_annual !== '' && formData.estimated_quantity_annual != null
                              ? formData.estimated_quantity_annual
                              : (() => {
                                  const qty = parseFloat(formData.estimated_quantity_tons) || 0;
                                  if (!qty || !formData.contract_date_start || !formData.contract_date_end) return '';
                                  return calcAnnualQty(qty, formData.contract_date_start, formData.contract_date_end).toFixed(2);
                                })()
                          }
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="Calculat automat"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">= cant. contract × zile an / zile contract</p>
                      </div>
                    </div>

                    {/* Valoare Totală — bazată direct pe cantitatea contract */}
                    {(formData.tariff_per_ton && formData.estimated_quantity_tons) && (() => {
                      const contractQty = parseFloat(formData.estimated_quantity_tons) || 0;
                      const val = (parseFloat(formData.tariff_per_ton) || 0) * contractQty;
                      if (val <= 0) return null;
                      return (
                        <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-lg border border-teal-200 dark:border-teal-500/20 flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Valoare Totală Estimată:</span>
                          <span className="text-base font-bold text-teal-700 dark:text-teal-400">
                            {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(val)}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Indicatori de Performanță */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <Percent className="w-3 h-3 text-teal-500" />
                        Indicator de Performanță
                      </h4>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Cantitatea totală de reziduuri trimisă la depozitare (%)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            name="indicator_disposal_percent"
                            value={formData.indicator_disposal_percent}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Ca procent din cantitatea totală de deșeuri biodegradabile receptionate</p>
                      </div>
                    </div>

                    {/* ROW: Document Contract | Ordin de Începere */}
                    <div className="grid grid-cols-2 gap-3">
                      <PDFUpload
                        label="Document Contract"
                        value={formData.contract_file_url ? { url: formData.contract_file_url, fileName: formData.contract_file_name } : null}
                        onChange={handlePDFChange}
                        onView={handleViewPDF}
                        disabled={isReadOnly}
                        contractType={contractType}
                        contractNumber={formData.contract_number}
                        compact={true}
                      />
                      <PDFUpload
                        label="Ordin de Începere"
                        value={formData.service_order_file_url ? { url: formData.service_order_file_url, fileName: formData.service_order_file_name } : null}
                        onChange={handleServiceOrderPDFChange}
                        onView={(url, name) => { setPdfViewerUrl(url); setPdfViewerFileName(name); setPdfViewerOpen(true); }}
                        disabled={isReadOnly}
                        contractType={contractType}
                        contractNumber={formData.contract_number ? formData.contract_number + '_ordin' : ''}
                        compact={true}
                      />
                    </div>

                    {/* Observații */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Observații
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                        placeholder="Observații adiționale..."
                      />
                    </div>

                    {/* Contract activ */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contract activ</label>
                    </div>

                  </div>
                ) : contractType === 'AEROBIC' ? (
                  /* ================================================================
                     AEROBIC FORM - 2 COLUMN COMPACT LAYOUT
                     ================================================================ */
                  <div className="space-y-3">

                    {/* ROW 1: Tip Atribuire - full width */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        <Gavel className="w-3 h-3 inline mr-1" />
                        Tip Atribuire <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="attribution_type"
                        value={formData.attribution_type}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.attribution_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează tipul de atribuire...</option>
                        {ATTRIBUTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.attribution_type && <p className="mt-1 text-xs text-red-600">{errors.attribution_type}</p>}
                    </div>

                    {/* ROW 2: Operator Aerob | Asociat */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Operator Aerob <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="institution_id"
                          value={formData.institution_id}
                          onChange={handleInputChange}
                          disabled={isReadOnly || mode === 'edit'}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.institution_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        >
                          <option value="">Selectează...</option>
                          {filteredInstitutions.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                        {errors.institution_id && <p className="mt-1 text-xs text-red-600">{errors.institution_id}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Asociat (opțional)
                        </label>
                        <select
                          name="associate_institution_id"
                          value={formData.associate_institution_id}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        >
                          <option value="">Fără asociat</option>
                          {aerobicOperatorsForAssociate.map(i => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* ROW 3: Număr Contract | Data Contract */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Număr Contract <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contract_number"
                          value={formData.contract_number}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="TA-123"
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.contract_number && <p className="mt-1 text-xs text-red-600">{errors.contract_number}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Data Contract <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="contract_date_start"
                          value={formData.contract_date_start}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_date_start ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.contract_date_start && <p className="mt-1 text-xs text-red-600">{errors.contract_date_start}</p>}
                      </div>
                    </div>

                    {/* ROW 4: Durată (Data Sfârșit) | Data Începere Serviciu */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Durată (Data Sfârșit)
                        </label>
                        <input
                          type="date"
                          name="contract_date_end"
                          value={formData.contract_date_end}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Data Începere Serviciu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="service_start_date"
                          value={formData.service_start_date}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.service_start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        />
                        {errors.service_start_date && <p className="mt-1 text-xs text-red-600">{errors.service_start_date}</p>}
                      </div>
                    </div>

                    {/* ROW 5: U.A.T. (Sector) | Tarif */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          U.A.T. (Sector) <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="sector_id"
                          value={formData.sector_id}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                        >
                          <option value="">Selectează...</option>
                          {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.sector_name}</option>
                          ))}
                        </select>
                        {errors.sector_id && <p className="mt-1 text-xs text-red-600">{errors.sector_id}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Tarif (LEI/t)
                        </label>
                        <input
                          type="number" step="0.01"
                          name="tariff_per_ton"
                          value={formData.tariff_per_ton}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* ROW 6: Cant. estimată contract (manual) | Cant. estimată anual (calculată, editabilă) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Cant. estimată contract (tone)
                        </label>
                        <input
                          type="number" step="0.01"
                          name="estimated_quantity_tons"
                          value={formData.estimated_quantity_tons}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">Introdus manual</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Cant. estimată anual (tone)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="estimated_quantity_annual"
                          value={
                            formData.estimated_quantity_annual !== '' && formData.estimated_quantity_annual != null
                              ? formData.estimated_quantity_annual
                              : (() => {
                                  const qty = parseFloat(formData.estimated_quantity_tons) || 0;
                                  if (!qty || !formData.contract_date_start || !formData.contract_date_end) return '';
                                  return calcAnnualQty(qty, formData.contract_date_start, formData.contract_date_end).toFixed(2);
                                })()
                          }
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          placeholder="Calculat automat"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                        <p className="mt-1 text-xs text-gray-400">= cant. contract × zile an / zile contract</p>
                      </div>
                    </div>

                    {/* Valoare Totală */}
                    {(formData.tariff_per_ton && formData.estimated_quantity_tons) && (() => {
                      const contractQty = parseFloat(formData.estimated_quantity_tons) || 0;
                      const val = (parseFloat(formData.tariff_per_ton) || 0) * contractQty;
                      if (val <= 0) return null;
                      return (
                        <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-lg border border-teal-200 dark:border-teal-500/20 flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Valoare Totală:</span>
                          <span className="text-base font-bold text-teal-700 dark:text-teal-400">
                            {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(val)}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Indicatori de Performanță */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <Percent className="w-3 h-3 text-teal-500" />
                        Indicator de Performanță
                      </h4>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                          Cantitatea totală de reziduuri trimisă la depozitare (%)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            name="indicator_disposal_percent"
                            value={formData.indicator_disposal_percent}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Ca procent din cantitatea totală de deșeuri biodegradabile receptionate</p>
                      </div>
                    </div>

                    {/* ROW: Document Contract | Ordin de Începere */}
                    <div className="grid grid-cols-2 gap-3">
                      <PDFUpload
                        label="Document Contract"
                        value={formData.contract_file_url ? { url: formData.contract_file_url, fileName: formData.contract_file_name } : null}
                        onChange={handlePDFChange}
                        onView={handleViewPDF}
                        disabled={isReadOnly}
                        contractType={contractType}
                        contractNumber={formData.contract_number}
                        compact={true}
                      />
                      <PDFUpload
                        label="Ordin de Începere"
                        value={formData.service_order_file_url ? { url: formData.service_order_file_url, fileName: formData.service_order_file_name } : null}
                        onChange={handleServiceOrderPDFChange}
                        onView={(url, name) => { setPdfViewerUrl(url); setPdfViewerFileName(name); setPdfViewerOpen(true); }}
                        disabled={isReadOnly}
                        contractType={contractType}
                        contractNumber={formData.contract_number ? formData.contract_number + '_ordin' : ''}
                        compact={true}
                      />
                    </div>

                    {/* Observații */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Observații
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                        placeholder="Observații adiționale..."
                      />
                    </div>

                    {/* Contract activ */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Contract activ</label>
                    </div>

                  </div>
                ) : (
                  /* ================================================================
                     OTHER CONTRACTS (SORTING, WASTE_COLLECTOR)
                     ================================================================ */
                  <div className="space-y-5">

                  {/* ATTRIBUTION TYPE */}
                  {contractType === 'AEROBIC' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <Gavel className="w-4 h-4 inline mr-1" />
                        Tip Atribuire <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="attribution_type"
                        value={formData.attribution_type}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.attribution_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      >
                        <option value="">Selectează tipul de atribuire...</option>
                        {ATTRIBUTION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.attribution_type && <p className="mt-1 text-xs text-red-600">{errors.attribution_type}</p>}
                    </div>
                  )}

                  {/* OPERATOR */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {contractType === 'AEROBIC' ? 'Operator Aerob' :
                       'Instituție'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="institution_id"
                      value={formData.institution_id}
                      onChange={handleInputChange}
                      disabled={isReadOnly || mode === 'edit'}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.institution_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    >
                      <option value="">Selectează...</option>
                      {filteredInstitutions.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                    {errors.institution_id && <p className="mt-1 text-xs text-red-600">{errors.institution_id}</p>}
                  </div>

                  {/* CONTRACT NUMBER */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Număr Contract <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contract_number"
                      value={formData.contract_number}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      placeholder={contractType === 'AEROBIC' ? 'TA-123' : 'C-123'}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    />
                    {errors.contract_number && <p className="mt-1 text-xs text-red-600">{errors.contract_number}</p>}
                  </div>

                  {/* DATES */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Data Contract <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="contract_date_start"
                        value={formData.contract_date_start}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.contract_date_start ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                      />
                      {errors.contract_date_start && <p className="mt-1 text-xs text-red-600">{errors.contract_date_start}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Durată (Data Sfârșit)
                      </label>
                      <input
                        type="date"
                        name="contract_date_end"
                        value={formData.contract_date_end}
                        onChange={handleInputChange}
                        disabled={isReadOnly}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* SERVICE START DATE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Data Începere Serviciu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="service_start_date"
                      value={formData.service_start_date}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.service_start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    />
                    {errors.service_start_date && <p className="mt-1 text-xs text-red-600">{errors.service_start_date}</p>}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">📅 Data de la care începe efectiv prestarea serviciului</p>
                  </div>

                  {/* SECTOR */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      U.A.T. (Sector) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sector_id"
                      value={formData.sector_id}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    >
                      <option value="">Selectează...</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.id}>{s.sector_name}</option>
                      ))}
                    </select>
                    {errors.sector_id && <p className="mt-1 text-xs text-red-600">{errors.sector_id}</p>}
                  </div>

                  {/* TARIFF */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tarif (LEI/t)
                    </label>
                    <input
                      type="number" step="0.01"
                      name="tariff_per_ton"
                      value={formData.tariff_per_ton}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Cantitate Estimată (tone)
                    </label>
                    <input
                      type="number" step="0.01"
                      name="estimated_quantity_tons"
                      value={formData.estimated_quantity_tons}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  {/* TOTAL VALUE */}
                  {(formData.tariff_per_ton && formData.estimated_quantity_tons) && (
                    <div className="p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-200 dark:border-teal-500/20 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Valoare Totală:</span>
                      <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                        {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(calculateTotalValue())}
                      </span>
                    </div>
                  )}

                  {/* AEROBIC: Indicator de Performanță */}
                  {contractType === 'AEROBIC' && (
                    <>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Percent className="w-4 h-4 text-teal-500" />
                          Indicator de Performanță
                        </h4>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Cantitatea totală de reziduuri trimisă la depozitare (%)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number" step="0.01" min="0" max="100"
                              name="indicator_disposal_percent"
                              value={formData.indicator_disposal_percent}
                              onChange={handleInputChange}
                              disabled={isReadOnly}
                              placeholder="0.00"
                              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Ca procent din cantitatea totală de deșeuri biodegradabile receptionate
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* PDF Upload */}
                  <PDFUpload
                    label="Document Contract (PDF)"
                    value={formData.contract_file_url ? { url: formData.contract_file_url, fileName: formData.contract_file_name } : null}
                    onChange={handlePDFChange}
                    onView={handleViewPDF}
                    disabled={isReadOnly}
                    contractType={contractType}
                    contractNumber={formData.contract_number}
                  />

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Observații
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                      placeholder="Observații adiționale..."
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-5 h-5 rounded-lg border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contract activ
                    </label>
                  </div>

                  </div>
                )} {/* end DISPOSAL ternary */}

                </div>
              )} {/* end non-TMB form */}

              {/* ================= AMENDMENTS SECTION ================= */}
              {(mode === 'edit' || mode === 'view') && (contractType === 'DISPOSAL' || contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAmendmentsExpanded(!amendmentsExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Acte Adiționale
                      </span>
                      {amendments.length > 0 && (
                        <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full">
                          {amendments.length}
                        </span>
                      )}
                    </div>
                    {amendmentsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {amendmentsExpanded && (
                    <div className="p-4 space-y-3">
                      {loadingAmendments ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
                        </div>
                      ) : (
                        <>
                          {amendments.map((a) => (
                            <div key={a.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                                      {a.amendment_number}
                                    </span>
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                                      {AMENDMENT_TYPES.find(t => t.value === a.amendment_type)?.label || a.amendment_type}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                                    <div>
                                      <Calendar className="w-3 h-3 inline mr-1" />
                                      {formatDate(a.amendment_date)}
                                    </div>
                                    {a.effective_date && a.effective_date.split('T')[0] !== a.amendment_date?.split('T')[0] && (
                                      <div className="text-xs text-amber-600 dark:text-amber-400">
                                        <span className="font-medium">Intră în vigoare:</span> {formatDate(a.effective_date)}
                                      </div>
                                    )}
                                    {getAmendmentDetails(a) && (
                                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        {getAmendmentDetails(a)}
                                      </div>
                                    )}
                                    {a.changes_description && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                                        {a.changes_description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {mode === 'edit' && (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEditAmendment(a)}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAmendment(a.id, a.amendment_number)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {amendments.length === 0 && !amendmentForm && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                              Nu există acte adiționale
                            </p>
                          )}

                          {/* Amendment Form */}
                          {amendmentForm && (
                            <div className="p-4 border-2 border-dashed border-teal-300 dark:border-teal-500/50 rounded-xl space-y-3 bg-teal-50/50 dark:bg-teal-500/5">
                              <h5 className="text-sm font-bold text-teal-700 dark:text-teal-400">
                                {amendmentForm.id ? 'Editare Act Adițional' : 'Act Adițional Nou'}
                              </h5>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Număr <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="amendment_number"
                                    value={amendmentForm.amendment_number}
                                    onChange={handleAmendmentInputChange}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Data Semnării <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="date"
                                    name="amendment_date"
                                    value={amendmentForm.amendment_date}
                                    onChange={handleAmendmentInputChange}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>

                              {/* Data intrării în vigoare - full width */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Data Intrării în Vigoare
                                  <span className="ml-1 text-gray-400 dark:text-gray-500 font-normal">(implicit = data semnării)</span>
                                </label>
                                <input
                                  type="date"
                                  name="effective_date"
                                  value={amendmentForm.effective_date || amendmentForm.amendment_date}
                                  onChange={handleAmendmentInputChange}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Tip Modificare
                                </label>
                                <select
                                  name="amendment_type"
                                  value={amendmentForm.amendment_type}
                                  onChange={handleAmendmentInputChange}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                >
                                  {AMENDMENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                              </div>

                              {(amendmentForm.amendment_type === 'EXTENSION' || amendmentForm.amendment_type === 'TERMINATION' || amendmentForm.amendment_type === 'MULTIPLE') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {amendmentForm.amendment_type === 'TERMINATION' ? 'Dată Încetare Contract' : 'Nouă Dată Sfârșit'}
                                  </label>
                                  <input
                                    type="date"
                                    name="new_contract_date_end"
                                    value={amendmentForm.new_contract_date_end}
                                    onChange={handleAmendmentInputChange}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                  />
                                  {amendmentForm.amendment_type === 'EXTENSION' && (
                                    <p className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1">
                                      <span className="mt-0.5">💡</span>
                                      <span>Pentru prelungiri, cantitatea se calculează automat proporțional cu perioada dacă nu este specificată manual.</span>
                                    </p>
                                  )}
                                  {amendmentForm.amendment_type === 'TERMINATION' && (
                                    <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1">
                                      <span className="mt-0.5">⚠️</span>
                                      <span>Cantitatea estimată se recalculează automat proporțional până la data încetării.</span>
                                    </p>
                                  )}
                                </div>
                              )}

                              {(amendmentForm.amendment_type === 'TARIFF_CHANGE' || amendmentForm.amendment_type === 'MULTIPLE') && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Noul Tarif
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      name="new_tariff_per_ton"
                                      value={amendmentForm.new_tariff_per_ton}
                                      onChange={handleAmendmentInputChange}
                                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  {contractType === 'DISPOSAL' && (
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Nouă Taxă CEC
                                      </label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        name="new_cec_tax_per_ton"
                                        value={amendmentForm.new_cec_tax_per_ton}
                                        onChange={handleAmendmentInputChange}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {(amendmentForm.amendment_type === 'QUANTITY_CHANGE' || amendmentForm.amendment_type === 'MULTIPLE' || amendmentForm.amendment_type === 'EXTENSION') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Nouă Cantitate (tone)
                                    {amendmentForm.amendment_type === 'EXTENSION' && (
                                      <span className="text-gray-500 ml-1.5">(opțional)</span>
                                    )}
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name={(contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') ? 'new_estimated_quantity_tons' : 'new_contracted_quantity_tons'}
                                    value={(contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') ? amendmentForm.new_estimated_quantity_tons : amendmentForm.new_contracted_quantity_tons}
                                    onChange={handleAmendmentInputChange}
                                    placeholder={amendmentForm.amendment_type === 'EXTENSION' ? 'Lasă gol pentru calcul automat' : ''}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                  />
                                  {amendmentForm.amendment_type === 'EXTENSION' && (
                                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                      Se va calcula proporțional: (cantitate_contract / zile_totale) × zile_prelungire
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* PDF Upload for Amendment */}
                              <PDFUpload
                                label="Document Act Adițional (PDF)"
                                value={amendmentForm.amendment_file_url ? { url: amendmentForm.amendment_file_url, fileName: amendmentForm.amendment_file_name } : null}
                                onChange={handleAmendmentPDFChange}
                                onView={handleViewPDF}
                                contractType={contractType}
                                contractNumber={formData.contract_number}
                                isAmendment={true}
                                amendmentNumber={amendmentForm.amendment_number}
                              />

                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Descriere
                                </label>
                                <textarea
                                  name="changes_description"
                                  value={amendmentForm.changes_description}
                                  onChange={handleAmendmentInputChange}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white resize-none"
                                />
                              </div>

                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setAmendmentForm(null)}
                                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  Anulează
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveAmendment}
                                  disabled={savingAmendment}
                                  className="flex-1 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                                >
                                  {savingAmendment 
                                    ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Save className="w-3 h-3" />
                                  }
                                  Salvează
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Add Amendment Button */}
                          {mode === 'edit' && !amendmentForm && (
                            <button
                              type="button"
                              onClick={handleAddAmendment}
                              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:text-teal-400 flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Adaugă Act Adițional
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
            >
              {mode === 'view' ? 'Închide' : 'Anulează'}
            </button>
            
            {mode === 'delete' ? (
              <button
                onClick={() => onDelete(contract)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {saving 
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                {saving ? 'Se șterge...' : 'Șterge'}
              </button>
            ) : mode !== 'view' && (
              <button
                onClick={handleSubmit}
                disabled={saving || validating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all"
              >
                {(saving || validating)
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save className="w-4 h-4" />
                }
                {validating ? 'Se verifică...' : saving ? 'Se salvează...' : ((mode === 'add' || mode === 'create') ? 'Adaugă' : 'Salvează')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onConfirm={handleConfirmSave}
        errors={validationErrors}
        warnings={validationWarnings}
        loading={saving}
      />

      {/* Delete Amendment Confirm Modal */}
      {deleteAmendConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteAmendConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
            </div>
            {/* Title */}
            <h3 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-2">
              Confirmare ștergere
            </h3>
            {/* Message */}
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-1">
              Ștergeți actul adițional
            </p>
            <p className="text-center font-semibold text-gray-900 dark:text-white mb-2">
              {deleteAmendConfirm.number}
            </p>
            <p className="text-center text-xs text-amber-600 dark:text-amber-400 mb-6">
              Această acțiune nu poate fi anulată. Fișierul PDF atașat va fi șters.
            </p>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteAmendConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors text-sm"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmDeleteAmendment}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ContractSidebar;