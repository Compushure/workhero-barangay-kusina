/**
 * Role-Based Access Control (RBAC)
 * ===================================
 * Defines role hierarchy and permission checks for the application.
 * Role hierarchy: superadmin > manager > hr > regular
 */

// Define role hierarchy with numeric values for comparison
export const ROLE_HIERARCHY = {
  superadmin: 4,
  manager: 3,
  hr: 2,
  regular: 1,
} as const

export type RoleType = keyof typeof ROLE_HIERARCHY

/**
 * Checks if a user has a minimum role level
 * @param userRole - The user's role
 * @param minimumRole - The minimum required role
 * @returns true if user's role is >= minimum role
 */
export function hasMinimumRole(
  userRole: string | null | undefined,
  minimumRole: RoleType
): boolean {
  if (!userRole) return false

  const trimmedRole = userRole.trim().toLowerCase()
  const userRoleLevel = ROLE_HIERARCHY[trimmedRole as RoleType]
  const minimumRoleLevel = ROLE_HIERARCHY[minimumRole]

  return (userRoleLevel ?? 0) >= minimumRoleLevel
}

/**
 * Checks if user role is exactly equal to specified role
 * @param userRole - The user's role
 * @param role - The role to check against
 * @returns true if roles match
 */
export function hasRole(
  userRole: string | null | undefined,
  role: RoleType
): boolean {
  return userRole?.trim().toLowerCase() === role
}

/**
 * Checks if user has any of the specified roles
 * @param userRole - The user's role
 * @param roles - Array of roles to check against
 * @returns true if user has any of the specified roles
 */
export function hasAnyRole(
  userRole: string | null | undefined,
  roles: RoleType[]
): boolean {
  if (!userRole) return false
  const trimmedRole = userRole.trim().toLowerCase()
  return roles.includes(trimmedRole as RoleType)
}

/**
 * Permission checks for different operations
 */
export const PERMISSIONS = {
  // User management operations
  CAN_ADD_USER: (userRole: string | null | undefined) =>
    hasMinimumRole(userRole, 'hr'), // hr, manager, superadmin
  CAN_EDIT_USER: (userRole: string | null | undefined) =>
    hasMinimumRole(userRole, 'hr'), // hr, manager, superadmin
  CAN_DELETE_USER: (userRole: string | null | undefined) =>
    hasRole(userRole, 'superadmin'), // only superadmin
  CAN_VIEW_USERS: (userRole: string | null | undefined) =>
    hasMinimumRole(userRole, 'manager'), // manager, superadmin
  CAN_MANAGE_ADMINS: (userRole: string | null | undefined) =>
    hasRole(userRole, 'superadmin'), // only superadmin
} as const

/**
 * Error messages for role-based access denial
 */
export const ROLE_ERROR_MESSAGES = {
  SUPERADMIN_ONLY: 'Only superadmins can perform this action',
  HR_OR_ABOVE: 'Only HR staff and above can perform this action',
  MANAGER_OR_ABOVE: 'Only managers and above can perform this action',
  NOT_AUTHORIZED: 'You do not have permission to perform this action',
} as const
