/**
 * ============================================================================
 * THEME CONTEXT
 * ============================================================================
 * 
 * Provides dark/light mode management across the application
 * 
 * Features:
 * - Dark mode / Light mode toggle
 * - Persistence in localStorage
 * - System preference detection
 * - Smooth transitions
 * 
 * Usage:
 * 1. Wrap App with ThemeProvider
 * 2. Use useTheme() hook in components
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React, { createContext, useState, useEffect } from 'react';

// Create Theme Context
export const ThemeContext = createContext({
  isDarkMode: true,
  toggleTheme: () => {},
});

/**
 * Theme Provider Component
 * Manages theme state and persistence
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('wasteapp-theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }

    // Default to dark mode
    return true;
  });

  /**
   * Toggle between dark and light mode
   */
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      // Save to localStorage
      localStorage.setItem('wasteapp-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  /**
   * Apply theme class to document root
   */
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Optional: Add transition class for smooth theme switching
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [isDarkMode]);

  /**
   * Listen to system theme preference changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('wasteapp-theme');
      if (savedTheme === null) {
        setIsDarkMode(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;