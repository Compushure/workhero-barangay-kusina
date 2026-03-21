'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, UserWithExtras } from '@/types';

/**
 * Fetches user profile information by user ID from user_attributes view
 * Used by the full profile page to display comprehensive user data
 */
export async function fetchUserProfileById(
  userId: string
): Promise<ServerActionResponse<UserWithExtras>> {
  try {
    const supabase = await createClient();

    // Fetch user details from the user_attributes view
    const { data: userData, error: userError } = await supabase
      .from('user_attributes')
      .select(
        `
        user_id,
        user_name,
        user_email,
        role_type,
        user_date_added,
        employee_id,
        employment_status,
        contact_details,
        home_address,
        tin_id,
        sss_id,
        pagibig_id,
        xp,
        user_level,
        points,
        deducted_points,
        is_tenured,
        total_xp,
        performance_score
      `
      )
      .eq('user_id', userId)
      .single();

    if (userError || !userData) {
      return {
        error:
          'Failed to fetch user profile' +
          (userError?.message ? `: ${userError.message}` : ''),
        data: undefined,
      };
    }

    // Fetch attendance totals from dedicated view
    const { data: attendanceData } = await supabase
      .from('total_attendance_stats_view')
      .select('total_absences, total_lates, total_undertimes, total_overtimes')
      .eq('employee_id', userId)
      .maybeSingle();

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
      xp: userData.xp ?? undefined,
      user_level: userData.user_level ?? undefined,
      points: userData.points ?? undefined,
      deducted_points: userData.deducted_points ?? undefined,
      is_tenured: userData.is_tenured ?? undefined,
      total_xp: userData.total_xp ?? undefined,
      performance_score: userData.performance_score ?? undefined,
      total_absences: attendanceData?.total_absences ?? undefined,
      total_lates: attendanceData?.total_lates ?? undefined,
      total_undertimes: attendanceData?.total_undertimes ?? undefined,
      total_overtimes: attendanceData?.total_overtimes ?? undefined,
    };

    return {
      error: null,
      data: userWithExtras,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      error: 'An unexpected error occurred while fetching profile',
      data: undefined,
    };
  }
}

/**
 * Updates current user's profile information
 * Reuses editUserAction from manage.ts but restricted to current user
 */
export async function updateOwnProfile(
  profileData: {
    name?: string;
    contactNumber?: string;
    address?: string;
  }
): Promise<ServerActionResponse> {
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

    // Build update params (only allow name, contact, and address updates)
    const params = {
      p_user_id: userId,
      p_new_name: profileData.name || '',
      p_role_type: '', // Don't allow role change from self-service
      p_employment_status: '', // Don't allow employment status change from self-service
      p_contact_details: profileData.contactNumber || '',
      p_home_address: profileData.address || '',
      p_tin_id: '', // Don't allow government ID changes from self-service
      p_sss_id: '',
      p_pagibig_id: '',
    };

    const { data, error } = await supabase.rpc('rpc_update_user_name_and_assign_role', {
      ...params,
    });

    if (error) {
      return { error: 'Failed to update profile: ' + error.message };
    }

    return { error: null, data: data };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      error: 'An unexpected error occurred while updating profile',
      data: undefined,
    };
  }
}

/**
 * Uploads profile picture for current user
 * Reuses uploadProfilePicture from manage.ts
 */
export async function uploadOwnProfilePicture(
  file: File
): Promise<ServerActionResponse> {
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

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('employees')
      .upload(`${userId}/profile.png`, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: (file as any)?.type || 'image/png',
      });

    if (error) {
      return { error: 'Failed to upload profile picture: ' + error.message };
    }

    return { error: null, data: data };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return {
      error: 'An unexpected error occurred while uploading profile picture',
      data: undefined,
    };
  }
}

/**
 * Deletes profile picture for current user
 */
export async function deleteOwnProfilePicture(): Promise<ServerActionResponse> {
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

    // Delete from storage
    const { data, error } = await supabase.storage
      .from('employees')
      .remove([`${userId}/profile.png`]);

    if (error) {
      return { error: 'Failed to delete profile picture: ' + error.message };
    }

    return { error: null, data: data };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return {
      error: 'An unexpected error occurred while deleting profile picture',
      data: undefined,
    };
  }
}
