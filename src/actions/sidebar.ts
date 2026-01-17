'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, UserWithExtras } from '@/types';

/**
 * Fetches the current logged-in user's information including profile data
 * Used by the ProfilePic component to display user avatar and navigate
 */
export async function fetchInSessionUserInfo(): Promise<ServerActionResponse<UserWithExtras>> {
  try {
    const supabase = await createClient();

    // Get the authenticated user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return {
        error: 'No active session found',
        data: undefined,
      };
    }

    const userId = sessionData.session.user.id;
    console.log('Fetching info for user ID:', userId);

    // Fetch user details from the public_users table or users table
    const { data: userData, error: userError } = await supabase
      .from('user_attributes')
      .select('user_id, user_name, user_email, role_type, user_date_added')
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      return {
        error:
          'Failed to fetch user information' + (userError.message ? `: ${userError.message}` : ''),
        data: undefined,
      };
    }

    // Construct profile picture URL from storage
    const { data: storageData } = supabase.storage
      .from('employees')
      .getPublicUrl(`${userId}/profile.png`);

    const profilePictureUrl = storageData?.publicUrl || '';

    const userWithExtras: UserWithExtras = {
      id: userData.user_id,
      name: userData.user_name || 'Unknown User',
      email: userData.user_email || '',
      employeeType: userData.role_type || 'regular',
      date_added: new Date(userData.user_date_added),
      profilePictureUrl: profilePictureUrl,
    };

    return {
      error: null,
      data: userWithExtras,
    };
  } catch (error) {
    console.error('Error fetching in-session user:', error);
    return {
      error: 'An unexpected error occurred',
      data: undefined,
    };
  }
}
