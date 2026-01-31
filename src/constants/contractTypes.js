// src/constants/contractTypes.js
/**
 * ============================================================================
 * CONTRACT TYPES - ALL 6 TYPES WITH METADATA
 * ============================================================================
 * Order: Colectare → Sortare → Aerobă → Anaerobă → TMB → Depozitare
 * ============================================================================
 */

export const CONTRACT_TYPES = {
    WASTE_COLLECTOR: 'WASTE_COLLECTOR',
    SORTING: 'SORTING',
    AEROBIC: 'AEROBIC',
    ANAEROBIC: 'ANAEROBIC',
    TMB: 'TMB',
    DISPOSAL: 'DISPOSAL',
  };
  
  export const CONTRACT_TYPE_LABELS = {
    WASTE_COLLECTOR: 'Colectare',
    SORTING: 'Sortare',
    AEROBIC: 'Aerobă',
    ANAEROBIC: 'Anaerobă',
    TMB: 'TMB',
    DISPOSAL: 'Depozitare',
  };
  
  export const CONTRACT_TYPE_ICONS = {
    WASTE_COLLECTOR: '🚛',
    SORTING: '🔄',
    AEROBIC: '🌱',
    ANAEROBIC: '🔋',
    TMB: '⚙️',
    DISPOSAL: '📦',
  };
  
  export const CONTRACT_TYPE_PREFIXES = {
    WASTE_COLLECTOR: 'C-',
    SORTING: 'S-',
    AEROBIC: 'TA-',
    ANAEROBIC: 'TAN-',
    TMB: 'TMB-',
    DISPOSAL: 'D-',
  };
  
  export const CONTRACT_TYPE_COLORS = {
    WASTE_COLLECTOR: {
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-500/30',
    },
    SORTING: {
      bg: 'bg-purple-100 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-500/30',
    },
    AEROBIC: {
      bg: 'bg-green-100 dark:bg-green-500/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-500/30',
    },
    ANAEROBIC: {
      bg: 'bg-indigo-100 dark:bg-indigo-500/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-500/30',
    },
    TMB: {
      bg: 'bg-orange-100 dark:bg-orange-500/20',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-500/30',
    },
    DISPOSAL: {
      bg: 'bg-red-100 dark:bg-red-500/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-500/30',
    },
  };
  
  // Contract type metadata
  export const CONTRACT_TYPE_METADATA = {
    WASTE_COLLECTOR: {
      value: 'WASTE_COLLECTOR',
      label: 'Colectare',
      icon: '🚛',
      prefix: 'C-',
      description: 'Contracte pentru colectarea deșeurilor',
      hasAttribution: false,
      hasAssociate: false,
      hasCEC: false,
      hasWasteCodes: true,
      hasIndicators: false,
    },
    SORTING: {
      value: 'SORTING',
      label: 'Sortare',
      icon: '🔄',
      prefix: 'S-',
      description: 'Contracte pentru sortarea deșeurilor',
      hasAttribution: false,
      hasAssociate: false,
      hasCEC: false,
      hasWasteCodes: true,
      hasIndicators: false,
    },
    AEROBIC: {
      value: 'AEROBIC',
      label: 'Aerobă',
      icon: '🌱',
      prefix: 'TA-',
      description: 'Contracte pentru tratare aerobă',
      hasAttribution: true,
      hasAssociate: true,
      hasCEC: false,
      hasWasteCodes: true,
      hasIndicators: true,
      indicators: [
        {
          key: 'disposal_percent',
          label: 'Cantitatea de deșeuri trimisă la depozitare (%)',
          description: 'Ca procent din cantitatea totală receptată',
        },
      ],
    },
    ANAEROBIC: {
      value: 'ANAEROBIC',
      label: 'Anaerobă',
      icon: '🔋',
      prefix: 'TAN-',
      description: 'Contracte pentru tratare anaerobă',
      hasAttribution: true,
      hasAssociate: true,
      hasCEC: false,
      hasWasteCodes: true,
      hasIndicators: true,
      indicators: [
        {
          key: 'disposal_percent',
          label: 'Cantitatea de deșeuri trimisă la depozitare (%)',
          description: 'Ca procent din cantitatea totală receptată',
        },
      ],
    },
    TMB: {
      value: 'TMB',
      label: 'TMB',
      icon: '⚙️',
      prefix: 'TMB-',
      description: 'Contracte pentru tratare mecano-biologică',
      hasAttribution: true,
      hasAssociate: true,
      hasCEC: false,
      hasWasteCodes: true,
      hasIndicators: true,
      indicators: [
        {
          key: 'recycling_percent',
          label: 'Deșeuri reciclabile trimise la reciclare (%)',
          description: 'Ca procent din cantitatea totală acceptată',
        },
        {
          key: 'recovery_percent',
          label: 'Deșeuri trimise la valorificare energetică (%)',
          description: 'Ca procent din cantitatea totală acceptată',
        },
        {
          key: 'disposal_percent',
          label: 'Deșeuri trimise la depozitare (%)',
          description: 'Ca procent din cantitatea totală acceptată',
        },
      ],
    },
    DISPOSAL: {
      value: 'DISPOSAL',
      label: 'Depozitare',
      icon: '📦',
      prefix: 'D-',
      description: 'Contracte pentru depozitarea deșeurilor',
      hasAttribution: true,
      hasAssociate: false,
      hasCEC: true,
      hasWasteCodes: true,
      hasIndicators: false,
    },
  };
  
  // Get contract type metadata
  export const getContractTypeMetadata = (type) => {
    return CONTRACT_TYPE_METADATA[type] || null;
  };
  
  // Get contract type label
  export const getContractTypeLabel = (type) => {
    return CONTRACT_TYPE_LABELS[type] || type;
  };
  
  // Get contract type icon
  export const getContractTypeIcon = (type) => {
    return CONTRACT_TYPE_ICONS[type] || '📄';
  };
  
  // Get contract type prefix
  export const getContractTypePrefix = (type) => {
    return CONTRACT_TYPE_PREFIXES[type] || '';
  };
  
  // Get contract type colors
  export const getContractTypeColors = (type) => {
    return CONTRACT_TYPE_COLORS[type] || {
      bg: 'bg-gray-100 dark:bg-gray-500/20',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-500/30',
    };
  };
  
  // Check if contract type has attribution field
  export const hasAttributionField = (type) => {
    const metadata = getContractTypeMetadata(type);
    return metadata?.hasAttribution || false;
  };
  
  // Check if contract type has associate field
  export const hasAssociateField = (type) => {
    const metadata = getContractTypeMetadata(type);
    return metadata?.hasAssociate || false;
  };
  
  // Check if contract type has CEC tax field
  export const hasCECField = (type) => {
    const metadata = getContractTypeMetadata(type);
    return metadata?.hasCEC || false;
  };
  
  // Check if contract type has indicators
  export const hasIndicators = (type) => {
    const metadata = getContractTypeMetadata(type);
    return metadata?.hasIndicators || false;
  };
  
  // Get indicators for contract type
  export const getContractIndicators = (type) => {
    const metadata = getContractTypeMetadata(type);
    return metadata?.indicators || [];
  };
  
  // All contract types in order
  export const CONTRACT_TYPES_ORDERED = [
    'WASTE_COLLECTOR',
    'SORTING',
    'AEROBIC',
    'ANAEROBIC',
    'TMB',
    'DISPOSAL',
  ];
  
  // Contract types as array with metadata
  export const CONTRACT_TYPES_ARRAY = CONTRACT_TYPES_ORDERED.map(type => ({
    ...CONTRACT_TYPE_METADATA[type],
    colors: CONTRACT_TYPE_COLORS[type],
  }));