'use client';

import { safeAction } from '@/lib/utils/safe-action';
import { fetchInSessionUserInfo } from '@/actions/shared/sidebar';
import { UserWithExtras } from '@/types';
import { toast } from 'sonner';

/**
 * Handler for fetching in-session user information with error handling
 * Wraps the server action with safeAction for consistent error handling
 * Shows toast notifications on success or failure
 *
 * @returns Promise with user data or error message
 */
export async function handleFetchSessionUser(): Promise<{
  error: string | null;
  data?: UserWithExtras;
}> {
  if (typeof window !== 'undefined' && (window as { Cypress?: unknown }).Cypress) {
    return { error: null };
  }

  const result = await safeAction(() => fetchInSessionUserInfo());

  if (!result.success) {
    toast.error('Failed to load profile', {
      description: result.error || 'An unexpected error occurred',
    });
    return { error: result.error || 'Failed to load profile' };
  }

  if (result.data?.error) {
    if (result.data.error === 'No active session found') {
      return { error: null };
    }
    toast.error('Failed to load profile', {
      description: result.data.error,
    });
    return { error: result.data.error };
  }

  return { error: null, data: result.data?.data };
}
