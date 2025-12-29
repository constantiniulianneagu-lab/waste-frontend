// src/config/api.js
/**
 * ============================================================================
 * API CONFIGURATION
 * ============================================================================
 * Configurare centralizată pentru API endpoints și constante
 */

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://waste-backend-3u9c.onrender.com';

// Storage Keys pentru localStorage
export const STORAGE_KEYS = {
  USER: 'wasteUser',
  ACCESS_TOKEN: 'wasteAccessToken',
  REFRESH_TOKEN: 'wasteRefreshToken'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',

  // Users
  USERS: '/api/users',
  USER_PROFILE: '/api/users/profile',
  USER_PASSWORD: '/api/users/password',
  USER_STATS: '/api/users/stats',

  // Institutions
  INSTITUTIONS: '/api/institutions',
  INSTITUTION_STATS: '/api/institutions/stats',

  // Sectors
  SECTORS: '/api/sectors',

  // Waste Codes
  WASTE_CODES: '/api/waste-codes',

  // Tickets
  TICKETS_LANDFILL: '/api/tickets/landfill',
  TICKETS_TMB: '/api/tickets/tmb',
  TICKETS_RECYCLING: '/api/tickets/recycling',
  TICKETS_RECOVERY: '/api/tickets/recovery',
  TICKETS_DISPOSAL: '/api/tickets/disposal',
  TICKETS_REJECTED: '/api/tickets/rejected',

  // Dashboard
  DASHBOARD_LANDFILL: '/api/dashboard/landfill',
  DASHBOARD_TMB: '/api/dashboard/tmb',

  // Reports
  REPORTS_LANDFILL: '/api/reports/landfill',
  REPORTS_TMB: '/api/reports/tmb',

  // Contracts
  CONTRACTS: '/api/contracts',
  CONTRACT_UPLOAD: (contractId) => `/api/contracts/${contractId}/upload`,
  CONTRACT_FILE: (contractId) => `/api/contracts/${contractId}/file`
};

// Helper function pentru a construi URL complet
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

// Helper function pentru headers cu autentificare
export const getAuthHeaders = (includeContentType = true) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

export default {
  API_BASE_URL,
  STORAGE_KEYS,
  API_ENDPOINTS,
  buildUrl,
  getAuthHeaders
};
