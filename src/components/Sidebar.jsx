// src/components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ThemeToggle from './dashboard/ThemeToggle';
import {
  LayoutDashboard,
  BarChart3,
  Users as UsersIcon,
  Building2,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Nu afișăm sidebar pe login sau dacă nu există user
  if (!user || location.pathname === '/login') return null;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      color: 'emerald',
    },
    {
      title: 'Dashboard Landfill',
      icon: BarChart3,
      path: '/dashboard/landfill',
      color: 'blue',
    },
    {
      title: 'Users',
      icon: UsersIcon,
      path: '/users',
      color: 'purple',
    },
    {
      title: 'Institutions',
      icon: Building2,
      path: '/institutions',
      color: 'orange',
    },
    {
      title: 'Reports',
      icon: FileText,
      path: '/reports',
      color: 'pink',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      color: 'gray',
    },
  ];

  const colorClasses = {
    emerald:
      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    purple:
      'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    orange:
      'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    pink: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
    gray: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } flex flex-col z-50`}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                SAMD
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monitorizare Deșeuri
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div
        className={`px-4 py-6 border-b border-gray-200 dark:border-gray-800 ${
          isCollapsed ? 'flex justify-center' : ''
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.role}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                  active
                    ? `${colorClasses[item.color]} shadow-lg scale-105`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full" />
                )}

                <Icon
                  className={`w-5 h-5 ${
                    active ? 'animate-pulse' : 'group-hover:scale-110'
                  } transition-transform`}
                />

                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}

                {/* Tooltip pentru collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {/* Theme Toggle */}
        <div
          className={`flex items-center gap-3 px-3 py-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <ThemeToggle />
          {!isCollapsed && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Theme
            </span>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium text-sm">Logout</span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
