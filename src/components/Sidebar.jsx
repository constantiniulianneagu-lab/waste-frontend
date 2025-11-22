// src/components/Sidebar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "./dashboard/ThemeToggle";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Nu afișăm sidebar pe login sau dacă nu e user
  if (!user || location.pathname === "/login") return null;

  const menuItems = [
    {
      title: "Depozitare",
      icon: BarChart3,
      path: "/dashboard/landfill",
      color: "blue",
    },
    {
      title: "Tratare",
      icon: LayoutDashboard,
      path: "/dashboard/tmb",
      color: "emerald",
      disabled: true,
    },
    {
      title: "Rapoarte",
      icon: FileText,
      path: "/reports",
      color: "purple",
      disabled: true,
    },
    {
      title: "Operatori",
      icon: Users,
      path: "/users",
      color: "orange",
    },
    {
      title: "Institutions",
      icon: Building2,
      path: "/institutions",
      color: "pink",
    },
    {
      title: "Setări",
      icon: Settings,
      path: "/settings",
      color: "gray",
      disabled: true,
    },
  ];

  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-900/20",
    blue: "text-blue-400 bg-blue-900/20",
    purple: "text-purple-400 bg-purple-900/20",
    orange: "text-orange-400 bg-orange-900/20",
    pink: "text-pink-400 bg-pink-900/20",
    gray: "text-gray-400 bg-gray-800/50",
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#1a1f2e] border-r border-gray-800
                  transition-all duration-300 ease-in-out
                  ${isCollapsed ? "w-20" : "w-60"} flex flex-col z-50`}
    >
      {/* Header - Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800 px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">SAMD</h1>
              <p className="text-[10px] text-gray-400">Monitorizare Deșeuri</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.disabled ? "#" : item.path}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg
                            transition-all duration-200 relative
                            ${
                              active
                                ? `${colorClasses[item.color]} font-medium`
                                : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                            ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                {active && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}

                <Icon className="w-5 h-5 flex-shrink-0" />

                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - User Profile + Actions */}
      <div className="border-t border-gray-800">
        {/* User Profile */}
        <div
          className={`p-3 border-b border-gray-800 ${
            isCollapsed ? "flex justify-center" : ""
          }`}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
          )}
        </div>

        {/* Theme + Logout + Collapse */}
        <div className="p-2 space-y-1">
          {/* Theme */}
          <div
            className={`flex items-center gap-2 px-2 py-2 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <ThemeToggle />
            {!isCollapsed && (
              <span className="text-xs text-gray-400">Theme</span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 transition-all text-sm ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && (
              <span className="text-xs font-medium">Logout</span>
            )}
          </button>

          {/* Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
