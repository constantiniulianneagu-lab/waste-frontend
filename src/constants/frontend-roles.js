// src/constants/roles.js
// Frontend - Constante pentru roluri

export const ROLES = {
    PLATFORM_ADMIN: 'PLATFORM_ADMIN',
    ADMIN_INSTITUTION: 'ADMIN_INSTITUTION',
    EDITOR_INSTITUTION: 'EDITOR_INSTITUTION',
    REGULATOR_VIEWER: 'REGULATOR_VIEWER',
  };
  
  export const ROLE_LABELS = {
    PLATFORM_ADMIN: 'Administrator Platformă',
    ADMIN_INSTITUTION: 'Administrator Instituție',
    EDITOR_INSTITUTION: 'Editor Instituție',
    REGULATOR_VIEWER: 'Autoritate Publică',
  };
  
  // Helper functions pentru verificări în componente
  export const isPlatformAdmin = (role) => {
    return role === ROLES.PLATFORM_ADMIN;
  };
  
  export const isInstitutionAdmin = (role) => {
    return role === ROLES.ADMIN_INSTITUTION;
  };
  
  export const isEditor = (role) => {
    return role === ROLES.EDITOR_INSTITUTION;
  };
  
  export const isRegulator = (role) => {
    return role === ROLES.REGULATOR_VIEWER;
  };
  
  // Verificări permisiuni
  export const canEditData = (role) => {
    return role === ROLES.PLATFORM_ADMIN;  // DOAR ADIGIDMB momentan
  };
  
  export const canCreateData = (role) => {
    return role === ROLES.PLATFORM_ADMIN;  // DOAR ADIGIDMB momentan
  };
  
  export const canDeleteData = (role) => {
    return role === ROLES.PLATFORM_ADMIN;  // DOAR ADIGIDMB momentan
  };
  
  export const canManageUsers = (role) => {
    return role === ROLES.PLATFORM_ADMIN || role === ROLES.ADMIN_INSTITUTION;
  };
  
  export const canViewOperators = (role) => {
    return role !== ROLES.REGULATOR_VIEWER;  // Toți în afară de REGULATOR
  };
  
  export const canAccessSectorsPage = (role) => {
    return role !== ROLES.REGULATOR_VIEWER;  // Toți în afară de REGULATOR
  };
  
  export const canAccessInstitutionsPage = (role) => {
    return role !== ROLES.REGULATOR_VIEWER;  // Toți în afară de REGULATOR
  };
  
  export const canAccessUsersPage = (role) => {
    return canManageUsers(role);
  };