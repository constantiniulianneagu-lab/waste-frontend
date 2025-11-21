// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import WasteLogin from './WasteLogin';
import Dashboard from './Dashboard';
import Users from './Users';
import Institutions from './Institutions';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      // 🎨 Adaptat pentru dark/light mode
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
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
    // 🎨 PASUL 1: ThemeProvider (cel mai extern - theme e global)
    <ThemeProvider>
      {/* PASUL 2: AuthProvider (auth logic) */}
      <AuthProvider>
        {/* PASUL 3: AppContent (aplicația propriu-zisă) */}
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;