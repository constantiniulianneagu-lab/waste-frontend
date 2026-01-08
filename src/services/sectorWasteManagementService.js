// src/services/sectorWasteManagementService.js
/**
 * ============================================================================
 * SECTOR WASTE MANAGEMENT SERVICE
 * ============================================================================
 * API calls pentru statistici waste management per sector
 * ============================================================================
 */

import { apiGet } from '../api/apiClient';

/**
 * Get waste management overview for all sectors
 * @param {Object} params - { year }
 */
export const getAllSectorsOverview = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/sectors/waste-management/overview${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet(url);
    return response;
  } catch (error) {
    console.error('Error fetching sectors overview:', error);
    throw error;
  }
};

/**
 * Get waste management stats for specific sector
 * @param {Number} sectorNumber - 1-6
 * @param {Object} params - { year, month }
 */
export const getSectorWasteManagementStats = async (sectorNumber, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/sectors/${sectorNumber}/waste-management${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet(url);
    return response;
  } catch (error) {
    console.error(`Error fetching sector ${sectorNumber} stats:`, error);
    throw error;
  }
};