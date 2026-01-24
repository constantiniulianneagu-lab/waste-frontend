// src/constants/institutionTypes.js
/**
 * ============================================================================
 * INSTITUTION TYPES - CONSTANTS & LABELS
 * ============================================================================
 * 
 * Updated: 2025-01-24
 * - Added AEROBIC_OPERATOR, ANAEROBIC_OPERATOR
 * - Changed color theme from amber/orange to green/teal (waste management)
 * 
 * ============================================================================
 */

// ============================================================================
// INSTITUTION TYPES - Backend Values
// ============================================================================
export const INSTITUTION_TYPES = {
  ASSOCIATION: 'ASSOCIATION',              // ADIGDMB
  MUNICIPALITY: 'MUNICIPALITY',            // Municipii + Sectoare
  WASTE_COLLECTOR: 'WASTE_COLLECTOR',      // Operatori colectare
  TMB_OPERATOR: 'TMB_OPERATOR',            // Operatori TMB (procesare)
  SORTING_OPERATOR: 'SORTING_OPERATOR',    // Operatori sortare
  AEROBIC_OPERATOR: 'AEROBIC_OPERATOR',    // Operatori tratare aerobă (NOU!)
  ANAEROBIC_OPERATOR: 'ANAEROBIC_OPERATOR', // Operatori tratare anaerobă (NOU!)
  LANDFILL: 'LANDFILL',                    // Depozite
  DISPOSAL_CLIENT: 'DISPOSAL_CLIENT',      // Client depozit (alias)
  RECYCLING_CLIENT: 'RECYCLING_CLIENT',    // Companii reciclare
  RECOVERY_CLIENT: 'RECOVERY_CLIENT',      // Companii valorificare energetică
  REGULATOR: 'REGULATOR'                   // Instituții reglementare
};

// ============================================================================
// LABELS ROMÂNĂ - Pentru UI
// ============================================================================
export const INSTITUTION_TYPE_LABELS_RO = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Asociație',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'U.A.T.',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Colectare',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Tratare mecano-biologică',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'Sortare',
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'Tratare aerobă',
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'Tratare anaerobă',
  [INSTITUTION_TYPES.LANDFILL]: 'Depozitare',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Depozitare',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Reciclare',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Valorificare',
  [INSTITUTION_TYPES.REGULATOR]: 'Autoritate publică'
};

// ============================================================================
// LABELS ENGLEZĂ - Pentru raportare/export
// ============================================================================
export const INSTITUTION_TYPE_LABELS_EN = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Association',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Municipality',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Waste Collection',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Mechanical-Biological Treatment',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'Sorting',
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'Aerobic Treatment',
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'Anaerobic Treatment',
  [INSTITUTION_TYPES.LANDFILL]: 'Landfill',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Disposal',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Recycling',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Recovery',
  [INSTITUTION_TYPES.REGULATOR]: 'Regulator'
};

// ============================================================================
// DESCRIERI DETALIATE - Pentru tooltips/help text
// ============================================================================
export const INSTITUTION_TYPE_DESCRIPTIONS = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Asociație de dezvoltare (ex: ADIGDMB)',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Unități administrativ-teritoriale (ex: PMB, Sector 1-6)',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Operatori care colectează deșeuri de la populație și agenți economici',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Operatori care procesează deșeuri prin tratare mecano-biologică',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'Operatori care sortează deșeuri reciclabile',
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'Operatori care tratează deșeuri prin proces aerob (compostare)',
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'Operatori care tratează deșeuri prin proces anaerob (biogaz)',
  [INSTITUTION_TYPES.LANDFILL]: 'Depozite ecologice pentru deșeuri',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Clienți pentru servicii de depozitare',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Companii care preiau materiale reciclabile pentru procesare',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Companii care valorifică energetic deșeurile',
  [INSTITUTION_TYPES.REGULATOR]: 'Instituții de reglementare și supraveghere'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Obține label-ul pentru un tip de instituție
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
 */
export const getInstitutionTypeDescription = (type) => {
  if (!type) return '';
  return INSTITUTION_TYPE_DESCRIPTIONS[type] || '';
};

/**
 * Verifică dacă un tip este valid
 */
export const isValidInstitutionType = (type) => {
  return Object.values(INSTITUTION_TYPES).includes(type);
};

