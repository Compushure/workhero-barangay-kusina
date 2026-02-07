/**
 * HR Reward Management Action Handlers
 * ====================================
 * Client-side wrappers for HR reward CRUD operations.
 * Handles UI feedback (toasts) and state management.
 */

import {
  addRewardAction,
  editRewardAction,
  deleteRewardAction,
  hideRewardAction,
  uploadRewardPicture,
} from '@/actions/hr/rewards';
import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import { AddRewardInput, EditRewardInput, Reward } from '@/types';

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

// Action handler to hide/unhide a reward/mercado item
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

export async function handleUploadRewardPicture(
  rewardId: string,
  file: File,
  rewardName?: string
): Promise<string | null> {
  const result = await safeAction(() => uploadRewardPicture(rewardId, file));

  if (!result.success) {
    toast.error(`Failed to update ${rewardName ?? 'item'} picture: ${result.error}`);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success(`Successfully updated ${rewardName ?? 'item'} picture`);
  return (result.data?.data as { publicUrl?: string })?.publicUrl ?? null;
}
