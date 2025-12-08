/**
 * Auth Action Handlers (Client-side)
 * ====================================
 * Client-side wrappers for auth server actions.
 * Provides a clean interface between UI components and server actions.
 * Uses safeAction wrapper for consistent error handling.
 */

import { safeAction } from '@/lib/utils/safe-action'
import { signinAction, signOutAction, fetchUserSession } from '@/actions/auth'

/**
 * Handles login form submission
 * @param formData - Form data with email and password
 * @returns Object with error message if failed, null if successful
 */
export async function handleLoginSubmit(
  formData: FormData
): Promise<{ error: string | null }> {
  const result = await safeAction(() => signinAction(formData))

  if (!result.success) {
    return { error: result.error }
  }

  // Server action returns its own error format
  if (result.data?.error) {
    return { error: result.data.error }
  }

  return { error: null }
}

/**
 * Handles user logout
 * @returns Object with error message if failed, null if successful
 */
export async function handleLogout(): Promise<{ error: string | null }> {
  const result = await safeAction(() => signOutAction())

  if (!result.success) {
    return { error: result.error }
  }

  if (result.data?.error) {
    return { error: result.data.error }
  }

  return { error: null }
}

/**
 * Checks if user has an active session
 * @returns Session object or null
 */
export async function checkSession() {
  const result = await safeAction(() => fetchUserSession())
  return result.success ? result.data : null
}
