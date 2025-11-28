// src/api/apiClient.js
const API_URL = 'https://waste-backend-3u9c.onrender.com';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * API Client cu auto-refresh pentru access tokens
 * @param {string} endpoint - Endpoint-ul API (ex: '/api/users')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise} - Response data
 */
export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('wasteAccessToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    let response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Token expired - try refresh
    if (response.status === 401) {
      const data = await response.json();
      
      // Check if it's a token expiration (backend should return expired: true)
      if (data.expired && !isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshToken = localStorage.getItem('wasteRefreshToken');
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Try to refresh the token
          const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          const refreshData = await refreshResponse.json();
          
          if (refreshData.success && refreshData.data.accessToken) {
            // Save new access token
            localStorage.setItem('wasteAccessToken', refreshData.data.accessToken);
            
            // Process queued requests
            processQueue(null, refreshData.data.accessToken);
            
            // Retry original request with new token
            config.headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
            response = await fetch(`${API_URL}${endpoint}`, config);
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Clear queue and logout user
          processQueue(refreshError, null);
          
          // Clear all auth data
          localStorage.removeItem('wasteUser');
          localStorage.removeItem('wasteAccessToken');
          localStorage.removeItem('wasteRefreshToken');
          
          // Redirect to login
          window.location.href = '/';
          
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      } else if (isRefreshing) {
        // Token is being refreshed, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return fetch(`${API_URL}${endpoint}`, config).then(r => r.json());
        });
      } else {
        // Not a token expiration, just unauthorized
        throw new Error(data.message || 'Unauthorized');
      }
    }
    
    // Check for other HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Client Error:', error);
    throw error;
  }
};

/**
 * Helper function pentru GET requests
 */
export const apiGet = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiClient(url);
};

/**
 * Helper function pentru POST requests
 */
export const apiPost = (endpoint, data) => {
  return apiClient(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * Helper function pentru PUT requests
 */
export const apiPut = (endpoint, data) => {
  return apiClient(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * Helper function pentru DELETE requests
 */
export const apiDelete = (endpoint) => {
  return apiClient(endpoint, {
    method: 'DELETE'
  });
};