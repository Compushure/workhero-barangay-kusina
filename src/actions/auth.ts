/**
 * Auth Server Actions
 * ====================
 * Server-side authentication actions for admin login/logout.
 * Contains Zod validation and Supabase auth integration placeholders.
 *
 * TODO: Uncomment Supabase imports and logic when integration is ready.
 */

'use server'

import type { ServerActionResponse } from '@/lib/utils/safe-action'
import { type LoginInput } from '@/types'
import { loginSchema } from '@/zod/schemas'
// TODO: Uncomment when Supabase is configured
// import { createSupabaseClient } from '@/lib/supabase/server'

// ============================================
// Auth Actions
// ============================================

/**
 * Signs in an admin user with email and password
 * @param formData - Form data containing email and password
 * @returns ServerActionResponse with error message if failed
 *
 * TODO: Replace placeholder logic with Supabase auth
 */
export async function signinAction(
  formData: FormData
): Promise<ServerActionResponse> {
  // Parse and validate form data
  const rawData = Object.fromEntries(formData.entries())
  const parsed = loginSchema.safeParse(rawData)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return {
      error:
        'Invalid data: ' +
        (fieldErrors.email ? '(Invalid email) ' : '') +
        (fieldErrors.password ? '(Password required)' : '').trim(),
    }
  }

  const { email, password } = parsed.data

  // ============================================
  // TODO: Supabase Authentication
  // ============================================
  // const supabase = await createSupabaseClient()
  //
  // // Check if user is locked out
  // const { data: isLocked } = await supabase.rpc('is_user_locked', { user_email: email })
  // if (isLocked) {
  //   return { error: 'Too many login attempts. Please wait 5 minutes.' }
  // }
  //
  // const { error } = await supabase.auth.signInWithPassword({ email, password })
  // if (error) {
  //   await supabase.rpc('increment_failed_attempts', { user_email: email })
  //   return { error: 'Failed to log in: ' + error.message }
  // }
  //
  // await supabase.rpc('reset_failed_attempts', { user_email: email })
  // return { error: null }
  // ============================================

  // PLACEHOLDER: Demo authentication logic
  if (email === 'admin@company.com' && password === 'Admin123!') {
    return { error: null }
  }

  return { error: 'Invalid email or password' }
}

/**
 * Signs out the current admin user
 * @returns ServerActionResponse with error message if failed
 *
 * TODO: Replace with Supabase signOut
 */
export async function signOutAction(): Promise<ServerActionResponse> {
  // ============================================
  // TODO: Supabase Sign Out
  // ============================================
  // const supabase = await createSupabaseClient()
  // const { data: { session } } = await supabase.auth.getSession()
  //
  // if (session) {
  //   const { error } = await supabase.auth.signOut()
  //   if (error) {
  //     return { error: 'Failed to sign out: ' + error.message }
  //   }
  // }
  // return { error: null }
  // ============================================

  // PLACEHOLDER: Always succeed for demo
  return { error: null }
}

/**
 * Fetches the current user session
 * @returns Session object or null if not authenticated
 *
 * TODO: Replace with Supabase getSession
 */
export async function fetchUserSession(): Promise<{
  user: { email: string }
} | null> {
  // ============================================
  // TODO: Supabase Session Check
  // ============================================
  // const supabase = await createSupabaseClient()
  // const { data, error } = await supabase.auth.getSession()
  // if (error || !data.session) {
  //   return null
  // }
  // return data.session
  // ============================================

  // PLACEHOLDER: Return null (no session) for demo
  return null
}
