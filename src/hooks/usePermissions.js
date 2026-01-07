// src/hooks/usePermissions.js
/**
 * ============================================================================
 * RBAC PERMISSIONS HOOK
 * ============================================================================
 * Centralized hook for checking user permissions based on userAccess
 */

import { useAuth } from '../AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      canCreateData: false,
      canEditData: false,
      canDeleteData: false,
      scopes: {},
      hasAccess: () => false,
      isLoading: true,
    };
  }

  const userAccess = user.userAccess || {};
  const scopes = userAccess.scopes || {};

  return {
    // CRUD permissions
    canCreateData: userAccess.canCreateData || false,
    canEditData: userAccess.canEditData || false,
    canDeleteData: userAccess.canDeleteData || false,
    
    // Scopes object
    scopes,
    
    // Helper function to check if user has access to a specific page
    hasAccess: (pageName) => {
      return scopes[pageName] !== 'NONE';
    },
    
    // User role (for backwards compatibility)
    role: user.role,
    isPlatformAdmin: user.role === 'PLATFORM_ADMIN',
    isInstitutionAdmin: user.role === 'ADMIN_INSTITUTION',
    isEditor: user.role === 'EDITOR_INSTITUTION',
    isRegulator: user.role === 'REGULATOR_VIEWER',
    
    // Access level (ALL, OWN, or sector-specific)
    accessLevel: userAccess.accessLevel,
    
    // Institution info
    institutionId: user.institution?.id || null,
    institutionName: user.institution?.name || null,
    
    // Visible sectors
    visibleSectors: userAccess.visibleSectorIds || [],
    
    // Loading state
    isLoading: false,
  };
};