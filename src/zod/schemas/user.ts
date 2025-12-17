/**
 * Zod Schemas - User Management
 * ==============================
 * Validation schemas for user-related forms and inputs.
 */

import { z } from 'zod';
import { EmployeeType } from '@/types';
import { CompassIcon } from 'lucide-react';

/**
 * Schema for adding a new user
 */
export const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  employeeType: EmployeeType,
  companyId: z.string().optional(),
});

/**
 * Schema for editing an existing user
 */
export const editUserSchema = z.object({
  name: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, 'Name must be at least 2 characters if provided'),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, 'Password must be 6+ chars '),
  employeeType: z.enum(['manager', 'hr', 'regular', 'no-change', '']).optional(),
  employmentStatus: z.enum(['regular', 'probationary', 'no-change', '']).optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  tin: z.string().optional(),
  sss: z.string().optional(),
  pagibig: z.string().optional(),
});
