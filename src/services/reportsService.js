/**
 * ============================================================================
 * REPORTS SERVICE
 * ============================================================================
 * API calls pentru rapoarte
 * ============================================================================
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waste-backend-3u9c.onrender.com/api';

// Create axios instance with auth token
const createAuthHeaders = () => {
  const token = localStorage.getItem('wasteAccessToken');  // ✅ SCHIMBĂ AICI
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * GET LANDFILL REPORTS
 * @param {Object} filters - { year, from, to, sector_id, page, per_page }
 * @returns {Promise} - Reports data
 */
export const getLandfillReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.year) params.append('year', filters.year);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.sector_id) params.append('sector_id', filters.sector_id);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);

    const response = await axios.get(
      `${API_BASE_URL}/reports/landfill?${params.toString()}`,
      createAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error('❌ getLandfillReports error:', error);
    throw error.response?.data || error;
  }
};

/**
 * GET AUXILIARY DATA
 * Dropdown data: waste codes, operators, sectors
 * @returns {Promise} - Auxiliary data
 */
export const getAuxiliaryData = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reports/landfill/auxiliary`,
      createAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error('❌ getAuxiliaryData error:', error);
    throw error.response?.data || error;
  }
};

/**
 * CREATE LANDFILL TICKET
 * @param {Object} ticketData - Ticket fields
 * @returns {Promise} - Created ticket
 */
export const createLandfillTicket = async (ticketData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tickets/landfill`,
      ticketData,
      createAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error('❌ createLandfillTicket error:', error);
    throw error.response?.data || error;
  }
};

/**
 * UPDATE LANDFILL TICKET
 * @param {string} id - Ticket ID
 * @param {Object} ticketData - Updated fields
 * @returns {Promise} - Updated ticket
 */
export const updateLandfillTicket = async (id, ticketData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/tickets/landfill/${id}`,
      ticketData,
      createAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error('❌ updateLandfillTicket error:', error);
    throw error.response?.data || error;
  }
};

/**
 * DELETE LANDFILL TICKET
 * @param {string} id - Ticket ID
 * @returns {Promise} - Delete confirmation
 */
export const deleteLandfillTicket = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/tickets/landfill/${id}`,
      createAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error('❌ deleteLandfillTicket error:', error);
    throw error.response?.data || error;
  }
};

/**
 * EXPORT REPORTS TO EXCEL
 * @param {Array} data - Report data to export
 * @param {string} filename - File name
 */
export const exportToExcel = (data, filename = 'raport_depozitare.xlsx') => {
  // Will implement with xlsx library
  console.log('📤 Export to Excel:', filename, data);
};

/**
 * EXPORT REPORTS TO CSV
 * @param {Array} data - Report data to export
 * @param {string} filename - File name
 */
export const exportToCSV = (data, filename = 'raport_depozitare.csv') => {
  // Will implement CSV export
  console.log('📤 Export to CSV:', filename, data);
};

/**
 * EXPORT REPORTS TO PDF
 * @param {Array} data - Report data to export
 * @param {string} filename - File name
 */
export const exportToPDF = (data, filename = 'raport_depozitare.pdf') => {
  // Will implement with jsPDF
  console.log('📤 Export to PDF:', filename, data);
};

export default {
  getLandfillReports,
  getAuxiliaryData,
  createLandfillTicket,
  updateLandfillTicket,
  deleteLandfillTicket,
  exportToExcel,
  exportToCSV,
  exportToPDF
};