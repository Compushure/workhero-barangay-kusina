import { acceptRedemptionRequestAction, declineRedemptionRequestAction } from '@/actions/hr';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

//hr action-handlers
export async function handleDeclineRedemptionRequestAction(
  params: RedemptionRequestParams
): Promise<{ error: string | null }> {
  const result = await safeAction(() =>
    declineRedemptionRequestAction(params.id, params.remarks)
  );

  if (!result.success) {
    toast.error(`Failed to decline redemption request: ` + result.error);
    return { error: result.error };
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

  if (!result.success) {
    toast.error(`Failed to accept redemption request: ` + result.error);
    return { error: result.error };
  }

  toast.success(
    params.remarks
      ? `Redemption request accepted with remarks.`
      : `Redemption request has been accepted.`
  );

  return { error: null };
}
