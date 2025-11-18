// src/userService.js
const API_URL = 'https://waste-backend-3u9c.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('wasteAccessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/users?${queryString}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create user
  createUser: async (userData) => {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get stats
  getUserStats: async () => {
    const response = await fetch(`${API_URL}/api/users/stats`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};