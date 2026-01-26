// src/components/institutions/InstitutionTable.jsx
/**
 * ============================================================================
 * INSTITUTION TABLE - MODERN DESIGN (NO EXPAND)
 * ============================================================================
 */

import {
  Building2, Eye, Edit2, Trash2, Mail, Phone,
  ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, XCircle,
  MapPin,
} from 'lucide-react';

const InstitutionTable = ({
  institutions = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  sortBy = 'name',
  sortOrder = 'asc',
  onSort,
  canEdit = false,
  canDelete = false,
  institutionTypes = {},
}) => {
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-teal-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-teal-500" />;
  };

  const SortableHeader = ({ column, children, className = '' }) => (
    <th
      className={`group px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {getSortIcon(column)}
      </div>
    </th>
  );

  const getTypeBadgeClasses = (type) => {
    const typeInfo = institutionTypes[type];
    const color = typeInfo?.color || 'gray';
    
    const colorClasses = {
      teal: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
      pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
      yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
      slate: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
      stone: 'bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-400',
    };
    
    return colorClasses[color] || colorClasses.gray;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (institutions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Nicio instituție găsită</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Modificați filtrele sau adăugați o instituție nouă.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <SortableHeader column="name" className="min-w-[280px]">Instituție</SortableHeader>
              <SortableHeader column="type" className="min-w-[120px]">Tip</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[140px]">
                Sectoare
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
                Contact
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                Acțiuni
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {institutions.map((inst) => (
              <tr key={inst.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {/* Institution Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {inst.name}
                      </p>
                      {inst.short_name && inst.short_name !== inst.name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {inst.short_name}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeBadgeClasses(inst.type)}`}>
                    {institutionTypes[inst.type]?.label || inst.type}
                  </span>
                </td>

                {/* Sectors */}
                <td className="px-4 py-3">
                  {inst.sectors && inst.sectors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {inst.sectors.slice(0, 4).map(s => (
                        <span 
                          key={s.id} 
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded"
                        >
                          <MapPin className="w-3 h-3" />
                          S{s.sector_number}
                        </span>
                      ))}
                      {inst.sectors.length > 4 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                          +{inst.sectors.length - 4}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {(inst.email || inst.contact_email) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{inst.email || inst.contact_email}</span>
                      </div>
                    )}
                    {(inst.phone || inst.contact_phone) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{inst.phone || inst.contact_phone}</span>
                      </div>
                    )}
                    {!inst.email && !inst.contact_email && !inst.phone && !inst.contact_phone && (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {inst.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      Activ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      <XCircle className="w-3 h-3" />
                      Inactiv
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(inst)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Vizualizează"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canEdit && (
                      <button
                        onClick={() => onEdit(inst)}
                        className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors"
                        title="Editează"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canDelete && (
                      <button
                        onClick={() => onDelete(inst)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Șterge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstitutionTable;