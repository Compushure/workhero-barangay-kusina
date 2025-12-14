import { safeAction } from '@/lib/utils/safe-action';
import { signinAction, signOutAction } from '@/actions/auth';

export async function handleLoginSubmit(formData: FormData): Promise<{ error: string | null }> {
  const result = await safeAction(() => signinAction(formData));

  if (!result.success) {
    return { error: result.error };
  }

  if (result.data?.error) {
    return { error: result.data.error };
  }

  return { error: null };
}

export async function handleSignOut(): Promise<{ error: string | null }> {
  const result = await safeAction(() => signOutAction());

  if (!result.success) {
    return { error: result.error };
  }

  if (result.data?.error) {
    return { error: result.data.error };
  }

  return { error: null };
}
