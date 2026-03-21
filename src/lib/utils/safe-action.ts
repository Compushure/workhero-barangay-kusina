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

/**
 * Wraps an async server action with standardized error handling
 * @param action - The async function to execute
 * @returns ActionResult with either success data or error message
 */
export async function safeAction<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
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
