import { toast } from 'sonner';
import { safeAction } from '@/lib/utils/safe-action';
import { deleteProfilePicture } from '@/actions/manage-delete-profile';

/**
 * Handle Delete Profile Picture
 * ==============================
 * Client-side handler with toast notifications
 */
export async function handleDeleteProfilePicture(
  userId: string,
  userName: string
): Promise<boolean> {
  const result = await safeAction(() => deleteProfilePicture(userId));

  if (!result.success) {
    toast.error(`Failed to remove ${userName}'s profile picture: ` + result.error);
    return false;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return false;
  }

  toast.success(`Successfully removed ${userName}'s profile picture`);
  return true;
}
