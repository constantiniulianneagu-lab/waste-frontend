import React from 'react';
import ThemeToggle from './dashboard/ThemeToggle';

function Header({ user }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo și titlu */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🗑️ WasteApp
              </h1>
            </div>
          </div>

          {/* Right side: User info + Theme toggle */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {user?.email}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout button */}
            <button className="text-red-600 hover:text-red-700 dark:text-red-400">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;