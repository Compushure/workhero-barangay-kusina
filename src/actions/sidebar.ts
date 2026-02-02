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

    // Fetch user details from the user_attributes view
    // View definition includes: user_id, user_name, user_email, role_type, user_date_added,
    // employee_id, employment_status, contact_details, home_address, tin_id, sss_id, pagibig_id, etc.
    const { data: userData, error: userError } = await supabase
      .from('user_attributes')
      .select(
        'user_id, user_name, user_email, role_type, user_date_added, employee_id, employment_status, contact_details, home_address, tin_id, sss_id, pagibig_id'
      )
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
      employeeId: userData.employee_id || undefined,
      employmentStatus: userData.employment_status || undefined,
      contactNumber: userData.contact_details || undefined,
      address: userData.home_address || undefined,
      tin: userData.tin_id || undefined,
      sss: userData.sss_id || undefined,
      pagibig: userData.pagibig_id || undefined,
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
