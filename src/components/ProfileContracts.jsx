// src/components/ProfileContracts.jsx
/**
 * ============================================================================
 * PROFILE CONTRACTS - Contracte active vizibile utilizatorului
 * ============================================================================
 * Afișează contractele active filtrate după rolul utilizatorului:
 * - PLATFORM_ADMIN / REGULATOR_VIEWER → toate sectoarele
 * - ADMIN_INSTITUTION / EDITOR_INSTITUTION PMB → toate sectoarele
 * - ADMIN_INSTITUTION / EDITOR_INSTITUTION Sector X → doar sectorul lor
 *
 * Design: tab-uri per categorie, tabel compact, dark/light mode
 * ============================================================================
 */

import { useState, useMemo } from 'react';
import {
  Truck, Layers, Wind, Flame, Factory, Trash2,
  Calendar, TrendingUp, Package, ChevronRight,
  AlertCircle, LayoutGrid, CheckCircle2,
} from 'lucide-react';

// ============================================================================
// CONFIG
// ============================================================================

const CONTRACT_CATEGORIES = [
  { key: 'ALL',        label: 'Toate',       icon: LayoutGrid,  color: 'teal' },
  { key: 'WASTE_COLLECTOR', label: 'Colectare',  icon: Truck,     color: 'blue' },
  { key: 'SORTING',   label: 'Sortare',     icon: Layers,    color: 'purple' },
  { key: 'AEROBIC',   label: 'Aerobă',      icon: Wind,      color: 'green' },
  { key: 'ANAEROBIC', label: 'Anaerobă',    icon: Flame,     color: 'orange' },
  { key: 'TMB',       label: 'TMB',         icon: Factory,   color: 'emerald' },
  { key: 'DISPOSAL',  label: 'Depozitare',  icon: Trash2,    color: 'red' },
];

