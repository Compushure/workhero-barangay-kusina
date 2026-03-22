import { supabaseAdmin } from '@/lib/supabase/admin';

const AUTH_USERS_PAGE_SIZE = 1000;

export type ExistingEmailCheckResult = {
  exists: boolean;
  normalizedEmail: string;
  source: 'public_user' | 'auth_user' | null;
};

export function normalizeUserEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildExistingEmailMessage(normalizedEmail: string): string {
  return `A user with email "${normalizedEmail}" already exists`;
}

async function emailExistsInPublicUsers(normalizedEmail: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('User')
    .select('id')
    .eq('email', normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify email availability: ${error.message}`);
  }

  return Boolean(data);
}

async function emailExistsInAuthUsers(normalizedEmail: string): Promise<boolean> {
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) {
      throw new Error(`Failed to verify auth email availability: ${error.message}`);
    }

    const emailExists = data.users.some(
      (user) => normalizeUserEmail(user.email ?? '') === normalizedEmail
    );

    if (emailExists) {
      return true;
    }

    if (!data.nextPage || page >= data.lastPage) {
      return false;
    }

    page = data.nextPage;
  }
}

export async function findExistingUserEmail(email: string): Promise<ExistingEmailCheckResult> {
  const normalizedEmail = normalizeUserEmail(email);

  if (!normalizedEmail) {
    return {
      exists: false,
      normalizedEmail,
      source: null,
    };
  }

  if (await emailExistsInPublicUsers(normalizedEmail)) {
    return {
      exists: true,
      normalizedEmail,
      source: 'public_user',
    };
  }

  if (await emailExistsInAuthUsers(normalizedEmail)) {
    return {
      exists: true,
      normalizedEmail,
      source: 'auth_user',
    };
  }

  return {
    exists: false,
    normalizedEmail,
    source: null,
  };
}
