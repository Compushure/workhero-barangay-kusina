'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getPostLoginPath, sendWelcomeEmail } from '@/lib/smtp/welcome-email';
import {
  buildExistingEmailMessage,
  findExistingUserEmail,
  normalizeUserEmail,
} from '@/lib/users/email-availability';
import { createClient } from '@/lib/supabase/server';
import type {
  ServerActionResponse,
  User,
  AddUserInput,
  EditUserInput,
  UserQueryParams,
  PaginatedResponse,
} from '@/types';
import { addUserSchema, editUserSchema } from '@/zod/schemas';
import { normalizeSearchQuery, sanitizeSearchInput } from '@/lib/utils/search-normalization';

// ============================================
// Route helpers
// ============================================
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3008';

// Helper function to get public URL with cache busting
function getProfileImageUrl(supabase: any, userId: string): string {
  const baseUrl = supabase.storage.from('employees').getPublicUrl(`${userId}/profile.png`)
    .data.publicUrl;
  // Add cache-busting query parameter to force fresh image on every fetch
  return `${baseUrl}?t=${Date.now()}`;
}

// ============================================
// Route helpers
// ============================================

async function changeuserPassword(userId: string, newPassword: string) {
  // const { role } = await getUserRole()
  // if (!role) {
  //   return {
  //     error: 'Failed to change password: No user role found',
  //   }
  // }
  // if (role.trim() != 'superadmin') {
  //   return {
  //     error: `Failed to change password: Unauthorized User Role (${role.trim()})`,
  //   }
  // }

  // add this to env variables soon
  const res = await fetch(`${baseUrl}/admin/tools/changepw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      new_password: newPassword,
    }),
  });

  const { error } = await res.json();

  if (error) {
    return { error: 'Failed to change password: ' + error };
  }
  return { error: null };
}

function buildQueryParams(params: UserQueryParams): string {
  const searchParams = new URLSearchParams();

  // sort mapping
  let type = 'dateadded';
  let order = 'desc';
  switch (params.sortBy) {
    case 'name-asc':
      type = 'name';
      order = 'asc';
      break;
    case 'name-desc':
      type = 'name';
      order = 'desc';
      break;
    case 'date-asc':
      type = 'dateadded';
      order = 'asc';
      break;
    case 'date-desc':
      type = 'dateadded';
      order = 'desc';
      break;
  }
  searchParams.set('type', type);
  searchParams.set('order', order);

  // search
  const sanitizedSearch = sanitizeSearchInput(params.searchQuery ?? '');
  const normalizedSearch = normalizeSearchQuery(sanitizedSearch);
  if (normalizedSearch) {
    searchParams.set('query', normalizedSearch);
    searchParams.set('queryby', params.searchType ?? 'name');
  }

  // filters
  searchParams.set('employeeType', params.employeeTypeFilter?.toLowerCase() ?? 'all');
  searchParams.set('employmentStatus', params.employmentStatusFilter?.toLowerCase() ?? 'all');

  // pagination
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('pageSize', String(params.pageSize ?? 10));

  return searchParams.toString();
}

type EmailAvailabilityCheck = {
  available: boolean;
  normalizedEmail: string;
  message?: string;
};

async function createFirstLoginMagicLink(
  email: string,
  employeeType: AddUserInput['employeeType']
) {
  const nextPath = getPostLoginPath(employeeType);
  const redirectTo = new URL(nextPath, baseUrl).toString();
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo,
    },
  });

  if (error || !data?.properties?.hashed_token) {
    throw new Error(error?.message || 'Failed to generate the first login magic link');
  }

  const confirmUrl = new URL('/auth/confirm', baseUrl);
  confirmUrl.searchParams.set('token_hash', data.properties.hashed_token);
  confirmUrl.searchParams.set('type', data.properties.verification_type);
  confirmUrl.searchParams.set('next', nextPath);

  return confirmUrl.toString();
}

export async function checkUserEmailAvailabilityAction(
  email: string
): Promise<ServerActionResponse<EmailAvailabilityCheck>> {
  const normalizedEmail = normalizeUserEmail(email);
  const parsedEmail = addUserSchema.shape.email.safeParse(normalizedEmail);

  if (!parsedEmail.success) {
    return {
      error: null,
      data: {
        available: false,
        normalizedEmail,
        message: parsedEmail.error.issues[0]?.message || 'Invalid email address',
      },
    };
  }

  try {
    const existingEmail = await findExistingUserEmail(parsedEmail.data);

    if (existingEmail.exists) {
      return {
        error: null,
        data: {
          available: false,
          normalizedEmail: existingEmail.normalizedEmail,
          message: buildExistingEmailMessage(existingEmail.normalizedEmail),
        },
      };
    }

    return {
      error: null,
      data: {
        available: true,
        normalizedEmail: parsedEmail.data,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to verify email availability',
    };
  }
}

// ============================================
// User Management Actions
// ============================================

export async function fetchUsersAction(params: UserQueryParams = {}): Promise<User[]> {
  const qs = buildQueryParams(params);
  const res = await fetch(`${baseUrl}/admin/tools/filter?${qs}`, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Error fetching users: ${res.statusText}`);
  }

  const data = await res.json();
  return data.users as User[];
}

