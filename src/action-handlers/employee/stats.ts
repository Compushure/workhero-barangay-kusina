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
  getEmployeeTopWeeklyRanks,
  getEmployeeXP,
} from '@/actions/employee/stats';
import { toast } from 'sonner';
import type { EmployeePointsData, EmployeeRank, EmployeeTopRankEntry, EmployeeXP } from '@/types';
// import type { TimePeriod } from '@/lib/utils/time-period-utils';

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

  if (!result.data) {
    toast.error('Failed to load level data', {
      description: 'No rank data available',
    });
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
 * Fetches the latest weekly employee rank
 * Ranking updates automatically once per week via scheduler.
 */
export async function handleFetchEmployeeRank(): Promise<EmployeeRank | null> {
  const result = await getEmployeeRank();

  if (!result.success) {
    toast.error('Failed to load weekly rank', {
      description: result.error ?? 'Unknown error',
    });
    return null;
  }

  if (!result.data) {
    toast.error('No weekly rank available');
    return null;
  }

  return result.data;
}

/**
 * Fetches the top 10 weekly rankings for the latest visible period.
 * Returns null on failure or when no ranking exists (no toast for empty data).
 */
export async function handleFetchEmployeeTopWeeklyRanks(): Promise<
  EmployeeTopRankEntry[] | null
> {
  const result = await getEmployeeTopWeeklyRanks();

  if (!result.success) {
    toast.error('Failed to load top rankings', {
      description: result.error ?? 'Unknown error',
    });
    return null;
  }

  return result.data ?? null;
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
