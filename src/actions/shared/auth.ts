'use server';

import type { ServerActionResponse } from '@/lib/utils/safe-action';
import { loginSchema } from '@/zod/schemas';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type AuthenticatedClaimsResult =
  | {
      userId: string;
      role: string | null;
    }
  | null;

async function getAuthenticatedClaims(): Promise<AuthenticatedClaimsResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    return null;
  }

  const role = claimsData.claims.app_metadata?.user_role;
  return {
    userId: user.id,
    role: typeof role === 'string' ? role : null,
  };
}

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
  const auth = await getAuthenticatedClaims();
  if (auth) {
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
      redirect('/manager/task-assignment');
      return;
    case 'hr':
      redirect('/hr/reward-requests');
      return;
    case 'regular':
    case 'employee':
      redirect('/employee/dashboard');
      return;
    default:
      console.log('unknwon role');
      //localhost:3008/error?status=404&cause=Page%20not%20found&recommendation=Check%20the%20URL%20or%20go%20back.
      redirect('/error?status=403&cause=Access%20Denied&recommendation=Contact%20your%20administrator.');
      return;
  }
}

export async function protectAdminRoute() {
  const auth = await getAuthenticatedClaims();

  if (!auth) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const normalizedRole = auth.role?.trim().toLowerCase();

  if (normalizedRole !== 'superadmin') {
    console.log('Access denied: User has role', auth.role, 'but superadmin is required');
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
  const auth = await getAuthenticatedClaims();

  if (!auth) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const normalizedRole = auth.role?.trim().toLowerCase();

  if (normalizedRole !== 'manager') {
    console.log('Access denied: User has role', auth.role, 'but manager is required');
   redirect(
     '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
   );
    return;
  }

  console.log('✓ Manager access granted');
}

export async function protectHRRoute() {
  const auth = await getAuthenticatedClaims();

  if (!auth) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const normalizedRole = auth.role?.trim().toLowerCase();

  if (normalizedRole !== 'hr') {
    console.log('Access denied: User has role', auth.role, 'but hr is required');
redirect(
  '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
);
    return;
  }

  console.log('✓ HR access granted');
}

export async function protectEmployeeRoute() {
  const auth = await getAuthenticatedClaims();

  if (!auth) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  const normalizedRole = auth.role?.trim().toLowerCase();

  if (normalizedRole !== 'regular' && normalizedRole !== 'employee') {
    console.log('Access denied: User has role', auth.role, 'but employee/regular is required');
 redirect(
   '/error?status=403&cause=Access%20Denied&recommendation=Make%20sure%20you%20have%20the%20right%20permissions.'
 );
    return;
  }

  console.log('✓ Employee access granted');
}

/**
 * Protects routes that require any authenticated session (all roles)
 * Used for routes like /profile/* that should be accessible to any logged-in user
 * 
 * @param restrictToUserId - Optional user ID to restrict access to (user can only access their own profile)
 */
export async function protectSessionRoute(restrictToUserId?: string) {
  const auth = await getAuthenticatedClaims();

  if (!auth) {
    console.log('No session found, redirecting to login');
    redirect('/error?status=401&cause=Unauthorized&recommendation=Please%20log%20in%20to%20access%20this%20page.');
    return;
  }

  // If restrictToUserId is provided, verify the session user matches
  if (restrictToUserId) {
    if (auth.userId !== restrictToUserId) {
      console.log('Access denied: User', auth.userId, 'tried to access profile of', restrictToUserId);
      redirect(
        '/error?status=403&cause=Access%20Denied&recommendation=You%20can%20only%20view%20your%20own%20profile.'
      );
      return;
    }
  }

  console.log('✓ Session access granted');
}

export async function signOutAction(): Promise<ServerActionResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: 'Failed to sign out: ' + error.message };
  }

  return { error: null };
}
