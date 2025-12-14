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
// User Type
// ============================================

/**
 * User interface representing a user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  employeeType: EmployeeTypeValue;
  date_added: Date;
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
