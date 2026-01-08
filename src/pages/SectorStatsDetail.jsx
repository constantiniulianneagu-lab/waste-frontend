// src/pages/SectorStatsDetail.jsx
/**
 * ============================================================================
 * SECTOR STATS DETAIL - STATISTICI COMPLETE PER SECTOR
 * ============================================================================
 * Modern UI - Samsung/Apple Style 2026
 * Afișează detalii complete pentru:
 * - Colectare
 * - Sortare
 * - TMB
 * - Depozitare
 * - Costuri totale și indicatori
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle, Truck, Recycle, Factory,
  Trash2, DollarSign, TrendingUp, Users, MapPin,
  Building2, Calendar, ChevronDown
} from 'lucide-react';
import { getSectorWasteManagementStats } from '../services/sectorWasteManagementService';

const SectorStatsDetail = () => {
  const { sector_number } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('all');

  // Available years
  const availableYears = Array.from(
    { length: 3 },
    (_, i) => new Date().getFullYear() - i
  );

  // Months in Romanian
  const months = [
    { value: 'all', label: 'Tot Anul' },
    { value: '1', label: 'Ianuarie' },
    { value: '2', label: 'Februarie' },
    { value: '3', label: 'Martie' },
    { value: '4', label: 'Aprilie' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Iunie' },
    { value: '7', label: 'Iulie' },
    { value: '8', label: 'August' },
    { value: '9', label: 'Septembrie' },
    { value: '10', label: 'Octombrie' },
    { value: '11', label: 'Noiembrie' },
    { value: '12', label: 'Decembrie' }
  ];

  useEffect(() => {
    fetchData();
  }, [sector_number, year, month]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { year };
      if (month !== 'all') {
        params.month = month;
      }

      const response = await getSectorWasteManagementStats(sector_number, params);

      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching sector stats:', err);
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('ro-RO');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Se încarcă statisticile sectorului...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/sectoare')}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 
                     hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la Sectoare
          </button>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-900 dark:text-red-100 mb-2">
                  Eroare la încărcarea datelor
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Încearcă din nou
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { sector_info, collection, sorting, tmb, disposal, totals } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/sectoare')}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 
                     hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la Sectoare
          </button>

          {/* Title & Info */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-600
                            flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Sector {sector_info.sector_number} - {sector_info.sector_name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(sector_info.population)} locuitori</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{sector_info.area_km2} km²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {/* Year */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  An
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                           rounded-lg text-sm font-medium text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Lună
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                           rounded-lg text-sm font-medium text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 lg:px-8 py-8 space-y-6">
        {/* COLECTARE */}
        <ComponentCard
          title="COLECTARE"
          icon={<Truck className="w-6 h-6" />}
          gradient="from-blue-500 to-indigo-600"
          data={collection}
          type="collection"
          formatNumber={formatNumber}
        />

        {/* SORTARE */}
        <ComponentCard
          title="SORTARE"
          icon={<Recycle className="w-6 h-6" />}
          gradient="from-emerald-500 to-teal-600"
          data={sorting}
          type="sorting"
          formatNumber={formatNumber}
        />

        {/* TMB */}
        <ComponentCard
          title="TMB (TRATARE MECANO-BIOLOGICĂ)"
          icon={<Factory className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-600"
          data={tmb}
          type="tmb"
          formatNumber={formatNumber}
        />

        {/* DEPOZITARE */}
        <ComponentCard
          title="DEPOZITARE"
          icon={<Trash2 className="w-6 h-6" />}
          gradient="from-red-500 to-rose-600"
          data={disposal}
          type="disposal"
          formatNumber={formatNumber}
        />

        {/* TOTALS */}
        <TotalsCard
          totals={totals}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * COMPONENT CARD - Pentru fiecare componentă (Colectare, Sortare, TMB, Depozitare)
 * ============================================================================
 */
const ComponentCard = ({ title, icon, gradient, data, type, formatNumber }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-[24px] 
                  border border-gray-200 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${gradient} p-6 cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-[16px] 
                          flex items-center justify-center text-white">
              {icon}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold mb-1">{title}</h2>
              <p className="text-sm opacity-90">
                Cost Total: {data.cost?.total_cost_formatted || '0,00'} RON
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-6 h-6 text-white transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Contract Warning */}
          {!data.has_contract && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 
                          rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ Contract lipsă pentru perioada selectată
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Costurile afișate sunt 0 RON deoarece nu există un contract activ.
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {type === 'collection' && (
              <>
                <StatBox
                  label="Cantitate Colectată"
                  value={`${data.total_tons_formatted} tone`}
                  gradient={gradient}
                />
                <StatBox
                  label="Cost/Tonă"
                  value={`${data.cost.cost_per_ton_formatted} RON`}
                  gradient={gradient}
                />
                <StatBox
                  label="Operatori"
                  value={data.operators?.length || 0}
                  gradient={gradient}
                />
                <StatBox
                  label="Tipuri Deșeuri"
                  value={data.waste_types?.length || 0}
                  gradient={gradient}
                />
              </>
            )}

            {type === 'sorting' && (
              <>
                <StatBox
                  label="Trimis la Sortare"
                  value={`${data.total_sent_formatted} tone`}
                  gradient={gradient}
                />
                <StatBox
                  label="Acceptat"
                  value={`${data.total_accepted_formatted} tone`}
                  gradient={gradient}
                />
                <StatBox
                  label="Reziduuri"
                  value={`${data.total_residues_formatted} tone`}
                  gradient={gradient}
                />
                <StatBox
                  label="Rată Acceptare"
                  value={`${data.acceptance_rate}%`}
                  gradient={gradient}
                />
              </>
            )}

            {type === 'tmb' && (
              <>
                <StatBox
                  label="Input TMB"
                  value={`${data.total_input_formatted} tone`}
                  gradient={gradient}
                />
                <StatBox
                  label="Reciclare"
                  value={`${data.outputs.recycling.tons_formatted} t (${data.outputs.recycling.percentage}%)`}
                  gradient={gradient}
                />
                <StatBox
                  label="Valorificare"
                  value={`${data.outputs.recovery.tons_formatted} t (${data.outputs.recovery.percentage}%)`}
                  gradient={gradient}
                />
                <StatBox
                  label="Depozitare"
                  value={`${data.outputs.disposal.tons_formatted} t (${data.outputs.disposal.percentage}%)`}
                  gradient={gradient}
                />
              </>
            )}

            {type === 'disposal' && (
              <>
                <StatBox
                  label="Total Depozitat"
                  value={`${data.total_disposal_formatted} tone`}
                  gradient={gradient}
                />
                <StatBox
                  label="Direct"
                  value={`${data.landfill_direct_formatted} t (${data.landfill_direct_pct}%)`}
                  gradient={gradient}
                />
                <StatBox
                  label="Din TMB"
                  value={`${data.landfill_from_tmb_formatted} t (${data.landfill_from_tmb_pct}%)`}
                  gradient={gradient}
                />
                <StatBox
                  label="Cost/Tonă Total"
                  value={`${data.cost.total_per_ton_formatted} RON`}
                  gradient={gradient}
                />
              </>
            )}
          </div>

          {/* Contract Info */}
          {data.has_contract && data.contract_info && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Informații Contract
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Număr Contract:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {data.contract_info.contract_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Operator:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {data.contract_info.operator_name || data.contract_info.station_name || data.contract_info.facility_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tarif:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatNumber(data.contract_info.tariff_per_ton)} RON/tonă
                  </span>
                </div>
                {data.contract_info.cec_tax_per_ton !== undefined && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Taxa CEC:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatNumber(data.contract_info.cec_tax_per_ton)} RON/tonă
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operators Table */}
          {data.operators && data.operators.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Operatori
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left">
                      <th className="pb-3 font-bold text-gray-600 dark:text-gray-400">Nume</th>
                      <th className="pb-3 font-bold text-gray-600 dark:text-gray-400 text-right">Cantitate</th>
                      {data.operators[0].percentage !== undefined && (
                        <th className="pb-3 font-bold text-gray-600 dark:text-gray-400 text-right">Procent</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.operators.map((op, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="py-3 text-gray-900 dark:text-white">{op.name}</td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                          {op.tons_collected_formatted || op.tons_received_formatted || op.tons_processed_formatted} t
                        </td>
                        {op.percentage !== undefined && (
                          <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                            {op.percentage}%
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TMB Stations */}
          {data.stations && data.stations.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Stații TMB
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left">
                      <th className="pb-3 font-bold text-gray-600 dark:text-gray-400">Nume Stație</th>
                      <th className="pb-3 font-bold text-gray-600 dark:text-gray-400 text-right">Cantitate Procesată</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.stations.map((st, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="py-3 text-gray-900 dark:text-white">{st.name}</td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                          {st.tons_processed_formatted} t
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Facilities */}
          {data.facilities && data.facilities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Depozite
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-left">
                      <th className="pb-3 font-bold text-gray-600 dark:text-gray-400">Nume Depozit</th>
                      <th className="pb-3 font-bold text-gray-600 dark:text-gray-400 text-right">Cantitate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.facilities.map((f, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="py-3 text-gray-900 dark:text-white">{f.name}</td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                          {f.tons_formatted} t
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ============================================================================
 * STAT BOX
 * ============================================================================
 */
const StatBox = ({ label, value, gradient }) => (
  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
      {label}
    </p>
    <p className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
      {value}
    </p>
  </div>
);

/**
 * ============================================================================
 * TOTALS CARD
 * ============================================================================
 */
const TotalsCard = ({ totals, formatNumber }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[24px] p-8 text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-[16px] 
                      flex items-center justify-center">
          <DollarSign className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">COST TOTAL LANȚ</h2>
          <p className="text-sm opacity-90">Toate componentele combinate</p>
        </div>
      </div>

      {/* Total Cost */}
      <div className="mb-8">
        <p className="text-6xl font-bold mb-2">{totals.total_chain_cost_formatted}</p>
        <p className="text-lg opacity-90">RON</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-xs opacity-75 mb-1">Colectare</p>
          <p className="text-lg font-bold">{totals.costs_breakdown.collection.cost_formatted} RON</p>
          <p className="text-xs opacity-75">{totals.costs_breakdown.collection.percentage}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-xs opacity-75 mb-1">Sortare</p>
          <p className="text-lg font-bold">{totals.costs_breakdown.sorting.cost_formatted} RON</p>
          <p className="text-xs opacity-75">{totals.costs_breakdown.sorting.percentage}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-xs opacity-75 mb-1">TMB</p>
          <p className="text-lg font-bold">{totals.costs_breakdown.tmb.cost_formatted} RON</p>
          <p className="text-xs opacity-75">{totals.costs_breakdown.tmb.percentage}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-xs opacity-75 mb-1">Depozitare</p>
          <p className="text-lg font-bold">{totals.costs_breakdown.disposal.cost_formatted} RON</p>
          <p className="text-xs opacity-75">{totals.costs_breakdown.disposal.percentage}%</p>
        </div>
      </div>

      {/* Indicators */}
      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-bold mb-4">Indicatori Cheie</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs opacity-75 mb-1">Cost/Tonă Lanț Complet</p>
            <p className="text-2xl font-bold">{totals.indicators.cost_per_ton_chain_formatted} RON</p>
          </div>

          <div>
            <p className="text-xs opacity-75 mb-1">Cost/Locuitor/An</p>
            <p className="text-2xl font-bold">{totals.indicators.cost_per_capita_year_formatted} RON</p>
          </div>

          <div>
            <p className="text-xs opacity-75 mb-1">Tone Procesate Total</p>
            <p className="text-2xl font-bold">{totals.indicators.total_tons_processed_formatted}</p>
          </div>

          <div>
            <p className="text-xs opacity-75 mb-1">Eficiență Reciclare</p>
            <p className="text-2xl font-bold">{totals.indicators.recycling_efficiency}%</p>
          </div>

          <div>
            <p className="text-xs opacity-75 mb-1">Eficiență Valorificare</p>
            <p className="text-2xl font-bold">{totals.indicators.recovery_efficiency}%</p>
          </div>

          <div>
            <p className="text-xs opacity-75 mb-1">Rată Depozitare</p>
            <p className="text-2xl font-bold">{totals.indicators.disposal_rate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorStatsDetail;