'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/lib/utils/safe-action';
import type { User, AddUserInput, EditUserInput } from '@/types';
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

// ============================================
// User Management Actions
// ============================================

export async function fetchUsersAction(): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_role_attribute')
    .select('user_id, user_name, user_email, role_type, user_date_added, employee_id, contact_details, home_address, tin_id, sss_id,employment_status, pagibig_id')
    .order('user_date_added', { ascending: false });

  if (error || !data) {
    throw new Error('Error fetching users: ' + error?.message || 'Unknown error');
  }

  const users = data.map((u) => {
    let date_added = new Date();
    if (u.user_date_added) {
      const parsed = new Date(u.user_date_added);
      if (!Number.isNaN(parsed.getTime())) {
        date_added = parsed;
      }
    }
    return {
      id: u.user_id,
      name: u.user_name,
      email: u.user_email,
      employeeType: u.role_type,
      date_added,
      employeeId: u.employee_id,
      contactNumber: u.contact_details,
      address: u.home_address,
      tin: u.tin_id,
      sss: u.sss_id,
      employmentStatus: u.employment_status,
      createdAt: u.user_date_added,
      companyId: undefined,
      pagibig: u.pagibig_id,
    };
  });
  return users;
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
  if (input.name === '') {
    parsed.data.name = '';
  }

  const { name, employeeType, password } = parsed.data;

  // change password if provided
  if (password) {
    const { error: pwError } = await changeuserPassword(userId, password);
    if (pwError) {
      return { error: 'Failed to update user: ' + pwError };
    }
  }

  // only call to rpc if there's no password error or change
  const { data, error } = await supabase.rpc('rpc_update_user_name_and_assign_role', {
    p_user_id: userId,

    p_new_name: name,

    p_new_role_type: employeeType,
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
export async function searchAndFilterUsersAction(
  // search: string,
  // searchType: 'name' | 'employee_id',
  // employeeType?: string,
  // employmentStatus?: string,
  // sortBy?: 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc',
  // limit?: number,
  // offset?: number,
): Promise<ServerActionResponse<User[]>> {
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

  return { error: 'Not implemented yet',  };
}
