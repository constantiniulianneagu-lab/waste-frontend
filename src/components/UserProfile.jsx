// src/components/UserProfile.jsx
/**
 * ============================================================================
 * USER PROFILE - 2026 SAMSUNG/APPLE STYLE
 * ============================================================================
 * 
 * Modern glassmorphism design with perfect light/dark mode
 * 
 * ✅ Samsung One UI 7.0 rounded corners (24-28px)
 * ✅ Apple iOS 18 glassmorphism effects
 * ✅ Premium gradients and micro-interactions
 * ✅ Perfect light/dark mode adaptive colors
 * ✅ Smooth animations (300ms)
 * ✅ Operators table with expand row
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
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
  Shield,
  FileText,
} from "lucide-react";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProfileContracts from "./ProfileContracts";

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [institutionData, setInstitutionData] = useState(null);
  
  // ✅ OPERATORS STATE
  const [operators, setOperators] = useState([]);
  const [operatorsLoading, setOperatorsLoading] = useState(false);
  const [expandedOperator, setExpandedOperator] = useState(null);
  
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
    if (currentUser?.role !== 'REGULATOR_VIEWER') {
      loadOperators();
    }
  }, [currentUser?.role]);

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

  // ✅ LOAD OPERATORS FROM API
  const loadOperators = async () => {
    setOperatorsLoading(true);
    try {
      const response = await userService.getProfileOperators();
      
      if (response.success) {
        setOperators(response.data.operators || []);
        console.log('✅ Operators loaded:', response.data.operators.length);
      } else {
        console.error('Failed to load operators:', response.message);
      }
    } catch (err) {
      console.error('Error loading operators:', err);
    } finally {
      setOperatorsLoading(false);
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

  // ✅ OPERATORS HANDLERS
  const toggleExpandOperator = (operatorId) => {
    setExpandedOperator(expandedOperator === operatorId ? null : operatorId);
  };

  const getOperatorTypeLabel = (type) => {
    const labels = {
      'WASTE_COLLECTOR': 'Colectare',
      'SORTING_OPERATOR': 'Sortare',
      'TMB_OPERATOR': 'Tratare mecano-biologică',
      'DISPOSAL_OPERATOR': 'Depozitare'
    };
    return labels[type] || type;
  };

  const getOperatorTypeBadgeColor = (type) => {
    const colors = {
      'WASTE_COLLECTOR': 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
      'SORTING_OPERATOR': 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30',
      'TMB_OPERATOR': 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30',
      'DISPOSAL_OPERATOR': 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/30'
    };
    return colors[type] || 'bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20 dark:border-gray-500/30';
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
      REGULATOR_VIEWER: "Autoritate publică",
    };
    return roleMap[role] || role;
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader title="Profil Utilizator" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Se încarcă...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER - MODERN STYLE
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader title="Profil Utilizator" />

      <div className="px-6 py-6 max-w-[1600px] mx-auto">
        
        {/* HEADER CARD - Premium Samsung style */}
        <div className="group relative mb-6">
          <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                        rounded-[28px] border border-gray-200 dark:border-gray-700/50 
                        p-6 shadow-sm dark:shadow-none overflow-hidden">
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 
                          opacity-[0.02] dark:opacity-[0.04]" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[20px] 
                              bg-gradient-to-br from-emerald-500 to-teal-600 
                              flex items-center justify-center 
                              shadow-xl shadow-emerald-500/20">
                  <span className="text-white text-3xl font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                
                {/* Online indicator with pulse */}
                <div className="absolute -bottom-2 -right-2">
                  <div className="relative">
                    <div className="w-6 h-6 bg-emerald-400 rounded-full 
                                  border-4 border-white dark:border-gray-800" />
                    <div className="absolute inset-0 w-6 h-6 bg-emerald-400 
                                  rounded-full animate-ping opacity-40" />
                  </div>
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {userData?.first_name} {userData?.last_name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {userData?.position || "Funcție nedefinită"}
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 
                               text-xs font-bold rounded-[14px] 
                               bg-emerald-500/10 dark:bg-emerald-500/20 
                               text-emerald-600 dark:text-emerald-400 
                               border border-emerald-500/20 dark:border-emerald-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  {formatRole(userData?.role)}
                </span>
              </div>

              {/* Contact info - Desktop */}
              <div className="hidden lg:flex flex-col gap-3 px-6 border-l border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-[12px] 
                                bg-blue-500/10 dark:bg-blue-500/20 
                                flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {userData?.phone || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-[12px] 
                                bg-emerald-500/10 dark:bg-emerald-500/20 
                                flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {userData?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRID LAYOUT: 2 COLOANE - Modern cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          
          {/* INFO PERSONALE */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                        rounded-[28px] border border-gray-200 dark:border-gray-700/50 
                        shadow-sm dark:shadow-none overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700/50">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-blue-500/10 dark:bg-blue-500/20 
                              flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Informații personale
              </h3>
              <button
                onClick={handleEditPersonal}
                className="p-2.5 text-blue-600 dark:text-blue-400 
                         hover:bg-blue-500/10 dark:hover:bg-blue-500/20 
                         rounded-[12px] transition-all duration-300
                         active:scale-95"
                title="Editează informații"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoField label="Nume" value={userData?.last_name} />
              <InfoField label="Prenume" value={userData?.first_name} />
              <InfoField label="Email" value={userData?.email} />
              <InfoField label="Telefon" value={userData?.phone} />
              <InfoField label="Funcția" value={userData?.position} />
              <InfoField label="Departament" value={userData?.department} />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700/50">
              <button
                onClick={handleEditPassword}
                className="w-full px-5 py-3 
                         bg-gradient-to-r from-blue-600 to-blue-700 
                         hover:from-blue-700 hover:to-blue-800 
                         text-white text-sm font-bold rounded-[16px] 
                         transition-all duration-300
                         active:scale-98
                         flex items-center justify-center gap-2
                         shadow-lg shadow-blue-500/20"
              >
                <Lock className="w-4 h-4" />
                Schimbă parola
              </button>
            </div>
          </div>

          {/* INFO ORGANIZAȚIE */}
          {institutionData && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl 
                          rounded-[28px] border border-gray-200 dark:border-gray-700/50 
                          shadow-sm dark:shadow-none overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700/50">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 
                                flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Informații organizație
                </h3>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Denumire
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {institutionData.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Adresă
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    {institutionData.address || "-"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Telefon
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {institutionData.contact_phone || "-"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Email
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {institutionData.contact_email || "-"}
                    </p>
                  </div>
                </div>
                
                {institutionData.website && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Website
                    </p>
                    <a 
                      href={institutionData.website.startsWith('http') ? institutionData.website : `https://${institutionData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 
                               hover:text-blue-700 dark:hover:text-blue-300 
                               hover:underline font-medium
                               flex items-center gap-2 transition-colors"
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


        {/* ✅ CONTRACTE ACTIVE */}
        {currentUser?.role !== 'REGULATOR_VIEWER' && (
          <ProfileContracts
            operators={operators}
            loading={operatorsLoading}
            userRole={currentUser?.role}
          />
        )}
      </div>

      {/* SIDEBAR EDITARE - Modern glassmorphism */}
      {sidebarMode && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 
                     transition-opacity duration-300"
            onClick={handleCloseSidebar}
          />
          
          <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] 
                        bg-white dark:bg-gray-800 
                        shadow-2xl z-50 overflow-y-auto 
                        border-l border-gray-200 dark:border-gray-700
                        animate-slide-in">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 
                          flex items-center justify-between 
                          sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {sidebarMode === "personal" ? "Editează informații" : "Schimbă parola"}
              </h3>
              <button
                onClick={handleCloseSidebar}
                className="p-2.5 text-gray-600 dark:text-gray-400 
                         hover:text-gray-900 dark:hover:text-white 
                         hover:bg-gray-100 dark:hover:bg-gray-700 
                         rounded-[12px] transition-all duration-300
                         active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              {sidebarMode === "personal" ? (
                <div className="space-y-5">
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
                <div className="space-y-5">
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
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 
                                rounded-[14px] border border-blue-200 dark:border-blue-800/30">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      💡 Parola trebuie să conțină minim 8 caractere, o literă mare, o literă mică și un număr.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 
                          flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={handleCloseSidebar}
                disabled={saving}
                className="flex-1 px-5 py-3 
                         bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600 
                         text-gray-900 dark:text-white 
                         font-bold rounded-[16px] 
                         transition-all duration-300
                         active:scale-98
                         disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                onClick={sidebarMode === "personal" ? handleSavePersonal : handleSavePassword}
                disabled={saving}
                className="flex-1 px-5 py-3 
                         bg-gradient-to-r from-emerald-600 to-teal-600 
                         hover:from-emerald-700 hover:to-teal-700 
                         text-white font-bold rounded-[16px] 
                         transition-all duration-300
                         active:scale-98
                         disabled:opacity-50 
                         flex items-center justify-center gap-2
                         shadow-lg shadow-emerald-500/20"
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
// HELPER COMPONENTS - MODERN STYLE
// ============================================================================

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className="text-sm font-medium text-gray-900 dark:text-white">
      {value || "-"}
    </p>
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange, error }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                    uppercase tracking-wider mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 
                bg-gray-50 dark:bg-gray-900/50 
                border ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} 
                rounded-[14px] 
                focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 
                outline-none 
                text-gray-900 dark:text-white text-sm 
                transition-all duration-300
                placeholder-gray-400 dark:placeholder-gray-500`}
    />
    {error && (
      <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
        {error}
      </p>
    )}
  </div>
);

const PasswordField = ({ label, name, value, onChange, error, showPassword, toggleShow }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 
                    uppercase tracking-wider mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 pr-12
                  bg-gray-50 dark:bg-gray-900/50 
                  border ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} 
                  rounded-[14px] 
                  focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 
                  outline-none 
                  text-gray-900 dark:text-white text-sm 
                  transition-all duration-300`}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 
                 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                 transition-colors rounded-[10px]
                 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {error && (
      <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
        {error}
      </p>
    )}
  </div>
);

export default UserProfile;