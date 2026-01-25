// src/components/contracts/ContractSidebar.jsx
/**
 * ============================================================================
 * CONTRACT SIDEBAR - WITH PDF UPLOAD + VALIDATION + AMENDMENTS
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import {
  X, Save, Trash2, FileText, AlertTriangle, Plus,
  ChevronDown, ChevronUp, Calendar, FileCheck, Users,
  Percent, AlertCircle, CheckCircle,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/apiClient';
import PDFUpload from '../common/PDFUpload';
import PDFViewerModal from '../common/PDFViewerModal';

const AMENDMENT_TYPES = [
  { value: 'EXTENSION', label: 'Prelungire perioadă' },
  { value: 'TARIFF_CHANGE', label: 'Modificare tarif' },
  { value: 'QUANTITY_CHANGE', label: 'Modificare cantitate' },
  { value: 'MULTIPLE', label: 'Modificări multiple' },
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
    // PDF fields
    contract_file_url: '',
    contract_file_name: '',
  });

  const [errors, setErrors] = useState({});
  const [amendments, setAmendments] = useState([]);
  const [loadingAmendments, setLoadingAmendments] = useState(false);
  const [showAmendments, setShowAmendments] = useState(false);
  const [amendmentForm, setAmendmentForm] = useState(null);
  const [savingAmendment, setSavingAmendment] = useState(false);

  // Validation modal state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [validating, setValidating] = useState(false);

  // PDF Viewer modal state
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState('');
  const [pdfViewerFileName, setPdfViewerFileName] = useState('');

  // Filter institutions based on contract type
  const filteredInstitutions = institutions.filter(inst => {
    switch (contractType) {
      case 'DISPOSAL':
        return inst.type === 'DISPOSAL_CLIENT' || inst.type === 'LANDFILL';
      case 'WASTE_COLLECTOR':
        return inst.type === 'WASTE_COLLECTOR';
      case 'TMB':
        return inst.type === 'TMB_OPERATOR' || inst.type === 'AEROBIC_OPERATOR' || inst.type === 'ANAEROBIC_OPERATOR';
      default:
        return true;
    }
  });

  // TMB operators for associate dropdown
  const tmbOperatorsForAssociate = institutions.filter(inst => 
    (inst.type === 'TMB_OPERATOR' || inst.type === 'AEROBIC_OPERATOR' || inst.type === 'ANAEROBIC_OPERATOR') &&
    inst.id !== parseInt(formData.institution_id)
  );

  // Initialize form data
  useEffect(() => {
    if (contract && (mode === 'edit' || mode === 'view' || mode === 'delete')) {
      setFormData({
        institution_id: contract.institution_id || '',
        contract_number: contract.contract_number || '',
        contract_date_start: contract.contract_date_start || '',
        contract_date_end: contract.contract_date_end || '',
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
    } else if (mode === 'add') {
      const prefix = contractType === 'DISPOSAL' ? 'D-' : contractType === 'TMB' ? 'TMB-' : 'C-';
      setFormData({
        institution_id: '',
        contract_number: prefix,
        contract_date_start: '',
        contract_date_end: '',
        notes: '',
        is_active: true,
        sector_id: '',
        tariff_per_ton: '',
        cec_tax_per_ton: '0',
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
    setShowAmendments(false);
    setShowValidationModal(false);
    setValidationErrors([]);
    setValidationWarnings([]);
  }, [contract, mode, isOpen, contractType]);

  // Load amendments
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle PDF upload change
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

  // Handle PDF view
  const handleViewPDF = (url, fileName) => {
    setPdfViewerUrl(url);
    setPdfViewerFileName(fileName);
    setPdfViewerOpen(true);
  };

  // Local validation (required fields)
  const validateLocal = () => {
    const newErrors = {};
    
    if (!formData.contract_number.trim()) {
      newErrors.contract_number = 'Numărul contractului este obligatoriu';
    }
    if (!formData.contract_date_start) {
      newErrors.contract_date_start = 'Data de început este obligatorie';
    }
    if (!formData.institution_id) {
      newErrors.institution_id = contractType === 'TMB' ? 'Selectați operatorul TMB' : 'Selectați instituția';
    }
    if (!formData.sector_id) {
      newErrors.sector_id = 'Selectați U.A.T. (sectorul)';
    }
    
    if (contractType === 'DISPOSAL') {
      if (!formData.tariff_per_ton || parseFloat(formData.tariff_per_ton) <= 0) {
        newErrors.tariff_per_ton = 'Tariful este obligatoriu';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Server validation
  const validateServer = async () => {
    setValidating(true);
    try {
      const endpoint = contractType === 'TMB' 
        ? '/api/contracts/validate/tmb'
        : '/api/contracts/validate/disposal';
      
      const payload = {
        id: contract?.id || null,
        institution_id: formData.institution_id,
        sector_id: formData.sector_id,
        contract_number: formData.contract_number,
        contract_date_start: formData.contract_date_start,
        contract_date_end: formData.contract_date_end,
      };

      const response = await apiPost(endpoint, payload);
      
      if (response.success) {
        setValidationErrors(response.errors || []);
        setValidationWarnings(response.warnings || []);
        
        if ((response.errors && response.errors.length > 0) || (response.warnings && response.warnings.length > 0)) {
          setShowValidationModal(true);
          return false;
        }
        
        return true;
      } else {
        console.error('Validation API error:', response.message);
        return true;
      }
    } catch (err) {
      console.error('Validation error:', err);
      return true;
    } finally {
      setValidating(false);
    }
  };

  // Handle submit with validation
  const handleSubmit = async () => {
    if (!validateLocal()) return;
    
    const canProceed = await validateServer();
    if (canProceed) {
      onSave(formData);
    }
  };

  // Handle confirm from validation modal
  const handleConfirmSave = () => {
    setShowValidationModal(false);
    onSave(formData);
  };

  // Amendment handlers
  const handleAddAmendment = () => {
    const lastNum = amendments.length > 0
      ? Math.max(...amendments.map(a => {
          const m = a.amendment_number?.match(/-(\d+)$/);
          return m ? parseInt(m[1]) : 0;
        }))
      : 0;
    
    const baseNumber = formData.contract_number.replace(/^(D-|TMB-|C-)/, '');
    const prefix = contractType === 'TMB' ? 'TMB' : contractType === 'DISPOSAL' ? 'D' : 'C';
    
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
    });
  };

  const handleEditAmendment = (a) => {
    setAmendmentForm({
      id: a.id,
      amendment_number: a.amendment_number || '',
      amendment_date: a.amendment_date || '',
      amendment_type: a.amendment_type || 'EXTENSION',
      new_contract_date_end: a.new_contract_date_end || '',
      new_tariff_per_ton: a.new_tariff_per_ton || '',
      new_cec_tax_per_ton: a.new_cec_tax_per_ton || '',
      new_contracted_quantity_tons: a.new_contracted_quantity_tons || '',
      new_estimated_quantity_tons: a.new_estimated_quantity_tons || '',
      changes_description: a.changes_description || '',
      amendment_file_url: a.amendment_file_url || '',
      amendment_file_name: a.amendment_file_name || '',
    });
  };

  const handleAmendmentInputChange = (e) => {
    const { name, value } = e.target;
    setAmendmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAmendmentPDFChange = (fileData) => {
    if (fileData) {
      setAmendmentForm(prev => ({
        ...prev,
        amendment_file_url: fileData.url,
        amendment_file_name: fileData.fileName,
      }));
    } else {
      setAmendmentForm(prev => ({
        ...prev,
        amendment_file_url: '',
        amendment_file_name: '',
      }));
    }
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
          endpoint = `/api/institutions/0/tmb-contracts/${contract.id}/amendments`;
          break;
        default:
          return;
      }
      
      const response = amendmentForm.id
        ? await apiPut(`${endpoint}/${amendmentForm.id}`, amendmentForm)
        : await apiPost(endpoint, amendmentForm);
      
      if (response.success) {
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
          endpoint = `/api/institutions/0/tmb-contracts/${contract.id}/amendments/${id}`;
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
    } else {
      const t = parseFloat(formData.tariff_per_ton) || 0;
      const c = parseFloat(formData.cec_tax_per_ton) || 0;
      const q = parseFloat(formData.contracted_quantity_tons) || 0;
      return (t + c) * q;
    }
  };

  const getTitle = () => {
    const labels = { DISPOSAL: 'Depozitare', WASTE_COLLECTOR: 'Colectare', TMB: 'TMB' };
    const l = labels[contractType] || '';
    switch (mode) {
      case 'add': return `Adaugă Contract ${l}`;
      case 'edit': return `Editează Contract ${l}`;
      case 'view': return `Detalii Contract ${l}`;
      case 'delete': return 'Șterge Contract';
      default: return 'Contract';
    }
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
              
              {/* Operator / Institution */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {contractType === 'TMB' ? 'Operator TMB' : 'Instituție'} <span className="text-red-500">*</span>
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
                  placeholder={contractType === 'TMB' ? 'TMB-123' : 'D-123'}
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
                      Sector {s.sector_number} - {s.sector_name}
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
                  name={contractType === 'TMB' ? 'estimated_quantity_tons' : 'contracted_quantity_tons'}
                  value={contractType === 'TMB' ? formData.estimated_quantity_tons : formData.contracted_quantity_tons}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="0"
                />
              </div>

              {/* Total Value */}
              {(formData.tariff_per_ton && (formData.estimated_quantity_tons || formData.contracted_quantity_tons)) && (
                <div className="p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-200 dark:border-teal-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valoare Totală:
                    </span>
                    <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                      {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(calculateTotalValue())}
                    </span>
                  </div>
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

              {/* ================= PDF UPLOAD FOR CONTRACT ================= */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                <PDFUpload
                  label="Document Contract (PDF)"
                  value={formData.contract_file_url ? { url: formData.contract_file_url, fileName: formData.contract_file_name } : null}
                  onChange={handlePDFChange}
                  onView={handleViewPDF}
                  contractType={contractType}
                  contractNumber={formData.contract_number}
                  disabled={isReadOnly}
                />
              </div>

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
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white resize-none disabled:opacity-60 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="Observații..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 disabled:opacity-60"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contract activ
                </label>
              </div>

              {/* ================= AMENDMENTS SECTION ================= */}
              {(mode === 'edit' || mode === 'view') && (contractType === 'DISPOSAL' || contractType === 'TMB') && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAmendments(!showAmendments)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Acte Adiționale
                      </span>
                      {amendments.length > 0 && (
                        <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 text-xs font-bold rounded-full">
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
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      {loadingAmendments ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                      ) : (
                        <>
                          {amendments.length === 0 && !amendmentForm && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                              Niciun act adițional
                            </p>
                          )}

                          {/* Existing Amendments */}
                          {amendments.map(a => (
                            <div key={a.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {a.amendment_number}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded">
                                      {AMENDMENT_TYPES.find(t => t.value === a.amendment_type)?.label || a.amendment_type}
                                    </span>
                                    {a.amendment_file_url && (
                                      <button
                                        type="button"
                                        onClick={() => handleViewPDF(a.amendment_file_url, a.amendment_file_name || 'Act aditional.pdf')}
                                        className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded flex items-center gap-1 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                                      >
                                        <FileText className="w-3 h-3" />
                                        PDF
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(a.amendment_date)}
                                  </p>
                                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                                    {a.new_contract_date_end && (
                                      <p>Nouă dată: <span className="font-medium">{formatDate(a.new_contract_date_end)}</span></p>
                                    )}
                                    {a.new_tariff_per_ton && (
                                      <p>Nou tarif: <span className="font-medium">{a.new_tariff_per_ton} LEI/t</span></p>
                                    )}
                                    {(a.new_contracted_quantity_tons || a.new_estimated_quantity_tons) && (
                                      <p>Nouă cantitate: <span className="font-medium">
                                        {parseFloat(a.new_contracted_quantity_tons || a.new_estimated_quantity_tons).toLocaleString('ro-RO')} t
                                      </span></p>
                                    )}
                                  </div>
                                </div>
                                
                                {mode === 'edit' && (
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditAmendment(a)}
                                      className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded transition-colors"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
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

                          {/* Amendment Form */}
                          {amendmentForm && (
                            <div className="p-4 bg-teal-50 dark:bg-teal-500/5 rounded-lg border border-teal-200 dark:border-teal-500/20 space-y-3">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {amendmentForm.id ? 'Editează' : 'Adaugă'} Act Adițional
                              </h5>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Număr *
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
                                    Data *
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
                                  Ce se modifică
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

                              {/* Conditional fields based on amendment type */}
                              {(amendmentForm.amendment_type === 'EXTENSION' || amendmentForm.amendment_type === 'MULTIPLE') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Nouă Dată Sfârșit
                                  </label>
                                  <input
                                    type="date"
                                    name="new_contract_date_end"
                                    value={amendmentForm.new_contract_date_end}
                                    onChange={handleAmendmentInputChange}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                  />
                                </div>
                              )}

                              {(amendmentForm.amendment_type === 'TARIFF_CHANGE' || amendmentForm.amendment_type === 'MULTIPLE') && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Nou Tarif (LEI/t)
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

                              {(amendmentForm.amendment_type === 'QUANTITY_CHANGE' || amendmentForm.amendment_type === 'MULTIPLE') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Nouă Cantitate (tone)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    name={contractType === 'TMB' ? 'new_estimated_quantity_tons' : 'new_contracted_quantity_tons'}
                                    value={contractType === 'TMB' ? amendmentForm.new_estimated_quantity_tons : amendmentForm.new_contracted_quantity_tons}
                                    onChange={handleAmendmentInputChange}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                                  />
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
                {validating ? 'Se verifică...' : saving ? 'Se salvează...' : (mode === 'add' ? 'Adaugă' : 'Salvează')}
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