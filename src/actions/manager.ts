'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ServerActionResponse,
  User,
  AddUserInput,
  EditUserInput,
  UserQueryParams,
  VerificationRequest,
  PaginatedResponse,
} from '@/types';

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
  pageSize: number = 8
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
  pageSize: number = 8
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
  pageSize: number = 8
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

export async function approveTaskAction(
  kpitask_id: string,
  reqmark: string
): Promise<ServerActionResponse<VerificationRequest>> {
  const supabase = await createClient();

  // First, get task details from the view to get category_points
  const { data: taskData, error: taskError } = await supabase
    .from('task_info_view')
    .select('assigned_to, category_points, max_orders, completed_orders')
    .eq('kpitask_id', kpitask_id)
    .single();

  if (taskError) {
    return { error: 'Failed to fetch task details: ' + taskError.message, data: undefined };
  }

  // Update the task status and remark

  // if the status max_orders is == completed_orders then change to approved, else changed to assigned
   

  if (taskData.max_orders > taskData.completed_orders + 1) {
  
     const { error: assignError } = await supabase
       .from('KPITask')
       .update({ status: 'assigned', remark: reqmark , completed_orders: taskData.completed_orders + 1 })
       .eq('id', kpitask_id);

      if (assignError) {
        return { error: 'Failed to reassign task: ' + assignError.message, data: undefined };
      }
  } else{
     const { error: updateError } = await supabase
       .from('KPITask')
       .update({ status: 'approved', remark: reqmark })
       .eq('id', kpitask_id);

     if (updateError) {
       return { error: 'Failed to approve task: ' + updateError.message, data: undefined };
     }

  }

  // Update user points
  const { error: pointsError } = await supabase.rpc('increment_points_for_user', {
    target_user_id: taskData.assigned_to,
    amount: taskData.category_points,
  });


  if (pointsError) {
    return { error: 'Failed to update user points: ' + pointsError.message, data: undefined };
  }

  // Get the updated task from the view to return
  const { data: updatedTask, error: fetchError } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('kpitask_id', kpitask_id)
    .single();

  if (fetchError) {
    return { error: 'Failed to fetch updated task: ' + fetchError.message, data: undefined };
  }

  return { error: null, data: updatedTask as VerificationRequest };
}

export async function rejectTaskAction(
  kpitask_id: string,
  reqmark: string
): Promise<ServerActionResponse<VerificationRequest>> {
  const supabase = await createClient();

  // Update the task status and remark
  const { error: updateError } = await supabase
    .from('KPITask')
    .update({ status: 'rejected', remark: reqmark })
    .eq('id', kpitask_id.trim());

  if (updateError) {
    return { error: 'Failed to reject task: ' + updateError.message, data: undefined };
  }

  // Get the updated task from the view to return
  const { data: rejectedTask, error: fetchError } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('kpitask_id', kpitask_id.trim())
    .single();

  if (fetchError) {
    return { error: 'Failed to fetch updated task: ' + fetchError.message, data: undefined };
  }

  // No need to update the points for rejected tasks
  return { error: null, data: rejectedTask as VerificationRequest };
}
