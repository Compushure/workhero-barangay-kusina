/**
 * Safe Action Wrapper Utility
 * ============================
 * Provides a type-safe wrapper for server actions with automatic error handling.
 * Eliminates repetitive try-catch blocks in action handlers by centralizing error logic.
 *
 * Usage: const result = await safeAction(() => myServerAction(data))
 */

export type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };
  // JOSH STUFF 

function sanitizeActionErrorMessage(message: string): string {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes('<!doctype html') || lower.includes('<html')) {
    if (lower.includes('502') || lower.includes('bad gateway')) {
      return 'The leaderboard service is temporarily unavailable. Please try again in a few minutes.';
    }

    if (lower.includes('503') || lower.includes('service unavailable')) {
      return 'The service is temporarily unavailable. Please try again in a few minutes.';
    }

    return 'An upstream service returned an unexpected HTML error response.';
  }

  return normalized;
}

/**
 * Wraps an async server action with standardized error handling
 * @param action - The async function to execute
 * @returns ActionResult with either success data or error message
 */
// efocrse a generic type T for the data returned by the action,
//  and the function returns a promise of ActionResult<
// also for typesafe man actualy
// basically wraps the whole thing in a tray catch wrapper so that indi na sagi liwat2 sulat
export async function safeAction<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data, error: null };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const message = sanitizeActionErrorMessage(rawMessage);
    console.error('[SafeAction Error]:', message);
    return { success: false, data: null, error: message };
  }
}

/**
 * Type for server action responses with optional error
 */
export type ServerActionResponse<T = void> =
  | { error: null; data?: T; warning?: string | null }
  | { error: string; data?: never; warning?: never };
