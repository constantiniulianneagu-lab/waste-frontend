// src/App.jsx
/**
 * ============================================================================
 * APP - WITH RESPONSIVE SIDEBAR & SHARED STATE + ROLE GUARDS
 * ============================================================================
 */

import { useState, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

import Sidebar from "./components/Sidebar";
import WasteLogin from "./WasteLogin";
import DashboardLandfill from "./components/dashboard/DashboardLandfill";
import DashboardTmb from "./components/dashboard/DashboardTmb";
import ReportsMain from "./components/reports/ReportsMain";

// ✅ NEW: Import UsersPage from pages folder
import UsersPage from "./pages/UsersPage";
import ReportTMB from "./components/reports/ReportTMB";
import UserProfile from "./components/UserProfile";
import SectorStatsOverview from "./pages/SectorStatsOverview";
import SectorStatsDetail from "./pages/SectorStatsDetail";
import ContractsPage from "./pages/ContractsPage";

// ✅ NEW: Import from pages folder
import InstitutionsPage from "./pages/InstitutionsPage";

const ProtectedRoute = ({ children, allowedRoles = null }) => {
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

  if (!user) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard/landfill" replace />;
    }
  }

  return children;
};

function App() {
  const { user } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const showSidebar = !!user && location.pathname !== "/login";

  const roles = useMemo(
    () => ({
      dashboards: [
        "PLATFORM_ADMIN",
        "ADMIN_INSTITUTION",
        "EDITOR_INSTITUTION",
        "REGULATOR_VIEWER",
      ],
      reports: ["PLATFORM_ADMIN", "ADMIN_INSTITUTION", "EDITOR_INSTITUTION"],
      users: ["PLATFORM_ADMIN", "ADMIN_INSTITUTION"],
      institutions: ["PLATFORM_ADMIN"],
      contracts: ["PLATFORM_ADMIN", "ADMIN_INSTITUTION"],
      sectorStats: ["PLATFORM_ADMIN", "ADMIN_INSTITUTION", "EDITOR_INSTITUTION"],
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {showSidebar && (
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      )}

      <div
        className={`
          transition-all duration-300 ease-in-out
          ${showSidebar ? (isCollapsed ? "ml-20" : "ml-72") : "ml-0"}
        `}
      >
        <Routes>
          <Route path="/login" element={<WasteLogin />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/landfill" replace />
              </ProtectedRoute>
            }
          />

          {/* DASHBOARDS */}
          <Route
            path="/dashboard/landfill"
            element={
              <ProtectedRoute allowedRoles={roles.dashboards}>
                <DashboardLandfill />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/tmb"
            element={
              <ProtectedRoute allowedRoles={roles.dashboards}>
                <DashboardTmb />
              </ProtectedRoute>
            }
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={roles.reports}>
                <ReportsMain />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/tmb"
            element={
              <ProtectedRoute allowedRoles={roles.reports}>
                <ReportTMB />
              </ProtectedRoute>
            }
          />

          {/* CONTRACTS */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute allowedRoles={roles.contracts}>
                <ContractsPage />
              </ProtectedRoute>
            }
          />

          {/* USERS - Now using UsersPage */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={roles.users}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ INSTITUTIONS - Now using InstitutionsPage */}
          <Route
            path="/institutions"
            element={
              <ProtectedRoute allowedRoles={roles.institutions}>
                <InstitutionsPage />
              </ProtectedRoute>
            }
          />

          {/* SECTOR STATS */}
          <Route
            path="/sectoare"
            element={
              <ProtectedRoute allowedRoles={roles.sectorStats}>
                <SectorStatsOverview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sectoare/:sector_number"
            element={
              <ProtectedRoute allowedRoles={roles.sectorStats}>
                <SectorStatsDetail />
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

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