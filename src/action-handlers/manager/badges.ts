
// MOST OF THIS IS JUST VERIFICATION

import { toast } from 'sonner';
import { safeAction } from '@/lib/utils/safe-action';
import type { ServerActionResponse } from '@/types';
import type { Badge, BadgeOption } from '@/types/manager/badge-editor';
import {
  addBadge,
  deleteBadge,
  deleteBadgeImage,
  editBadge,
  fetchBadgeAttendanceOptions,
  fetchBadgeAttributeOptions,
  fetchBadgeTaskOptions,
  fetchBadges,
  uploadBadgeImage,
} from '@/actions/manager/badges';
import type { AddBadgeInput, EditBadgeInput } from '@/zod/schemas/badge';

export async function handleFetchBadges(): Promise<Badge[]> {
  const result = await safeAction<ServerActionResponse<Badge[]>>(() => fetchBadges());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleFetchBadgeTaskOptions(): Promise<BadgeOption[]> {
  const result = await safeAction<ServerActionResponse<BadgeOption[]>>(() => fetchBadgeTaskOptions());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleFetchBadgeAttributeOptions(): Promise<BadgeOption[]> {
  const result = await safeAction<ServerActionResponse<BadgeOption[]>>(() =>
    fetchBadgeAttributeOptions()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleFetchBadgeAttendanceOptions(): Promise<BadgeOption[]> {
  const result = await safeAction<ServerActionResponse<BadgeOption[]>>(() =>
    fetchBadgeAttendanceOptions()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }

  return result.data?.data ?? [];
}

export async function handleAddBadge(input: AddBadgeInput): Promise<Badge | null> {
  const result = await safeAction<ServerActionResponse<Badge>>(() => addBadge(input));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return null;
  }

  toast.success('Badge added successfully');
  return result.data?.data ?? null;
}

export async function handleEditBadge(
  id: string,
  input: EditBadgeInput,
  options?: { suppressToast?: boolean }
): Promise<Badge | null> {
  const result = await safeAction<ServerActionResponse<Badge>>(() => editBadge(id, input));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return null;
  }

  if (!options?.suppressToast) {
    toast.success('Badge updated successfully');
  }
  return result.data?.data ?? null;
}

export async function handleDeleteBadge(id: string): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() => deleteBadge(id));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Badge deleted successfully');
  return true;
}

export async function handleUploadBadgeImage(
  badgeId: string,
  file: File
): Promise<string | null> {
  const result = await safeAction<ServerActionResponse<{ path: string | null; publicUrl: string }>>(
    () => uploadBadgeImage(badgeId, file)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return null;
  }

  toast.success('Badge image uploaded successfully');
  return result.data?.data?.publicUrl ?? null;
}

export async function handleDeleteBadgeImage(badgeId: string): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<void>>(() => deleteBadgeImage(badgeId));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Badge image removed');
  return true;
}
