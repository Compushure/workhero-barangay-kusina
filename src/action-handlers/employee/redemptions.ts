
/**
 * Employee Redemption Action Handlers
 * Client-side wrappers for employee redemption request creation.
 * Handles UI feedback (toasts) for redemption submissions.
 */


import {
  cancelMyRedemptionRequestAction,
  createRedemptionRequestAction,
  getMyRedemptionRequestsAction,
} from '@/actions/employee/redemptions';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import type { RedemptionRequest } from '@/types';

const TOAST_MESSAGES = {
  itemRequested: 'Item Requested',
  itemRequestCancelled: 'Item request Cancelled',
} as const;

export async function handleGetMyRedemptionRequestsAction(
  status?: string
): Promise<RedemptionRequest[]> {
  //logic for fetch my requests: wrap server action with safe error handling
  const result = await safeAction(() => getMyRedemptionRequestsAction(status));

  if (!result.success || result.data?.error) {
    throw new Error(result.error || result.data?.error || 'Failed to fetch your redemption requests');
  }

  return result.data?.data ?? [];
}

export async function handleCreateRedemptionRequestAction(
  rewardId: string,
  quantity: number
): Promise<boolean> {
  //logic for item request submit: create pending redemption
  const result = await safeAction(() => createRedemptionRequestAction(rewardId, quantity));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to create redemption request: ${result.error || result.data?.error}`);
    return false;
  }

  toast.success(TOAST_MESSAGES.itemRequested);
  return true;
}

export async function handleCancelMyRedemptionRequestAction(requestId: string): Promise<boolean> {
  //logic for cancel request submit: cancel pending redemption
  const result = await safeAction(() => cancelMyRedemptionRequestAction(requestId));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to cancel redemption request: ${result.error || result.data?.error}`);
    return false;
  }

  toast.success(TOAST_MESSAGES.itemRequestCancelled);
  return true;
}
