// src/constants/institutionTypes.js
/**
 * ============================================================================
 * INSTITUTION TYPES - CONSTANTS & LABELS
 * ============================================================================
 * 
 * Definește toate tipurile de instituții și label-urile lor în română/engleză
 * 
 * IMPORTANT: Sincronizat cu backend și database
 * - ASSOCIATION = ADIGDMB (asociație de dezvoltare)
 * - MUNICIPALITY = Municipii și sectoare (PMB, S1-S6)
 * - WASTE_COLLECTOR = Operatori de colectare deșeuri (ex: ROMPREST, ECOSAL)
 * - TMB_OPERATOR = Operatori TMB care procesează deșeuri
 * - SORTING_OPERATOR = Operatori sortare deșeuri
 * - LANDFILL = Depozite de deșeuri
 * - RECYCLING_CLIENT = Companii de reciclare
 * - RECOVERY_CLIENT = Companii valorificare energetică
 * - REGULATOR = Instituții de reglementare (Garda Mediu, Ministere)
 * 
 * Created: 2024-12-17
 * Updated: 2024-12-28 - Added REGULATOR type
 * ============================================================================
 */

// ============================================================================
// INSTITUTION TYPES - Backend Values
// ============================================================================
export const INSTITUTION_TYPES = {
  ASSOCIATION: 'ASSOCIATION',              // ADIGDMB
  MUNICIPALITY: 'MUNICIPALITY',            // Municipii + Sectoare
  WASTE_COLLECTOR: 'WASTE_COLLECTOR',      // Operatori colectare (ex: ROMPREST)
  TMB_OPERATOR: 'TMB_OPERATOR',            // Operatori TMB (procesare)
  SORTING_OPERATOR: 'SORTING_OPERATOR',    // Operatori sortare
  LANDFILL: 'LANDFILL',                    // Depozite (DISPOSAL_CLIENT alias)
  DISPOSAL_CLIENT: 'DISPOSAL_CLIENT',      // Depozite (alias pentru LANDFILL)
  RECYCLING_CLIENT: 'RECYCLING_CLIENT',    // Companii reciclare
  RECOVERY_CLIENT: 'RECOVERY_CLIENT',      // Companii valorificare energetică
  REGULATOR: 'REGULATOR'                   // Instituții reglementare (NOU!)
};

// ============================================================================
// LABELS ROMÂNĂ - Pentru UI
// ============================================================================
export const INSTITUTION_TYPE_LABELS_RO = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Asociație',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipiu',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Operator Colectare',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Operator TMB',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'Operator Sortare',
  [INSTITUTION_TYPES.LANDFILL]: 'Depozit',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Client Depozit',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Client Reciclare',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Client Valorificare',
  [INSTITUTION_TYPES.REGULATOR]: 'Regulator'
};

// ============================================================================
// LABELS ENGLEZĂ - Pentru raportare/export
// ============================================================================
export const INSTITUTION_TYPE_LABELS_EN = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Association',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipality',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Waste Collection Operator',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Mechanical-Biological Treatment Operator',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'Sorting Operator',
  [INSTITUTION_TYPES.LANDFILL]: 'Landfill',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Disposal Client',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Recycling Client',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Recovery Client',
  [INSTITUTION_TYPES.REGULATOR]: 'Regulator'
};

// ============================================================================
// DESCRIERI DETALIATE - Pentru tooltips/help text
// ============================================================================
export const INSTITUTION_TYPE_DESCRIPTIONS = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Asociație de dezvoltare (ex: ADIGDMB)',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipalități și sectoare (ex: PMB, Sector 1-6)',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Operatori care colectează deșeuri de la populație și agenți economici (ex: ROMPREST, ECOSAL)',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Operatori care procesează deșeuri prin tratare mecano-biologică',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'Operatori care sortează deșeuri reciclabile',
  [INSTITUTION_TYPES.LANDFILL]: 'Depozite ecologice pentru deșeuri',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Clienți pentru servicii de depozitare',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Companii care preiau materiale reciclabile pentru procesare',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Companii care valorifică energetic deșeurile',
  [INSTITUTION_TYPES.REGULATOR]: 'Instituții de reglementare și supraveghere (ex: Garda Națională de Mediu, Ministere)'
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
  [INSTITUTION_TYPES.ASSOCIATION]: 'Building2',        // lucide: Building2
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Building',        // lucide: Building
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Truck',        // lucide: Truck
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Factory',         // lucide: Factory
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'PackageSearch', // lucide: PackageSearch
  [INSTITUTION_TYPES.LANDFILL]: 'Mountain',            // lucide: Mountain
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Mountain',     // lucide: Mountain
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Recycle',     // lucide: Recycle
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Zap',          // lucide: Zap (energie)
  [INSTITUTION_TYPES.REGULATOR]: 'Shield'              // lucide: Shield
};

// ============================================================================
// COLOR MAPPING - Pentru badges/tags
// ============================================================================
export const INSTITUTION_TYPE_COLORS = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'red',          // Roșu pentru ADIGDMB
  [INSTITUTION_TYPES.MUNICIPALITY]: 'blue',        // Albastru pentru municipii
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'emerald',  // Verde pentru colectare
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'cyan',        // Cyan pentru TMB
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'purple',  // Mov pentru sortare
  [INSTITUTION_TYPES.LANDFILL]: 'rose',            // Roșu pentru depozit
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'rose',     // Roșu pentru depozit
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'green',   // Verde închis pentru reciclare
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'amber',    // Portocaliu pentru valorificare
  [INSTITUTION_TYPES.REGULATOR]: 'indigo'          // Indigo pentru regulator
};

/**
 * Obține clasa Tailwind pentru badge-ul unui tip de instituție
 * @param {string} type - Tipul instituției
 * @returns {string} Clasele Tailwind pentru badge
 */
export const getInstitutionTypeBadgeColor = (type) => {
  const colorMap = {
    [INSTITUTION_TYPES.ASSOCIATION]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    [INSTITUTION_TYPES.MUNICIPALITY]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    [INSTITUTION_TYPES.SORTING_OPERATOR]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    [INSTITUTION_TYPES.LANDFILL]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    [INSTITUTION_TYPES.REGULATOR]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
  getBadgeColor: getInstitutionTypeBadgeColor,
  isValid: isValidInstitutionType,
  forDropdown: getInstitutionTypesForDropdown,
  icons: INSTITUTION_TYPE_ICONS,
  colors: INSTITUTION_TYPE_COLORS
};