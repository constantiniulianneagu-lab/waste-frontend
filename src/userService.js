// src/userService.js
/**
 * ============================================================================
 * USER SERVICE - API CALLS
 * ============================================================================
 * 
 * User Management (PLATFORM_ADMIN):
 * - getAllUsers
 * - getUserById
 * - createUser
 * - updateUser
 * - deleteUser
 * - getUserStats
 * 
 * User Profile (ALL USERS):
 * - getUserProfile
 * - updateProfile
 * - updatePassword
 * 
 * ============================================================================
 */

import apiClient from './api/apiClient';

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
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('getUserProfile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la încărcarea profilului'
      };
    }
  },

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('updateProfile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la actualizarea profilului'
      };
    }
  },

  /**
   * Update current user password
   * PUT /api/users/password
   */
  updatePassword: async (data) => {
    try {
      const response = await apiClient.put('/users/password', data);
      return response.data;
    } catch (error) {
      console.error('updatePassword error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la schimbarea parolei'
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
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('getAllUsers error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la încărcarea utilizatorilor'
      };
    }
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('getUserById error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la încărcarea utilizatorului'
      };
    }
  },

  /**
   * Create new user
   * POST /api/users
   */
  createUser: async (data) => {
    try {
      const response = await apiClient.post('/users', data);
      return response.data;
    } catch (error) {
      console.error('createUser error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la crearea utilizatorului'
      };
    }
  },

  /**
   * Update user
   * PUT /api/users/:id
   */
  updateUser: async (id, data) => {
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('updateUser error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la actualizarea utilizatorului'
      };
    }
  },

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('deleteUser error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la ștergerea utilizatorului'
      };
    }
  },

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('getUserStats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la încărcarea statisticilor'
      };
    }
  }
};