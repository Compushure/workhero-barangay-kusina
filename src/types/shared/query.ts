/**
 * Shared Query Parameter Types
 * =============================
 * Types for filtering, searching, and pagination
 */

import { z } from 'zod';
import type { EmployeeTypeValue, EmploymentStatusValue } from './auth';

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

/**
 * Type for user search filter input
 * Inferred from userSearchFilterSchema in @/zod/schemas
 */
export type UserSearchFilterInput = z.infer<
  typeof import('@/zod/schemas/search').userSearchFilterSchema
>;
