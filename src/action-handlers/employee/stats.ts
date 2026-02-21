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
} from '@/actions/employee/stats';
import { toast } from 'sonner';
import type { EmployeeRank, EmployeeXP, EmployeePointsData } from '@/types';

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
  
  if (result.error) {
    toast.error('Failed to load points', {
      description: result.error,
    });
    return null;
  }

  if (!result.data) {
    toast.error('Failed to load points', {
      description: 'No points data available',
    });
    return null;
  }

  return result.data;
}

/**
 * Fetches the current employee's rank among all employees
 * @returns Promise with rank data or null on error
 */
export async function handleFetchEmployeeRank(): Promise<EmployeeRank | null> {
  const result = await getEmployeeRank();

  if (!result.success) {
    toast.error('Failed to load rank', {
      description: result.error ?? 'Unknown error',
    });
    return null;
  }

  if (!result.data) {
    toast.error('Failed to load rank', {
      description: 'No rank data available',
    });
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
    toast.error('Failed to load XP', {
      description: result.error ?? 'Unknown error',
    });
    return null;
  }

  if (!result.data) {
    toast.error('No XP data available');
    return null;
  }

  return result.data;
}
