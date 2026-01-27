// src/components/users/UserViewModal.jsx
/**
 * ============================================================================
 * USER VIEW MODAL - ELEGANT DESIGN
 * ============================================================================
 */

import {
  X, User, Mail, Phone, Building2, Shield,
  Briefcase, Users as UsersIcon, UserCheck, UserX,
  Calendar,
} from 'lucide-react';

const UserViewModal = ({
  isOpen,
  onClose,
  user,
  roleTypes = {},
}) => {
  if (!isOpen || !user) return null;

  const roleInfo = roleTypes[user.role] || { label: user.role, color: 'gray' };

  const getGradient = (color) => {
    const gradients = {
      red: 'from-red-500 to-rose-600',
      blue: 'from-blue-500 to-indigo-600',
      emerald: 'from-emerald-500 to-teal-600',
      purple: 'from-purple-500 to-violet-600',
      gray: 'from-gray-500 to-slate-600',
    };
    return gradients[color] || gradients.emerald;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Gradient */}
          <div className={`relative bg-gradient-to-br ${getGradient(roleInfo.color)} px-6 py-6`}>
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-xl font-bold">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                    {roleInfo.label}
                  </span>
                  {user.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100">
                      Activ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-400/20 text-gray-200">
                      Inactiv
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-white/70 text-sm mt-0.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)] space-y-5">
            
            {/* Contact Info */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${user.email}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {user.email}
                    </a>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                      <a href={`tel:${user.phone}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {user.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Institution */}
            {user.institution && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Instituție
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.institution.name}
                    </p>
                    {user.institution.short_name && user.institution.short_name !== user.institution.name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.institution.short_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Role */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Rol în Sistem
              </h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradient(roleInfo.color)} flex items-center justify-center`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {roleInfo.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.is_active ? 'Cont activ' : 'Cont inactiv'}
                  </p>
                </div>
              </div>
            </div>

            {/* Position & Department */}
            {(user.position || user.department) && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  Poziție
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {user.position && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Funcție</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.position}</p>
                    </div>
                  )}
                  {user.department && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Departament</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.department}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Informații Sistem
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Creat la</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.created_at)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Actualizat la</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(user.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Utilizator</p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{user.id}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
            >
              Închide
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserViewModal;
