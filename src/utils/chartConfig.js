/**
 * ============================================================================
 * CHART CONFIGURATION
 * ============================================================================
 * 
 * Configuration for Recharts components with dark mode support
 * 
 * Library: Recharts
 * Documentation: https://recharts.org
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

/**
 * Get theme-aware colors
 * @param {boolean} isDarkMode - Current theme state
 * @returns {Object} Color configuration
 */
export const getChartColors = (isDarkMode) => ({
    // Primary gradient colors
    primary: isDarkMode ? '#10B981' : '#059669',
    primaryLight: isDarkMode ? '#34D399' : '#10B981',
    
    // Area fill gradient
    areaGradientStart: isDarkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.3)',
    areaGradientEnd: isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.05)',
    
    // Grid and axis colors
    gridColor: isDarkMode ? '#374151' : '#E5E7EB',
    axisColor: isDarkMode ? '#9CA3AF' : '#6B7280',
    
    // Text colors
    textColor: isDarkMode ? '#D1D5DB' : '#374151',
    labelColor: isDarkMode ? '#9CA3AF' : '#6B7280',
    
    // Tooltip
    tooltipBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    tooltipBorder: isDarkMode ? '#374151' : '#E5E7EB',
    tooltipText: isDarkMode ? '#F3F4F6' : '#111827',
    
    // Sector colors
    sectors: {
      1: '#7C3AED', // Violet
      2: '#6B7280', // Gray
      3: '#10B981', // Emerald
      4: '#F59E0B', // Orange
      5: '#EC4899', // Pink
      6: '#06B6D4', // Cyan
    },
  });
  
  /**
   * Monthly Evolution Chart Configuration
   */
  export const monthlyEvolutionConfig = (isDarkMode) => ({
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
    
    grid: {
      stroke: getChartColors(isDarkMode).gridColor,
      strokeDasharray: '3 3',
    },
    
    xAxis: {
      dataKey: 'month',
      stroke: getChartColors(isDarkMode).axisColor,
      style: {
        fontSize: '12px',
        fill: getChartColors(isDarkMode).textColor,
      },
    },
    
    yAxis: {
      stroke: getChartColors(isDarkMode).axisColor,
      style: {
        fontSize: '12px',
        fill: getChartColors(isDarkMode).textColor,
      },
      tickFormatter: (value) => {
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value;
      },
    },
    
    area: {
      type: 'monotone',
      dataKey: 'total_tons',
      stroke: getChartColors(isDarkMode).primary,
      strokeWidth: 2,
      fillOpacity: 1,
      fill: 'url(#colorTons)',
    },
    
    tooltip: {
      contentStyle: {
        backgroundColor: getChartColors(isDarkMode).tooltipBg,
        border: `1px solid ${getChartColors(isDarkMode).tooltipBorder}`,
        borderRadius: '8px',
        color: getChartColors(isDarkMode).tooltipText,
        padding: '12px',
        boxShadow: isDarkMode 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      itemStyle: {
        color: getChartColors(isDarkMode).tooltipText,
      },
      labelStyle: {
        color: getChartColors(isDarkMode).labelColor,
        marginBottom: '4px',
      },
    },
    
    gradient: {
      id: 'colorTons',
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '1',
      stops: [
        {
          offset: '5%',
          stopColor: getChartColors(isDarkMode).primary,
          stopOpacity: 0.4,
        },
        {
          offset: '95%',
          stopColor: getChartColors(isDarkMode).primary,
          stopOpacity: 0.05,
        },
      ],
    },
  });
  
  /**
   * Pie Chart Configuration (for sector distribution)
   */
  export const pieChartConfig = (isDarkMode) => ({
    colors: Object.values(getChartColors(isDarkMode).sectors),
    
    pie: {
      dataKey: 'total_tons',
      nameKey: 'sector_name',
      cx: '50%',
      cy: '50%',
      innerRadius: 60,
      outerRadius: 100,
      paddingAngle: 2,
    },
    
    label: {
      fill: getChartColors(isDarkMode).textColor,
      fontSize: 12,
    },
    
    tooltip: {
      contentStyle: {
        backgroundColor: getChartColors(isDarkMode).tooltipBg,
        border: `1px solid ${getChartColors(isDarkMode).tooltipBorder}`,
        borderRadius: '8px',
        color: getChartColors(isDarkMode).tooltipText,
      },
    },
  });
  
  /**
   * Bar Chart Configuration (for operators comparison)
   */
  export const barChartConfig = (isDarkMode) => ({
    margin: { top: 10, right: 30, left: 0, bottom: 60 },
    
    bar: {
      dataKey: 'total_tons',
      fill: getChartColors(isDarkMode).primary,
      radius: [8, 8, 0, 0],
    },
    
    xAxis: {
      dataKey: 'institution_name',
      stroke: getChartColors(isDarkMode).axisColor,
      angle: -45,
      textAnchor: 'end',
      height: 100,
      style: {
        fontSize: '10px',
        fill: getChartColors(isDarkMode).textColor,
      },
    },
    
    yAxis: {
      stroke: getChartColors(isDarkMode).axisColor,
      style: {
        fontSize: '12px',
        fill: getChartColors(isDarkMode).textColor,
      },
      tickFormatter: (value) => {
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value;
      },
    },
    
    grid: {
      stroke: getChartColors(isDarkMode).gridColor,
      strokeDasharray: '3 3',
    },
    
    tooltip: {
      contentStyle: {
        backgroundColor: getChartColors(isDarkMode).tooltipBg,
        border: `1px solid ${getChartColors(isDarkMode).tooltipBorder}`,
        borderRadius: '8px',
        color: getChartColors(isDarkMode).tooltipText,
      },
    },
  });
  
  /**
   * Custom tooltip formatter for tons
   */
  export const formatTooltipValue = (value, name) => {
    if (name === 'total_tons' || name.includes('tone')) {
      return [`${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} tone`, 'Cantitate'];
    }
    return [value, name];
  };
  
  /**
   * Responsive chart configuration
   */
  export const getResponsiveConfig = (width) => {
    if (width < 640) {
      // Mobile
      return {
        height: 250,
        fontSize: 10,
        margin: { top: 5, right: 10, left: -20, bottom: 5 },
      };
    } else if (width < 1024) {
      // Tablet
      return {
        height: 300,
        fontSize: 11,
        margin: { top: 10, right: 20, left: 0, bottom: 0 },
      };
    } else {
      // Desktop
      return {
        height: 350,
        fontSize: 12,
        margin: { top: 10, right: 30, left: 0, bottom: 0 },
      };
    }
  };
  
  export default {
    getChartColors,
    monthlyEvolutionConfig,
    pieChartConfig,
    barChartConfig,
    formatTooltipValue,
    getResponsiveConfig,
  };