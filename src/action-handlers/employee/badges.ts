'use client';

import { toast } from 'sonner';
import type { UserBadge } from '@/actions/employee/badges';
import { fetchUserBadges as fetchUserBadgesAction } from '@/actions/employee/badges';

/**
 * Wraps fetchUserBadges server action with error handling and toast notifications
 */
export async function fetchUserBadgesHandler(
  userId: string
): Promise<UserBadge[] | null> {
  try {
    const result = await fetchUserBadgesAction(userId);

    if (result.error) {
      toast.error(result.error);
      return null;
    }

    return result.data || [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch badges';
    toast.error(message);
    return null;
  }
}
