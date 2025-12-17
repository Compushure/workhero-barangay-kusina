/**
 * Type Definitions
 * =================
 * Centralized location for all application types and interfaces.
 */

import { z } from 'zod';

// ============================================
// Employee Type Enum
// ============================================

export const EmployeeType = z.enum(['manager', 'hr', 'regular']);
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

// ============================================
// Query Parameters Type
// ============================================

/**
 * Parameters for filtering, searching, and paginating users
 * Used throughout the application for consistent query handling
 */
export interface UserQueryParams {
  searchQuery?: string;
  searchType?: 'name' | 'employee_id';
  employeeTypeFilter?: 'all' | EmployeeTypeValue;
  employmentStatusFilter?: 'all' | EmploymentStatusValue;
  sortBy?: 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';
  page?: number;
  pageSize?: number;
}

// ============================================
// Input Types (Inferred from Zod Schemas)
// ============================================

/**
 * Type for adding a new user input
 * Inferred from addUserSchema in @/zod/schemas
 */
export type AddUserInput = z.infer<typeof import('@/zod/schemas').addUserSchema>;

/**
 * Type for editing a user input
 * Inferred from editUserSchema in @/zod/schemas
 */
export type EditUserInput = z.infer<typeof import('@/zod/schemas').editUserSchema>;

/**
 * Type for login input
 * Inferred from loginSchema in @/zod/schemas
 */
export type LoginInput = z.infer<typeof import('@/zod/schemas').loginSchema>;

/**
 * Type for server action responses
 * Generic response type for consistent error handling
 */
export type ServerActionResponse<T = unknown> = {
  error: string | null;
  data?: T;
};
