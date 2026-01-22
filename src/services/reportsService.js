/**
 * ============================================================================
 * REPORTS SERVICE - COMPLETE WITH RECYCLING
 * ============================================================================
 */

import axios from 'axios';
import { apiClient } from '../api/apiClient';


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
      limit: filters.per_page  // ✅ SCHIMBAT din per_page în limit
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
    return await apiClient(`/api/tickets/landfill/${ticketId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('❌ deleteLandfillTicket error:', error);
    throw error;
  }
};

export const createLandfillTicket = async (ticketData) => {
  try {
    return await apiClient(`/api/tickets/landfill`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  } catch (error) {
    console.error('❌ createLandfillTicket error:', error);
    throw error;
  }
};

export const updateLandfillTicket = async (ticketId, ticketData) => {
  try {
    return await apiClient(`/api/tickets/landfill/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
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
      from: filters.from,
      to: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    console.log('🔵 getTmbReports sending params:', Object.fromEntries(params));

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
      from: filters.from,
      to: filters.to,
      page: filters.page,
      limit: filters.per_page
    });
    
    if (filters.sector_id) {
      params.append('sector_id', filters.sector_id);
    }

    console.log('🟢 getRecyclingReports sending params:', Object.fromEntries(params));

    const response = await axios.get(
      `${API_BASE_URL}/reports/tmb/recycling?${params}`,
      headers
    );
    
    console.log('🟢 getRecyclingReports received response:', {
      success: response.data.success,
      total_tickets: response.data.data?.summary?.total_tickets,
      items_count: response.data.data?.items?.length,
      first_ticket_number: response.data.data?.items?.[0]?.ticket_number,
      first_ticket_sector: response.data.data?.items?.[0]?.sector_name,
      all_ticket_numbers: response.data.data?.items?.map(t => `${t.ticket_number} (${t.sector_name})`)
    });
    
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
      from: filters.from,
      to: filters.to,
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

/**
 * CREATE Recovery Ticket
 */
export const createRecoveryTicket = async (ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/tickets/recovery`,
      ticketData,
      headers
    );
    return response.data;
  } catch (error) {
    console.error('❌ createRecoveryTicket error:', error);
    throw error;
  }
};

/**
 * UPDATE Recovery Ticket
 */
export const updateRecoveryTicket = async (id, ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/tickets/recovery/${id}`,
      ticketData,
      headers
    );
    return response.data;
  } catch (error) {
    console.error('❌ updateRecoveryTicket error:', error);
    throw error;
  }
};

/**
 * DELETE Recovery Ticket
 */
export const deleteRecoveryTicket = async (id) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/tickets/recovery/${id}`,
      headers
    );
    return response.data;
  } catch (error) {
    console.error('❌ deleteRecoveryTicket error:', error);
    throw error;
  }
};

export const getDisposalReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      from: filters.from,
      to: filters.to,
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
      from: filters.from,
      to: filters.to,
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

/**
 * ============================================================================
 * RECYCLING TICKETS CRUD
 * ============================================================================
 */

export const createRecyclingTicket = async (ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/tickets/recycling`,
      ticketData,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ createRecyclingTicket error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Eroare la crearea tichetului de reciclare'
    };
  }
};

export const updateRecyclingTicket = async (ticketId, ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/tickets/recycling/${ticketId}`,
      ticketData,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ updateRecyclingTicket error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Eroare la actualizarea tichetului de reciclare'
    };
  }
};

export const deleteRecyclingTicket = async (ticketId) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/tickets/recycling/${ticketId}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ deleteRecyclingTicket error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Eroare la ștergerea tichetului de reciclare'
    };
  }
};

export const getRecyclingTicketById = async (ticketId) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.get(
      `${API_BASE_URL}/tickets/recycling/${ticketId}`,
      headers
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ getRecyclingTicketById error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Eroare la obținerea tichetului de reciclare'
    };
  }
};

/**
 * ============================================================================
 * EXPORT RECYCLING REPORTS (pentru Export dropdown)
 * ============================================================================
 */

export const exportRecyclingReports = async (filters) => {
  try {
    const headers = createAuthHeaders();
    const params = new URLSearchParams({
      year: filters.year,
      from: filters.from,
      to: filters.to,
      page: 1,
      limit: 100000 // Get ALL records for export
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
    console.error('❌ exportRecyclingReports error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Eroare la exportul datelor de reciclare'
    };
  }
};

/**
 * ============================================================================
 * DEFAULT EXPORT - ALL FUNCTIONS
 * ============================================================================
 */

export default {
  // Landfill
  getLandfillReports,
  exportLandfillReports,
  getAuxiliaryData,
  createLandfillTicket,
  updateLandfillTicket,
  deleteLandfillTicket,
  
  // TMB Reports
  getTmbReports,
  getRecyclingReports,
  getRecoveryReports,
  getDisposalReports,
  getRejectedReports,
  
  // TMB Tickets CRUD
  createTmbTicket,
  updateTmbTicket,
  deleteTmbTicket,
  
  // Recycling Tickets CRUD (✅ ADĂUGAT)
  createRecyclingTicket,
  updateRecyclingTicket,
  deleteRecyclingTicket,
  getRecyclingTicketById,
  exportRecyclingReports
};
/**
 * CREATE Disposal Ticket
 */
export const createDisposalTicket = async (ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/tickets/disposal`,
      ticketData,
      headers
    );
    return response.data;
  } catch (error) {
    console.error('❌ createDisposalTicket error:', error);
    throw error;
  }
};

/**
 * UPDATE Disposal Ticket
 */
export const updateDisposalTicket = async (id, ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/tickets/disposal/${id}`,
      ticketData,
      headers
    );
    return response.data;
  } catch (error) {
    console.error('❌ updateDisposalTicket error:', error);
    throw error;
  }
};

/**
 * DELETE Disposal Ticket
 */
export const deleteDisposalTicket = async (id) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/tickets/disposal/${id}`,
      headers
    );
    return response.data;
  } catch (error) {
    console.error('❌ deleteDisposalTicket error:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * REJECTED TICKETS CRUD
 * ============================================================================
 */

export const createRejectedTicket = async (ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/tickets/rejected`,
      ticketData,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("❌ createRejectedTicket error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Eroare la crearea tichetului refuzat"
    };
  }
};

export const updateRejectedTicket = async (id, ticketData) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/tickets/rejected/${id}`,
      ticketData,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("❌ updateRejectedTicket error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Eroare la actualizarea tichetului refuzat"
    };
  }
};

export const deleteRejectedTicket = async (id) => {
  try {
    const headers = createAuthHeaders();
    const response = await axios.delete(
      `${API_BASE_URL}/tickets/rejected/${id}`,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("❌ deleteRejectedTicket error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Eroare la ștergerea tichetului refuzat"
    };
  }
};