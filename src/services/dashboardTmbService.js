// ============================================================================
// TMB DASHBOARD SERVICE
// ============================================================================

import { apiGet } from '../api/apiClient';

export const getTmbStats = async (params = {}) => {
  try {
    const response = await apiGet('/api/dashboard/tmb/stats', params);
    return response;
  } catch (error) {
    console.error('Error fetching TMB stats:', error);
    throw error;
  }
};

export const getOutputDetails = async (params = {}) => {
  try {
    if (!params.output_type) {
      throw new Error('output_type is required');
    }
    const response = await apiGet('/api/dashboard/tmb/output-details', params);
    return response;
  } catch (error) {
    console.error('Error fetching output details:', error);
    throw error;
  }
};

export default {
  getTmbStats,
  getOutputDetails
};