// src/institutionService.js
const API_URL = 'https://waste-backend-3u9c.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('wasteAccessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const institutionService = {
  // Get all institutions
  getAllInstitutions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/institutions?${queryString}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get institution by ID
  getInstitutionById: async (id) => {
    const response = await fetch(`${API_URL}/api/institutions/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create institution
  createInstitution: async (institutionData) => {
    const response = await fetch(`${API_URL}/api/institutions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(institutionData)
    });
    return response.json();
  },

  // Update institution
  updateInstitution: async (id, institutionData) => {
    const response = await fetch(`${API_URL}/api/institutions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(institutionData)
    });
    return response.json();
  },

  // Delete institution
  deleteInstitution: async (id) => {
    const response = await fetch(`${API_URL}/api/institutions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get stats
  getInstitutionStats: async () => {
    const response = await fetch(`${API_URL}/api/institutions/stats`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};