/**
 * Zod Schemas - User Management
 * ==============================
 * Validation schemas for user-related forms and inputs.
 */

import { z } from 'zod'
import { EmployeeType } from '@/types'

/**
 * Schema for adding a new user
 */
export const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  employeeType: EmployeeType,
})

/**
 * Schema for editing an existing user
 */
export const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)),
      'Password must be 8+ chars with 1 uppercase and 1 number'
    ),
  employeeType: EmployeeType,
})
