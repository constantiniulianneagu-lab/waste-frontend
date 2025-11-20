// src/institutionService.js
import { apiGet, apiPost, apiPut, apiDelete } from './api/apiClient';

export const institutionService = {
  // Get all institutions
  getAllInstitutions: async (params = {}) => {
    return apiGet('/api/institutions', params);
  },

  // Get institution by ID
  getInstitutionById: async (id) => {
    return apiGet(`/api/institutions/${id}`);
  },

  // Create institution
  createInstitution: async (institutionData) => {
    return apiPost('/api/institutions', institutionData);
  },

  // Update institution
  updateInstitution: async (id, institutionData) => {
    return apiPut(`/api/institutions/${id}`, institutionData);
  },

  // Delete institution
  deleteInstitution: async (id) => {
    return apiDelete(`/api/institutions/${id}`);
  },

  // Get stats
  getInstitutionStats: async () => {
    return apiGet('/api/institutions/stats');
  }
};