/**
 * ============================================================================
 * REPORTS SERVICE - CU TMB
 * ============================================================================
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waste-backend-3u9c.onrender.com/api';

// Helper pentru headers cu autentificare
const createAuthHeaders = () => {
  const token = localStorage.getItem('wasteAccessToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * ============================================================================
 * LANDFILL REPORTS
 * ============================================================================
 */

export const getLandfillReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      from: filters.from,
      to: filters.to,
      page: filters.page,
      per_page: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/landfill?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getLandfillReports error:', error);
    throw error;
  }
};

export const exportLandfillReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      from: filters.from,
      to: filters.to
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/landfill/export?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ exportLandfillReports error:', error);
    throw error;
  }
};

export const getAuxiliaryData = async () => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/reports/landfill/auxiliary`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getAuxiliaryData error:', error);
    throw error;
  }
};

export const deleteLandfillTicket = async (ticketId) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/waste-tickets/landfill/${ticketId}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ deleteLandfillTicket error:', error);
    throw error;
  }
};

export const createLandfillTicket = async (ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/waste-tickets/landfill`,
      ticketData,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ createLandfillTicket error:', error);
    throw error;
  }
};

export const updateLandfillTicket = async (ticketId, ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/waste-tickets/landfill/${ticketId}`,
      ticketData,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ updateLandfillTicket error:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * TMB REPORTS SERVICE - COMPLETE
 * ============================================================================
 */

export const getTmbReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      start_date: filters.from,
      end_date: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/tmb/tmb?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getTmbReports error:', error);
    throw error;
  }
};

export const getRecyclingReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      start_date: filters.from,
      end_date: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/tmb/recycling?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getRecyclingReports error:', error);
    throw error;
  }
};

export const getRecoveryReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      start_date: filters.from,
      end_date: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/tmb/recovery?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getRecoveryReports error:', error);
    throw error;
  }
};

export const getDisposalReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      start_date: filters.from,
      end_date: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/tmb/disposal?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getDisposalReports error:', error);
    throw error;
  }
};

export const getRejectedReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      start_date: filters.from,
      end_date: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    const response = await axios.get(
      `${API_BASE_URL}/reports/tmb/rejected?${params}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getRejectedReports error:', error);
    throw error;
  }
};

export const createTmbTicket = async (ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/tickets/tmb`,
      ticketData,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ createTmbTicket error:', error);
    throw error;
  }
};

export const updateTmbTicket = async (ticketId, ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/tickets/tmb/${ticketId}`,
      ticketData,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ updateTmbTicket error:', error);
    throw error;
  }
};

export const deleteTmbTicket = async (ticketId) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/tickets/tmb/${ticketId}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ deleteTmbTicket error:', error);
    throw error;
  }
};

export default {
  getLandfillReports,
  exportLandfillReports,
  getAuxiliaryData,
  createLandfillTicket,
  updateLandfillTicket,
  deleteLandfillTicket,
  getTmbReports,
  getRecyclingReports,
  getRecoveryReports,
  getDisposalReports,
  getRejectedReports,
  createTmbTicket,
  updateTmbTicket,
  deleteTmbTicket
};