'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, VerificationRequest, PaginatedResponse } from '@/types';
import { insertNotification } from '@/lib/notifications';

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

type VerificationSort = 'date-desc' | 'date-asc' | 'employee-asc' | 'employee-desc';

function applySearchAndSort(query: any, searchTerm: string, sort: VerificationSort): any {
  const normalizedSearch = searchTerm.trim();
  if (normalizedSearch) {
    query = query.or(
      `assigned_to_name.ilike.%${normalizedSearch}%,assigned_to_employee_id.ilike.%${normalizedSearch}%,category_name.ilike.%${normalizedSearch}%`
    );
  }

  switch (sort) {
    case 'employee-asc':
      return query.order('assigned_to_name', { ascending: true, nullsLast: true });
    case 'employee-desc':
      return query.order('assigned_to_name', { ascending: false, nullsLast: true });
    case 'date-asc':
      return query
        .order('kpitask_verification_requested_at', { ascending: true, nullsLast: true })
        .order('kpitask_created_at', { ascending: true, nullsLast: true });
    case 'date-desc':
    default:
      return query
        .order('kpitask_verification_requested_at', { ascending: false, nullsLast: true })
        .order('kpitask_created_at', { ascending: false, nullsLast: true });
  }
}

export async function fetchTasksToReviewPaginated(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = '',
  sort: VerificationSort = 'date-desc'
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .eq('status', 'in review');

  query = applySearchAndSort(query, searchTerm, sort).range(start, end);

  const { data, error, count } = await query;

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
  pageSize: number = 10,
  searchTerm: string = '',
  sort: VerificationSort = 'date-desc'
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .eq('status', 'approved');

  query = applySearchAndSort(query, searchTerm, sort).range(start, end);

  const { data, error, count } = await query;

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
  pageSize: number = 10,
  searchTerm: string = '',
  sort: VerificationSort = 'date-desc'
): Promise<ServerActionResponse<PaginatedResponse<VerificationRequest>>> {
  const supabase = await createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .eq('status', 'rejected');

  query = applySearchAndSort(query, searchTerm, sort).range(start, end);

  const { data, error, count } = await query;

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

  // Approving a submission keeps pending_orders for the employee claim flow.
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

  if (updatedTask?.assigned_to) {
    await insertNotification({
      userId: updatedTask.assigned_to,
      type: 'task',
      message:
        'Your task submission has been approved! Check the remarks section for any additional notes.',
      metadata: {
        taskId: kpitask_id,
        taskName: updatedTask.category_name ?? 'Task',
        status: updatedTask.status,
        remark: updatedTask.remark,
      },
    });
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

  if (rejectedTask?.assigned_to) {
    await insertNotification({
      userId: rejectedTask.assigned_to,
      type: 'task',
      message: 'Your task submission has been rejected. Check the remarks section to see why.',
      metadata: {
        taskId: kpitask_id,
        taskName: rejectedTask.category_name ?? 'Task',
        status: rejectedTask.status,
        remark: rejectedTask.remark,
      },
    });
  }

  return { error: null, data: rejectedTask as VerificationRequest };
}
