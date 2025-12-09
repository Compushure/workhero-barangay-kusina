'use server'

import type { ServerActionResponse } from '@/lib/utils/safe-action'
import { loginSchema } from '@/zod/schemas'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { hasRole, ROLE_ERROR_MESSAGES } from '@/lib/rbac/roles'

/**
 * Retrieves the current user's role from JWT claims
 * @returns Object with role (string or null)
 */
export async function getUserRole() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    return { role: null }
  } else {
    return { role: data.claims.app_metadata?.user_role || null }
  }
}

/**
 * Protects admin routes by checking if user is superadmin
 * Redirects to /admin if not authenticated or not superadmin
 * @throws Redirect to /admin if not authorized
 * @returns JSON string of user claims if authorized
 */
export async function protectAdminRoute() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (!sessionData.session || sessionError) {
    console.warn(' Admin access denied: No active session')
    redirect('/admin')
  }

  if (claimsError || !claimsData?.claims) {
    console.warn(' Admin access denied: Failed to retrieve claims')
    redirect('/admin')
  }

  const role = claimsData?.claims?.app_metadata?.user_role
  console.log(
    `Admin route check - Raw role value: "${role}" (type: ${typeof role})`
  )

  if (!hasRole(role, 'superadmin')) {
    console.warn(
      ` Admin access DENIED for non-superadmin user. Role: "${role}" (trimmed: "${role?.trim()}")`
    )
    redirect('/admin')
  }

  console.log(' Admin access GRANTED for superadmin user')
  return JSON.stringify(claimsData.claims, null, 2)
}

/**
 * Helper function to check admin route without redirecting
 * Useful for action-level checks
 * @returns Object with { authorized: boolean, role: string | null, error: string | null }
 */
export async function checkAdminAccess() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (!sessionData.session || sessionError) {
    console.warn(' Admin check failed: No active session')
    return {
      authorized: false,
      role: null,
      error: 'Not authenticated',
    }
  }

  if (claimsError || !claimsData?.claims) {
    console.warn(' Admin check failed: Could not retrieve claims')
    return {
      authorized: false,
      role: null,
      error: 'Failed to retrieve user claims',
    }
  }

  const role = claimsData?.claims?.app_metadata?.user_role
  console.log(
    ` Admin access check - Raw role value: "${role}" (type: ${typeof role})`
  )

  if (!hasRole(role, 'superadmin')) {
    console.warn(
      ` Admin access DENIED for non-superadmin. Role: "${role}" (trimmed: "${role?.trim()}")`
    )
    return {
      authorized: false,
      role: role || null,
      error: ROLE_ERROR_MESSAGES.SUPERADMIN_ONLY,
    }
  }

  console.log(' Admin access GRANTED for superadmin user')
  return {
    authorized: true,
    role: role || null,
    error: null,
  }
}

/**
 * Checks admin access and returns info without redirecting
 * Used to provide user feedback when access is denied
 * @returns Object with { isAuthorized: boolean, role: string | null, message: string | null }
 */
export async function getAdminAccessInfo(): Promise<{
  isAuthorized: boolean
  role: string | null
  message: string | null
}> {
  const result = await checkAdminAccess()

  if (result.authorized) {
    return {
      isAuthorized: true,
      role: result.role,
      message: null,
    }
  }

  return {
    isAuthorized: false,
    role: result.role,
    message: `Access Denied: You are signed in as "${result.role}", but only superadmins can access this area.`,
  }
}

export async function signinAction(
  formData: FormData
): Promise<ServerActionResponse> {
  const supabase = await createClient()
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

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: 'Failed to log in: ' + error.message }
  } else {
    return { error: null }
  }
}

export async function signOutAction(): Promise<ServerActionResponse> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: 'Failed to sign out: ' + error.message }
    }
  }
  return { error: null }
}
