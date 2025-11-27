// ============================================================================
// DASHBOARD SERVICE - TMB
// ============================================================================
// Service pentru apeluri API către dashboard TMB
// ============================================================================

import { apiGet } from './apiClient';

/**
 * Get TMB statistics
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @param {string} params.sector_id - Sector ID (1-6 or UUID)
 * @param {number} params.operator_id - Operator ID (from tmb_associations)
 * @returns {Promise} Stats data
 */
export const getTmbStats = async (params = {}) => {
  try {
    console.log('🔄 Fetching TMB stats with params:', params);
    
    const response = await apiGet('/api/dashboard/tmb/stats', params);
    
    console.log('✅ TMB stats received:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching TMB stats:', error);
    throw error;
  }
};

/**
 * Get output details (recycling, recovery, disposal)
 * @param {Object} params - Query parameters
 * @param {string} params.output_type - Type: 'recycling', 'recovery', or 'disposal'
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @param {string} params.sector_id - Sector ID (1-6 or UUID)
 * @returns {Promise} Output details
 */
export const getOutputDetails = async (params = {}) => {
  try {
    if (!params.output_type) {
      throw new Error('output_type is required (recycling, recovery, or disposal)');
    }
    
    console.log('🔄 Fetching output details with params:', params);
    
    const response = await apiGet('/api/dashboard/tmb/output-details', params);
    
    console.log('✅ Output details received:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching output details:', error);
    throw error;
  }
};

/**
 * Get operators for a specific sector (from tmb_associations)
 * @param {string} sectorId - Sector ID (1-6 or UUID)
 * @param {string} date - Date for validation (YYYY-MM-DD) - optional
 * @returns {Promise} List of operators
 */
export const getTmbOperatorsBySector = async (sectorId, date = null) => {
  try {
    console.log('🔄 Fetching TMB operators for sector:', sectorId);
    
    const params = { sector_id: sectorId };
    if (date) {
      params.date = date;
    }
    
    const response = await apiGet('/api/tmb/operators', params);
    
    console.log('✅ TMB operators received:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching TMB operators:', error);
    throw error;
  }
};

export default {
  getTmbStats,
  getOutputDetails,
  getTmbOperatorsBySector
};