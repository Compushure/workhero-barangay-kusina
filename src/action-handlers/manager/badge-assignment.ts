import { toast } from 'sonner';
import { safeAction } from '@/lib/utils/safe-action';
import type { ServerActionResponse } from '@/types';
import type { BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';
import {
  assignManualBadgeToUser,
  fetchAllBadges,
  fetchBadgeAssignmentUsers,
  fetchBadgeAwardDebugEntries,
  fetchManualBadges,
  removeBadgeAward,
} from '@/actions/manager/badge-assignment';
import type { BadgeAwardDebugEntry } from '@/types/manager/badge-assignment';

export async function handleFetchManualBadges(): Promise<BadgeSummary[]> {
  const result = await safeAction<ServerActionResponse<BadgeSummary[]>>(() => fetchManualBadges());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleFetchAllBadges(): Promise<BadgeSummary[]> {
  const result = await safeAction<ServerActionResponse<BadgeSummary[]>>(() => fetchAllBadges());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleFetchBadgeAssignmentUsers(): Promise<BadgeAssignmentUser[]> {
  const result = await safeAction<ServerActionResponse<BadgeAssignmentUser[]>>(() =>
    fetchBadgeAssignmentUsers()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleAssignManualBadgeToUser(
  badgeId: string,
  userId: string
): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() =>
    assignManualBadgeToUser(badgeId, userId)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Badge awarded');
  return true;
}

export async function handleFetchBadgeAwardDebugEntries(): Promise<BadgeAwardDebugEntry[]> {
  const result = await safeAction<ServerActionResponse<BadgeAwardDebugEntry[]>>(() =>
    fetchBadgeAwardDebugEntries()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleRemoveBadgeAward(awardId: string): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() =>
    removeBadgeAward(awardId)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Badge removed');
  return true;
}