/**
 * Obține toate tipurile ca array pentru dropdown-uri
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
// OPERATORS THAT HAVE CONTRACTS - For filtering
// ============================================================================
export const OPERATORS_WITH_CONTRACTS = [
  INSTITUTION_TYPES.WASTE_COLLECTOR,
  INSTITUTION_TYPES.SORTING_OPERATOR,
  INSTITUTION_TYPES.TMB_OPERATOR,
  INSTITUTION_TYPES.AEROBIC_OPERATOR,
  INSTITUTION_TYPES.ANAEROBIC_OPERATOR,
  INSTITUTION_TYPES.DISPOSAL_CLIENT,
  INSTITUTION_TYPES.LANDFILL
];

/**
 * Verifică dacă tipul are contracte
 */
export const hasContracts = (type) => {
  return OPERATORS_WITH_CONTRACTS.includes(type);
};

/**
 * Verifică dacă tipul necesită reprezentant
 */
export const needsRepresentative = (type) => {
  return OPERATORS_WITH_CONTRACTS.includes(type);
};

// ============================================================================
// ICON MAPPING - Pentru UI (lucide-react)
// ============================================================================
export const INSTITUTION_TYPE_ICONS = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'Building2',
  [INSTITUTION_TYPES.MUNICIPALITY]: 'Building',
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'Truck',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'Factory',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'PackageSearch',
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'Wind',
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'Flame',
  [INSTITUTION_TYPES.LANDFILL]: 'Mountain',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'Mountain',
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'Recycle',
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'Zap',
  [INSTITUTION_TYPES.REGULATOR]: 'Shield'
};

// ============================================================================
// COLOR MAPPING - GREEN/TEAL THEME for Waste Management
// ============================================================================
export const INSTITUTION_TYPE_COLORS = {
  [INSTITUTION_TYPES.ASSOCIATION]: 'teal',         // Teal pentru ADIGDMB
  [INSTITUTION_TYPES.MUNICIPALITY]: 'blue',        // Albastru pentru UAT
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'emerald',  // Verde pentru colectare
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'cyan',        // Cyan pentru TMB
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'violet',  // Violet pentru sortare
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'lime',    // Lime pentru aerob
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'orange', // Orange pentru anaerob
  [INSTITUTION_TYPES.LANDFILL]: 'slate',           // Slate pentru depozit
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'slate',    // Slate pentru depozit
  [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'green',   // Verde închis pentru reciclare
  [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'amber',    // Amber pentru valorificare
  [INSTITUTION_TYPES.REGULATOR]: 'indigo'          // Indigo pentru regulator
};

/**
 * Obține clasa Tailwind pentru badge-ul unui tip de instituție
 */
export const getInstitutionTypeBadgeColor = (type) => {
  const colorMap = {
    [INSTITUTION_TYPES.ASSOCIATION]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    [INSTITUTION_TYPES.MUNICIPALITY]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    [INSTITUTION_TYPES.TMB_OPERATOR]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    [INSTITUTION_TYPES.SORTING_OPERATOR]: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
    [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    [INSTITUTION_TYPES.LANDFILL]: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    [INSTITUTION_TYPES.RECYCLING_CLIENT]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [INSTITUTION_TYPES.RECOVERY_CLIENT]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    [INSTITUTION_TYPES.REGULATOR]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

// ============================================================================
// CONTRACT TYPE MAPPING
// ============================================================================
export const CONTRACT_TYPE_BY_INSTITUTION = {
  [INSTITUTION_TYPES.WASTE_COLLECTOR]: 'WASTE_COLLECTOR',
  [INSTITUTION_TYPES.SORTING_OPERATOR]: 'SORTING',
  [INSTITUTION_TYPES.TMB_OPERATOR]: 'TMB',
  [INSTITUTION_TYPES.AEROBIC_OPERATOR]: 'AEROBIC',
  [INSTITUTION_TYPES.ANAEROBIC_OPERATOR]: 'ANAEROBIC',
  [INSTITUTION_TYPES.DISPOSAL_CLIENT]: 'DISPOSAL',
  [INSTITUTION_TYPES.LANDFILL]: 'DISPOSAL'
};

// ============================================================================
// EXPORT DEFAULT
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
  colors: INSTITUTION_TYPE_COLORS,
  operatorsWithContracts: OPERATORS_WITH_CONTRACTS,
  hasContracts,
  needsRepresentative,
  contractTypeByInstitution: CONTRACT_TYPE_BY_INSTITUTION
};
