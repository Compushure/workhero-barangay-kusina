'use server';

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

// ============================================
// Route helpers
// ============================================
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3008';

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
  if (params.searchQuery) {
    searchParams.set('query', params.searchQuery.trim());
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
    const users = data.users as User[];
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    // Calculate pagination metadata
    // Note: The backend doesn't return total count directly in the current implementation,
    // so we estimate based on whether results are less than pageSize
    const totalPages = users.length < pageSize ? page : page + 1; // Simplified estimation

    return {
      error: null,
      data: {
        data: users,
        count: users.length,
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
  console.log('Adding user:', name, email, employeeType, employmentStatus);

  const res = await fetch(`${baseUrl}/admin/tools/adduser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
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

  const { error, user } = await res.json();

  if (error) {
    return { error: 'Failed to create user' + error };
  }
  return { error: null, data: user };
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
  return { error: null };
}

// ============================================
// Optionals
// ============================================

export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<ServerActionResponse> {
  const supabase = await createClient();
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
