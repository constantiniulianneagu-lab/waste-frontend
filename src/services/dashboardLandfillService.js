/**
 * ============================================================================
 * DASHBOARD LANDFILL SERVICE
 * ============================================================================
 * 
 * Service for fetching landfill dashboard statistics from backend API
 * 
 * Base URL: /api/dashboard/landfill
 * 
 * Endpoints:
 * - GET /stats - Get comprehensive statistics
 * 
 * Query Parameters:
 * - year: Filter by year
 * - from: Start date (YYYY-MM-DD)
 * - to: End date (YYYY-MM-DD)
 * - sector_id: Filter by sector UUID
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waste-backend-3u9c.onrender.com';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  const authData = localStorage.getItem('wasteapp-auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.accessToken;
    } catch (e) {
      console.error('Failed to parse auth data:', e);
      return null;
    }
  }
  return null;
};

/**
 * Build query string from params object
 */
const buildQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
};

/**
 * Make authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('wasteapp-auth');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * DASHBOARD LANDFILL API METHODS
 * ============================================================================
 */

/**
 * Get comprehensive landfill statistics
 * 
 * @param {Object} filters - Query filters
 * @param {number} filters.year - Year filter
 * @param {string} filters.from - Start date (YYYY-MM-DD)
 * @param {string} filters.to - End date (YYYY-MM-DD)
 * @param {string} filters.sector_id - Sector UUID filter
 * 
 * @returns {Promise<Object>} Dashboard statistics data
 * 
 * @example
 * const stats = await getLandfillStats({
 *   year: 2025,
 *   from: '2025-01-01',
 *   to: '2025-11-21',
 *   sector_id: 'uuid-here'
 * });
 */
export const getLandfillStats = async (filters = {}) => {
  try {
    const queryString = buildQueryString(filters);
    const endpoint = `/api/dashboard/landfill/stats${queryString}`;
    
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });

    // Validate response structure
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch statistics');
    }

    return response.data;
  } catch (error) {
    console.error('getLandfillStats error:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Format error message for display
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Check if API is reachable
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Export service object
 */
const dashboardLandfillService = {
  getLandfillStats,
  formatErrorMessage,
  checkApiHealth,
};

export default dashboardLandfillService;