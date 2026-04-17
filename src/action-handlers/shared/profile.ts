import { toast } from 'sonner';
import { safeAction } from '@/lib/utils/safe-action';
import { fetchUserProfileById, updateOwnProfile, uploadOwnProfilePicture, deleteOwnProfilePicture } from '@/actions/shared/profile';
import type { UserWithExtras } from '@/types';

/**
// MOST OF THIS IS JUST VERIFICATION
 * Fetches user profile with toast notifications
 */
export async function fetchUserProfileByIdHandler(userId: string): Promise<UserWithExtras | null> {
  const result = await safeAction(() => fetchUserProfileById(userId));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to load profile');
    return null;
  }

  return result.data?.data || null;
}

/**
 * Updates user's own profile with toast notifications
 */
export async function updateOwnProfileHandler(profileData: {
  name?: string;
  contactNumber?: string;
  address?: string;
}) {
  const result = await safeAction(() => updateOwnProfile(profileData));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to update profile');
    return null;
  }

  toast.success('Profile updated successfully');
  return result.data;
}

/**
 * Uploads profile picture with toast notifications
 */
export async function uploadOwnProfilePictureHandler(file: File) {
  const result = await safeAction(() => uploadOwnProfilePicture(file));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to upload profile picture');
    return null;
  }

  toast.success('Profile picture uploaded successfully');
  return result.data;
}

/**
 * Deletes profile picture with toast notifications
 */
export async function deleteOwnProfilePictureHandler() {
  const result = await safeAction(() => deleteOwnProfilePicture());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to remove profile picture');
    return false;
  }

  toast.success('Profile picture removed successfully');
  return true;
}
