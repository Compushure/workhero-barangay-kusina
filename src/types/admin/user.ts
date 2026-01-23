/**
 * Admin User Management Types
 * ============================
 * Types related to user administration and management
 */

import { z } from 'zod';

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
 * Form values for adding a user
 */
export type AddUserFormValues = AddUserInput;

/**
 * Form values for editing a user
 */
export type EditUserFormValues = EditUserInput;
