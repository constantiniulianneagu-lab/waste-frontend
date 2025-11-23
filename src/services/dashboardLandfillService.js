// src/services/dashboardLandfillService.js

import { apiGet } from '../api/apiClient';

/**
 * ============================================================================
 * DASHBOARD LANDFILL SERVICE - FIXED v2
 * ============================================================================
 *
 * 🔧 CHANGES:
 * - Clean params before sending (remove null/undefined/empty strings)
 * - Better logging
 * - Type validation
 *
 * ============================================================================
 */

const BASE_PATH = '/api/dashboard/landfill';

/**
 * Curăță parametrii de filtrare înainte de a-i trimite la API
 * Elimină valorile null, undefined, empty string
 * 
 * @param {Object} filters - Filtre brute
 * @returns {Object} - Filtre curate
 */
const cleanFilters = (filters = {}) => {
  const cleaned = {};
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    
    // Skip null, undefined, empty string
    if (value === null || value === undefined || value === '') {
      return;
    }
    
    // Skip NaN
    if (typeof value === 'number' && isNaN(value)) {
      return;
    }
    
    cleaned[key] = value;
  });
  
  return cleaned;
};

/**
 * Obține statisticile de depozitare (landfill) pentru dashboard.
 *
 * @param {Object} filters - Filtre pentru query
 * @param {number} [filters.year] - Anul
 * @param {string} [filters.from] - Data de început (YYYY-MM-DD)
 * @param {string} [filters.to] - Data de sfârșit (YYYY-MM-DD)
 * @param {number} [filters.sector_id] - Sector number (1-6)
 *
 * @returns {Promise<any>} Datele de statistici returnate de backend
 *
 * @example
 * // Toate sectoarele
 * const stats = await getLandfillStats({
 *   year: 2025,
 *   from: '2025-01-01',
 *   to: '2025-11-21'
 * });
 * 
 * // Sector specific
 * const stats = await getLandfillStats({
 *   year: 2025,
 *   from: '2025-01-01',
 *   to: '2025-11-21',
 *   sector_id: 5
 * });
 */
export const getLandfillStats = async (filters = {}) => {
  try {
    console.log('📊 getLandfillStats called with raw filters:', filters);
    
    // 🔧 FIX: Curăță parametrii înainte de trimitere
    const cleanedFilters = cleanFilters(filters);
    
    console.log('✅ Cleaned filters for API:', cleanedFilters);
    
    // Validare sector_id dacă există
    if (cleanedFilters.sector_id) {
      const sectorId = parseInt(cleanedFilters.sector_id, 10);
      
      if (isNaN(sectorId) || sectorId < 1 || sectorId > 6) {
        console.error('❌ Invalid sector_id:', cleanedFilters.sector_id);
        throw new Error(`Invalid sector_id: ${cleanedFilters.sector_id}. Must be between 1 and 6.`);
      }
      
      // Asigură-te că e integer
      cleanedFilters.sector_id = sectorId;
    }
    
    console.log('🔍 Final params to send:', cleanedFilters);
    
    // apiGet folosește automat apiClient care adaugă baseURL + token + query params
    const response = await apiGet(`${BASE_PATH}/stats`, cleanedFilters);

    console.log('✅ Stats received from API:', response);
    
    // Returnează response-ul așa cum vine (apiClient.js deja face parse JSON)
    return response;
    
  } catch (error) {
    console.error('❌ getLandfillStats error:', error);
    console.error('Error details:', {
      message: error.message,
      filters: filters
    });
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
 *
 * @returns {Promise<boolean>}
 */
export const checkApiHealth = async () => {
  try {
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