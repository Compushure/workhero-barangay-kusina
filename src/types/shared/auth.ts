/**
 * Shared Authentication Types
 * ===========================
 * Core user and authentication related types
 */

import { z } from 'zod';

// ============================================
// Employee Type Enum
// ============================================

export const EmployeeType = z.enum(['superadmin', 'manager', 'hr', 'regular']);
export type EmployeeTypeValue = z.infer<typeof EmployeeType>;

// ============================================
// Employment Status Enum
// ============================================

export const EmploymentStatus = z.enum(['', 'probational', 'regular']);
export type EmploymentStatusValue = z.infer<typeof EmploymentStatus>;

// ============================================
// User Type
// ============================================

/**
 * User interface representing a user in the system
 * Includes optional extended fields for comprehensive employee data
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  employeeType: EmployeeTypeValue;
  date_added: Date;
  // Extended employee fields
  companyId?: string;
  employeeId?: string;
  employmentStatus?: EmploymentStatusValue;
  contactNumber?: string;
  address?: string;
  tin?: string;
  sss?: string;
  pagibig?: string;
  createdAt?: Date;
}

/**
 * AuthUser minimal type for authentication contexts
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * UserWithExtras extends the base User interface with additional fields
 * Used throughout the application for comprehensive user data display
 */
export type UserWithExtras = User & {
  employeeId?: string;
  companyId?: string;
  employmentStatus?: 'probationary' | 'regular' | string;
  contactNumber?: string;
  address?: string;
  tin?: string;
  sss?: string;
  pagibig?: string;
  createdAt?: string | Date;
  profilePictureUrl?: string;
};

/**
 * Type for login input
 * Inferred from loginSchema in @/zod/schemas
 */
export type LoginInput = z.infer<typeof import('@/zod/schemas').loginSchema>;

/**
 * Type for user role result
 */
export type UserRoleResult = {
  role: string | null;
  error: string | null;
};
