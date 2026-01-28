/**
 * Zod Schemas - User Management
 * ==============================
 * Validation schemas for user-related forms and inputs.
 */

import { z } from 'zod';
import { EmployeeType } from '@/types';

/**
 * Philippine TIN (Tax Identification Number) validation
 * Format: 9 digits (e.g., 123-456-789)
 */
const tinSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^\d{9}$/.test(val.replace(/[^\d]/g, '')),
    'TIN must be 9 digits'
  );

/**
 * Philippine SSS (Social Security System) validation
 * Format: 10 digits (e.g., 12-3456789-0)
 */
const sssSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^\d{10}$/.test(val.replace(/[^\d]/g, '')),
    'SSS must be 10 digits'
  );

/**
 * Philippine Pag-IBIG (HDMF) validation
 * Format: 12 digits (e.g., 1234-5678-9012)
 */
const pagibigSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^\d{12}$/.test(val.replace(/[^\d]/g, '')),
    'Pag-IBIG must be 12 digits'
  );

/**
 * Philippine mobile number validation
 * Format: 11 digits starting with 09 (e.g., 09123456789)
 */
const contactNumberSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^09\d{9}$/.test(val.replace(/[^\d]/g, '')),
    'Contact number must be 11 digits starting with 09'
  );

/**
 * Schema for adding a new user
 */
export const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  employmentStatus: z.enum(['', 'probational', 'regular']).default(''),
  employeeType: EmployeeType,
  companyId: z.string().optional(),
  employeeId: z.string().optional(),
  contactNumber: contactNumberSchema,
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(250, 'Address must not exceed 250 characters'),
  tin: tinSchema,
  sss: sssSchema,
  pagibig: pagibigSchema,
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
    .refine((val) => !val || val.length >= 6, 'Password must be 6+ chars'),
  employeeType: z.enum(['superadmin', 'manager', 'hr', 'regular', 'no-change', '']).optional(),
  employmentStatus: z.enum(['', 'probational', 'regular', 'no-change']).optional(),
  contactNumber: contactNumberSchema,
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 250),
      'Address must be between 10-250 characters if provided'
    ),
  tin: tinSchema,
  sss: sssSchema,
  pagibig: pagibigSchema,
});
