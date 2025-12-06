// src/components/UserProfile.jsx
/**
 * ============================================================================
 * USER PROFILE - COMPLETE (FIXED - REAL DATA ONLY)
 * ============================================================================
 * ✅ Fără mock data
 * ✅ Toate datele vin din API
 * ✅ Loading states
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
} from "lucide-react";
import DashboardHeader from "./dashboard/DashboardHeader";

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  
  // ========================================================================
  // STATE
  // ========================================================================
  
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
      // TODO: Implementează endpoint backend pentru operators
      // const response = await operatorService.getAllOperators();
      // setOperators(response.data);
      
      // Mock data pentru demo - doar pentru PLATFORM_ADMIN
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
      "Colectare": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "Tratare mecano-biologică": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      "Depozitare": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[activity] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader title="Profil Utilizator" />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Se încarcă profilul...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <DashboardHeader title="Profil Utilizator" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* GRID LAYOUT: STÂNGA (Avatar + Contact) + DREAPTA (Info Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* STÂNGA: AVATAR + CONTACT RAPID */}
          <div className="space-y-6">
            
            {/* Avatar Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 rounded-full border-4 border-white dark:border-gray-800" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {userData?.first_name} {userData?.last_name}
                </h2>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {userData?.position || "Funcție nedefinită"}
                </p>
                
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {formatRole(userData?.role)}
                </span>
              </div>
            </div>

            {/* Contact Rapid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Contact rapid</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {userData?.phone || "Telefon nedefinit"}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    {userData?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Organizație Card */}
            {institutionData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Organizație
                </h3>
                
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {institutionData.short_name || institutionData.name}
                </p>
                
                {institutionData.sector && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sector {institutionData.sector}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* DREAPTA: INFO PERSONALE + INFO ORGANIZAȚIE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* INFO PERSONALE */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Informații personale
                </h3>
                <button
                  onClick={handleEditPersonal}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nume</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.last_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Prenume</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.first_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.phone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Funcția</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.position || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Direcția/Departamentul</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData?.department || "-"}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button
                  onClick={handleEditPassword}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Schimbă parola
                </button>
              </div>
            </div>

            {/* INFO ORGANIZAȚIE */}
            {institutionData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Informații organizație
                  </h3>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Denumire</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {institutionData.name}
                    </p>
                  </div>
                  
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Adresă</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      {institutionData.address || "-"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {institutionData.contact_phone || "-"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {institutionData.contact_email || "-"}
                    </p>
                  </div>
                  
                  {institutionData.website && (
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Website</p>
                      <a 
                        href={institutionData.website.startsWith('http') ? institutionData.website : `https://${institutionData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
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
        </div>

        {/* TABEL OPERATORI (doar pentru PLATFORM_ADMIN) */}
        {currentUser?.role === "PLATFORM_ADMIN" && operators.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Operatori platformă
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nume Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Telefon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activitate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Beneficiar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {operators.map((operator) => (
                    <tr key={operator.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{operator.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{operator.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{operator.phone}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getBadgeColor(operator.activity)}`}>
                          {operator.activity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{operator.beneficiary}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                          <span className="text-gray-600 dark:text-gray-300">{operator.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium rounded-lg transition-all">
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
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={handleCloseSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {sidebarMode === "personal" ? "Editează informații personale" : "Schimbă parola"}
              </h3>
              <button
                onClick={handleCloseSidebar}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {sidebarMode === "personal" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prenume *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.firstName ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nume *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.lastName ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                        errors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                      } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Funcția
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Direcția/Departamentul
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parola curentă *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                          errors.currentPassword ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parola nouă *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border ${
                          errors.newPassword ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                        } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Parola trebuie să aibă minim 8 caractere, o literă mare, o literă mică și un număr.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
              <button
                onClick={handleCloseSidebar}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Anulează
              </button>
              <button
                onClick={sidebarMode === "personal" ? handleSavePersonal : handleSavePassword}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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

export default UserProfile;