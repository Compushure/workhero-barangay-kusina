'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ServerActionResponse,
  User,
  AddUserInput,
  EditUserInput,
  UserQueryParams,
} from '@/types';
import type { VerificationRequest } from '@/types/manager-verification-req';

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  totalPages: number;
}

export async function fetchTasksToReview(): Promise<ServerActionResponse<VerificationRequest[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('status', 'in review');

  if (error) {
    return { error: 'Failed to fetch tasks in review: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest[] };
}

/**
 * Fetch paginated tasks in review
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 */
export async function fetchTasksToReviewPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .eq('status', 'in review')
    .range(start, end);

  if (error) {
    return { error: 'Failed to fetch tasks in review: ' + error.message, data: undefined };
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return {
    error: null,
    data: {
      data: data as VerificationRequest[],
      count: count || 0,
      totalPages,
    },
  };
}

export async function fetchApprovedTasks(): Promise<ServerActionResponse<VerificationRequest[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('status', 'approved');

  if (error) {
    return { error: 'Failed to fetch approved tasks: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest[] };
}

/**
 * Fetch paginated approved tasks
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 */
export async function fetchApprovedTasksPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')
    .range(start, end);

  if (error) {
    return { error: 'Failed to fetch approved tasks: ' + error.message, data: undefined };
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return {
    error: null,
    data: {
      data: data as VerificationRequest[],
      count: count || 0,
      totalPages,
    },
  };
}

export async function fetchDeniedTasks(): Promise<ServerActionResponse<VerificationRequest[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('status', 'rejected');

  if (error) {
    return { error: 'Failed to fetch rejected tasks: ' + error.message, data: undefined };
  }

  return { error: null, data: data as VerificationRequest[] };
}

/**
 * Fetch paginated denied/rejected tasks
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 */
export async function fetchDeniedTasksPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .eq('status', 'rejected')
    .range(start, end);

  if (error) {
    return { error: 'Failed to fetch rejected tasks: ' + error.message, data: undefined };
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return {
    error: null,
    data: {
      data: data as VerificationRequest[],
      count: count || 0,
      totalPages,
    },
  };
}

export async function approveTaskAction(id: string) {
  const supabase = await createClient();

  // First update the task
  const { error: updateError } = await supabase
    .from('KPITask')
    .update({ status: 'approved' })
    .eq('id', id);

  if (updateError) {
    return { error: 'Failed to approve task: ' + updateError.message, data: undefined };
  }


}

export async function rejectTaskAction(id: string) {
  const supabase = await createClient();

  // First update the task
  const {data,  error: updateError } = await supabase
    .from('KPITask')
    .update({ status: 'rejected' })
    .eq('id', id.trim())
    .select()

    console.log("id: ",id)
  if (updateError) {
    return { error: 'Failed to reject task: ' + updateError.message, data: undefined };
  }

}
