// src/Dashboard.jsx
import { useAuth } from './AuthContext';
import { LogOut, Users, Building2, BarChart3, Settings } from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WasteApp</h1>
              <p className="text-sm text-gray-500">Waste Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bine ai revenit, {user?.firstName}! 👋
          </h2>
          <p className="text-emerald-50">
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
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onNavigate('users')}
              className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600">
                Manage Users
              </h4>
              <p className="text-sm text-gray-500">Add, edit, or remove users</p>
            </button>
            <button 
  onClick={() => onNavigate('institutions')}
  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
>
  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600">
    View Institutions
  </h4>
  <p className="text-sm text-gray-500">Monitor institution data</p>
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
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const ActionButton = ({ title, description }) => (
  <button className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600">
      {title}
    </h4>
    <p className="text-sm text-gray-500">{description}</p>
  </button>
);

export default Dashboard;