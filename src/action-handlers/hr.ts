import {
  acceptRedemptionRequestAction,
  declineRedemptionRequestAction,
  addRewardAction,
  editRewardAction,
  deleteRewardAction,
  hideRewardAction
} from '@/actions/hr';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import { AddRewardInput, EditRewardInput, Reward } from '@/types';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

// Action handler to decline a redemption request
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

// Action handler to add a new reward/mercado item
export async function handleAddRewardAction(
  input: AddRewardInput
): Promise<Reward | null> {
  const result = await safeAction(() => addRewardAction(input));
  if (!result.success || result.data?.error) {
    toast.error(`Failed to add item: ${result.error || result.data?.error}`);
    return null;
  }

  toast.success('Item added successfully to Mercado');
  return result.data?.data ?? null;
}

// Action handler to edit an existing reward/mercado item
export async function handleEditRewardAction(
  id: string,
  input: EditRewardInput
): Promise<Reward | null> {
  const result = await safeAction(() => editRewardAction(id, input));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to update item: ${result.error || result.data?.error}`);
    return null;
  }

  toast.success('Item updated successfully');
  return result.data?.data ?? null;
}

// Action handler to delete a reward/mercado item
export async function handleDeleteRewardAction(
  id: string
): Promise<boolean> {
  const result = await safeAction(() => deleteRewardAction(id));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to delete item: ${result.error || result.data?.error}`);
    return false;
  }

  toast.success('Item deleted successfully');
  return true;
}

/**
 * Action handler to hide/unhide a reward/mercado item
 * @param id - The ID of the reward to hide/unhide
 * @param isActive - Whether the item should be active (visible) or hidden
 * @returns true on success, false on error
 */
export async function handleHideRewardAction(
  id: string,
  isActive: boolean = false
): Promise<boolean> {
  const result = await safeAction(() => hideRewardAction(id, isActive));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to ${isActive ? 'unhide' : 'hide'} item: ${result.error || result.data?.error}`);
    return false;
  }

  toast.success(`Item ${isActive ? 'unhidden' : 'hidden'} successfully`);
  return true;
}
