'use server';

import type { ServerActionResponse } from '@/lib/utils/safe-action';
import { loginSchema } from '@/zod/schemas';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { de } from 'zod/v4/locales';

export async function getUserRole() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return { role: null, error };
  } else {
    return { role: data.claims.app_metadata?.user_role || null, error: null };
  }
}

export async function redirectToCorrectDashboardServer() {
  const { role, error } = await getUserRole();
  if (error || !role) {
    console.log('No role found, redirecting to login');
    redirect('/admin');
    return;
  }

  const normalizedRole = role.trim().toLowerCase();

  switch (normalizedRole) {
    case 'superadmin':
      redirect('/admin/manage');
      return;
    case 'manager':
      redirect('/manager/dashboard');
      return;
    case 'hr':
      redirect('/hr/dashboard');
      return;
    case 'regular':
    case 'employee':
      redirect('/employee/dashboard');
      return;
    default:
      console.log('Unknown role:', role);
      redirect('/admin');
      return;
  }
}

export async function protectAdminRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'superadmin') {
    console.log('Access denied: User has role', role, 'but superadmin is required');
    redirect('/auth/login');
    return;
  }

  console.log('✓ Superadmin access granted');
}

export async function signinAction(formData: FormData): Promise<ServerActionResponse> {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error:
        'Invalid data: ' +
        (fieldErrors.email ? '(Invalid email) ' : '') +
        (fieldErrors.password ? '(Password required)' : '').trim(),
    };
  }

  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: 'Failed to log in: ' + error.message };
  } else {
    return { error: null };
  }
}

export async function protectManagerRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'manager') {
    console.log('Access denied: User has role', role, 'but manager is required');
    redirect('/auth/login');
    return;
  }

  console.log('✓ Manager access granted');
}

export async function protectHRRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'hr') {
    console.log('Access denied: User has role', role, 'but hr is required');
    redirect('/auth/login');
    return;
  }

  console.log('✓ HR access granted');
}

export async function protectEmployeeRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/auth/login');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'regular' && normalizedRole !== 'employee') {
    console.log('Access denied: User has role', role, 'but employee/regular is required');
    redirect('/auth/login');
    return;
  }

  console.log('✓ Employee access granted');
}

export async function signOutAction(): Promise<ServerActionResponse> {
  const supabase = await createClient();
  const {
    data: { session },
    error:sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    return { error: 'Error verifying user session' };
  }
  if (session) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: 'Failed to sign out: ' + error.message };
    }
  }
  return { error: null };
}
