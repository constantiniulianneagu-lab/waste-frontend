const API_URL = 'https://waste-backend-3u9c.onrender.com';

export const apiGet = async (endpoint, params = {}) => {
  const token = localStorage.getItem('wasteAccessToken');
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  const response = await fetch(`${API_URL}${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};