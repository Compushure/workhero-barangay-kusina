/**
 * Manager Task Action Handlers (Client-side)
 * ============================================
 * Client-side wrappers for manager task server actions.
 * Handles UI feedback (toasts) and state management integration.
 * Uses safeAction wrapper for consistent error handling.
 */

import { safeAction } from '@/lib/utils/safe-action';
import {
  fetchTasksToReview,
  fetchApprovedTasks,
  fetchDeniedTasks,
  fetchTasksToReviewPaginated,
  fetchApprovedTasksPaginated,
  fetchDeniedTasksPaginated,
  approveTaskAction,
  rejectTaskAction,
} from '@/actions/manager/verification';
import type { VerificationRequest, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

/**
 * Fetches all tasks pending review with error handling and toast feedback
 * @returns Array of verification requests or empty array on error
 */
export async function handleFetchTasksToReview(): Promise<VerificationRequest[]> {
  const result = await safeAction(() => fetchTasksToReview());

  if (!result.success) {
    toast.error('Failed to load tasks: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
}

/**
 * Fetches all approved tasks with error handling and toast feedback
 * @returns Array of approved verification requests or empty array on error
 */
export async function handleFetchApprovedTasks(): Promise<VerificationRequest[]> {
  const result = await safeAction(() => fetchApprovedTasks());

  if (!result.success) {
    toast.error('Failed to load approved tasks: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
}

/**
 * Fetches all denied/rejected tasks with error handling and toast feedback
 * @returns Array of denied verification requests or empty array on error
 */
export async function handleFetchDeniedTasks(): Promise<VerificationRequest[]> {
  const result = await safeAction(() => fetchDeniedTasks());

  if (!result.success) {
    toast.error('Failed to load denied tasks: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
}

/**
 * Fetches paginated tasks in review with error handling and toast feedback
 * @param page - Page number (1-indexed)
 * @returns Paginated response with data array, count, and total pages
 */
export async function handleFetchTasksToReviewPaginated(
  page: number = 1,
  searchTerm: string = '',
  sort: 'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc' = 'date-desc'
): Promise<PaginatedResponse<VerificationRequest>> {
  const result = await safeAction(() => fetchTasksToReviewPaginated(page, 8, searchTerm, sort));

  if (!result.success) {
    toast.error('Failed to load tasks: ' + result.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return result.data?.data ?? { data: [], count: 0, totalPages: 0 };
}

/**
 * Fetches paginated approved tasks with error handling and toast feedback
 * @param page - Page number (1-indexed)
 * @returns Paginated response with data array, count, and total pages
 */
export async function handleFetchApprovedTasksPaginated(
  page: number = 1,
  searchTerm: string = '',
  sort: 'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc' = 'date-desc'
): Promise<PaginatedResponse<VerificationRequest>> {
  const result = await safeAction(() => fetchApprovedTasksPaginated(page, 8, searchTerm, sort));

  if (!result.success) {
    toast.error('Failed to load approved tasks: ' + result.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return result.data?.data ?? { data: [], count: 0, totalPages: 0 };
}

/**
 * Fetches paginated denied/rejected tasks with error handling and toast feedback
 * @param page - Page number (1-indexed)
 * @returns Paginated response with data array, count, and total pages
 */
export async function handleFetchDeniedTasksPaginated(
  page: number = 1,
  searchTerm: string = '',
  sort: 'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc' = 'date-desc'
): Promise<PaginatedResponse<VerificationRequest>> {
  const result = await safeAction(() => fetchDeniedTasksPaginated(page, 8, searchTerm, sort));

  if (!result.success) {
    toast.error('Failed to load denied tasks: ' + result.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return result.data?.data ?? { data: [], count: 0, totalPages: 0 };
}

/**
 * Approves a task with toast feedback
 * @param id - Task ID to approve
 * @param remark - Remarks for the approval
 * @returns Approved task or null on error
 */
export async function handleApproveTask(
  id: string,
  remark: string
): Promise<VerificationRequest | null> {
  const result = await safeAction(() => approveTaskAction(id, remark));

  if (!result.success) {
    toast.error('Failed to approve task: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Task approved successfully');
  return result.data?.data ?? null;
}

/**
 * Rejects a task with toast feedback
 * @param id - Task ID to reject
 * @param remark - Remarks for the rejection
 * @returns Rejected task or null on error
 */
export async function handleRejectTask(
  id: string,
  remark: string
): Promise<VerificationRequest | null> {
  const result = await safeAction(() => rejectTaskAction(id, remark));

  if (!result.success) {
    toast.error('Failed to reject task: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Task rejected successfully');
  return result.data?.data ?? null;
}
