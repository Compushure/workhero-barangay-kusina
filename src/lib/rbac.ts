/**
 * Role-Based Access Control (RBAC) Utilities
 * ===========================================
 * Centralized role definitions and permission checks.
 * Defines role hierarchy and permission mappings.
 */

// ============================================
// Role Hierarchy
// ============================================
export const ROLE_HIERARCHY = {
  superadmin: 3,
  manager: 2,
  hr: 1,
  regular: 0,
} as const

export type RoleType = keyof typeof ROLE_HIERARCHY

// ============================================
// Permission Checks
// ============================================

/**
 * Check if user's role is equal to or higher than required role
 * @param userRole - User's current role
 * @param requiredRole - Minimum role required
 * @returns true if user has sufficient permissions
 */
export function hasRoleOrHigher(
  userRole: RoleType | null,
  requiredRole: RoleType
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Check if user has exact role
 * @param userRole - User's current role
 * @param exactRole - Exact role required
 * @returns true if user has exact role
 */
export function hasExactRole(
  userRole: RoleType | null,
  exactRole: RoleType
): boolean {
  return userRole === exactRole
}

/**
 * Check if user can add a new user
 * - superadmin: can add anyone
 * - hr: can add regular or hr employees
 * - manager: can add regular employees only
 * - regular: cannot add anyone
 * @param userRole - User's current role
 * @param targetRole - Role of user being added
 * @returns true if user can add target role
 */
export function canAddUser(
  userRole: RoleType | null,
  targetRole: RoleType
): boolean {
  if (!userRole) return false

  switch (userRole) {
    case 'superadmin':
      return true // can add anyone
    case 'hr':
      return targetRole === 'regular' || targetRole === 'hr' // can add regular and hr
    case 'manager':
      return targetRole === 'regular' // can only add regular
    case 'regular':
      return false // cannot add anyone
    default:
      return false
  }
}

/**
 * Check if user can edit another user
 * - superadmin: can edit anyone
 * - hr: can edit regular and hr (not manager/superadmin)
 * - manager: can edit regular only
 * - regular: cannot edit anyone
 * @param userRole - User's current role
 * @param targetRole - Role of user being edited
 * @returns true if user can edit target role
 */
export function canEditUser(
  userRole: RoleType | null,
  targetRole: RoleType
): boolean {
  if (!userRole) return false

  switch (userRole) {
    case 'superadmin':
      return true // can edit anyone
    case 'hr':
      return targetRole === 'regular' || targetRole === 'hr' // can edit regular and hr
    case 'manager':
      return targetRole === 'regular' // can only edit regular
    case 'regular':
      return false // cannot edit anyone
    default:
      return false
  }
}

/**
 * Check if user can delete another user
 * - superadmin: can delete anyone
 * - others: cannot delete anyone
 * @param userRole - User's current role
 * @returns true if user can delete
 */
export function canDeleteUser(userRole: RoleType | null): boolean {
  return userRole === 'superadmin'
}

/**
 * Check if user can view all users
 * - superadmin: can view all
 * - manager: can view all
 * - hr: can view all
 * - regular: cannot view user list
 * @param userRole - User's current role
 * @returns true if user can view users
 */
export function canViewUsers(userRole: RoleType | null): boolean {
  if (!userRole) return false
  return hasRoleOrHigher(userRole, 'hr')
}

/**
 * Get role label for display
 * @param role - Role type
 * @returns Human-readable role label
 */
export function getRoleLabel(role: RoleType | null): string {
  switch (role) {
    case 'superadmin':
      return 'Super Admin'
    case 'hr':
      return 'HR Manager'
    case 'manager':
      return 'Manager'
    case 'regular':
      return 'Regular Employee'
    case null:
      return 'Unknown'
    default:
      const _exhaustive: never = role
      return _exhaustive
  }
}
