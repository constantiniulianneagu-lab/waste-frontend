// src/components/users/UserSidebar.jsx
import { X, Eye, EyeOff, Save, User, Mail, Shield, Building2, Calendar, Phone, Briefcase, Users as UsersIcon } from 'lucide-react';
import { useState, useMemo } from 'react';

const UserSidebar = ({
  mode = 'create',
  user = null,
  formData,
  institutions = [],
  sectors = [],
  onClose,
  onSubmit,
  onFormChange,
  formError = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Role labels
  const roleLabels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN_INSTITUTION: 'Admin Instituție',
    EDITOR_INSTITUTION: 'Editor Instituție',
    REGULATOR_VIEWER: 'Regulator'
  };

  // Role badge
  const getRoleBadge = (role) => {
    const styles = {
      SUPER_ADMIN: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
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

  // Filter institutions based on role
  const availableInstitutions = useMemo(() => {
    if (!formData.role) return institutions;

    if (formData.role === 'SUPER_ADMIN') {
      // Doar ADIGDMB
      return institutions.filter(i => i.type === 'ASSOCIATION');
    }

    if (formData.role === 'ADMIN_INSTITUTION') {
      // Doar PMB și Primării
      return institutions.filter(i => i.type === 'MUNICIPALITY');
    }

    if (formData.role === 'EDITOR_INSTITUTION') {
      // Same ca creator (dacă e edit, păstrăm instituția)
      if (isEditMode && user?.institution) {
        return [user.institution];
      }
      // În create mode, ADMIN_INSTITUTION va seta automat
      return institutions.filter(i => i.type === 'MUNICIPALITY');
    }

    if (formData.role === 'REGULATOR_VIEWER') {
      // Regulator + Operatori
      return institutions.filter(i => 
        i.type === 'REGULATOR' || 
        i.type === 'WASTE_COLLECTOR' || 
        i.type === 'TMB_OPERATOR' || 
        i.type === 'SORTING_OPERATOR' ||
        i.type === 'LANDFILL'
      );
    }

    return institutions;
  }, [formData.role, institutions, isEditMode, user]);

  // Selected institution
  const selectedInstitution = useMemo(() => {
    return institutions.find(i => i.id === formData.institutionId);
  }, [formData.institutionId, institutions]);

  // Operator institutions pentru REGULATOR_VIEWER
  const operatorInstitutions = useMemo(() => {
    return institutions.filter(i => 
      i.type === 'WASTE_COLLECTOR' || 
      i.type === 'TMB_OPERATOR' || 
      i.type === 'SORTING_OPERATOR' ||
      i.type === 'LANDFILL'
    );
  }, [institutions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Handle role change
  const handleRoleChange = (newRole) => {
    const newFormData = { ...formData, role: newRole };

    // Reset institution când schimbi rolul
    newFormData.institutionId = null;

    // Reset permissions
    newFormData.permissions = {
      can_edit_data: false,
      access_type: null,
      sector_id: null,
      operator_institution_id: null
    };

    // Auto-select ADIGDMB pentru SUPER_ADMIN
    if (newRole === 'SUPER_ADMIN') {
      const adigdmb = institutions.find(i => i.type === 'ASSOCIATION');
      if (adigdmb) {
        newFormData.institutionId = adigdmb.id;
      }
    }

    onFormChange(newFormData);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[700px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isViewMode ? (
            // ========== VIEW MODE ==========
            <div className="space-y-6">
              {/* Info Card */}
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
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</dt>
                    <dd>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-xs font-bold ${user?.is_active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
                        {user?.is_active ? 'Activ' : 'Inactiv'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Creat la</dt>
                    <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(user?.created_at)}
                    </dd>
                  </div>
                  {user?.updated_at && user.updated_at !== user.created_at && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ultima modificare</dt>
                      <dd className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(user?.updated_at)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Institution */}
              {user?.institution && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Instituție</h3>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-[12px] border border-gray-200 dark:border-gray-700">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{user.institution.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.institution.type}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sectors */}
              {user?.sectors && user.sectors.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Sectoare Asociate</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.sectors.map(sector => (
                      <span key={sector.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-[8px] text-xs font-bold border border-blue-500/20">
                        🏙️ Sector {sector.sector_number}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions Info */}
              {user?.permissions && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-[16px] p-5 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Permisiuni</h3>
                  <div className="space-y-2 text-sm">
                    {user.permissions.can_edit_data && (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        ✅ Poate edita/adăuga/șterge date
                      </div>
                    )}
                    {user.permissions.access_type === 'ALL' && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        🌍 Acces la toate datele
                      </div>
                    )}
                    {user.permissions.access_type === 'SECTOR' && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        🏙️ Acces limitat la un sector
                      </div>
                    )}
                    {user.permissions.access_type === 'OPERATOR' && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        🚛 Acces limitat la un operator
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ========== EDIT/CREATE MODE ==========
            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-[14px]">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{formError}</p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Prenume *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Nume *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
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
                    className="w-full px-4 py-2.5 pr-12 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    required={isCreateMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-[10px] hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="07XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Poziție</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => onFormChange({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="Director, Manager..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Departament</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  placeholder="Operațiuni, Management..."
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Rol *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  required
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN_INSTITUTION">Admin Instituție</option>
                  <option value="EDITOR_INSTITUTION">Editor Instituție</option>
                  <option value="REGULATOR_VIEWER">Regulator</option>
                </select>
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Instituție *</label>
                <select
                  value={formData.institutionId || ''}
                  onChange={(e) => onFormChange({ ...formData, institutionId: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-[14px] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  required
                  disabled={formData.role === 'SUPER_ADMIN' || (isEditMode && formData.role === 'EDITOR_INSTITUTION')}
                >
                  <option value="">Selectează instituție</option>
                  {availableInstitutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
                {formData.role === 'SUPER_ADMIN' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ℹ️ Super Admin poate fi asociat doar cu ADIGDMB
                  </p>
                )}
                {isEditMode && formData.role === 'EDITOR_INSTITUTION' && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ℹ️ Instituția nu poate fi modificată pentru Editor
                  </p>
                )}
              </div>

              {/* Sectors Display */}
              {selectedInstitution?.sectors && selectedInstitution.sectors.length > 0 && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-[14px]">
                  <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">
                    📊 Sectoare Asociate (automat)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstitution.sectors.map(sector => (
                      <span key={sector.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-[8px] text-xs font-bold border border-blue-500/20">
                        Sector {sector.sector_number}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions for ADMIN_INSTITUTION */}
              {formData.role === 'ADMIN_INSTITUTION' && (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[14px]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="can_edit_data"
                      checked={formData.permissions.can_edit_data}
                      onChange={(e) => onFormChange({
                        ...formData,
                        permissions: { ...formData.permissions, can_edit_data: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                    <label htmlFor="can_edit_data" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Permite editare/adăugare/ștergere date
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    ℹ️ Doar PLATFORM_ADMIN poate activa acest permis. Editorii creați vor moșteni permisiunea.
                  </p>
                </div>
              )}

              {/* Permissions for REGULATOR_VIEWER */}
              {formData.role === 'REGULATOR_VIEWER' && (
                <div className="space-y-3 p-4 bg-purple-50/50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-[14px]">
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    Tip Acces Date *
                  </label>

                  {/* All Data */}
                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-[12px] cursor-pointer hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="access_type"
                      checked={formData.permissions.access_type === 'ALL'}
                      onChange={() => onFormChange({
                        ...formData,
                        permissions: { ...formData.permissions, access_type: 'ALL', sector_id: null, operator_institution_id: null }
                      })}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">Toate datele</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Acces complet la toate sectoarele și operatorii</div>
                    </div>
                  </label>

                  {/* Sector */}
                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-[12px] cursor-pointer hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="access_type"
                      checked={formData.permissions.access_type === 'SECTOR'}
                      onChange={() => onFormChange({
                        ...formData,
                        permissions: { ...formData.permissions, access_type: 'SECTOR', operator_institution_id: null }
                      })}
                      className="w-4 h-4 text-purple-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white mb-2">Un sector specific</div>
                      {formData.permissions.access_type === 'SECTOR' && (
                        <select
                          value={formData.permissions.sector_id || ''}
                          onChange={(e) => onFormChange({
                            ...formData,
                            permissions: { ...formData.permissions, sector_id: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-[10px] bg-white dark:bg-gray-900 text-sm"
                          required
                        >
                          <option value="">Selectează sector</option>
                          {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>Sector {sector.sector_number}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>

                  {/* Operator */}
                  <label className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-[12px] cursor-pointer hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="access_type"
                      checked={formData.permissions.access_type === 'OPERATOR'}
                      onChange={() => onFormChange({
                        ...formData,
                        permissions: { ...formData.permissions, access_type: 'OPERATOR', sector_id: null }
                      })}
                      className="w-4 h-4 text-purple-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white mb-2">Un operator specific</div>
                      {formData.permissions.access_type === 'OPERATOR' && (
                        <select
                          value={formData.permissions.operator_institution_id || ''}
                          onChange={(e) => onFormChange({
                            ...formData,
                            permissions: { ...formData.permissions, operator_institution_id: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-[10px] bg-white dark:bg-gray-900 text-sm"
                          required
                        >
                          <option value="">Selectează operator</option>
                          {operatorInstitutions.map(op => (
                            <option key={op.id} value={op.id}>{op.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-[14px] border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => onFormChange({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cont activ
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            {isViewMode ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSidebarMode('edit');
                    setFormData({
                      email: user.email,
                      password: '',
                      firstName: user.first_name,
                      lastName: user.last_name,
                      phone: user.phone || '',
                      position: user.position || '',
                      department: user.department || '',
                      role: user.role,
                      isActive: user.is_active,
                      institutionId: user.institution?.id || null,
                      permissions: user.permissions || {
                        can_edit_data: false,
                        access_type: null,
                        sector_id: null,
                        operator_institution_id: null
                      }
                    });
                  }}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-[14px] transition-all active:scale-98 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editează
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-[14px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-98"
                >
                  Închide
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-[14px] transition-all active:scale-98 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Salvează' : 'Creează'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-[14px] hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-98"
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