export async function fetchUsersPaginatedAction(
  params: UserQueryParams = {}
): Promise<ServerActionResponse<PaginatedResponse<User>>> {
  const qs = buildQueryParams(params);

  try {
    const res = await fetch(`${baseUrl}/admin/tools/filter?${qs}`, { method: 'GET' });
    if (!res.ok) {
      return {
        error: `Error fetching users: ${res.statusText}`,
        data: undefined,
      };
    }

    const data = await res.json();
    const users = (data.users ?? []) as User[];
    const fallbackPageSize = params.pageSize ?? 25;
    const totalCount = typeof data.count === 'number' ? data.count : users.length;
    const totalPages =
      typeof data.totalPages === 'number'
        ? data.totalPages
        : Math.max(1, Math.ceil(totalCount / fallbackPageSize));

    return {
      error: null,
      data: {
        data: users,
        count: totalCount,
        totalPages,
      },
    };
  } catch (error) {
    return {
      error: `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: undefined,
    };
  }
}

export async function addUserAction(input: AddUserInput): Promise<ServerActionResponse<User>> {
  // Validate input
  const parsed = addUserSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const {
    name,
    email,
    password,
    employeeType,
    employmentStatus,
    contactNumber,
    address,
    tin,
    sss,
    pagibig,
    employeeId,
  } = parsed.data;
  const normalizedEmail = normalizeUserEmail(email);
  console.log('Adding user:', name, normalizedEmail, employeeType, employmentStatus);

  const existingEmail = await findExistingUserEmail(normalizedEmail);
  if (existingEmail.exists) {
    return {
      error: buildExistingEmailMessage(existingEmail.normalizedEmail),
    };
  }

  const res = await fetch(`${baseUrl}/admin/tools/adduser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: normalizedEmail,
      password: password,
      name: name,
      requested_role: employeeType,
      employee_id: employeeId || '',
      employment_status: employmentStatus || '',
      contact_details: contactNumber || '',
      home_address: address || '',
      tin_id: tin || '',
      sss_id: sss || '',
      pagibig_id: pagibig || '',
    }),
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch (e) {
    return { error: `Failed to create user: Unable to parse response (${res.status})` };
  }

  if (!res.ok) {
    const message = payload?.error || `Failed to create user (status ${res.status})`;
    return { error: message };
  }

  const { error, user, userRow } = payload;

  if (error) {
    return { error: 'Failed to create user: ' + error };
  }

  // user is the auth user (has id, email)
  // userRow is the database row (has all extended fields)
  // Combine them to create complete User object
  const completeUser: User = {
    id: user?.id || userRow?.id,
    name: userRow?.name || user?.user_metadata?.name || user?.email || '',
    email: user?.email || normalizedEmail,
    employeeType,
    date_added: new Date(userRow?.date_added || new Date()),
    createdAt: new Date(userRow?.date_added || new Date()),
    employmentStatus: userRow?.employment_status || '',
    contactNumber: userRow?.contact_details || '',
    address: userRow?.home_address || '',
    employeeId: userRow?.employee_id || '',
    tin: userRow?.tin_id || '',
    sss: userRow?.sss_id || '',
    pagibig: userRow?.pagibig_id || '',
  };

  try {
    const magicLink = await createFirstLoginMagicLink(normalizedEmail, employeeType);

    await sendWelcomeEmail({
      to: normalizedEmail,
      name,
      role: employeeType,
      magicLink,
    });

    return { error: null, data: completeUser };
  } catch (mailError) {
    const mailErrorMessage =
      mailError instanceof Error ? mailError.message : 'Unknown email delivery error';

    console.error('[addUserAction] Failed to send welcome email:', mailError);

    return {
      error: null,
      data: completeUser,
      warning: `User was added, but the welcome email could not be sent: ${mailErrorMessage}`,
    };
  }
}

