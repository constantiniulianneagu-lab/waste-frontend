/**
 * ============================================================================
 * REPORTS SERVICE - VERSIUNE ACTUALIZATĂ
 * ============================================================================
 * Adăugat: exportLandfillReports (pentru export ALL filtered data)
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
 * GET LANDFILL REPORTS (cu paginare)
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

/**
 * EXPORT LANDFILL REPORTS (toate înregistrările filtrate, fără paginare)
 */
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

/**
 * GET AUXILIARY DATA (pentru dropdowns)
 */
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

/**
 * DELETE LANDFILL TICKET
 */
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

/**
 * CREATE LANDFILL TICKET
 */
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

/**
 * UPDATE LANDFILL TICKET
 */
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

export default {
  getLandfillReports,
  exportLandfillReports,
  getAuxiliaryData,
  createLandfillTicket,
  updateLandfillTicket,
  deleteLandfillTicket
};