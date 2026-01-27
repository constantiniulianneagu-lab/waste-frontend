// src/components/users/UserSidebar.jsx
/**
 * ============================================================================
 * USER SIDEBAR - ADD/EDIT FORM (REFINED)
 * ============================================================================
 */

import { X, Eye, EyeOff, Save, User } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { INSTITUTION_TYPES } from '../../constants/institutionTypes';

const UserSidebar = ({
  mode = 'create',
  user = null,
  formData,
  institutions = [],
  sectors = [],
  currentUser = null,
  onClose,
  onSubmit,
  onFormChange,
  formError = '',
  roleTypes = {},
  roleOrder = [],
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const isPlatformAdmin = currentUser?.role === 'PLATFORM_ADMIN';
  const isInstitutionAdmin = currentUser?.role === 'ADMIN_INSTITUTION';
  const myInstitutionId = currentUser?.institution?.id || null;

  const defaultRoleTypes = {
    PLATFORM_ADMIN: { label: 'Administrator Platformă', color: 'red' },
    ADMIN_INSTITUTION: { label: 'Administrator Instituție', color: 'blue' },
    EDITOR_INSTITUTION: { label: 'Editor Instituție', color: 'emerald' },
    REGULATOR_VIEWER: { label: 'Autoritate publică', color: 'purple' },
  };

  const effectiveRoleTypes = Object.keys(roleTypes).length > 0 ? roleTypes : defaultRoleTypes;
  const effectiveRoleOrder = roleOrder.length > 0 ? roleOrder : Object.keys(defaultRoleTypes);

  useEffect(() => {
    if (!isInstitutionAdmin) return;
    const next = { ...formData };
    if (next.role !== 'EDITOR_INSTITUTION') next.role = 'EDITOR_INSTITUTION';
    if (myInstitutionId && next.institutionId !== myInstitutionId) {
      next.institutionId = myInstitutionId;
    }
    const changed = next.role !== formData.role || next.institutionId !== formData.institutionId;
    if (changed) onFormChange(next);
  }, [isInstitutionAdmin, myInstitutionId]);

  const filteredInstitutions = useMemo(() => {
    const role = formData?.role;
    if (role === 'PLATFORM_ADMIN') {
      return institutions.filter((i) => Number(i.id) === 100 || i.type === INSTITUTION_TYPES.ASSOCIATION);
    }
    if (role === 'ADMIN_INSTITUTION') {
      return institutions.filter((i) => i.type === INSTITUTION_TYPES.MUNICIPALITY);
    }
    if (role === 'REGULATOR_VIEWER') {
      return institutions.filter((i) => i.type === INSTITUTION_TYPES.REGULATOR);
    }
    return institutions;
  }, [institutions, formData?.role]);

  useEffect(() => {
    const role = formData?.role;
    if (role === 'PLATFORM_ADMIN') {
      const has100 = filteredInstitutions.some((i) => Number(i.id) === 100);
      if (has100 && Number(formData.institutionId) !== 100) {
        onFormChange({ ...formData, institutionId: 100 });
      }
      return;
    }
    const stillValid = filteredInstitutions.some((i) => Number(i.id) === Number(formData.institutionId));
    if (!stillValid) {
      if (filteredInstitutions.length === 1) {
        onFormChange({ ...formData, institutionId: Number(filteredInstitutions[0].id) });
      } else {
        onFormChange({ ...formData, institutionId: null });
      }
    }
  }, [formData?.role, filteredInstitutions.length]);

  const roleOptions = useMemo(() => {
    if (isPlatformAdmin) {
      return effectiveRoleOrder.map(key => ({
        value: key,
        label: effectiveRoleTypes[key]?.label || key
      }));
    }
    if (isInstitutionAdmin) {
      return [{ value: 'EDITOR_INSTITUTION', label: effectiveRoleTypes['EDITOR_INSTITUTION']?.label || 'Editor Instituție' }];
    }
    return [];
  }, [isPlatformAdmin, isInstitutionAdmin, effectiveRoleTypes, effectiveRoleOrder]);

  const selectedInstitution = useMemo(() => {
    return institutions.find(i => Number(i.id) === Number(formData.institutionId));
  }, [formData.institutionId, institutions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.institutionId) {
      alert('Vă rugăm să selectați o instituție!');
      return;
    }
    onSubmit(formData);
  };

  const getTitle = () => {
    if (isCreateMode) return 'Utilizator Nou';
    if (isEditMode) return 'Editare Utilizator';
    return 'Utilizator';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{getTitle()}</h2>
              {user && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{user.email}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Prenume <span className="text-red-500">*</span></label>
                <input type="text" value={formData.firstName} onChange={(e) => onFormChange({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nume <span className="text-red-500">*</span></label>
                <input type="text" value={formData.lastName} onChange={(e) => onFormChange({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" value={formData.email} onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required />
            </div>

            {(isCreateMode || (isEditMode && isPlatformAdmin)) && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Parolă {isEditMode ? '(opțional)' : ''} {isCreateMode && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                    className="w-full pr-10 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required={isCreateMode} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Telefon</label>
              <input type="text" value={formData.phone || ''} onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="07XX XXX XXX" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Funcție</label>
                <input type="text" value={formData.position || ''} onChange={(e) => onFormChange({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Manager" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Departament</label>
                <input type="text" value={formData.department || ''} onChange={(e) => onFormChange({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Operațional" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Rol <span className="text-red-500">*</span></label>
                <select value={formData.role} onChange={(e) => onFormChange({ ...formData, role: e.target.value })} disabled={isInstitutionAdmin}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60 transition-all">
                  {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                <select value={formData.isActive ? 'active' : 'inactive'} onChange={(e) => onFormChange({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                  <option value="active">Activ</option>
                  <option value="inactive">Inactiv</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Instituție <span className="text-red-500">*</span></label>
              <select value={formData.institutionId || ''} onChange={(e) => onFormChange({ ...formData, institutionId: Number(e.target.value) || null })}
                disabled={isInstitutionAdmin || formData.role === 'PLATFORM_ADMIN'}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60 transition-all">
                <option value="">Selectează instituția...</option>
                {filteredInstitutions.map(inst => <option key={inst.id} value={inst.id}>{inst.short_name || inst.name}</option>)}
              </select>
              {isInstitutionAdmin && selectedInstitution && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Instituția este blocată la: <strong>{selectedInstitution.short_name || selectedInstitution.name}</strong></p>
              )}
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl transition-colors">
              Anulează
            </button>
            <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all">
              <Save className="w-4 h-4" />
              {isCreateMode ? 'Creează' : 'Salvează'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
