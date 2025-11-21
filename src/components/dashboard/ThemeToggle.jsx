/**
 * ============================================================================
 * THEME TOGGLE COMPONENT
 * ============================================================================
 * 
 * Toggle button for switching between dark and light mode
 * 
 * Features:
 * - Smooth animation on toggle
 * - Icon transition (Moon ↔ Sun)
 * - Tooltip on hover
 * - Accessible (keyboard navigation, ARIA labels)
 * 
 * Position: Usually in header/navbar (top-right)
 * 
 * Usage:
 * <ThemeToggle />
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-12 rounded-full
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDarkMode 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 focus:ring-yellow-500' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-blue-500'
        }
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Mod luminos' : 'Mod întunecat'}
    >
      {/* Icon Container with rotation animation */}
      <div className="relative w-6 h-6">
        {/* Sun Icon (Light Mode) */}
        <svg
          className={`
            absolute inset-0 w-6 h-6
            transition-all duration-500 ease-in-out
            ${isDarkMode 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>

        {/* Moon Icon (Dark Mode) */}
        <svg
          className={`
            absolute inset-0 w-6 h-6
            transition-all duration-500 ease-in-out
            ${isDarkMode 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        </svg>
      </div>

      {/* Optional: Ripple effect on click */}
      <span className="sr-only">
        {isDarkMode ? 'Schimbă la mod luminos' : 'Schimbă la mod întunecat'}
      </span>
    </button>
  );
};

export default ThemeToggle;