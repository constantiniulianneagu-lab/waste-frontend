// src/components/users/UserSidebar.jsx
import { X, Eye, EyeOff, Save, User, Mail, Shield, Building2, Calendar } from 'lucide-react';
import { useState } from 'react';
import InstitutionMultiSelect from './InstitutionMultiSelect';

const UserSidebar = ({
  mode = 'create', // 'create' | 'edit' | 'view'
  user = null,
  formData,
  institutions = [],
  onClose,
  onSubmit,
  onFormChange,
  formError = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    INSTITUTION_ADMIN: 'Admin Instituție',
    INSTITUTION_EDITOR: 'Editor Instituție',
    INSTITUTION_VIEWER: 'Vizualizator'
  };

  const getRoleBadge = (role) => {
    const styles = {
      SUPER_ADMIN: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      INSTITUTION_ADMIN: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      INSTITUTION_EDITOR: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      INSTITUTION_VIEWER: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold border ${styles[role] || styles.INSTITUTION_VIEWER}`}>
        <Shield className="w-3 h-3" />
        {roleLabels[role] || role}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 
                 animate-fadeIn"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-[650px]
        bg-white dark:bg-gray-900 
        shadow-2xl
        transform transition-transform duration-300 ease-out
        z-50
        flex flex-col
        animate-slideInRight
      `}>
        {/* Header */}
        <div className="flex items-center justify-between 
                      p-6 
                      border-b border-gray-200 dark:border-gray-800
                      bg-gradient-to-r from-emerald-50 to-teal-50 
                      dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-[12px] shadow-sm">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isViewMode && 'Detalii Utilizator'}
                {isEditMode && 'Editare Utilizator'}
                {isCreateMode && 'Utilizator Nou'}
              </h2>
              {user && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 
                     text-gray-500 hover:text-gray-700 
                     dark:text-gray-400 dark:hover:text-gray-200
                     hover:bg-white/50 dark:hover:bg-gray-800/50 
                     rounded-[10px] 
                     transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {isViewMode ? (
            // VIEW MODE - Read-only Details
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Informații Generale
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nume Complet
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {user?.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Rol
                    </dt>
                    <dd>{getRoleBadge(user?.role)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </dt>
                    <dd>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-bold ${
                        user?.is_active 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user?.is_active ? 'Activ' : 'Inactiv'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Creat la
                    </dt>
                    <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(user?.created_at)}
                    </dd>
                  </div>
                  {user?.updated_at && user.updated_at !== user.created_at && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ultima modificare
                      </dt>
                      <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(user?.updated_at)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Institutions Section */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Instituții Asociate ({user?.institutions?.length || 0})
                </h3>
                {user?.institutions && user.institutions.length > 0 ? (
                  <div className="space-y-2">
                    {user.institutions.map(inst => (
                      <div key={inst.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-[12px] border border-gray-200 dark:border-gray-700">
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {inst.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {inst.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nicio instituție asociată
                  </p>
                )}
              </div>
            </div>
          ) : (
            // EDIT/CREATE MODE - Form
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-[14px]">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {formError}
                  </p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Prenume *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 
                             border border-gray-200 dark:border-gray-700 
                             rounded-[14px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white text-sm
                             focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                             transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Nume *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 
                             border border-gray-200 dark:border-gray-700 
                             rounded-[14px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white text-sm
                             focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                             transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 
                           border border-gray-200 dark:border-gray-700 
                           rounded-[14px] 
                           bg-gray-50 dark:bg-gray-900/50 
                           text-gray-900 dark:text-white text-sm
                           focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                           transition-all duration-300"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Parolă {isEditMode && '(lasă gol pentru a păstra)'}
                  {isCreateMode && ' *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 pr-12
                             border border-gray-200 dark:border-gray-700 
                             rounded-[14px] 
                             bg-gray-50 dark:bg-gray-900/50 
                             text-gray-900 dark:text-white text-sm
                             focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                             transition-all duration-300"
                    required={isCreateMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                             p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                             transition-colors rounded-[10px]
                             hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 
                           border border-gray-200 dark:border-gray-700 
                           rounded-[14px] 
                           bg-gray-50 dark:bg-gray-900/50 
                           text-gray-900 dark:text-white text-sm
                           focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                           transition-all duration-300"
                  required
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="INSTITUTION_ADMIN">Admin Instituție</option>
                  <option value="INSTITUTION_EDITOR">Editor Instituție</option>
                  <option value="INSTITUTION_VIEWER">Vizualizator</option>
                </select>
              </div>

              {/* Institutions Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Instituții Asociate
                </label>
                <InstitutionMultiSelect
                  institutions={institutions}
                  selectedIds={formData.institutionIds || []}
                  onChange={(ids) => onFormChange({ ...formData, institutionIds: ids })}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 p-4 
                            bg-gray-50 dark:bg-gray-900/30 
                            rounded-[14px] 
                            border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => onFormChange({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 
                           text-emerald-600 
                           border-gray-300 dark:border-gray-600 
                           rounded 
                           focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cont activ
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions - Sticky */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            {isViewMode ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-3 
                         bg-gray-100 dark:bg-gray-700 
                         text-gray-700 dark:text-gray-300 
                         font-bold rounded-[14px] 
                         hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-all duration-300
                         active:scale-98"
              >
                Închide
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-5 py-3 
                           bg-gradient-to-r from-emerald-600 to-teal-600 
                           hover:from-emerald-700 hover:to-teal-700 
                           text-white font-bold rounded-[14px] 
                           transition-all duration-300
                           active:scale-98
                           shadow-lg shadow-emerald-500/20
                           flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Salvează' : 'Creează'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 
                           bg-gray-100 dark:bg-gray-700 
                           text-gray-700 dark:text-gray-300 
                           font-bold rounded-[14px] 
                           hover:bg-gray-200 dark:hover:bg-gray-600 
                           transition-all duration-300
                           active:scale-98"
                >
                  Anulează
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
