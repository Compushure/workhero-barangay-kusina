/**
 * Employee Stats Action Handlers
 * ==============================
 * Client-side wrappers for employee stat fetching actions.
 * These actions already use safeAction internally, so handlers
 * primarily add UI feedback (toasts) when needed.
 * 
// MOST OF THIS IS JUST VERIFICATION
 */

import {
  getEmployeeLevel,
  getEmployeePoints,
  getEmployeeRank,
  getEmployeeTopRanksByPeriod,
  getEmployeeTopWeeklyRanks,
  getEmployeeXP,
  getXPRequiredForNextLevel,
  getAllLevelMetadata,
  adjustActiveUserXPByDelta,
  type LevelMetadata,
  type XPDebugUpdateResult,
} from '@/actions/employee/stats';
import { toast } from 'sonner';
import type {
  EmployeePointsData,
  EmployeeRank,
  EmployeeTopRankEntry,
  EmployeeXP,
  RankLogPeriodType,
} from '@/types';

export type { LevelMetadata, XPDebugUpdateResult };
// import type { TimePeriod } from '@/lib/utils/time-period-utils';

export interface EmployeePeriodParams {
  periodType: RankLogPeriodType;
  year: number;
  month?: number;
  week?: number;
}

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
 * Fetches top 10 weekly rankings for the latest visible period.
 */
export async function handleFetchEmployeeTopWeeklyRanks(): Promise<
  EmployeeTopRankEntry[] | null
> {
  const result = await getEmployeeTopWeeklyRanks();

  if (!result.success) {
    toast.error('Failed to load top weekly ranks', {
      description: result.error ?? 'Unknown error',
    });
    return null;
  }

  return result.data ?? null;
}

/**
 * Fetches top 10 rankings for a specific period (weekly, monthly, yearly).
 */
export async function handleFetchEmployeeTopRanksByPeriod(
  params: EmployeePeriodParams
): Promise<EmployeeTopRankEntry[] | null> {
  const result = await getEmployeeTopRanksByPeriod(
    params.periodType,
    params.year,
    params.month,
    params.week
  );

  if (!result.success) {
    toast.error('Failed to load rankings for selected period', {
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

/**
 * Fetches the XP required to reach the next level
 * @param currentLevel Current user level
 * @returns XP required for next level, or null on error
 */
export async function handleFetchXPRequiredForNextLevel(currentLevel: number): Promise<number | null> {
  const result = await getXPRequiredForNextLevel(currentLevel);

  if (!result.success) {
    // Silent fail for this one since it's not critical UI feedback
    return null;
  }

  return result.data ?? 100; // Default to 100 if not found
}

/**
 * Fetches all level metadata
 * @returns Array of level metadata, or null on error
 */
export async function handleFetchAllLevelMetadata(): Promise<LevelMetadata[] | null> {
  const result = await getAllLevelMetadata();

  if (!result.success) {
    // Silent fail - will use defaults
    return null;
  }

  return result.data ?? null;
}

/**
 * Debug-only handler to adjust active user's XP by delta.
 */
export async function handleAdjustActiveUserXPByDelta(
  delta: number
): Promise<XPDebugUpdateResult | null> {
  const result = await adjustActiveUserXPByDelta(delta);

  if (!result.success) {
    toast.error('Failed to update XP', {
      description: result.error ?? 'Unknown error',
    });
    return null;
  }

  return result.data ?? null;
}
