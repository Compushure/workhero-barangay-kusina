'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';
import type { AssignedTask, AssignedEmployee } from '@/types';

function mapRow(row: any): AssignedTask {
  const employee: AssignedEmployee = {
    id: row.assigned_to ?? '',
    name: row.assigned_to_name ?? '',
    empId: row.assigned_to_employee_id ?? '',
    assignedTasks: [],
    completedOrders: row.completed_orders ?? 0,
  };

  return {
    id: row.kpitask_id,
    taskId: row.category_id,
    taskName: row.category_name || 'Unnamed Task',
    taskType: row.category_description || '',
    isRepeatable: row.is_repeatable ?? true,
    points: row.category_points,
    xp: row.category_points, // assuming xp is same as points for now
    dateRange: {
      start: row.kpitask_created_at,
      end: row.k_deadline_date,
    },
    maxOrders: row.max_orders ?? 1,
    pendingOrders: row.pending_orders,
    assignedEmployees: [employee],
  };
}

/**
 * Fetch paginated current assigned tasks
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 */
export async function fetchCurrentAssignedTasksPaginated(
  page: number = 1,
  pageSize: number = 5
): Promise<
  ServerActionResponse<{
    data: AssignedTask[];
    count: number;
    totalPages: number;
  }>
> {
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('task_info_view_temp')
    .select('*', { count: 'exact' })
    .range(start, end);

  if (error) {
    return { error: 'Failed to fetch assigned tasks: ' + error.message, data: undefined };
  }

  const tasks = (data ?? []).map(mapRow);
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return {
    error: null,
    data: {
      data: tasks,
      count: count || 0,
      totalPages,
    },
  };
}

export async function clearAllTasks(): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase.from('KPITask').delete().neq('status', 'done');

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

export async function deleteTask(taskId: string): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase.from('KPITask').delete().eq('id', taskId);

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

/**
 * ✅ New: Update task assignment
 */
export async function updateTaskAssignment(
  taskId: string,
  maxOrders: number,
  newDueDate: string,
  employeeIds: string[]
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  // Update the task row itself
  const { error } = await supabase
    .from('KPITask')
    .update({
      max_orders: maxOrders,
      deadline_date: newDueDate,
    })
    .eq('id', taskId);

  if (error) return { error: error.message, data: undefined };

  // ⚠️ If employees are modeled as separate KPITask rows, you’d also handle reassignments here
  // For now, we just update the task metadata

  return { error: null, data: true };
}
