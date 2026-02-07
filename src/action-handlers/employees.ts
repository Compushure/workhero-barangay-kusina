'use client';

<<<<<<< HEAD
import { getEmployeeRank } from '@/actions/employees/get-rank';
import { getEmployeeXP } from '@/actions/employees/get-xp';
import { getEmployeePoints } from '@/actions/employees/get-points';
import type { EmployeePointsData, EmployeeRank, EmployeeXP } from '@/types';
=======
import { getEmployeeRank } from '@/actions/employee/stats';
import type { EmployeeRank } from '@/types';
>>>>>>> 38c64158741778bd2e508317d1c1b2066239dfbb
import { toast } from 'sonner';


/**
 * Handler for fetching employee rank with error handling
 * Wraps the server action with error handling and toast notifications
 *
 * @returns Promise with employee rank data or null on error
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