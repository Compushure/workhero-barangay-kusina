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
    completedAttempts: row.completed_attempts ?? 0,
  };

  return {
    id: row.kpitask_id,
    taskId: row.category_id,
    taskName: row.category_name,
    taskType: row.category_description,
    isRepeatable: row.is_repeatable ?? true,
    points: row.category_points,
    xp: 0,
    dateRange: {
      start: row.kpitask_created_at,
      end: row.k_deadline_date,
    },
    maxAttempts: row.max_attempts,
    pendingAttempts: row.pending_attempts,
    assignedEmployees: [employee],
  };
}

export async function fetchCurrentAssignedTasks(): Promise<ServerActionResponse<AssignedTask[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('task_info_view').select('*');

  if (error) return { error: error.message, data: undefined };

  const tasks = (data ?? []).map(mapRow);
  return { error: null, data: tasks };
}

export async function clearAllTasks(): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase.from('KPITask').delete().neq('status', 'done'); // adjust status

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

export async function deleteTask(taskId: string): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase.from('KPITask').delete().eq('id', taskId);

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}