export async function editUserAction(
  userId: string,
  input: EditUserInput
): Promise<ServerActionResponse<User>> {
  // Validate input
  const supabase = await createClient();

  const parsed = editUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  if (input.employeeType === 'no-change') {
    parsed.data.employeeType = '';
  }
  if (input.employmentStatus === 'no-change') {
    parsed.data.employmentStatus = '';
  }
  if (input.name === '') {
    parsed.data.name = '';
  }

  const {
    name,
    employeeType,
    password,
    employmentStatus,
    contactNumber,
    address,
    tin,
    sss,
    pagibig,
  } = parsed.data;

  // change password if provided
  if (password) {
    const { error: pwError } = await changeuserPassword(userId, password);
    if (pwError) {
      return { error: 'Failed to update user: ' + pwError };
    }
  }

  const params = {
    p_user_id: userId,
    p_new_name: name || '',
    p_role_type: employeeType || '',
    p_employment_status: employmentStatus || '',
    p_contact_details: contactNumber || '',
    p_home_address: address || '',
    p_tin_id: tin || '',
    p_sss_id: sss || '',
    p_pagibig_id: pagibig || '',
  };
  // only call to rpc if there's no password error or change
  const { data, error } = await supabase.rpc('rpc_update_user_name_and_assign_role', {
    ...params,
  });

  if (error) {
    return { error: 'Failed to update user: ' + error.message };
  }

  return { error: null, data: data as User };
}

export async function deleteUserAction(userId: string): Promise<ServerActionResponse> {
  const res = await fetch(`${baseUrl}/admin/tools/deluser`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userid: userId,
    }),
  });

  const { error } = await res.json();

  if (error) {
    return { error: 'Failed to delete user: ' + error };
  }
  const supabase = await createClient();
  const { data, error: profileError } = await supabase.storage
    .from('employees')
    .remove([`${userId}/profile.png`]);

  if (profileError) {
    return { error: 'Failed to delete profile picture: ' + profileError.message };
  }
  return { error: null };
}

// ============================================
// Optionals
// ============================================

export async function uploadProfilePicture(
  userId: string,
  fileName: string
): Promise<ServerActionResponse<{ publicUrl: string }>> {
  // This action validates the upload and returns the public URL
  // The actual upload happens client-side to avoid Next.js body size limits
  const supabase = await createClient();

  // Verify the file exists in storage
  const { data, error } = await supabase.storage.from('employees').list(userId, {
    limit: 1,
    search: 'profile.png',
  });

  if (error || !data || data.length === 0) {
    return { error: 'Profile picture verification failed' };
  }

  // Return the public URL with cache busting
  const publicUrl = getProfileImageUrl(supabase, userId);
  return { error: null, data: { publicUrl } };
}

export async function deleteProfilePicture(userId: string): Promise<ServerActionResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('employees')
    .remove([`${userId}/profile.png`]);

  if (error) {
    return { error: 'Failed to delete profile picture: ' + error.message };
  }

  return { error: null, data: data };
}

async function uploadDocument(userId: string, file: File) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('user-files')
    .upload(`${userId}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;
  return data;
}
