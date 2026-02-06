/**
 * Employee Redemption Action Handlers
 * ===================================
 * Client-side wrappers for employee redemption request creation.
 * Handles UI feedback (toasts) for redemption submissions.
 */

import { createRedemptionRequestAction } from '@/actions/employee/redemptions';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';

// Action handler to create a new redemption request
export async function handleCreateRedemptionRequestAction(
  rewardId: string,
  quantity: number
): Promise<boolean> {
  const result = await safeAction(() => createRedemptionRequestAction(rewardId, quantity));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to create redemption request: ${result.error || result.data?.error}`);
    return false;
  }

  toast.success('Redemption request submitted successfully');
  return true;
}
