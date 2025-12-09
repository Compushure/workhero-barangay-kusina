'use server'

import { createClient } from '@/lib/supabase/server'
import type { ServerActionResponse } from '@/lib/utils/safe-action'
import type { User, AddUserInput, EditUserInput } from '@/types'
import { addUserSchema, editUserSchema } from '@/zod/schemas'
import { getUserRole } from './auth'

// ============================================
// Route helpers
// ============================================
const baseUrl = 'http://localhost:3008'

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
  })

  const { error } = await res.json()

  if (error) {
    return { error: 'Failed to change password: ' + error }
  }
  return { error: null }
}

// ============================================
// User Management Actions
// ============================================

export async function fetchUsersAction(): Promise<User[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_role_attribute')
    .select('user_id, user_name, user_email, role_type, user_date_added')
    .order('user_date_added', { ascending: false })

  if (error || !data) {
    throw new Error(
      'Error fetching users: ' + error?.message || 'Unknown error'
    )
  }

  const users = data.map((u) => {
    let date_added = new Date()
    if (u.user_date_added) {
      const parsed = new Date(u.user_date_added)
      if (!Number.isNaN(parsed.getTime())) {
        date_added = parsed
      }
    }
    return {
      id: u.user_id,
      name: u.user_name,
      email: u.user_email,
      employeeType: u.role_type,
      date_added,
    }
  })
  return users
}
export async function addUserAction(
  input: AddUserInput
): Promise<ServerActionResponse<User>> {
  // Validate input
  const parsed = addUserSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  const { name, email, password, employeeType } = parsed.data
  console.log('Adding user:', name, email, employeeType, password)

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
  })

  const { error, user } = await res.json()

  if (error) {
    return { error: 'Failed to create user' + error }
  }
  return { error: null, data: user }
}

export async function editUserAction(
  userId: string,
  input: EditUserInput
): Promise<ServerActionResponse<User>> {
  // Validate input
  const supabase = await createClient()

  const parsed = editUserSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  if (input.employeeType === 'no-change') {
    parsed.data.employeeType = ''
  }
  if (input.name === '') {
    parsed.data.name = ''
  }

  const { name, employeeType, password } = parsed.data

  // change password if provided
  if (password) {
    const { error: pwError } = await changeuserPassword(userId, password)
    if (pwError) {
      return { error: 'Failed to update user: ' + pwError }
    }
  }

  // only call to rpc if there's no password error or change
  const { data, error } = await supabase.rpc(
    'rpc_update_user_name_and_assign_role',
    {
      p_user_id: userId,

      p_new_name: name,

      p_new_role_type: employeeType,
    }
  )

  if (error) {
    return { error: 'Failed to update user: ' + error.message }
  }

  return { error: null, data: data as User }
}

export async function deleteUserAction(
  userId: string
): Promise<ServerActionResponse> {
  // ============================================
  // TODO: Supabase User Deletion
  // ============================================
  // const supabase = await createSupabaseClient()
  //
  // // Delete from users table first
  // const { error: dbError } = await supabase
  //   .from('users')
  //   .delete()
  //   .eq('id', userId)
  //
  // if (dbError) return { error: 'Failed to delete user: ' + dbError.message }
  //
  // // Delete auth user
  // const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  // if (authError) {
  //   console.error('Warning: User data deleted but auth record remains:', authError)
  // }
  //
  // return { error: null }
  // ============================================

  // PLACEHOLDER: Always succeed for demo
  console.log('[Demo] Would delete user:', userId)
  return { error: null }
}
