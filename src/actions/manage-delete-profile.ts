'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';

/**
 * Delete Profile Picture
 * ======================
 * Removes user's profile picture from Supabase storage
 */
export async function deleteProfilePicture(
  userId: string
): Promise<ServerActionResponse> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from('employees')
    .remove([`${userId}/profile.png`]);

  if (error) {
    return { error: 'Failed to delete profile picture: ' + error.message };
  }
  
  return { error: null, data: data };
}
