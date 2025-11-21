/**
 * ============================================================================
 * USE THEME HOOK
 * ============================================================================
 * 
 * Custom hook for accessing theme context
 * 
 * Usage:
 * const { isDarkMode, toggleTheme } = useTheme();
 * 
 * Returns:
 * - isDarkMode: boolean - Current theme state
 * - toggleTheme: function - Toggle between dark/light mode
 * 
 * Example:
 * ```jsx
 * import { useTheme } from '@/hooks/useTheme';
 * 
 * function MyComponent() {
 *   const { isDarkMode, toggleTheme } = useTheme();
 *   
 *   return (
 *     <div className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
 *       <button onClick={toggleTheme}>
 *         {isDarkMode ? '🌙' : '☀️'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Created: 2025-11-21
 * ============================================================================
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook to access theme context
 * @throws {Error} If used outside ThemeProvider
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default useTheme;