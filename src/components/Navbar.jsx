// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from './dashboard/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Nu afișăm navbar pe login
  if (!user || location.pathname === '/login') return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🗑️</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              WasteApp
            </span>
          </Link>

          {/* Menu Items */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              🏠 Home
            </Link>

            <Link 
              to="/dashboard/landfill"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              📊 Dashboard Landfill
            </Link>

            <Link 
              to="/users"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              👥 Users
            </Link>

            <Link 
              to="/institutions"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
            >
              🏢 Institutions
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout */}
            <button
              onClick={logout}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
