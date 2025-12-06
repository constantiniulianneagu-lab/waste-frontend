// src/App.jsx
/**
 * ============================================================================
 * APP - WITH RESPONSIVE SIDEBAR & SHARED STATE
 * ============================================================================
 * 
 * ✅ State collapse partajat între Sidebar și toate paginile
 * ✅ Content resize automat: ml-72 (expanded) sau ml-20 (collapsed)
 * ✅ Smooth transitions 300ms
 * ✅ Rută profil utilizator adăugată
 * 
 * ============================================================================
 */

import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

import Sidebar from "./components/Sidebar";
import WasteLogin from "./WasteLogin";
import DashboardLandfill from "./components/dashboard/DashboardLandfill";
import DashboardTmb from './components/dashboard/DashboardTmb';
import Users from "./Users";
import Institutions from "./Institutions";
import ReportsMain from './components/reports/ReportsMain';
import ReportTMB from './components/reports/ReportTMB';
import UserProfile from './components/UserProfile'; // ✅ ADĂUGAT

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { user } = useAuth();
  const location = useLocation();

  // ========================================================================
  // SIDEBAR COLLAPSE STATE - PARTAJAT CU SIDEBAR
  // ========================================================================
  const [isCollapsed, setIsCollapsed] = useState(false);

  const showSidebar = user && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* SIDEBAR - cu state partajat */}
      {showSidebar && (
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
      )}

      {/* MAIN CONTENT - RESIZE AUTOMAT */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${showSidebar ? (isCollapsed ? "ml-20" : "ml-72") : "ml-0"}
        `}
      >
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<WasteLogin />} />

          {/* Redirect root */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/landfill" replace />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard/landfill"
            element={
              <ProtectedRoute>
                <DashboardLandfill />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/tmb"
            element={
              <ProtectedRoute>
                <DashboardTmb />
              </ProtectedRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsMain />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/tmb"
            element={
              <ProtectedRoute>
                <ReportTMB />
              </ProtectedRoute>
            }
          />

          {/* Management Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/institutions"
            element={
              <ProtectedRoute>
                <Institutions />
              </ProtectedRoute>
            }
          />

          {/* ✅ USER PROFILE ROUTE - NOU */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to="/dashboard/landfill" replace />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;