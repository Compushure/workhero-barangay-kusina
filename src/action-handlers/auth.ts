import { safeAction } from '@/lib/utils/safe-action'
import { signinAction, signOutAction, checkAdminAccess } from '@/actions/auth'

/**
 * Handles login form submission with validation
 * @param formData - FormData containing email and password
 * @returns Object with error message or null
 */
export async function handleLoginSubmit(
  formData: FormData
): Promise<{ error: string | null }> {
  const result = await safeAction(() => signinAction(formData))

  if (!result.success) {
    return { error: result.error }
  }

  if (result.data?.error) {
    return { error: result.data.error }
  }

  return { error: null }
}

/**
 * Handles user sign out
 * @returns Object with error message or null
 */
export async function handleSignOut(): Promise<{ error: string | null }> {
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
 * Checks if user has admin access (superadmin only)
 * Note: Toast is shown by ProtectedRoute component, not here
 * @returns Object with { authorized: boolean, role: string | null, error: string | null }
 */
export async function handleCheckAdminAccess(): Promise<{
  authorized: boolean
  role: string | null
  error: string | null
}> {
  const result = await safeAction(() => checkAdminAccess())

  if (!result.success) {
    const errorMsg = 'Failed to verify admin access'
    return {
      authorized: false,
      role: null,
      error: errorMsg,
    }
  }

  const { authorized, role, error } = result.data

  return {
    authorized,
    role,
    error,
  }
}
