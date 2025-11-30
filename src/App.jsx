// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

import Sidebar from "./components/Sidebar";
import WasteLogin from "./WasteLogin";
import DashboardLandfill from "./components/dashboard/DashboardLandfill";
import DashboardTmb from './components/dashboard/DashboardTmb';
import Users from "./Users";
import Institutions from "./Institutions";
import ReportsMain from './components/reports/ReportsMain';
import ReportTMB from './components/reports/ReportTMB'; // 🆕 NOU - Raportare TMB


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

  const showSidebar = user && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] transition-colors">
      <Sidebar />
      <div className={showSidebar ? "ml-60 transition-all duration-300" : ""}>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<WasteLogin />} />

          {/* Redirect root → dashboard landfill */}
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