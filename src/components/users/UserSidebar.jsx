// src/components/users/UserSidebar.jsx
import { X, Eye, EyeOff, Save, User, Mail, Shield, Building2, Phone, Briefcase, Users as UsersIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

const UserSidebar = ({
  mode = 'create',
  user = null,
  formData,
  institutions = [],
  sectors = [],
  currentUser = null, // ✅ added
  onClose,
  onSubmit,
  onFormChange,
  formError = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const isPlatformAdmin = currentUser?.role === 'PLATFORM_ADMIN';
  const isInstitutionAdmin = currentUser?.role === 'ADMIN_INSTITUTION';
  const myInstitutionId = currentUser?.institution?.id || null;

  // Force constraints for ADMIN_INSTITUTION
  useEffect(() => {
    if (!isInstitutionAdmin) return;

    const next = { ...formData };

    // force role editor
    if (next.role !== 'EDITOR_INSTITUTION') next.role = 'EDITOR_INSTITUTION';

    // force institution
    if (myInstitutionId && next.institutionId !== myInstitutionId) {
      next.institutionId = myInstitutionId;
    }

    // avoid infinite loop: update only if changed
    const changed =
      next.role !== formData.role ||
      next.institutionId !== formData.institutionId;

    if (changed) onFormChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstitutionAdmin, myInstitutionId]);

  const roleLabels = {
    PLATFORM_ADMIN: 'Admin Platformă',
    ADMIN_INSTITUTION: 'Admin Instituție',
    EDITOR_INSTITUTION: 'Editor Instituție',
    REGULATOR_VIEWER: 'Regulator'
  };

  const getRoleBadge = (role) => {
    const styles = {
      PLATFORM_ADMIN: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      ADMIN_INSTITUTION: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      EDITOR_INSTITUTION: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      REGULATOR_VIEWER: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold border ${styles[role] || styles.EDITOR_INSTITUTION}`}>
        <Shield className="w-3 h-3" />
        {roleLabels[role] || role}
      </span>
    );
  };

  const selectedInstitution = useMemo(() => {
    return institutions.find(i => Number(i.id) === Number(formData.institutionId));
  }, [formData.institutionId, institutions]);

  // Role dropdown options:
  const roleOptions = useMemo(() => {
    if (isPlatformAdmin) {
      return [
        { value: 'PLATFORM_ADMIN', label: 'Admin Platformă' },
        { value: 'ADMIN_INSTITUTION', label: 'Admin Instituție' },
        { value: 'EDITOR_INSTITUTION', label: 'Editor Instituție' },
        { value: 'REGULATOR_VIEWER', label: 'Regulator' },
      ];
    }

    // ADMIN_INSTITUTION: can only create/edit editor
    if (isInstitutionAdmin) {
      return [{ value: 'EDITOR_INSTITUTION', label: 'Editor Instituție' }];
    }

    return [];
  }, [isPlatformAdmin, isInstitutionAdmin]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.institutionId) {
      alert('Vă rugăm să selectați o instituție!');
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
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
              {user && <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-[10px] transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isViewMode ? (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Informații Generale</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nume Complet</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {user?.email}
                    </dd>
                  </div>
                  {user?.phone && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Telefon</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {user.phone}
                      </dd>
                    </div>
                  )}
                  {user?.position && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Poziție</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        {user.position}
                      </dd>
                    </div>
                  )}
                  {user?.department && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Departament</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <UsersIcon className="w-3.5 h-3.5 text-gray-400" />
                        {user.department}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rol</dt>
                    <dd>{getRoleBadge(user?.role)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Instituție</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {user?.institution?.short_name || user?.institution?.name || '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-4 rounded-[14px] border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Prenume</label>
                  <input
                    value={formData.firstName}
                    onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Nume</label>
                  <input
                    value={formData.lastName}
                    onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  required
                />
              </div>

              {(isCreateMode || (isEditMode && isPlatformAdmin)) && (
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    Parolă {isEditMode ? '(doar dacă vrei să o schimbi)' : ''}
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                      className="w-full pr-12 px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      required={isCreateMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => onFormChange({ ...formData, role: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    disabled={isInstitutionAdmin} // ✅ lock
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => onFormChange({ ...formData, isActive: e.target.value === 'active' })}
                    className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <option value="active">Activ</option>
                    <option value="inactive">Inactiv</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Instituție</label>
                <select
                  value={formData.institutionId || ''}
                  onChange={(e) => onFormChange({ ...formData, institutionId: Number(e.target.value) || null })}
                  className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  disabled={isInstitutionAdmin} // ✅ lock
                >
                  <option value="">Selectează instituția</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.short_name || inst.name}
                    </option>
                  ))}
                </select>

                {isInstitutionAdmin && selectedInstitution && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Instituția este blocată la: <strong>{selectedInstitution.short_name || selectedInstitution.name}</strong>
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-[14px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-[14px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvează
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
