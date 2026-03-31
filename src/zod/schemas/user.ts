/**
 * Zod Schemas - User Management
 * ==============================
{imported module ./nodemodules/zod/v4/classic/external.js}.z.string(...).trim(...).optional(...).refine(...).max is not a function * Validation schemas for user-related forms and inputs.
 */

import { z } from 'zod';
import { EmployeeType } from '@/types';

const NAME_MIN = 1;
const NAME_MAX = 255;

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
 * Philippine mobile number validation (optional - for edit)
 * Format: 11 digits starting with 09 (e.g., 09123456789)
 */
const contactNumberSchemaOptional = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^09\d{9}$/.test(val.replace(/[^\d]/g, '')),
    'Contact number must be 11 digits starting with 09'
  );

/**
 * Philippine mobile number validation (required - for add)
 * Format: 11 digits starting with 09 (e.g., 09XX-XXX-XXXX)
 */
const contactNumberSchemaRequired = z
  .string()
  .min(1, 'Contact number is required')
  .refine(
    (val) => /^09\d{9}$/.test(val.replace(/[^\d]/g, '')),
    'Contact number must be 11 digits starting with 09 (format: 09XX-XXX-XXXX)'
  );

const addressSchemaOptional = z
  .string()
  .trim()
  .optional()
  // no upper limit due to the possibility of addresses have long names
  .refine(
    (val) => !val || val.length >= 1,
    'Address must be at least 1 character if provided'
  );

/**
 * Schema for adding a new user
 */
export const addUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN, 'Name is required')
    .max(NAME_MAX, 'Name must not exceed 255 characters'),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  employmentStatus: z.enum(['', 'probational', 'regular']).default(''),
  employeeType: EmployeeType,
  companyId: z.string().optional(),
  employeeId: z.string().optional(),
  contactNumber: contactNumberSchemaRequired,
  address: addressSchemaOptional,
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
    .trim()
    .max(NAME_MAX, 'Name must not exceed 255 characters if provided')
    .optional()
    .refine(
      (val) => val === undefined || val.length === 0 || val.length >= NAME_MIN,
      'Name must be at least 1 character if provided'
    ),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, 'Password must be 6+ chars'),
  employeeType: z.enum(['superadmin', 'manager', 'hr', 'regular', 'no-change', '']).optional(),
  employmentStatus: z.enum(['', 'probational', 'regular', 'no-change']).optional(),
  contactNumber: contactNumberSchemaOptional,
  address: addressSchemaOptional,
  tin: tinSchema,
  sss: sssSchema,
  pagibig: pagibigSchema,
});
