// src/components/users/UserTable.jsx
/**
 * ============================================================================
 * USER TABLE - MODERN DESIGN (NO EXPAND ROWS)
 * ============================================================================
 */

import {
  Users as UsersIcon, Eye, Edit2, Trash2, Mail, Building2,
  ArrowUpDown, ArrowUp, ArrowDown, UserCheck, UserX, Shield,
} from 'lucide-react';

const UserTable = ({
  users = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  sortBy = 'last_name',
  sortOrder = 'asc',
  onSort,
  canEdit = false,
  canDelete = false,
  canManageUser = () => false,
  isPlatformAdmin = false,
  roleTypes = {},
}) => {
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-emerald-500" />;
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

  const getRoleBadgeClasses = (role) => {
    const roleInfo = roleTypes[role];
    const color = roleInfo?.color || 'gray';
    
    const colorClasses = {
      red: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
    };
    
    return colorClasses[color] || colorClasses.gray;
  };

  const getRoleLabel = (role) => {
    return roleTypes[role]?.label || role;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Niciun utilizator găsit</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Modificați filtrele sau adăugați un utilizator nou.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <SortableHeader column="last_name" className="w-[280px]">Utilizator</SortableHeader>
              <SortableHeader column="institution" className="w-[200px]">Instituție</SortableHeader>
              <SortableHeader column="role" className="w-[180px]">Rol</SortableHeader>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                Acțiuni
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user) => {
              const canManageThis = canManageUser(user);
              
              return (
                <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* User Name & Email */}
                  <td className="px-4 py-3 w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm text-white text-xs font-bold">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Institution */}
                  <td className="px-4 py-3 w-[200px]">
                    {user.institution ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={user.institution.name}>
                          {user.institution.short_name || user.institution.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3 w-[180px]">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeClasses(user.role)}`}>
                      <Shield className="w-3 h-3" />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center w-[100px]">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <UserCheck className="w-3 h-3" />
                        Activ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <UserX className="w-3 h-3" />
                        Inactiv
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 w-[100px]">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(user)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        title="Vizualizează"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {canEdit && (isPlatformAdmin || canManageThis) && (
                        <button
                          onClick={() => onEdit(user)}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                          title="Editează"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {canDelete && (isPlatformAdmin || canManageThis) && (
                        <button
                          onClick={() => onDelete(user)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
