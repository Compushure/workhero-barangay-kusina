'use server';

// by anton mostye huhihihihihih : ))))))
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

  // helper functions to read the jwt claims (mostly ang sa app_metadata)
  // this is to get ang role, take note htat supabase now recommends using custom claims for role-based authentication
  // DEAR FUTURE DEVS: DO NOT ATTEMPT TO IMPLEMEENT USING USER_METADSATA AS IT IS NOT ENCCYPRTED AND COULD ESASILIY BE INJECTED
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
    // if weird role then i null
    role: typeof role === 'string' ? role : null,
  };
}

export async function getUserRole() {
  // get in session role
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


// REDIRECT STUFF SHOULD"VE PROBABLY  MADE ANOTHER WRAPPER FUNCION SIGH 💔
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
      // lol gin hardcode, i feel like---- pwede gid ni i dynamic, but brain not workign rip
      // this is just so tna kung ay ara gid app breakag like nag crash ang fornt end maka attempt mag redirect 
      // to one of the safe error pages 
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

// this one is ACTUALLY ONLY A SPECIAL CASE WHICH IS USD IN the DYNAMIC PROFIL ROUTE
// honestly also should migrate to server side  protection using RLS 
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

// straight forwards
export async function signOutAction(): Promise<ServerActionResponse> {
  const supabase = await createClient();
  // tries to get in session user , there's been a deabate abt using auth.sesions and auth user tbh
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
