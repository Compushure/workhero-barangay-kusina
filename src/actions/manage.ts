/**
 * User Management Server Actions
 * ================================
 * Server-side actions for CRUD operations on users.
 * Handles adding, editing, and deleting users in the system.
 *
 * TODO: Replace in-memory storage with Supabase database operations.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import type { ServerActionResponse } from '@/lib/utils/safe-action'
import type { User, AddUserInput, EditUserInput } from '@/types'
import { addUserSchema, editUserSchema } from '@/zod/schemas'
<<<<<<< Updated upstream
=======
import { getUserRole } from './auth'

// ============================================
// Route helpers
// ============================================
const baseUrl = 'http://localhost:3008'

async function changeuserPassword(userId: string, newPassword: string) {
  const { role } = await getUserRole()
  if (!role) {
    return {
      error: 'Failed to change password: No user role found',
    }
  }
  if (role.trim() != 'superadmin') {
    return {
      error: `Failed to change password: Unauthorized User Role (${role.trim()})`,
    }
  }

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
>>>>>>> Stashed changes

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
    throw new Error('Error fetching users: ' + error.message)
  } else {
    const users = data.map((u) => {
      return {
        id: u.user_id,
        name: u.user_name,
        email: u.user_email,
        employeeType: u.role_type,
        date_added: new Date(u.user_date_added),
      }
    })
    return users
  }
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
    return { error: 'Failed to add user ' + error }
  }
  return { error: null, data: user || null }
}

/**
 * Updates an existing user
 * @param userId - ID of user to update
 * @param input - Updated user data
 * @returns ServerActionResponse with updated user or error
 *
 * TODO: Replace with Supabase update
 */
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

  const { name, password, employeeType } = parsed.data

  const { data, error } = await supabase.rpc(
    'rpc_update_user_name_and_assign_role',
    {
      p_user_id: userId,

      p_new_name: input.name,

      p_new_role_type: input.employeeType,
    }
  )

  if (error) {
    return { error: 'Failed to update user: ' + error.message }
  }
  return { error: null, data: data as User }
  // com
  // ============================================
  // TODO: Supabase User Update
  // ============================================
  // const supabase = await createSupabaseClient()
  //
  // // Update user record
  // const updateData: Record<string, unknown> = { name, employee_type: employeeType }
  //
  // const { data, error } = await supabase
  //   .from('users')
  //   .update(updateData)
  //   .eq('id', userId)
  //   .select()
  //   .single()
  //
  // if (error) return { error: 'Failed to update user: ' + error.message }
  //
  // // Update password if provided
  // if (password) {
  //   const { error: pwError } = await supabase.auth.admin.updateUserById(userId, { password })
  //   if (pwError) return { error: 'User updated but password change failed: ' + pwError.message }
  // }
  //
  // return { error: null, data: { ...data, createdAt: new Date(data.created_at) } }
  // ============================================

  // PLACEHOLDER: Return updated demo user
  // const updatedUser: User = {
  //   id: userId,
  //   name,
  //   email: 'user@company.com', // Would come from DB
  //   password: password ? 'hashed_' + password : 'hashed_existing',
  //   employeeType,
  //   createdAt: new Date(),
  // }

  // return { error: null, data: updatedUser }
}

/**
 * Deletes a user from the database
 * @param userId - ID of user to delete
 * @returns ServerActionResponse with error if failed
 *
 * TODO: Replace with Supabase delete + auth.admin.deleteUser
 */
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
