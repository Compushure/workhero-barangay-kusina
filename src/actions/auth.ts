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

export async function redirectifSessionExists() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionData.session && !sessionError) {
    console.log('Active session found, redirecting to dashboard');
    await redirectToCorrectDashboardServer();
  }
}

export async function redirectToCorrectDashboardServer() {
  const { role, error } = await getUserRole();
  if (error || !role) {
    console.log('No role found, redirecting to login');
    return;
  }

  const normalizedRole = role.trim().toLowerCase();

  switch (normalizedRole) {
    case 'superadmin':
      redirect('/admin/manage');
      return;
    case 'manager':
      redirect('/manager/dashboard/task-assignment');
      return;
    case 'hr':
      redirect('/hr/dashboard');
      return;
    case 'regular':
    case 'employee':
      redirect('/employee/dashboard');
      return;
    default:
      console.log('unknwon role');
      //localhost:3008/error?status=404&cause=Page%20not%20found&recommendation=Check%20the%20URL%20or%20go%20back.
      redirect('/error?status=403&cause=Access%20Denied&recommendation=Contact%20your%20administrator.');
      http: return;
  }
}

export async function protectAdminRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'superadmin') {
    console.log('Access denied: User has role', role, 'but superadmin is required');
    redirect(
      '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
    );
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
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'manager') {
    console.log('Access denied: User has role', role, 'but manager is required');
   redirect(
     '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
   );
    return;
  }

  console.log('✓ Manager access granted');
}

export async function protectHRRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'hr') {
    console.log('Access denied: User has role', role, 'but hr is required');
redirect(
  '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
);
    return;
  }

  console.log('✓ HR access granted');
}

export async function protectEmployeeRoute() {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (!sessionData.session || sessionError) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    console.log('No claims found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole !== 'regular' && normalizedRole !== 'employee') {
    console.log('Access denied: User has role', role, 'but employee/regular is required');
 redirect(
   '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
 );
    return;
  }

  console.log('✓ Employee access granted');
}

export async function signOutAction(): Promise<ServerActionResponse> {
  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
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
