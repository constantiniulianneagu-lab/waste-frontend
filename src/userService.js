// src/userService.js
import { apiGet, apiPost, apiPut, apiDelete } from './api/apiClient';

export const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    return apiGet('/api/users', params);
  },

  // Get user by ID
  getUserById: async (id) => {
    return apiGet(`/api/users/${id}`);
  },

  // Create user
  createUser: async (userData) => {
    return apiPost('/api/users', userData);
  },

  // Update user
  updateUser: async (id, userData) => {
    return apiPut(`/api/users/${id}`, userData);
  },

  // Delete user
  deleteUser: async (id) => {
    return apiDelete(`/api/users/${id}`);
  },

  // Get stats
  getUserStats: async () => {
    return apiGet('/api/users/stats');
  }
};