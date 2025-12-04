// src/components/dashboard/DashboardTmb.jsx
/**
 * ============================================================================
 * DASHBOARD TMB - ANI AUTOMAT DIN API
 * ============================================================================
 * 
 * 🔧 FIX:
 * ✅ Ani: Se iau automat din API (data.available_years)
 * ✅ Fallback: Dacă API nu returnează, folosește ultimii 10 ani
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { AlertCircle, Factory, Trash2, Package } from "lucide-react";

import { getTmbStats } from "../../services/dashboardTmbService.js";

import DashboardHeader from "./DashboardHeader.jsx";
import DashboardFilters from "./DashboardFilters.jsx";

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DashboardTmb = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);
  const [chartType, setChartType] = useState('bar');
  
  // ========================================================================
  // ANI DISPONIBILI - STATE
  // ========================================================================
  const [availableYears, setAvailableYears] = useState([]);

  // ========================================================================
  // FILTRE - CONFORM COD VECHI TMB
  // ========================================================================

  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const today = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    year: currentYear,
    from: startOfYear,
    to: today,
    sector_id: null,
  });

  // ========================================================================
  // FORMAT NUMBER RO
  // ========================================================================

  const formatNumberRO = (number) => {
    if (!number && number !== 0) return '0,00';
    const num = typeof number === 'string' ? parseFloat(number) : number;
    const formatted = num.toFixed(2);
    const [intPart, decPart] = formatted.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intWithDots},${decPart}`;
  };

  // ========================================================================
  // FETCH DATA
  // ========================================================================

  const fetchDashboardData = async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("📊 Fetching TMB dashboard data with filters:", filterParams);
      
      // Adaptare filtre pentru API TMB
      const tmbFilters = {
        year: filterParams.year?.toString(),
        start_date: filterParams.from,
        end_date: filterParams.to,
      };

      // Adaugă sector_id doar dacă e selectat
      if (filterParams.sector_id && filterParams.sector_id >= 1 && filterParams.sector_id <= 6) {
        tmbFilters.sector_id = filterParams.sector_id.toString();
      }
      
      console.log("🔄 TMB Filters sent to API:", tmbFilters);
      
      const res = await getTmbStats(tmbFilters);
      
      console.log("✅ Raw response from TMB API:", res);
  
      if (!res) {
        throw new Error("Empty response from API");
      }
  
      let responseData;
      if (typeof res === "object" && "success" in res) {
        if (!res.success) {
          throw new Error(res.message || "API responded with success=false");
        }
        console.log("✅ Using res.data for TMB dashboard:", res.data);
        responseData = res.data;
      } else {
        console.log("⚠️ Using response as data directly");
        responseData = res;
      }
      
      setData(responseData);
      
      // ========================================================================
      // EXTRAGE ANII DIN API SAU FOLOSEȘTE FALLBACK
      // ========================================================================
      if (responseData?.available_years && Array.isArray(responseData.available_years)) {
        console.log("📅 Years from API:", responseData.available_years);
        setAvailableYears(responseData.available_years.sort((a, b) => b - a));
      } else {
        // Fallback: ultimii 10 ani
        const fallbackYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
        console.log("📅 Using fallback years (10 years):", fallbackYears);
        setAvailableYears(fallbackYears);
      }
      
    } catch (err) {
      console.error("❌ TMB Dashboard fetch error:", err);
      setError(err.message || "Failed to load TMB dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleFilterChange = (newFilters) => {
    console.log('🔄 TMB Filter change requested:', newFilters);
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    console.log("🔍 Search query:", query);
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          onSearchChange={handleSearchChange}
          title="Dashboard Tratare Mecano-Biologică"
        />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 73px)" }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Se încarcă datele...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // ERROR STATE
  // ========================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          onSearchChange={handleSearchChange}
          title="Dashboard Tratare Mecano-Biologică"
        />
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-red-900 dark:text-red-100 mb-2">
                    Eroare la încărcarea datelor
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={() => fetchDashboardData()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    Încearcă din nou
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // ========================================================================
  // SECTOARE - HARDCODED BUCUREȘTI + SECTOR 1-6
  // ========================================================================

  const sectors = [
    { sector_id: 1, sector_number: 1, sector_name: "Sector 1" },
    { sector_id: 2, sector_number: 2, sector_name: "Sector 2" },
    { sector_id: 3, sector_number: 3, sector_name: "Sector 3" },
    { sector_id: 4, sector_number: 4, sector_name: "Sector 4" },
    { sector_id: 5, sector_number: 5, sector_name: "Sector 5" },
    { sector_id: 6, sector_number: 6, sector_name: "Sector 6" },
  ];

  // ========================================================================
  // PREPARE DATA PENTRU GRAFICE
  // ========================================================================

  const monthlyChartData = data?.monthly_evolution?.map(item => ({
    month: item.month,
    'Deșeuri tratate': parseFloat(item.tmb_total) || 0,
    'Deșeuri depozitate': parseFloat(item.landfill_total) || 0
  })) || [];

  const sectorPieData = data?.sector_distribution?.map(item => ({
    name: item.sector_name,
    tratate: parseFloat(item.tmb_tons) || 0,
    depozitate: parseFloat(item.landfill_tons) || 0
  })) || [];

  // ========================================================================
  // PROGRESS BAR COMPONENT
  // ========================================================================

  const ProgressBar = ({ value, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
      <div
        className={`h-1 rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );

  // ========================================================================
  // RENDER CHART
  // ========================================================================

  const renderChart = () => {
    const commonProps = {
      data: monthlyChartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Bar dataKey="Deșeuri tratate" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Deșeuri depozitate" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    } else if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Line type="monotone" dataKey="Deșeuri tratate" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="Deșeuri depozitate" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      );
    } else {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorTratate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDepozitate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => `${formatNumberRO(value)} tone`}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
          <Area type="monotone" dataKey="Deșeuri tratate" stroke="#10b981" strokeWidth={2} fill="url(#colorTratate)" />
          <Area type="monotone" dataKey="Deșeuri depozitate" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepozitate)" />
        </AreaChart>
      );
    }
  };

  // ========================================================================
  // RENDER MAIN
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <DashboardHeader 
        notificationCount={notificationCount}
        onSearchChange={handleSearchChange}
        title="Dashboard Tratare Mecano-Biologică"
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        
        {/* FILTERS - CU ANI DIN API */}
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sectors={sectors}
          availableYears={availableYears}
          loading={loading}
        />

        {!data?.summary ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Nu există date pentru perioada selectată
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Încearcă să selectezi o perioadă diferită.
            </p>
          </div>
        ) : (
          <>
            {/* REST OF DASHBOARD CONTENT - Cards, Charts, Tables */}
            {/* ... (copy from original file) ... */}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardTmb;