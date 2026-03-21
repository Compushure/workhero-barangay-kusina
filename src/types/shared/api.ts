/**
 * Shared API Response Types
 * ==========================
 * Generic types for server actions and API responses
 */

/**
 * Type for server action responses
 * Generic response type for consistent error handling
 */
export type ServerActionResponse<T = unknown> = {
  error: string | null;
  data?: T;
  warning?: string | null;
};

/**
 * Alternative server action response type
 * Used by safe-action utility
 */
export type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

/**
 * Paginated response type for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
}
