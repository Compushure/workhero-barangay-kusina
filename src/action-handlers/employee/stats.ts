/**
 * Employee Stats Action Handlers
 * ==============================
 * Client-side wrappers for employee stat fetching actions.
 * These actions already use safeAction internally, so handlers
 * primarily add UI feedback (toasts) when needed.
 */

import {
  getEmployeeLevel,
  getEmployeePoints,
  getEmployeeRank,
  getEmployeeXP,
  type EmployeePointsData,
} from '@/actions/employee/stats';
import { toast } from 'sonner';
import type { EmployeeRank, EmployeeXP } from '@/types';
import type { TimePeriod } from '@/lib/utils/time-period-utils';

/**
 * Fetches the current employee's level
 * @returns Promise with level or null on error
 */
export async function handleFetchEmployeeLevel(): Promise<number | null> {
  const result = await getEmployeeLevel();
  
  if (!result.success) {
    toast.error('Failed to load level data');
    return null;
  }
  
  return result.data;
}

/**
 * Fetches the current employee's points and deducted points
 * @returns Promise with points data or null on error
 */
export async function handleFetchEmployeePoints(): Promise<EmployeePointsData | null> {
  const result = await getEmployeePoints();
  
  if (!result.success) {
    toast.error('Failed to load points data');
    return null;
  }
  
  return result.data;
}

/**
 * Fetches the current employee's rank among all employees
 * @param period - Time period filter (current/weekly/monthly/yearly)
 * @returns Promise with rank data or null on error
 */
export async function handleFetchEmployeeRank(
  period: TimePeriod | 'current' = 'current'
): Promise<EmployeeRank | null> {
  const result = await getEmployeeRank(period);
  
  if (!result.success) {
    toast.error('Failed to load rank data');
    return null;
  }
  
  return result.data;
}

/**
 * Fetches the current employee's XP
 * @returns Promise with XP data or null on error
 */
export async function handleFetchEmployeeXP(): Promise<EmployeeXP | null> {
  const result = await getEmployeeXP();
  
  if (!result.success) {
    toast.error('Failed to load XP data');
    return null;
  }
  
  return result.data;
}
