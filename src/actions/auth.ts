'use server'

import type { ServerActionResponse } from '@/lib/utils/safe-action'
import { loginSchema } from '@/zod/schemas'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserRole() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    return { role: null }
  } else {
    return { role: data.claims.app_metadata?.user_role || null }
  }
}

export async function protectAdminRoute() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims()
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (!sessionData.session || sessionError) {
    redirect('/admin')
  } else {
    if (claimsError || !claimsData?.claims) {
      // change to login ilater
      if (!claimsData?.claims) {
        console.log('No active session found.')
      }
      redirect('/admin')
    } else {
      const role = claimsData?.claims?.app_metadata?.user_role
      if (role.trim() != 'superadmin') {
        console.log('Unauthorized access attempt by user with role:', role)
        redirect('/admin')
      }
    }
    // custom claim is usually under app_metadata
    const role = claimsData?.claims?.app_metadata?.user_role
    console.log('role', role)
    console.log(claimsData.claims)
    return JSON.stringify(claimsData.claims, null, 2)
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
