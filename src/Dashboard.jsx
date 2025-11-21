// src/Dashboard.jsx
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Building2, BarChart3, Settings } from 'lucide-react';
import ThemeToggle from './components/dashboard/ThemeToggle';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">WasteApp</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Waste Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
            
            <ThemeToggle />
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bine ai revenit, {user?.firstName}! 👋
          </h2>
          <p className="text-emerald-50 dark:text-emerald-100">
            Role: {user?.role} | Email: {user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value="24"
            color="blue"
          />
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            title="Institutions"
            value="12"
            color="emerald"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Reports"
            value="156"
            color="purple"
          />
          <StatCard
            icon={<Settings className="w-6 h-6" />}
            title="Settings"
            value="8"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/users')}
              className="text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group bg-white dark:bg-gray-700"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Manage Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove users</p>
            </button>
            <button 
              onClick={() => navigate('/institutions')}
              className="text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group bg-white dark:bg-gray-700"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                View Institutions
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monitor institution data</p>
            </button>
            <ActionButton title="Generate Report" description="Create waste management reports" />
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

const ActionButton = ({ title, description }) => (
  <button className="text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group bg-white dark:bg-gray-700">
    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
      {title}
    </h4>
    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
  </button>
);

export default Dashboard;
