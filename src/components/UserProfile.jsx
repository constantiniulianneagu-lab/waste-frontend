// src/components/UserProfile.jsx
/**
 * ============================================================================
 * USER PROFILE - EXACT CA ÎN IMAGINE
 * ============================================================================
 * 
 * ✅ Layout: Avatar + Info personale + Info organizație
 * ✅ Sidebar dreapta pentru editare
 * ✅ Tabel operatori cu activități (dacă e PLATFORM_ADMIN)
 * ✅ Role-based access control
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { userService } from "../userService";
import DashboardHeader from "./dashboard/DashboardHeader";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Briefcase,
  Shield,
  Truck,
} from "lucide-react";

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const [notificationCount] = useState(3);
  
  const [userData, setUserData] = useState(null);
  const [institutionData, setInstitutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sidebar edit state
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [editMode, setEditMode] = useState("personal"); // "personal" sau "password"
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
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

  // Operators data (doar pentru PLATFORM_ADMIN)
  const [operators, setOperators] = useState([]);

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
      // Încarcă date user + instituție
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
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      // Mock data pentru demo - în producție vine din API
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
    setEditMode("personal");
    setShowEditSidebar(true);
  };

  const handleEditPassword = () => {
    setEditMode("password");
    setShowEditSidebar(true);
  };

  const handleSave = async () => {
    try {
      let response;
      
      if (editMode === "personal") {
        response = await userService.updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
        });
      } else {
        response = await userService.updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      if (response.success) {
        alert("Salvat cu succes!");
        setShowEditSidebar(false);
        loadUserProfile();
      } else {
        alert(response.message || "Eroare la salvare");
      }
    } catch (err) {
      alert(err.message || "Eroare la salvare");
    }
  };

  // ========================================================================
  // ROLE MAPPING
  // ========================================================================

  const roleMap = {
    PLATFORM_ADMIN: { label: "Administrator Platformă", color: "red", icon: Shield },
    ADMIN_INSTITUTION: { label: "Administrator Instituție", color: "blue", icon: Building2 },
    EDITOR_INSTITUTION: { label: "Editor Instituție", color: "emerald", icon: Edit2 },
    REGULATOR_VIEWER: { label: "Vizualizator", color: "gray", icon: Eye },
  };

  const getRoleInfo = (role) => {
    return roleMap[role] || { label: role, color: "gray", icon: User };
  };

  const roleInfo = getRoleInfo(currentUser?.role);
  const RoleIcon = roleInfo.icon;

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader 
          notificationCount={notificationCount}
          title="Profil utilizator"
        />
        <div className="px-6 lg:px-8 py-6">
          <div className="max-w-[1920px] mx-auto">
            <p className="text-center text-gray-500 dark:text-gray-400">Se încarcă...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER UNIFORM */}
      <DashboardHeader 
        notificationCount={notificationCount}
        title="Profil utilizator"
      />

      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-[1920px] mx-auto">
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Aici îți poți administra profilul de utilizator
          </p>

          {/* LAYOUT 2 COLOANE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* STÂNGA: AVATAR + INFO SCURT */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {userData?.first_name?.[0]}{userData?.last_name?.[0]}
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                    {userData?.first_name} {userData?.last_name}
                  </h2>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {userData?.position || "Expert managementul deșeurilor"}
                  </p>
                </div>

                {/* Contact rapid */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {userData?.phone || "+40 760 766 330"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400 truncate">
                      {userData?.email}
                    </span>
                  </div>
                </div>

                {/* Instituție link */}
                {institutionData && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Organizație
                    </p>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {institutionData.name}
                    </p>
                  </div>
                )}
              </div>
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
                      {userData?.last_name || "NEAGU"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Prenume</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData?.first_name || "Constantin"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData?.phone || "+40 760 766 330"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Funcția</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData?.position || "Expert managementul deșeurilor"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Direcția/Departamentul</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userData?.department || "Direcția tehnică"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Parolă curentă</p>
                    <button
                      onClick={handleEditPassword}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Introduceți parola curentă
                    </button>
                    <button
                      onClick={handleEditPassword}
                      className="ml-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Introduceți noua parolă
                    </button>
                  </div>
                </div>
              </div>

              {/* INFO ORGANIZAȚIE */}
              {institutionData && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      Informații organizație
                    </h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Denumire:</p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {institutionData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Adresă:</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {institutionData.address || "Bulevardul Regina Elisabeta, nr.47, sector 5, București"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Telefon:</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {institutionData.contact_phone || "+0347 256 269"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email:</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {institutionData.contact_email || "office@adigidmb.ro"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Web:</p>
                      <a 
                        href={institutionData.website || "https://www.adigidmb.ro"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {institutionData.website || "www.adigidmb.ro"}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABEL OPERATORI - DOAR PENTRU PLATFORM_ADMIN */}
          {currentUser?.role === "PLATFORM_ADMIN" && operators.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Informații privind activitatea de salubrizare
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Nume Operator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Activitate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Beneficiar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {operators.map((op) => (
                      <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {op.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {op.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {op.phone}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            op.activity === "Colectare" 
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : op.activity === "Tratare mecano-biologică"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          }`}>
                            {op.activity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {op.beneficiary}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-fit">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            {op.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-lg transition-all">
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
      </div>

      {/* SIDEBAR EDITARE - DREAPTA */}
      {showEditSidebar && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEditSidebar(false)}></div>
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
            <div className="h-full flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editMode === "personal" ? "Editează informații personale" : "Schimbă parola"}
                  </h3>
                  <button
                    onClick={() => setShowEditSidebar(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6">
                {editMode === "personal" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prenume
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nume
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Funcția
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Direcția/Departamentul
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Parola curentă
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Parolă nouă
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Parola trebuie să conțină minim 8 caractere, cel puțin o literă mare, o literă mică și un număr.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvează
                  </button>
                  <button
                    onClick={() => setShowEditSidebar(false)}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Anulează
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;