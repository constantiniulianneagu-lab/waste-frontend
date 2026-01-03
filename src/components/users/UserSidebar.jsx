// src/components/users/UserSidebar.jsx
import { useMemo, useState } from "react";
import { X, Save, Eye, Edit2, Plus } from "lucide-react";

const UserSidebar = ({
  mode, // 'create' | 'edit' | 'view'
  user,
  currentUser,
  formData,
  institutions,
  sectors, // (nu forțăm aici sectoare, păstrăm pentru viitor)
  onClose,
  onSubmit,
  onFormChange,
  formError,
}) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const isPlatformAdmin = currentUser?.role === "PLATFORM_ADMIN";
  const isAdminInstitution = currentUser?.role === "ADMIN_INSTITUTION";

  const currentInstitutionId = useMemo(() => {
    if (!currentUser) return null;
    return (
      currentUser.institution?.id ??
      currentUser.institutionId ??
      currentUser.institution_id ??
      null
    );
  }, [currentUser]);

  // Admin instituție: are voie doar pe editori din instituția lui (create/edit)
  const canSubmit = useMemo(() => {
    if (isView) return false;
    if (isPlatformAdmin) return true;

    if (isAdminInstitution) {
      // create: ok doar dacă instituția e a lui și rolul e editor
      if (isCreate) {
        return (
          Number(formData?.institutionId) === Number(currentInstitutionId) &&
          formData?.role === "EDITOR_INSTITUTION"
        );
      }

      // edit: doar dacă userul target e editor și e din instituția lui
      if (isEdit) {
        const targetInst = user?.institution?.id ?? null;
        const okTarget =
          user?.role === "EDITOR_INSTITUTION" &&
          Number(targetInst) === Number(currentInstitutionId);
        const okForm =
          Number(formData?.institutionId) === Number(currentInstitutionId) &&
          formData?.role === "EDITOR_INSTITUTION";
        return okTarget && okForm;
      }
    }

    return false;
  }, [
    isView,
    isPlatformAdmin,
    isAdminInstitution,
    isCreate,
    isEdit,
    formData?.institutionId,
    formData?.role,
    currentInstitutionId,
    user,
  ]);

  const title = useMemo(() => {
    if (isCreate) return "Utilizator Nou";
    if (isEdit) return "Editare Utilizator";
    return "Detalii Utilizator";
  }, [isCreate, isEdit]);

  const subtitle = useMemo(() => {
    if (isCreate) return "Completează datele utilizatorului";
    if (isEdit) return "Actualizează datele utilizatorului";
    return "Vizualizare profil utilizator";
  }, [isCreate, isEdit]);

  const icon = useMemo(() => {
    if (isCreate) return <Plus className="w-5 h-5" />;
    if (isEdit) return <Edit2 className="w-5 h-5" />;
    return <Eye className="w-5 h-5" />;
  }, [isCreate, isEdit]);

  // Admin instituție: lock rol și instituție
  const roleDisabled = isView || isAdminInstitution;
  const institutionDisabled = isView || isAdminInstitution;

  // Admin instituție: rol forțat editor
  const allowedRoleOptions = useMemo(() => {
    if (isAdminInstitution) return [{ value: "EDITOR_INSTITUTION", label: "Editor Instituție" }];
    return [
      { value: "PLATFORM_ADMIN", label: "Admin Platformă" },
      { value: "ADMIN_INSTITUTION", label: "Admin Instituție" },
      { value: "EDITOR_INSTITUTION", label: "Editor Instituție" },
      { value: "REGULATOR_VIEWER", label: "Regulator" },
    ];
  }, [isAdminInstitution]);

  // Admin instituție: instituție forțată
  const availableInstitutions = useMemo(() => {
    if (!isAdminInstitution) return institutions || [];
    return (institutions || []).filter((i) => Number(i.id) === Number(currentInstitutionId));
  }, [institutions, isAdminInstitution, currentInstitutionId]);

  const [localError, setLocalError] = useState("");

  const setField = (patch) => {
    onFormChange({ ...formData, ...patch });
  };

  const handleSubmit = () => {
    setLocalError("");

    // validări minime
    if (!formData.email?.trim()) return setLocalError("Email este obligatoriu.");
    if (!formData.firstName?.trim()) return setLocalError("Prenumele este obligatoriu.");
    if (!formData.lastName?.trim()) return setLocalError("Numele este obligatoriu.");
    if (!formData.institutionId) return setLocalError("Selectează instituția.");

    if (isCreate && !formData.password?.trim()) {
      return setLocalError("Parola este obligatorie la crearea utilizatorului.");
    }

    // Admin instituție: hard rules
    if (isAdminInstitution) {
      if (Number(formData.institutionId) !== Number(currentInstitutionId)) {
        return setLocalError("Adminul de instituție poate lucra doar în instituția lui.");
      }
      if (formData.role !== "EDITOR_INSTITUTION") {
        return setLocalError("Adminul de instituție poate crea/edita doar EDITOR_INSTITUTION.");
      }
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[12px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Închide"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {(formError || localError) && (
            <div className="p-4 rounded-[16px] bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm font-medium">
              {localError || formError}
            </div>
          )}

          {/* Info badge for ADMIN_INSTITUTION */}
          {isAdminInstitution && (
            <div className="p-4 rounded-[16px] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200 text-sm">
              Admin Instituție: poți crea/edita doar utilizatori <b>EDITOR_INSTITUTION</b> din instituția ta.
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Prenume
              </label>
              <input
                value={formData.firstName || ""}
                disabled={isView}
                onChange={(e) => setField({ firstName: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Nume
              </label>
              <input
                value={formData.lastName || ""}
                disabled={isView}
                onChange={(e) => setField({ lastName: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Email
            </label>
            <input
              value={formData.email || ""}
              disabled={isView}
              onChange={(e) => setField({ email: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60"
            />
          </div>

          {/* Password */}
          {!isView && (
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Parolă {isCreate ? "(obligatoriu)" : "(opțional)"}
              </label>
              <input
                type="password"
                value={formData.password || ""}
                onChange={(e) => setField({ password: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                placeholder={isCreate ? "Setează parola" : "Lasă gol dacă nu schimbi parola"}
              />
            </div>
          )}

          {/* Phone / Position / Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Telefon
              </label>
              <input
                value={formData.phone || ""}
                disabled={isView}
                onChange={(e) => setField({ phone: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Funcție
              </label>
              <input
                value={formData.position || ""}
                disabled={isView}
                onChange={(e) => setField({ position: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Departament
            </label>
            <input
              value={formData.department || ""}
              disabled={isView}
              onChange={(e) => setField({ department: e.target.value })}
              className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60"
            />
          </div>

          {/* Role + Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Rol
              </label>
              <select
                value={formData.role || "EDITOR_INSTITUTION"}
                disabled={roleDisabled}
                onChange={(e) => setField({ role: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                {allowedRoleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {isAdminInstitution && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Admin Instituție poate seta doar <b>EDITOR_INSTITUTION</b>.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Instituție
              </label>
              <select
                value={formData.institutionId || ""}
                disabled={institutionDisabled}
                onChange={(e) => setField({ institutionId: e.target.value ? Number(e.target.value) : null })}
                className="mt-1 w-full px-4 py-2.5 rounded-[14px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all disabled:opacity-60 cursor-pointer"
              >
                <option value="">Selectează</option>
                {availableInstitutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              {isAdminInstitution && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Instituția este fixă (instituția ta).
                </p>
              )}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between p-4 rounded-[16px] border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Status utilizator</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Activează/dezactivează contul</div>
            </div>

            <label className={`inline-flex items-center cursor-pointer ${isView ? "opacity-60 pointer-events-none" : ""}`}>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!formData.isActive}
                onChange={(e) => setField({ isActive: e.target.checked })}
              />
              <div className="relative w-12 h-7 bg-gray-300 dark:bg-gray-700 peer-checked:bg-emerald-600 rounded-full transition-colors">
                <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-[14px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Închide
          </button>

          {!isView && (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-[14px] font-bold flex items-center gap-2 transition-all ${
                canSubmit
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
              title={!canSubmit ? "Nu ai permisiunea pentru această acțiune" : "Salvează"}
            >
              <Save className="w-4 h-4" />
              Salvează
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;