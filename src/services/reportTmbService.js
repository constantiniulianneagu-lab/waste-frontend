// ============================================================================
// TMB REPORTS SERVICE
// ============================================================================

import { apiGet } from '../api/apiClient';

const API_BASE = '/api/reports/tmb';

export const getTmbReportData = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sector_id) queryParams.append('sector_id', params.sector_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiGet(`${API_BASE}/tmb?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch TMB report data:', error);
    throw error;
  }
};

export const getRecyclingReportData = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sector_id) queryParams.append('sector_id', params.sector_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiGet(`${API_BASE}/recycling?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch recycling report data:', error);
    throw error;
  }
};

export const getRecoveryReportData = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sector_id) queryParams.append('sector_id', params.sector_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiGet(`${API_BASE}/recovery?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch recovery report data:', error);
    throw error;
  }
};

export const getDisposalReportData = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sector_id) queryParams.append('sector_id', params.sector_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiGet(`${API_BASE}/disposal?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch disposal report data:', error);
    throw error;
  }
};

export const getRejectedReportData = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.sector_id) queryParams.append('sector_id', params.sector_id);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await apiGet(`${API_BASE}/rejected?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch rejected report data:', error);
    throw error;
  }
};

export default {
  getTmbReportData,
  getRecyclingReportData,
  getRecoveryReportData,
  getDisposalReportData,
  getRejectedReportData
};