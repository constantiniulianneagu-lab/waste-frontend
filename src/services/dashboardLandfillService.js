// src/services/dashboardLandfillService.js

import { apiGet } from '../api/apiClient';

/**
 * ============================================================================
 * DASHBOARD LANDFILL SERVICE
 * ============================================================================
 *
 * Service pentru obținerea statisticilor de depozitare de la backend API.
 *
 * Base URL (relativ față de apiClient): /api/dashboard/landfill
 *
 * Endpoints:
 * - GET /stats - statistici agregate
 *
 * Query Parameters:
 * - year: filtrare după an
 * - from: data de început (YYYY-MM-DD)
 * - to: data de sfârșit (YYYY-MM-DD)
 * - sector_id: filtrare după UUID sector
 *
 * Created: 2025-11-21
 * Updated: 2025-11-22 – refactor pentru a folosi apiClient.js (apiGet)
 * ============================================================================
 */

const BASE_PATH = '/api/dashboard/landfill';

/**
 * ============================================================================
 * DASHBOARD LANDFILL API METHODS
 * ============================================================================
 */

/**
 * Obține statisticile de depozitare (landfill) pentru dashboard.
 *
 * @param {Object} filters - Filtre pentru query
 * @param {number} [filters.year] - Anul
 * @param {string} [filters.from] - Data de început (YYYY-MM-DD)
 * @param {string} [filters.to] - Data de sfârșit (YYYY-MM-DD)
 * @param {string} [filters.sector_id] - UUID sector
 *
 * @returns {Promise<any>} Datele de statistici returnate de backend/apiClient
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
    console.log('🔍 Fetching landfill stats with params:', filters);

    // ✅ apiGet folosește automat apiClient care adaugă baseURL + token corect + query params
    const response = await apiGet(`${BASE_PATH}/stats`, filters);

    console.log('✅ Stats received:', response);
    return response;
  } catch (error) {
    console.error('❌ getLandfillStats error:', error);
    throw error;
  }
};

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Formatează un mesaj de eroare pentru afișare în UI
 *
 * @param {any} error
 * @returns {string}
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'A apărut o eroare neașteptată.';
};

/**
 * Verifică dacă API-ul este accesibil.
 * Folosește același apiClient (și deci aceeași configurație de baseURL).
 *
 * @returns {Promise<boolean>}
 */
export const checkApiHealth = async () => {
  try {
    // Ajustează endpoint-ul în funcție de cum e definit în backend:
    // - '/health' sau
    // - '/api/health'
    await apiGet('/health');
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Export serviciu ca obiect
 */
const dashboardLandfillService = {
  getLandfillStats,
  formatErrorMessage,
  checkApiHealth,
};

export default dashboardLandfillService;
