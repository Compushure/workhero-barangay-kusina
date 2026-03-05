'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ServerActionResponse,
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

export async function fetchTasksToReviewPaginated(
  page: number = 1,
  pageSize: number = 8
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();
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
    data: { data: data as VerificationRequest[], count: count || 0, totalPages },
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

export async function fetchApprovedTasksPaginated(
  page: number = 1,
  pageSize: number = 8
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();
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
    data: { data: data as VerificationRequest[], count: count || 0, totalPages },
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

export async function fetchDeniedTasksPaginated(
  page: number = 1,
  pageSize: number = 8
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();
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
    data: { data: data as VerificationRequest[], count: count || 0, totalPages },
  };
}

export async function approveTaskAction(
  kpitask_id: string,
  reqmark: string
): Promise<ServerActionResponse<VerificationRequest>> {
  const supabase = await createClient();

  const { data: taskData, error: taskError } = await supabase
    .from('task_info_view')
    .select('completed_orders, pending_orders, max_orders')
    .eq('kpitask_id', kpitask_id)
    .single();

  if (taskError) {
    return { error: 'Failed to fetch task details: ' + taskError.message, data: undefined };
  }

  // This is what I fixed - Always update status to approved, increment completed_orders, reset pending_orders, and include remark.
  const newCompleted = (taskData.completed_orders ?? 0) + (taskData.pending_orders ?? 1);

  const { error: updateError } = await supabase
    .from('KPITask')
    .update({
      status: 'approved',
      remark: reqmark,            
      completed_orders: newCompleted,
    })
    .eq('id', kpitask_id);

  if (updateError) {
    return { error: 'Failed to approve task: ' + updateError.message, data: undefined };
  }


  // if ((taskData.max_orders >= taskData.completed_orders + 1) && (taskData.pending_orders <= taskData.max_orders - taskData.completed_orders)) {
  //   const { error: updateError } = await supabase
  //     .from('KPITask')
  //     .update({ 
  //       status: 'approved', 
  //       remark: reqmark ,
  //       completed_orders: taskData.completed_orders + taskData.pending_orders, 
  //     })
  //     .eq('id', kpitask_id);

  //   if (updateError) {
  //     return { error: 'Failed to approve task: ' + updateError.message, data: undefined };
  //   }
  // } 

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

  const { error: updateError } = await supabase
    .from('KPITask')
    .update({ status: 'rejected', remark: reqmark, pending_orders: 0 })
    .eq('id', kpitask_id.trim());

  if (updateError) {
    return { error: 'Failed to reject task: ' + updateError.message, data: undefined };
  }

  const { data: rejectedTask, error: fetchError } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('kpitask_id', kpitask_id.trim())
    .single();

  if (fetchError) {
    return { error: 'Failed to fetch updated task: ' + fetchError.message, data: undefined };
  }

  return { error: null, data: rejectedTask as VerificationRequest };
}
