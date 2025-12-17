// src/constants/institutionTypes.js
/**
 * ============================================================================
 * INSTITUTION TYPES - CONSTANTS & LABELS
 * ============================================================================
 * 
 * Definește toate tipurile de instituții și label-urile lor în română/engleză
 * 
 * IMPORTANT: Sincronizat cu backend și database
 * - WASTE_COLLECTOR = Operatori de colectare deșeuri (ex: ROMPREST, ECOSAL)
 * - TMB_OPERATOR = Operatori TMB care procesează deșeuri
 * - RECYCLING_CLIENT = Companii de reciclare
 * - LANDFILL = Depozite de deșeuri
 * 
 * Created: 2024-12-17
 * ============================================================================
 */

// ============================================================================
// INSTITUTION TYPES - Backend Values
// ============================================================================
export const INSTITUTION_TYPES = {
    WASTE_COLLECTOR: 'WASTE_COLLECTOR',    // Operatori colectare (ex: ROMPREST)
    TMB_OPERATOR: 'TMB_OPERATOR',           // Operatori TMB (procesare)
    RECYCLING_CLIENT: 'RECYCLING_CLIENT',   // Companii reciclare
    LANDFILL: 'LANDFILL',                   // Depozite
    SORTING_STATION: 'SORTING_STATION',     // Stații sortare (opțional)
    MUNICIPALITY: 'MUNICIPALITY'             // Municipalitate (opțional)
  };
  
  // ============================================================================
  // LABELS ROMÂNĂ - Pentru UI
  // ============================================================================
  export const INSTITUTION_TYPE_LABELS_RO = {
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Operator Colectare',
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'Operator TMB',
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Client Reciclare',
    [INSTITUTION_TYPES.LANDFILL]: 'Depozit',
    [INSTITUTION_TYPES.SORTING_STATION]: 'Stație Sortare',
    [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipalitate'
  };
  
  // ============================================================================
  // LABELS ENGLEZĂ - Pentru raportare/export
  // ============================================================================
  export const INSTITUTION_TYPE_LABELS_EN = {
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Waste Collection Operator',
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'Mechanical-Biological Treatment Operator',
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Recycling Client',
    [INSTITUTION_TYPES.LANDFILL]: 'Landfill Operator',
    [INSTITUTION_TYPES.SORTING_STATION]: 'Sorting Station',
    [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipality'
  };
  
  // ============================================================================
  // DESCRIERI DETALIATE - Pentru tooltips/help text
  // ============================================================================
  export const INSTITUTION_TYPE_DESCRIPTIONS = {
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Operatori care colectează deșeuri de la populație și agenți economici (ex: ROMPREST, ECOSAL)',
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'Operatori care procesează deșeuri prin tratare mecano-biologică',
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Companii care preiau materiale reciclabile pentru procesare',
    [INSTITUTION_TYPES.LANDFILL]: 'Depozite ecologice pentru deșeuri',
    [INSTITUTION_TYPES.SORTING_STATION]: 'Stații de sortare deșeuri',
    [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipalități sau instituții publice'
  };
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Obține label-ul pentru un tip de instituție
   * @param {string} type - Tipul instituției (ex: 'WASTE_COLLECTOR')
   * @param {string} lang - Limba ('ro' sau 'en')
   * @returns {string} Label-ul formatat
   */
  export const getInstitutionTypeLabel = (type, lang = 'ro') => {
    if (!type) return '';
    
    const labels = lang === 'en' 
      ? INSTITUTION_TYPE_LABELS_EN 
      : INSTITUTION_TYPE_LABELS_RO;
    
    return labels[type] || type;
  };
  
  /**
   * Obține descrierea pentru un tip de instituție
   * @param {string} type - Tipul instituției
   * @returns {string} Descrierea
   */
  export const getInstitutionTypeDescription = (type) => {
    if (!type) return '';
    return INSTITUTION_TYPE_DESCRIPTIONS[type] || '';
  };
  
  /**
   * Verifică dacă un tip este valid
   * @param {string} type - Tipul de verificat
   * @returns {boolean}
   */
  export const isValidInstitutionType = (type) => {
    return Object.values(INSTITUTION_TYPES).includes(type);
  };
  
  /**
   * Obține toate tipurile ca array pentru dropdown-uri
   * @returns {Array} Array de { value, label }
   */
  export const getInstitutionTypesForDropdown = (lang = 'ro') => {
    const labels = lang === 'en' 
      ? INSTITUTION_TYPE_LABELS_EN 
      : INSTITUTION_TYPE_LABELS_RO;
    
    return Object.entries(INSTITUTION_TYPES).map(([key, value]) => ({
      value,
      label: labels[value],
      description: INSTITUTION_TYPE_DESCRIPTIONS[value]
    }));
  };
  
  // ============================================================================
  // ICON MAPPING - Pentru UI (opțional, dacă folosești lucide-react)
  // ============================================================================
  export const INSTITUTION_TYPE_ICONS = {
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Truck',           // lucide: Truck
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'Factory',            // lucide: Factory
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Recycle',        // lucide: Recycle
    [INSTITUTION_TYPES.LANDFILL]: 'Mountain',               // lucide: Mountain
    [INSTITUTION_TYPES.SORTING_STATION]: 'PackageSearch',  // lucide: PackageSearch
    [INSTITUTION_TYPES.MUNICIPALITY]: 'Building'            // lucide: Building
  };
  
  // ============================================================================
  // COLOR MAPPING - Pentru badges/tags
  // ============================================================================
  export const INSTITUTION_TYPE_COLORS = {
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'emerald',    // Verde pentru colectare
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'blue',          // Albastru pentru TMB
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'green',     // Verde închis pentru reciclare
    [INSTITUTION_TYPES.LANDFILL]: 'amber',             // Portocaliu pentru depozit
    [INSTITUTION_TYPES.SORTING_STATION]: 'purple',     // Mov pentru sortare
    [INSTITUTION_TYPES.MUNICIPALITY]: 'slate'          // Gri pentru municipalitate
  };
  
  // ============================================================================
  // EXPORT DEFAULT pentru usage simplu
  // ============================================================================
  export default {
    types: INSTITUTION_TYPES,
    labels: INSTITUTION_TYPE_LABELS_RO,
    labelsEn: INSTITUTION_TYPE_LABELS_EN,
    descriptions: INSTITUTION_TYPE_DESCRIPTIONS,
    getLabel: getInstitutionTypeLabel,
    getDescription: getInstitutionTypeDescription,
    isValid: isValidInstitutionType,
    forDropdown: getInstitutionTypesForDropdown,
    icons: INSTITUTION_TYPE_ICONS,
    colors: INSTITUTION_TYPE_COLORS
  };