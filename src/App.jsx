// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import WasteLogin from './WasteLogin';
import Dashboard from './Dashboard';
import Users from './Users';
import Institutions from './Institutions';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WasteLogin />;
  }

  // Navigation
  if (currentPage === 'users') {
    return <Users onBack={() => setCurrentPage('dashboard')} />;
  }

  if (currentPage === 'institutions') {
    return <Institutions onBack={() => setCurrentPage('dashboard')} />;
  }

  return <Dashboard onNavigate={setCurrentPage} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;