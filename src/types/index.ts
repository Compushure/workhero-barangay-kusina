/**
 * Type Definitions
 * =================
 * Centralized location for all application types and interfaces.
 * 
 * Types are organized by domain:
 * - shared: Common types used across the application
 * - manager: Manager-specific types
 * - hr: HR-specific types
 * - employee: Employee-specific types
 * - admin: Admin-specific types
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
  profilePictureUrl?: string;
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

// ============================================
// Attendance Types
// ============================================

export * from './attendance';

/**
 * Type for adding a reward/mercado item
 * Inferred from addRewardSchema in @/zod/schemas
 */
export type AddRewardInput = z.infer<typeof import('@/zod/schemas').addRewardSchema>;

/**
 * Type for editing a reward/mercado item
 * Inferred from editRewardSchema in @/zod/schemas
 */
export type EditRewardInput = z.infer<typeof import('@/zod/schemas').editRewardSchema>;

/**
 * Type for adding a badge input
 * Inferred from addBadgeSchema in @/zod/schemas
 */
export type AddBadgeInput = z.infer<typeof import('@/zod/schemas').addBadgeSchema>;

/**
 * Type for editing a badge input
 * Inferred from editBadgeSchema in @/zod/schemas
 */
export type EditBadgeInput = z.infer<typeof import('@/zod/schemas').editBadgeSchema>;

/**
 * Type for server action responses
 * Generic response type for consistent error handling
 */
export type ServerActionResponse<T = unknown> = {
  error: string | null;
  data?: T;
};

// ============================================
// Reward/Mercado Item Type
// ============================================

/**
 * Reward interface representing a mercado item in the system
 */
export interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  quantity?: number;
  redeemingLimit?: number;
  category?: string;
  isActive: boolean;
  availableDate?: string | Date | null;
  availableMonth?: number; // 1-12 for January-December, null/undefined for all months
  createdAt?: string | Date;
  createdBy?: string;
  imageUrl?: string;
  // Stock tracking properties
  redeemedCount?: number; // Total number of items redeemed
  isOutOfStock?: boolean; // Whether the item is out of stock (quantity <= 0)
}

// ============================================
// User Extended Type
// ============================================

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
// Re-export all domain types for convenience
export * from './shared';
export * from './manager';
export * from './hr';
export * from './employee';
export * from './admin';