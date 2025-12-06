// src/userService.js
/**
 * ============================================================================
 * USER SERVICE - API CALLS
 * ============================================================================
 * Compatibil cu apiClient function-based
 * ============================================================================
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api/apiClient';

export const userService = {
  // ========================================================================
  // USER PROFILE (ALL AUTHENTICATED USERS)
  // ========================================================================

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  getUserProfile: async () => {
    try {
      const data = await apiGet('/api/users/profile');
      return data;
    } catch (error) {
      console.error('getUserProfile error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la încărcarea profilului'
      };
    }
  },

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  updateProfile: async (profileData) => {
    try {
      const data = await apiPut('/api/users/profile', profileData);
      return data;
    } catch (error) {
      console.error('updateProfile error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la actualizarea profilului'
      };
    }
  },

  /**
   * Update current user password
   * PUT /api/users/password
   */
  updatePassword: async (passwordData) => {
    try {
      const data = await apiPut('/api/users/password', passwordData);
      return data;
    } catch (error) {
      console.error('updatePassword error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la schimbarea parolei'
      };
    }
  },

  // ========================================================================
  // USER MANAGEMENT (PLATFORM_ADMIN ONLY)
  // ========================================================================

  /**
   * Get all users with pagination and filters
   * GET /api/users
   */
  getAllUsers: async (params = {}) => {
    try {
      const data = await apiGet('/api/users', params);
      return data;
    } catch (error) {
      console.error('getAllUsers error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la încărcarea utilizatorilor'
      };
    }
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById: async (id) => {
    try {
      const data = await apiGet(`/api/users/${id}`);
      return data;
    } catch (error) {
      console.error('getUserById error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la încărcarea utilizatorului'
      };
    }
  },

  /**
   * Create new user
   * POST /api/users
   */
  createUser: async (userData) => {
    try {
      const data = await apiPost('/api/users', userData);
      return data;
    } catch (error) {
      console.error('createUser error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la crearea utilizatorului'
      };
    }
  },

  /**
   * Update user
   * PUT /api/users/:id
   */
  updateUser: async (id, userData) => {
    try {
      const data = await apiPut(`/api/users/${id}`, userData);
      return data;
    } catch (error) {
      console.error('updateUser error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la actualizarea utilizatorului'
      };
    }
  },

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  deleteUser: async (id) => {
    try {
      const data = await apiDelete(`/api/users/${id}`);
      return data;
    } catch (error) {
      console.error('deleteUser error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la ștergerea utilizatorului'
      };
    }
  },

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  getUserStats: async () => {
    try {
      const data = await apiGet('/api/users/stats');
      return data;
    } catch (error) {
      console.error('getUserStats error:', error);
      return {
        success: false,
        message: error.message || 'Eroare la încărcarea statisticilor'
      };
    }
  }
};