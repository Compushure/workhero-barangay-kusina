import { acceptRedemptionRequestAction, declineRedemptionRequestAction } from '@/actions/hr';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';

//hr action-handlers
export async function handleDeclineRedemptionRequestAction(
  requestId: string
): Promise<{ error: string | null }> {
  const result = await safeAction(() => declineRedemptionRequestAction(requestId));

  if (!result.success) {
    toast.error(`Failed to decline redemption request ${requestId}: ` + result.error);
    return { error: result.error };
  }

  toast.success(`Redemption request ${requestId} has been declined.`);

  return { error: null };
}

export async function handleAcceptRedemptionRequestAction(
  requestId: string
): Promise<{ error: string | null }> {
  const result = await safeAction(() => acceptRedemptionRequestAction(requestId));

  if (!result.success) {
    toast.error(`Failed to accept redemption request ${requestId}: ` + result.error);
    return { error: result.error };
  }

  toast.success(`Redemption request ${requestId} has been accepted.`);

  return { error: null };
}
