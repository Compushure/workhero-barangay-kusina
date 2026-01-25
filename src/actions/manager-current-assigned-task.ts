'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, Task, Employee, PaginatedResponse } from '@/types';

/**
 * Toggle between Task View and Employee View
 */
export async function toggleViewAction(): Promise<ServerActionResponse<'list' | 'employee'>> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('toggle_user_default_view');

  if (error) return { error: 'Failed to toggle view: ' + error.message, data: undefined };

  // Validate response
  if (!data || (data !== 'list' && data !== 'employee')) {
    return { error: 'Unexpected RPC result', data: undefined };
  }

  return { error: null, data: data as 'list' | 'employee' };
}

/**
 * Clear all tasks and employees
 */
export async function clearAllTasksAction(): Promise<ServerActionResponse<number>> {
  const supabase = await createClient();

  // Calls server-side admin RPC which checks admin claim
  const { data, error } = await supabase.rpc('clear_all_tasks_admin');

  if (error) return { error: 'Failed to clear tasks: ' + error.message, data: undefined };

  return { error: null, data: data as number };
}

/**
 * Remove an employee from a specific task
 */
export async function removeEmployeeFromTaskAction(
  taskId: string,
  employeeId: string
): Promise<ServerActionResponse<Task>> {
  const supabase = await createClient();

  const { error: rpcError } = await supabase.rpc('remove_employee_from_task', {
    p_task_id: taskId,
    p_employee_id: employeeId,
  });

  if (rpcError) return { error: 'Failed to remove employee: ' + rpcError.message, data: undefined };

  const { data: updatedTask, error: fetchError } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('id', taskId)
    .single();

  if (fetchError)
    return { error: 'Failed to fetch updated task: ' + fetchError.message, data: undefined };

  return { error: null, data: updatedTask as Task };
}

/**
 * Delete a task card
 */
export async function deleteTaskAction(taskId: string): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const { error } = await supabase.from('KPITask').delete().eq('id', taskId);

  if (error) return { error: 'Failed to delete task: ' + error.message, data: undefined };

  return { error: null, data: true };
}

/**
 * Fetch task for editing (modal)
 */
export async function editTaskAction(taskId: string): Promise<ServerActionResponse<Task>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) return { error: 'Failed to fetch task: ' + error.message, data: undefined };

  return { error: null, data: data as Task };
}

/**
 * Save edits to a task (employee assignment, due date)
 */
export async function saveTaskEditAction(
  taskId: string,
  updatedData: Partial<Task>
): Promise<ServerActionResponse<Task>> {
  const supabase = await createClient();

  const { error } = await supabase.from('KPITask').update(updatedData).eq('id', taskId);

  if (error) return { error: 'Failed to save edits: ' + error.message, data: undefined };

  const { data: updatedTask, error: fetchError } = await supabase
    .from('task_info_view')
    .select('*')
    .eq('id', taskId)
    .single();

  if (fetchError)
    return { error: 'Failed to fetch updated task: ' + fetchError.message, data: undefined };

  return { error: null, data: updatedTask as Task };
}

/**
 * Remove a task from an employee card
 */
export async function removeTaskFromEmployeeAction(
  employeeId: string,
  taskId: string
): Promise<ServerActionResponse<Employee>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('TaskAssignments')
    .delete()
    .match({ employee_id: employeeId, task_id: taskId });

  if (error) return { error: 'Failed to remove task: ' + error.message, data: undefined };

  const { data: updatedEmployee, error: fetchError } = await supabase
    .from('employee_info_view')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (fetchError)
    return { error: 'Failed to fetch updated employee: ' + fetchError.message, data: undefined };

  return { error: null, data: updatedEmployee as Employee };
}

/**
 * Clear all tasks assigned to an employee
 */
export async function clearEmployeeTasksAction(
  employeeId: string
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const { error } = await supabase.from('TaskAssignments').delete().eq('employee_id', employeeId);

  if (error) return { error: 'Failed to clear employee tasks: ' + error.message, data: undefined };

  return { error: null, data: true };
}

/**
 * Paginated fetch of tasks
 */
export async function fetchTasksPaginated(
  page: number = 1,
  pageSize: number = 8
): Promise<ServerActionResponse<PaginatedResponse<Task>>> {
  const supabase = await createClient();

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('task_info_view')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (error) return { error: 'Failed to fetch tasks: ' + error.message, data: undefined };

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return {
    error: null,
    data: { data: data as Task[], count: count || 0, totalPages },
  };
}

/**
 * Paginated fetch of employees
 */
export async function fetchEmployeesPaginated(
  page: number = 1,
  pageSize: number = 8
): Promise<ServerActionResponse<PaginatedResponse<Employee>>> {
  const supabase = await createClient();

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('employee_info_view')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (error) return { error: 'Failed to fetch employees: ' + error.message, data: undefined };

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return {
    error: null,
    data: { data: data as Employee[], count: count || 0, totalPages },
  };
}
