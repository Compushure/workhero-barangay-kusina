/**
 * User Management Server Actions
 * ================================
 * Server-side actions for CRUD operations on users.
 * Handles adding, editing, and deleting users in the system.
 *
 * TODO: Replace in-memory storage with Supabase database operations.
 */

'use server'

import type { ServerActionResponse } from '@/lib/utils/safe-action'
import { type User, type AddUserInput, type EditUserInput } from '@/types'
import { addUserSchema, editUserSchema } from '@/zod/schemas'
// TODO: Uncomment when Supabase is configured
// import { createSupabaseClient } from '@/lib/supabase/server'

// ============================================
// User Management Actions
// ============================================

/**
 * Fetches all users from the database
 * @returns Array of User objects
 *
 * TODO: Replace with Supabase query
 */
export async function fetchUsersAction(): Promise<User[]> {
  // ============================================
  // TODO: Supabase Query
  // ============================================
  // const supabase = await createSupabaseClient()
  // const { data, error } = await supabase
  //   .from('users')
  //   .select('*')
  //   .order('created_at', { ascending: false })
  //
  // if (error) throw new Error('Error fetching users: ' + error.message)
  // return data.map(u => ({
  //   id: u.id,
  //   name: u.name,
  //   email: u.email,
  //   password: u.password,
  //   employeeType: u.employee_type,
  //   createdAt: new Date(u.created_at),
  // }))
  // ============================================

  // PLACEHOLDER: Return demo data
  return [
    {
      id: '1',
      name: 'John Manager',
      email: 'john@company.com',
      password: 'hashed_password',
      employeeType: 'manager',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Sarah HR',
      email: 'sarah@company.com',
      password: 'hashed_password',
      employeeType: 'hr',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: '3',
      name: 'Mike Regular',
      email: 'mike@company.com',
      password: 'hashed_password',
      employeeType: 'regular',
      createdAt: new Date('2024-03-10'),
    },
  ]
}

/**
 * Adds a new user to the database
 * @param input - User data to create
 * @returns ServerActionResponse with new user data or error
 *
 * TODO: Replace with Supabase insert + auth.admin.createUser
 */
export async function addUserAction(
  input: AddUserInput
): Promise<ServerActionResponse<User>> {
  // Validate input
  const parsed = addUserSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  const { name, email, password, employeeType } = parsed.data

  // ============================================
  // TODO: Supabase User Creation
  // ============================================
  // const supabase = await createSupabaseClient()
  //
  // // Check if email already exists
  // const { data: exists } = await supabase.rpc('check_email_exists', { p_email: email })
  // if (exists) {
  //   return { error: 'A user with this email already exists' }
  // }
  //
  // // Create auth user
  // const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  //   email,
  //   password,
  //   email_confirm: true,
  // })
  // if (authError) return { error: 'Failed to create user: ' + authError.message }
  //
  // // Insert into users table
  // const { data, error } = await supabase
  //   .from('users')
  //   .insert({
  //     id: authData.user.id,
  //     name,
  //     email,
  //     password: 'hashed', // Store hashed or reference only
  //     employee_type: employeeType,
  //   })
  //   .select()
  //   .single()
  //
  // if (error) return { error: 'Failed to save user data: ' + error.message }
  // return { error: null, data: { ...data, createdAt: new Date(data.created_at) } }
  // ============================================

  // PLACEHOLDER: Create demo user
  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password: 'hashed_' + password,
    employeeType,
    createdAt: new Date(),
  }

  return { error: null, data: newUser }
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
  const parsed = editUserSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' }
  }

  const { name, password, employeeType } = parsed.data

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
  const updatedUser: User = {
    id: userId,
    name,
    email: 'user@company.com', // Would come from DB
    password: password ? 'hashed_' + password : 'hashed_existing',
    employeeType,
    createdAt: new Date(),
  }

  return { error: null, data: updatedUser }
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
