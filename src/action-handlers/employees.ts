'use client';

import { getEmployeeRank } from '@/actions/employee/stats';
import type { EmployeeRank } from '@/types';
import { toast } from 'sonner';

/**
 * Handler for fetching employee rank with error handling
 * Wraps the server action with error handling and toast notifications
 *
 * @returns Promise with employee rank data or null on error
 */
export async function handleFetchEmployeeRank(): Promise<EmployeeRank | null> {
  const result = await getEmployeeRank();

  if (result.error) {
    toast.error('Failed to load rank', {
      description: result.error,
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
