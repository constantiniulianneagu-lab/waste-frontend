
// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import WasteLogin from './WasteLogin';
import Dashboard from './Dashboard';
import DashboardLandfill from './components/dashboard/DashboardLandfill';
import Users from './Users';
import Institutions from './Institutions';
const ProtectedRoute = ({ children }) => {
const { user, loading } = useAuth();
if (loading) {
return (
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
<div className="text-center">
<div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
<p className="text-gray-600 dark:text-gray-300">Loading...</p>
</div>
</div>
);
}
return user ? children : <Navigate to="/login" replace />;
};
function App() {
return (
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
<Navbar />
  <Routes>
    {/* Public Route */}
    <Route path="/login" element={<WasteLogin />} />

    {/* Protected Routes */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard/landfill"
      element={
        <ProtectedRoute>
          <DashboardLandfill />
        </ProtectedRoute>
      }
    />

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

    {/* Fallback Route */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</div>
);
}
export default App;