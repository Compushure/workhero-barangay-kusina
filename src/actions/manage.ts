'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, User, AddUserInput, EditUserInput, UserQueryParams } from '@/types';
import { addUserSchema, editUserSchema } from '@/zod/schemas';
import { getUserRole } from './auth';

// ============================================
// Route helpers
// ============================================
const baseUrl = 'http://localhost:3008';

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



export async function addUserAction(input: AddUserInput): Promise<ServerActionResponse<User>> {
  // Validate input
  const parsed = addUserSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const { name, email, password, employeeType } = parsed.data;
  console.log('Adding user:', name, email, employeeType, password);

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
    return { error: 'Failed to create user' + error };
  }
  return { error: null };
  // // PLACEHOLDER: Always succeed for demo
  // console.log('[Demo] Would delete user:', userId)
  // return { error: null }
}

// ============================================
// Search, Filter & Sort Actions (Placeholder)
// ============================================

/**
 * Placeholder server action for advanced user search with filters and sorting
 *
 * IMPLEMENTATION STEPS:
 * 1. Build dynamic Supabase query based on filters:
 *    - Base query: supabase.from('user_role_attribute').select(...)
 *
 * 2. Apply search filter:
 *    - If searchType === 'name': Use .ilike('user_name', `%${search}%`) for fuzzy name matching
 *    - If searchType === 'employee_id': Use .eq('employee_id', search) for exact ID match
 *    - Chain with .or() for multiple conditions if needed
 *
 * 3. Apply employee type filter:
 *    - If employeeType !== 'all': Chain .eq('role_type', employeeType)
 *
 * 4. Apply employment status filter:
 *    - If employmentStatus !== 'all': Chain .eq('employment_status', employmentStatus)
 *
 * 5. Apply sorting:
 *    - 'name-asc': .order('user_name', { ascending: true })
 *    - 'name-desc': .order('user_name', { ascending: false })
 *    - 'date-asc': .order('user_date_added', { ascending: true })
 *    - 'date-desc': .order('user_date_added', { ascending: false })
 *
 * 6. Handle pagination (optional):
 *    - Use .range(offset, offset + limit - 1) for limit/offset pagination
 *    - Use .count() with { count: 'exact' } option for total count
 *
 * 7. Map and return results same as fetchUsersAction
 */
export async function searchAndFilterUsersAction(): Promise<ServerActionResponse<User[]>> {
  // search: string,
  // searchType: 'name' | 'employee_id',
  // employeeType?: string,
  // employmentStatus?: string,
  // sortBy?: 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc',
  // limit?: number,
  // offset?: number,
  // TODO: Implement search and filter logic
  // const supabase = await createClient()

  // Step 1: Initialize base query
  // let query = supabase
  //   .from('user_role_attribute')
  //   .select('user_id, user_name, user_email, role_type, user_date_added, employee_id, contact_details, home_address, tin_id, sss_id, employment_status, pagibig_id', { count: 'exact' })

  // Step 2: Apply search filter
  // if (search.trim()) {
  //   if (searchType === 'name') {
  //     query = query.ilike('user_name', `%${search}%`)
  //   } else if (searchType === 'employee_id') {
  //     query = query.eq('employee_id', search)
  //   }
  // }

  // Step 3: Apply employee type filter
  // if (employeeType && employeeType !== 'all') {
  //   query = query.eq('role_type', employeeType)
  // }

  // Step 4: Apply employment status filter
  // if (employmentStatus && employmentStatus !== 'all') {
  //   query = query.eq('employment_status', employmentStatus)
  // }

  // Step 5: Apply sorting
  // if (sortBy) {
  //   const [field, direction] = sortBy.split('-')
  //   const ascending = direction === 'asc'
  //   if (field === 'name') {
  //     query = query.order('user_name', { ascending })
  //   } else if (field === 'date') {
  //     query = query.order('user_date_added', { ascending })
  //   }
  // }

  // Step 6: Apply pagination
  // if (limit && offset !== undefined) {
  //   query = query.range(offset, offset + limit - 1)
  // }

  // Step 7: Execute query
  // const { data, error, count } = await query

  // if (error) {
  //   return { error: `Failed to search users: ${error.message}` }
  // }

  // Step 8: Map results
  // const users = (data || []).map(/* same mapping as fetchUsersAction */)
  // return { error: null, data: users }

  return { error: 'Not implemented yet' };
}
