// src/components/UserProfile.jsx
/**
 * ============================================================================
 * USER PROFILE - MODERN REDESIGN
 * ============================================================================
 * ✅ Layout modern, compact, intuitiv
 * ✅ Full-width cu grid responsiv
 * ✅ Fără spații inutile
 * ✅ Culori și iconițe moderne
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { userService } from "../userService";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Briefcase,
  Users,
  Lock,
  CheckCircle2,
} from "lucide-react";
import DashboardHeader from "./dashboard/DashboardHeader";

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [institutionData, setInstitutionData] = useState(null);
  const [operators, setOperators] = useState([]);
  
  const [sidebarMode, setSidebarMode] = useState(null);
  const [showPassword, setShowPassword] = useState({ current: false, new: false });
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    currentPassword: "",
    newPassword: "",
  });

  const [errors, setErrors] = useState({});

  // ========================================================================
  // LOAD DATA
  // ========================================================================

  useEffect(() => {
    loadUserProfile();
    if (currentUser?.role === "PLATFORM_ADMIN") {
      loadOperators();
    }
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getUserProfile();
      
      if (response.success) {
        setUserData(response.data.user);
        setInstitutionData(response.data.institution);
        
        setFormData({
          firstName: response.data.user.first_name || "",
          lastName: response.data.user.last_name || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
          position: response.data.user.position || "",
          department: response.data.user.department || "",
          currentPassword: "",
          newPassword: "",
        });
      } else {
        console.error("Failed to load profile:", response.message);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      setOperators([
        {
          id: 1,
          name: "ROMPREST SERVICE S.A.",
          email: "office@romprest.eu",
          phone: "+40 731 798 141",
          activity: "Colectare",
          beneficiary: "S1",
          status: "Activ",
        },
        {
          id: 2,
          name: "IRIDEX GROUP IMPORT EXPORT S.R.L.",
          email: "office@iridex.ro",
          phone: "+40 723 685 252",
          activity: "Tratare mecano-biologică",
          beneficiary: "S2, S3, S4",
          status: "Activ",
        },
        {
          id: 3,
          name: "ECO SUD S.A.",
          email: "office@ecosud.ro",
          phone: "+40 731 798 141",
          activity: "Depozitare",
          beneficiary: "S1, S2, S3, S4, S5, S6",
          status: "Activ",
        },
      ]);
    } catch (err) {
      console.error("Error loading operators:", err);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleEditPersonal = () => {
    setSidebarMode("personal");
    setErrors({});
  };

  const handleEditPassword = () => {
    setSidebarMode("password");
    setFormData({ ...formData, currentPassword: "", newPassword: "" });
    setErrors({});
  };

  const handleCloseSidebar = () => {
    setSidebarMode(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validatePersonalData = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "Prenumele este obligatoriu";
    if (!formData.lastName.trim()) newErrors.lastName = "Numele este obligatoriu";
    if (!formData.email.trim()) newErrors.email = "Email-ul este obligatoriu";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalid";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) newErrors.currentPassword = "Parola curentă este obligatorie";
    if (!formData.newPassword) newErrors.newPassword = "Parola nouă este obligatorie";
    else if (formData.newPassword.length < 8) newErrors.newPassword = "Parola trebuie să aibă minim 8 caractere";
    else if (!/[A-Z]/.test(formData.newPassword)) newErrors.newPassword = "Parola trebuie să conțină cel puțin o literă mare";
    else if (!/[a-z]/.test(formData.newPassword)) newErrors.newPassword = "Parola trebuie să conțină cel puțin o literă mică";
    else if (!/[0-9]/.test(formData.newPassword)) newErrors.newPassword = "Parola trebuie să conțină cel puțin un număr";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePersonal = async () => {
    if (!validatePersonalData()) return;

    setSaving(true);
    try {
      const response = await userService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
      });

      if (response.success) {
        await loadUserProfile();
        handleCloseSidebar();
        alert("Profil actualizat cu succes!");
      } else {
        alert(response.message || "Eroare la actualizare");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    try {
      const response = await userService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        handleCloseSidebar();
        alert("Parola schimbată cu succes!");
      } else {
        setErrors({ currentPassword: response.message });
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Eroare la schimbarea parolei");
    } finally {
      setSaving(false);
    }
  };

  // ========================================================================
  // UTILS
  // ========================================================================

  const getUserInitials = () => {
    if (!userData) return "?";
    const first = userData.first_name?.charAt(0) || "";
    const last = userData.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  const formatRole = (role) => {
    const roleMap = {
      PLATFORM_ADMIN: "Administrator Platformă",
      ADMIN_INSTITUTION: "Administrator Instituție",
      EDITOR_INSTITUTION: "Editor Instituție",
      REGULATOR_VIEWER: "Vizualizator",
    };
    return roleMap[role] || role;
  };

  const getBadgeColor = (activity) => {
    const colors = {
      "Colectare": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      "Tratare mecano-biologică": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      "Depozitare": "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return colors[activity] || "bg-gray-500/10 text-gray-400 border border-gray-500/20";
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <DashboardHeader title="Profil Utilizator" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-400">Se încarcă...</p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <DashboardHeader title="Profil Utilizator" />

      <div className="px-6 py-6 max-w-[1600px] mx-auto">
        
        {/* HEADER CARD - Compact */}
        <div className="bg-gradient-to-r from-[#1e293b] to-[#1e293b]/80 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white text-2xl font-bold">
                  {getUserInitials()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#1e293b]" />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-1">
                {userData?.first_name} {userData?.last_name}
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                {userData?.position || "Funcție nedefinită"}
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {formatRole(userData?.role)}
              </span>
            </div>

            {/* Contact rapid */}
            <div className="flex items-center gap-8 px-6 border-l border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{userData?.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{userData?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* GRID LAYOUT: 2 COLOANE */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          
          {/* INFO PERSONALE */}
          <div className="bg-[#1e293b] rounded-xl border border-gray-800">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Informații personale
              </h3>
              <button
                onClick={handleEditPersonal}
                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-4">
              <InfoField label="Nume" value={userData?.last_name} />
              <InfoField label="Prenume" value={userData?.first_name} />
              <InfoField label="Email" value={userData?.email} />
              <InfoField label="Telefon" value={userData?.phone} />
              <InfoField label="Funcția" value={userData?.position} />
              <InfoField label="Departament" value={userData?.department} />
            </div>

            <div className="p-5 border-t border-gray-800">
              <button
                onClick={handleEditPassword}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Schimbă parola
              </button>
            </div>
          </div>

          {/* INFO ORGANIZAȚIE */}
          {institutionData && (
            <div className="bg-[#1e293b] rounded-xl border border-gray-800">
              <div className="p-5 border-b border-gray-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Informații organizație
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Denumire</p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {institutionData.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Adresă</p>
                  <p className="text-sm text-gray-300 flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    {institutionData.address || "-"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Telefon</p>
                    <p className="text-sm text-gray-300">{institutionData.contact_phone || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Email</p>
                    <p className="text-sm text-gray-300">{institutionData.contact_email || "-"}</p>
                  </div>
                </div>
                
                {institutionData.website && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Website</p>
                    <a 
                      href={institutionData.website.startsWith('http') ? institutionData.website : `https://${institutionData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      {institutionData.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TABEL OPERATORI */}
        {currentUser?.role === "PLATFORM_ADMIN" && operators.length > 0 && (
          <div className="bg-[#1e293b] rounded-xl border border-gray-800">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Operatori platformă
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Operator</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Telefon</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Activitate</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Beneficiar</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((operator) => (
                    <tr key={operator.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white">{operator.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-300">{operator.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-300">{operator.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-lg ${getBadgeColor(operator.activity)}`}>
                          {operator.activity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-300">{operator.beneficiary}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                          <span className="text-gray-300">{operator.status}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                          Vezi detalii
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SIDEBAR EDITARE */}
      {sidebarMode && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
            onClick={handleCloseSidebar}
          />
          
          <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#1e293b] shadow-2xl z-50 overflow-y-auto border-l border-gray-800">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
              <h3 className="text-base font-bold text-white">
                {sidebarMode === "personal" ? "Editează informații" : "Schimbă parola"}
              </h3>
              <button
                onClick={handleCloseSidebar}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {sidebarMode === "personal" ? (
                <div className="space-y-4">
                  <InputField
                    label="Prenume *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                  />
                  <InputField
                    label="Nume *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                  />
                  <InputField
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                  />
                  <InputField
                    label="Telefon"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Funcția"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                  <InputField
                    label="Departament"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <PasswordField
                    label="Parola curentă *"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    error={errors.currentPassword}
                    showPassword={showPassword.current}
                    toggleShow={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  />
                  <PasswordField
                    label="Parola nouă *"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    error={errors.newPassword}
                    showPassword={showPassword.new}
                    toggleShow={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  />
                  <p className="text-xs text-gray-400">
                    Minim 8 caractere, o literă mare, o literă mică și un număr.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-800 flex gap-3 sticky bottom-0 bg-[#1e293b]">
              <button
                onClick={handleCloseSidebar}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                onClick={sidebarMode === "personal" ? handleSavePersonal : handleSavePassword}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvează
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
    <p className="text-sm text-white">{value || "-"}</p>
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange, error }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 bg-[#0f172a] border ${
        error ? "border-red-500" : "border-gray-700"
      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white text-sm transition-all`}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

const PasswordField = ({ label, name, value, onChange, error, showPassword, toggleShow }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 bg-[#0f172a] border ${
          error ? "border-red-500" : "border-gray-700"
        } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white text-sm pr-10 transition-all`}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

export default UserProfile;