const COLOR_MAP = {
  teal:    { tab: 'bg-teal-500 text-white',    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',    dot: 'bg-teal-500',    count: 'text-teal-600 dark:text-teal-400' },
  blue:    { tab: 'bg-blue-500 text-white',    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',    dot: 'bg-blue-500',    count: 'text-blue-600 dark:text-blue-400' },
  purple:  { tab: 'bg-purple-500 text-white',  badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',  dot: 'bg-purple-500',  count: 'text-purple-600 dark:text-purple-400' },
  green:   { tab: 'bg-green-500 text-white',   badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',   dot: 'bg-green-500',   count: 'text-green-600 dark:text-green-400' },
  orange:  { tab: 'bg-orange-500 text-white',  badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',  dot: 'bg-orange-500',  count: 'text-orange-600 dark:text-orange-400' },
  emerald: { tab: 'bg-emerald-500 text-white', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', count: 'text-emerald-600 dark:text-emerald-400' },
  red:     { tab: 'bg-red-500 text-white',     badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',     dot: 'bg-red-500',     count: 'text-red-600 dark:text-red-400' },
};

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' RON';
};

const formatQty = (v) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v) + ' t';
};

const isExpired = (dateEnd) => {
  if (!dateEnd) return false;
  return new Date(dateEnd) < new Date();
};

const isContractActive = (c) => {
  const end = c.contract_date_end;
  if (isExpired(end)) return false;
  return c.is_active;
};

// Flatten operators → individual contracts with type + operator info
const flattenContracts = (operators) => {
  const result = [];
  const seen = new Set();
  for (const op of (operators || [])) {
    const type = op.operator_type;
    for (const c of (op.contracts || [])) {
      // Deduplicate by contract_id + type (TMB returns one row per contract already)
      const key = `${type}-${c.contract_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      
      // For TMB, operator_name comes from primary_operator field on the contract
      const operatorName = type === 'TMB_OPERATOR'
        ? [c.primary_operator, c.secondary_operator].filter(Boolean).join(' + ')
        : op.name;
      
      result.push({
        ...c,
        operator_name: operatorName,
        operator_id: op.id,
        contract_type: type,
      });
    }
  }
  return result;
};

// Map operator_type → category key
const typeToCategory = {
  WASTE_COLLECTOR:  'WASTE_COLLECTOR',
  SORTING_OPERATOR: 'SORTING',
  TMB_OPERATOR:     'TMB',
  DISPOSAL_OPERATOR: 'DISPOSAL',
  // aerobic/anaerobic not returned by existing backend query yet → future
  AEROBIC_OPERATOR: 'AEROBIC',
  ANAEROBIC_OPERATOR: 'ANAEROBIC',
};

// ============================================================================
// SKELETON
// ============================================================================

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 dark:border-gray-700/30">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
             style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ============================================================================
// CONTRACT ROW
// ============================================================================

const ContractRow = ({ contract, categoryColor }) => {
  const active = isContractActive(contract);
  const colors = COLOR_MAP[categoryColor] || COLOR_MAP.teal;

  const tariff = contract.tariff_per_ton
    ? `${parseFloat(contract.tariff_per_ton).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON/t`
    : contract.total_per_ton
    ? `${parseFloat(contract.total_per_ton).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON/t`
    : '—';

  const qty = contract.estimated_quantity_tons
    ? formatQty(contract.estimated_quantity_tons)
    : contract.contracted_quantity_tons
    ? formatQty(contract.contracted_quantity_tons)
    : '—';

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors group">
      {/* Nr. contract */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
          <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
            {contract.contract_number}
          </span>
        </div>
      </td>

      {/* Operator */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {contract.operator_name}
        </span>
      </td>

      {/* Sector */}
      <td className="px-4 py-3">
        {contract.sector_number ? (
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${colors.badge}`}>
            S{contract.sector_number}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>

      {/* Perioadă */}
      <td className="px-4 py-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{formatDate(contract.contract_date_start)}</span>
          </div>
          <div className={`flex items-center gap-1 ${isExpired(contract.contract_date_end) ? 'text-red-500 dark:text-red-400' : ''}`}>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span>{formatDate(contract.contract_date_end)}</span>
            {isExpired(contract.contract_date_end) && (
              <span className="text-xs font-medium">(exp.)</span>
            )}
          </div>
        </div>
      </td>

      {/* Tarif */}
      <td className="px-4 py-3">
        <span className={`text-sm font-semibold ${colors.count}`}>
          {tariff}
        </span>
        {contract.cec_tax_per_ton && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            CEC: {parseFloat(contract.cec_tax_per_ton).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON/t
          </div>
        )}
      </td>

      {/* Cantitate */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">{qty}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        {active ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Activ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactiv
          </span>
        )}
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProfileContracts = ({ operators = [], loading = false, userRole }) => {
  const [activeTab, setActiveTab] = useState('ALL');

  // Flatten all contracts from operators
  const allContracts = useMemo(() => flattenContracts(operators), [operators]);

  // Only active contracts
  const activeContracts = useMemo(() => allContracts.filter(isContractActive), [allContracts]);

  // Counts per category (active only)
  const countsByCategory = useMemo(() => {
    const counts = { ALL: activeContracts.length };
    for (const cat of CONTRACT_CATEGORIES.slice(1)) {
      counts[cat.key] = activeContracts.filter(c => typeToCategory[c.contract_type] === cat.key).length;
    }
    return counts;
  }, [activeContracts]);

  // Filtered contracts for current tab
  const displayedContracts = useMemo(() => {
    if (activeTab === 'ALL') return activeContracts;
    return activeContracts.filter(c => typeToCategory[c.contract_type] === activeTab);
  }, [activeContracts, activeTab]);

  // Sort: sector → start date desc
  const sortedContracts = useMemo(() => {
    return [...displayedContracts].sort((a, b) => {
      const sA = a.sector_number || 99;
      const sB = b.sector_number || 99;
      if (sA !== sB) return sA - sB;
      return new Date(b.contract_date_start) - new Date(a.contract_date_start);
    });
  }, [displayedContracts]);

  // Current tab color
  const currentCategory = CONTRACT_CATEGORIES.find(c => c.key === activeTab) || CONTRACT_CATEGORIES[0];
  const currentColor = COLOR_MAP[currentCategory.color];

  // Don't render for REGULATOR_VIEWER (handled by parent)
  if (userRole === 'REGULATOR_VIEWER') return null;

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl
                    rounded-[28px] border border-gray-200 dark:border-gray-700/50
                    shadow-sm dark:shadow-none overflow-hidden">

      {/* ── Header ── */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-teal-500/10 dark:bg-teal-500/20
                           flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Contracte active
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {loading ? 'Se încarcă...' : `${activeContracts.length} contracte active din ${allContracts.length} total`}
              </p>
            </div>
          </div>

          {/* Stats chips */}
          {!loading && (
            <div className="hidden md:flex items-center gap-2">
              {CONTRACT_CATEGORIES.slice(1).map(cat => {
                const count = countsByCategory[cat.key];
                if (count === 0) return null;
                const colors = COLOR_MAP[cat.color];
                const Icon = cat.icon;
                return (
                  <div key={cat.key}
                       className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${colors.badge}`}>
                    <Icon className="w-3 h-3" />
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CONTRACT_CATEGORIES.map(cat => {
            const isActive = activeTab === cat.key;
            const count = countsByCategory[cat.key] ?? 0;
            const colors = COLOR_MAP[cat.color];
            const Icon = cat.icon;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold
                           transition-all duration-200 border
                           ${isActive
                             ? colors.tab + ' border-transparent shadow-sm'
                             : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                           }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                   ${isActive
                                     ? 'bg-white/20 text-white'
                                     : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                   }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/30">
                {['Nr. Contract', 'Operator', 'Sector', 'Perioadă', 'Tarif', 'Cantitate', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      ) : sortedContracts.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-[18px] bg-gray-100 dark:bg-gray-700/50
                         flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {activeTab === 'ALL'
              ? 'Nu există contracte active'
              : `Nu există contracte active de tip ${currentCategory.label}`}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Contractele vor apărea automat când sunt înregistrate
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-900/20">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nr. Contract</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operator</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sector</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perioadă</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarif</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantitate</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedContracts.map((contract, idx) => (
                <ContractRow
                  key={`${contract.contract_type}-${contract.contract_id || idx}`}
                  contract={contract}
                  categoryColor={
                    activeTab === 'ALL'
                      ? (CONTRACT_CATEGORIES.find(c => c.key === typeToCategory[contract.contract_type])?.color || 'teal')
                      : currentCategory.color
                  }
                />
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/30
                         flex items-center justify-between
                         bg-gray-50/50 dark:bg-gray-900/20">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {sortedContracts.length} {sortedContracts.length === 1 ? 'contract activ' : 'contracte active'}
              {activeTab !== 'ALL' && ` · ${currentCategory.label}`}
            </span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Date actualizate în timp real
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContracts;