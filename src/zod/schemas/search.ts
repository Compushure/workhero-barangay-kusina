/**
 * Zod Schemas - Search & Filter
 * ==============================
 * Validation schemas for search, filter, and pagination parameters.
 */

import { z } from 'zod';
import { EmployeeType, EmploymentStatus } from '@/types';

/**
 * Schema for user search and filter query parameters
 * Validates filter requests from the frontend
 */
export const userSearchFilterSchema = z.object({
  searchQuery: z
    .string()
    .max(100, 'Search query cannot exceed 100 characters')
    .optional()
    .default(''),
  searchType: z.enum(['name', 'employee_id']).optional().default('name'),
  employeeTypeFilter: z.enum(['all', 'manager', 'hr', 'regular']).optional().default('all'),
  employmentStatusFilter: z.enum(['all', 'probationary', 'regular']).optional().default('all'),
  sortBy: z
    .enum(['name-asc', 'name-desc', 'date-asc', 'date-desc'])
    .optional()
    .default('date-desc'),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(25),
});

export type UserSearchFilterInput = z.infer<typeof userSearchFilterSchema>;
