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

const AMENDMENT_TYPES = [
  { value: 'EXTENSION', label: 'Modificare perioadă (Prelungire)' },
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
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
  });

  const [errors, setErrors] = useState({});
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
      });
      
      if (mode === 'edit' || mode === 'view') {
        loadAmendments();
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
      });
      setAmendments([]);
    }
    setErrors({});
    setAmendmentForm(null);
  }, [contract, mode, isOpen]);

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
          endpoint = '/api/institutions/${contract.institution_id}/tmb-contracts/validate';
          break;
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
      amendment_type: 'EXTENSION',
      new_contract_date_end: '',
      new_tariff_per_ton: '',
      new_cec_tax_per_ton: '',
      new_contracted_quantity_tons: '',
      new_estimated_quantity_tons: '',
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
    setAmendmentForm(prev => ({ ...prev, [name]: value }));
    
    // CALCUL PROPORȚIONAL ÎN TIMP REAL
    // Când user schimbă new_contract_date_end pentru EXTENSION sau TERMINATION
    if (name === 'new_contract_date_end' && 
        (amendmentForm.amendment_type === 'EXTENSION' || amendmentForm.amendment_type === 'TERMINATION') && 
        value && 
        contract.contract_date_start && 
        contract.contract_date_end) {
      
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
          // IMPORTANT: totalDays = perioada ORIGINALĂ (pentru rata zilnică)
          const totalDays = Math.round((originalEnd - originalStart) / MS_PER_DAY);
          if (totalDays <= 0) return null;
          
          // Cantitate originală (ÎNTOTDEAUNA din contract inițial)
          const originalQty = contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC'
            ? parseFloat(contract.estimated_quantity_tons || 0)
            : parseFloat(contract.contracted_quantity_tons || 0);
          if (originalQty <= 0) return null;
          
          const dailyRate = originalQty / totalDays;
          
          if (amendmentForm.amendment_type === 'TERMINATION') {
            // INCETARE: zile de la start până la data încetării
            if (newEnd >= originalEnd) return null; // trebuie să fie înainte de end
            const effectiveDays = Math.round((newEnd - originalStart) / MS_PER_DAY);
            if (effectiveDays <= 0) return null;
            const proportionalQty = dailyRate * effectiveDays;
            console.log(`📊 Calcul INCETARE: ${effectiveDays} zile × ${dailyRate.toFixed(4)} t/zi = ${proportionalQty.toFixed(3)}t`);
            return Math.round(proportionalQty * 1000) / 1000;
          } else {
            // EXTENSION: zile adăugate după ultima prelungire sau după end original
            const lastExtensionEnd = amendments
              .filter(a => a.amendment_type === 'EXTENSION' || a.amendment_type === 'PRELUNGIRE')
              .filter(a => a.new_contract_date_end)
              .map(a => new Date(a.new_contract_date_end))
              .filter(d => !isNaN(d.getTime()))
              .sort((a, b) => b - a)[0];
            
            const extensionStartDate = lastExtensionEnd || originalEnd;
            if (newEnd <= extensionStartDate) return null;
            
            const extensionDays = Math.round((newEnd - extensionStartDate) / MS_PER_DAY);
            if (extensionDays <= 0) return null;
            const proportionalQty = dailyRate * extensionDays;
            console.log(`📊 Calcul PRELUNGIRE: ${extensionDays} zile × ${dailyRate.toFixed(4)} t/zi = ${proportionalQty.toFixed(3)}t`);
            return Math.round(proportionalQty * 1000) / 1000;
          }
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

  const handleDeleteAmendment = async (id) => {
    if (!confirm('Ștergeți actul adițional?')) return;
    
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
    if (contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') {
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
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
              
              {/* ================= ATTRIBUTION TYPE (FIRST FIELD) ================= */}
              {(contractType === 'DISPOSAL' || contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
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
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                      errors.attribution_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <option value="">Selectează tipul de atribuire...</option>
                    {ATTRIBUTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.attribution_type && (
                    <p className="mt-1 text-xs text-red-600">{errors.attribution_type}</p>
                  )}
                </div>
              )}

              {/* ================= OPERATOR / INSTITUTION ================= */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {contractType === 'TMB' ? 'Operator TMB' : 
                   contractType === 'DISPOSAL' ? 'Operator Depozitare' : 
                   contractType === 'AEROBIC' ? 'Operator Aerob' :
                   contractType === 'ANAEROBIC' ? 'Operator Anaerob' :
                   'Instituție'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleInputChange}
                  disabled={isReadOnly || mode === 'edit'}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                    errors.institution_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Selectează...</option>
                  {filteredInstitutions.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                {errors.institution_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.institution_id}</p>
                )}
              </div>

              {/* Contract Number */}
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
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                    errors.contract_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                  placeholder={
                    contractType === 'TMB' ? 'TMB-123' : 
                    contractType === 'DISPOSAL' ? 'D-123' :
                    contractType === 'AEROBIC' ? 'TA-123' :
                    contractType === 'ANAEROBIC' ? 'TAN-123' :
                    'C-123'
                  }
                />
                {errors.contract_number && (
                  <p className="mt-1 text-xs text-red-600">{errors.contract_number}</p>
                )}
              </div>

              {/* Dates */}
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
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                      errors.contract_date_start ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                  {errors.contract_date_start && (
                    <p className="mt-1 text-xs text-red-600">{errors.contract_date_start}</p>
                  )}
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

              {/* Service Start Date */}
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
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                    errors.service_start_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
                {errors.service_start_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.service_start_date}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  📅 Data de la care începe efectiv prestarea serviciului
                </p>
              </div>

              {/* U.A.T. (Sector) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  U.A.T. (Sector) <span className="text-red-500">*</span>
                </label>
                <select
                  name="sector_id"
                  value={formData.sector_id}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                    errors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <option value="">Selectează...</option>
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.sector_name}
                    </option>
                  ))}
                </select>
                {errors.sector_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.sector_id}</p>
                )}
              </div>

              {/* Tariff */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tarif (LEI/t) {contractType === 'DISPOSAL' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="tariff_per_ton"
                    value={formData.tariff_per_ton}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                      errors.tariff_per_ton ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.tariff_per_ton && (
                    <p className="mt-1 text-xs text-red-600">{errors.tariff_per_ton}</p>
                  )}
                </div>
                
                {contractType === 'DISPOSAL' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Taxa CEC (LEI/t)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cec_tax_per_ton"
                      value={formData.cec_tax_per_ton}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cantitate Estimată (tone)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name={(contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') ? 'estimated_quantity_tons' : 'contracted_quantity_tons'}
                  value={(contractType === 'TMB' || contractType === 'AEROBIC' || contractType === 'ANAEROBIC') ? formData.estimated_quantity_tons : formData.contracted_quantity_tons}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="0"
                />
              </div>

              {/* Total Value */}
              {(formData.tariff_per_ton && (formData.estimated_quantity_tons || formData.contracted_quantity_tons)) && (
                <div className="p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-200 dark:border-teal-500/20">
                  {contractType === 'DISPOSAL' ? (
                    // DISPOSAL: Afișare separată Tarif + CEC
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Valoare Tarif:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(
                            (parseFloat(formData.tariff_per_ton) || 0) * (parseFloat(formData.contracted_quantity_tons) || 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Valoare CEC:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(
                            (parseFloat(formData.cec_tax_per_ton) || 0) * (parseFloat(formData.contracted_quantity_tons) || 0)
                          )}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-teal-300 dark:border-teal-600">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Valoare Totală:
                          </span>
                          <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                            {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(calculateTotalValue())}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Other types: Single total
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Valoare Totală:
                      </span>
                      <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                        {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(calculateTotalValue())}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TMB SPECIFIC FIELDS ================= */}
              {contractType === 'TMB' && (
                <>
                  {/* Associate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Asociat (opțional)
                    </label>
                    <select
                      name="associate_institution_id"
                      value={formData.associate_institution_id}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="">Fără asociat</option>
                      {tmbOperatorsForAssociate.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Performance Indicators */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-teal-500" />
                      Indicatori de Performanță
                    </h4>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        1. % Deșeuri reciclabile → Reciclare
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          name="indicator_recycling_percent"
                          value={formData.indicator_recycling_percent}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        2. % Deșeuri → Valorificare energetică
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          name="indicator_energy_recovery_percent"
                          value={formData.indicator_energy_recovery_percent}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        3. % Deșeuri → Depozitare
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          name="indicator_disposal_percent"
                          value={formData.indicator_disposal_percent}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                          placeholder="0.00"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ================= AEROBIC & ANAEROBIC FIELDS ================= */}
              {(contractType === 'AEROBIC' || contractType === 'ANAEROBIC') && (
                <>
                  {/* Associate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Asociat (opțional)
                    </label>
                    <select
                      name="associate_institution_id"
                      value={formData.associate_institution_id}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="">Fără asociat</option>
                      {(contractType === 'AEROBIC' ? aerobicOperatorsForAssociate : anaerobicOperatorsForAssociate).map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Performance Indicator */}
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
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          name="indicator_disposal_percent"
                          value={formData.indicator_disposal_percent}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-60"
                          placeholder="0.00"
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

              {/* ================= AMENDMENTS SECTION ================= */}
              {(mode === 'edit' || mode === 'view') && (contractType === 'DISPOSAL' || contractType === 'TMB') && (
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
                                      onClick={() => handleDeleteAmendment(a.id)}
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
                                    Data <span className="text-red-500">*</span>
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
                                    {amendmentForm.amendment_type === 'TERMINATION' ? 'Data Încetare Contract' : 'Nouă Dată Sfârșit'}
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
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                                      <span className="mt-0.5">💡</span>
                                      <span>Cantitatea efectivă se calculează automat proporțional cu perioada de la start până la data încetării.</span>
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

                              {(amendmentForm.amendment_type === 'QUANTITY_CHANGE' || amendmentForm.amendment_type === 'MULTIPLE' || amendmentForm.amendment_type === 'EXTENSION' || amendmentForm.amendment_type === 'TERMINATION') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    {amendmentForm.amendment_type === 'TERMINATION' ? 'Cantitate Efectivă (tone)' : 'Nouă Cantitate (tone)'}
                                    {(amendmentForm.amendment_type === 'EXTENSION' || amendmentForm.amendment_type === 'TERMINATION') && (
                                      <span className="text-gray-500 ml-1.5">(opțional - se calculează automat)</span>
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