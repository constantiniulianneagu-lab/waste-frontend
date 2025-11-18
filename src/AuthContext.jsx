// src/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('wasteUser');
    const token = localStorage.getItem('wasteAccessToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('wasteUser', JSON.stringify(userData));
    localStorage.setItem('wasteAccessToken', accessToken);
    localStorage.setItem('wasteRefreshToken', refreshToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('wasteUser');
    localStorage.removeItem('wasteAccessToken');
    localStorage.removeItem('wasteRefreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};