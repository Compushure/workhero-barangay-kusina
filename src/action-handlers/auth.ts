import { safeAction } from '@/lib/utils/safe-action'
import { signinAction, signOutAction, checkAdminAccess } from '@/actions/auth'
import { toast } from 'sonner'

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
 * Shows toast notification if access is denied
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
    toast.error(errorMsg)
    return {
      authorized: false,
      role: null,
      error: errorMsg,
    }
  }

  const { authorized, role, error } = result.data

  // Show toast if access denied
  if (!authorized && error) {
    toast.error(error)
  }

  return {
    authorized,
    role,
    error,
  }
}
