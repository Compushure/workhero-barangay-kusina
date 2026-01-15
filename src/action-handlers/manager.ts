/**
 * Manager Task Action Handlers (Client-side)
 * ============================================
 * Client-side wrappers for manager task server actions.
 * Handles UI feedback (toasts) and state management integration.
 * Uses safeAction wrapper for consistent error handling.
 */

import { safeAction } from '@/lib/utils/safe-action';
import { fetchTasksToReview, approveTaskAction, rejectTaskAction } from '@/actions/manager';
import type { VerificationRequest } from '@/types/manager-verification-req';
import { toast } from 'sonner';

/**
 * Fetches all tasks pending review with error handling and toast feedback
 * @returns Array of verification requests or empty array on error
 */
export async function handleFetchTasksToReview(): Promise<VerificationRequest[]> {
  const result = await safeAction(() => fetchTasksToReview());

  if (!result.success) {
    toast.error('Failed to load tasks: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
}

/**
 * Approves a task with toast feedback
 * @param id - Task ID to approve
 * @returns Approved task or null on error
 */
export async function handleApproveTask(id: string): Promise<VerificationRequest | null> {
  const result = await safeAction(() => approveTaskAction(id));

  if (!result.success) {
    toast.error('Failed to approve task: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Task approved successfully');
  return result.data?.data ?? null;
}

/**
 * Rejects a task with toast feedback
 * @param id - Task ID to reject
 * @returns Rejected task or null on error
 */
export async function handleRejectTask(id: string): Promise<VerificationRequest | null> {
  const result = await safeAction(() => rejectTaskAction(id));

  if (!result.success) {
    toast.error('Failed to reject task: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Task rejected successfully');
  return result.data?.data ?? null;
}
