/**
 * ============================================================================
 * DASHBOARD UTILITIES
 * ============================================================================
 * 
 * Helper functions for dashboard data formatting and calculations
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

/**
 * Format number with Romanian thousands separator (comma)
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 * 
 * @example
 * formatNumber(1234567.89) => "1,234,567.89"
 */
export const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };
  
  /**
   * Format tons with unit
   * @param {number} tons - Number of tons
   * @returns {string} Formatted string with unit
   * 
   * @example
   * formatTons(1234.56) => "1,234.56 tone"
   */
  export const formatTons = (tons) => {
    return `${formatNumber(tons)} tone`;
  };
  
  /**
   * Format percentage
   * @param {number} percent - Percentage value
   * @returns {string} Formatted percentage
   * 
   * @example
   * formatPercent(45.678) => "45.7%"
   */
  export const formatPercent = (percent) => {
    if (percent === null || percent === undefined || isNaN(percent)) return '0%';
    return `${percent.toFixed(1)}%`;
  };
  
  /**
   * Get sector color by sector number
   * @param {number} sectorNumber - Sector number (1-6)
   * @returns {string} Tailwind color classes
   */
  export const getSectorColor = (sectorNumber) => {
    const colors = {
      1: 'bg-purple-500',
      2: 'bg-gray-400',
      3: 'bg-emerald-500',
      4: 'bg-orange-500',
      5: 'bg-pink-500',
      6: 'bg-cyan-500',
    };
    return colors[sectorNumber] || 'bg-gray-500';
  };
  
  /**
   * Get sector icon background color (for dark mode)
   * @param {number} sectorNumber - Sector number (1-6)
   * @returns {Object} Tailwind classes for light and dark mode
   */
  export const getSectorIconClasses = (sectorNumber) => {
    const classes = {
      1: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      2: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
      3: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      4: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      5: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      6: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    };
    return classes[sectorNumber] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  };
  
  /**
   * Get waste code color
   * @param {string} wasteCode - Waste code
   * @returns {string} Tailwind color classes
   */
  export const getWasteCodeColor = (wasteCode) => {
    const colors = {
      '20 03 01': 'bg-purple-500 dark:bg-purple-600',
      '20 03 03': 'bg-emerald-500 dark:bg-emerald-600',
      '19 * *': 'bg-orange-500 dark:bg-orange-600',
      '17 09 04': 'bg-pink-500 dark:bg-pink-600',
      'ALTELE': 'bg-cyan-500 dark:bg-cyan-600',
    };
    return colors[wasteCode] || 'bg-gray-500 dark:bg-gray-600';
  };
  
  /**
   * Get waste code icon background classes
   * @param {string} wasteCode - Waste code
   * @returns {string} Tailwind classes
   */
  export const getWasteCodeIconClasses = (wasteCode) => {
    const classes = {
      '20 03 01': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      '20 03 03': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      '19 * *': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      '17 09 04': 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      'ALTELE': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    };
    return classes[wasteCode] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  };
  
  /**
   * Get variation direction icon and color
   * @param {string} direction - 'up' or 'down'
   * @param {number} value - Variation value
   * @returns {Object} Icon component and color classes
   */
  export const getVariationDisplay = (direction, value) => {
    const isPositive = direction === 'up' && value > 0;
    const isNegative = direction === 'down' || value < 0;
    
    return {
      icon: isPositive ? '↑' : isNegative ? '↓' : '→',
      colorClass: isPositive 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : isNegative 
          ? 'text-red-600 dark:text-red-400' 
          : 'text-gray-500 dark:text-gray-400',
      bgClass: isPositive
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : isNegative
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-gray-50 dark:bg-gray-800',
    };
  };
  
  /**
   * Format date to Romanian format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   * 
   * @example
   * formatDate('2025-11-21') => "21.11.2025"
   */
  export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };
  
  /**
   * Format date and time
   * @param {string} dateTimeString - ISO datetime string
   * @returns {string} Formatted datetime
   * 
   * @example
   * formatDateTime('2025-11-21T10:30:00Z') => "21.11.2025 10:30"
   */
  export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  /**
   * Get current date in YYYY-MM-DD format
   * @returns {string} Today's date
   */
  export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  /**
   * Get first day of current year
   * @returns {string} First day of year in YYYY-MM-DD format
   */
  export const getYearStart = () => {
    const year = new Date().getFullYear();
    return `${year}-01-01`;
  };
  
  /**
   * Calculate percentage
   * @param {number} value - Part value
   * @param {number} total - Total value
   * @returns {number} Percentage
   */
  export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Get icon for waste code category
   * @param {string} wasteCode - Waste code
   * @returns {string} Emoji icon
   */
  export const getWasteCodeIcon = (wasteCode) => {
    const icons = {
      '20 03 01': '🗑️',
      '20 03 03': '🚛',
      '19 * *': '♻️',
      '17 09 04': '🏗️',
      'ALTELE': '📦',
    };
    return icons[wasteCode] || '📊';
  };
  
  /**
   * Debounce function for search inputs
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  export default {
    formatNumber,
    formatTons,
    formatPercent,
    getSectorColor,
    getSectorIconClasses,
    getWasteCodeColor,
    getWasteCodeIconClasses,
    getVariationDisplay,
    formatDate,
    formatDateTime,
    getTodayDate,
    getYearStart,
    calculatePercentage,
    truncateText,
    getWasteCodeIcon,
    debounce,
  };