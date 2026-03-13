/**
 * HR Redemption Processing Action Handlers
 * Client-side wrappers for HR redemption request processing.
 * Handles UI feedback (toasts) for approve/decline actions.
 */

import {
  acceptRedemptionRequestAction,
  getRedemptionRequestsAction,
  declineRedemptionRequestAction,
} from '@/actions/hr/redemptions';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import type { RedemptionRequest } from '@/types';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

export async function handleGetRedemptionRequestsAction(
  status?: string
): Promise<RedemptionRequest[]> {
  const result = await safeAction(() => getRedemptionRequestsAction(status));

  if (!result.success || result.data?.error) {
    throw new Error(result.error || result.data?.error || 'Failed to fetch redemption requests');
  }

  return result.data?.data ?? [];
}

// Action handler to decline a redemption request
export async function handleDeclineRedemptionRequestAction(
  params: RedemptionRequestParams
): Promise<{ error: string | null }> {
  const result = await safeAction(() =>
    declineRedemptionRequestAction(params.id, params.remarks)
  );

  if (!result.success || result.data?.error) {
    toast.error(`Failed to decline redemption request: ${result.error || result.data?.error}`);
    return { error: result.error || result.data?.error || 'Unknown error' };
  }

  toast.success(
    params.remarks
      ? `Redemption request declined with remarks.`
      : `Redemption request has been declined.`
  );

  return { error: null };
}

export async function handleAcceptRedemptionRequestAction(
  params: RedemptionRequestParams
): Promise<{ error: string | null }> {
  const result = await safeAction(() =>
    acceptRedemptionRequestAction(params.id, params.remarks)
  );

  if (!result.success || result.data?.error) {
    toast.error(`Failed to accept redemption request: ${result.error || result.data?.error}`);
    return { error: result.error || result.data?.error || 'Unknown error' };
  }

  toast.success(
    params.remarks
      ? `Redemption request accepted with remarks.`
      : `Redemption request has been accepted.`
  );

  return { error: null };
}
