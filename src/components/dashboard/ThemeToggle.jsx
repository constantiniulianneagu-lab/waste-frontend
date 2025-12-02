/**
 * ============================================================================
 * THEME TOGGLE - COMPACT & ELEGANT (CONSISTENT CU HEADER)
 * ============================================================================
 * Icon mic, consistent cu Search și Bell - fără rotund mare
 * ============================================================================
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all group"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Mod luminos' : 'Mod întunecat'}
    >
      {/* Sun (Light Mode) */}
      {!isDarkMode && (
        <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      )}
      
      {/* Moon (Dark Mode) */}
      {isDarkMode && (
        <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
      )}

      <span className="sr-only">
        {isDarkMode ? 'Schimbă la mod luminos' : 'Schimbă la mod întunecat'}
      </span>
    </button>
  );
};

export default ThemeToggle;