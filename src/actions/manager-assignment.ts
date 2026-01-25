'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, Task, AssignedEmployee } from '@/types';
// import { assignTaskToMultipleEmployeesSchema } from '@/zod/schemas/task-assignment';

/**
 * Fetch all available tasks for assignment
 */
export async function fetchTaskList(): Promise<ServerActionResponse<Task[]>> {
  try {
    const supabase = await createClient();

    // Fetch all tasks from KPICategory table (assuming tasks are managed there)
    // Adjust based on actual table structure
    const { data, error } = await supabase
      .from('KPICategory')
      .select('id, name, points, is_repeatable, type')
      .order('type', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return { error: `Failed to fetch tasks: ${error.message}` };
    }

    // Transform database response to match Task type
    const tasks: Task[] = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type, // we can add task_type column in schema if we could, or just remove this data column entirely
      isRepeatable: item.is_repeatable,
      points: item.points,
      xp: item.points,
      maxAttempts: 1,
    }));

    return { error: null, data: tasks };
  } catch (error) {
    console.error('Error in fetchTaskList:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching tasks' };
  }
}

/**
 * Fetch all active employees for task assignment
 */
export async function fetchEmployeeList(): Promise<ServerActionResponse<AssignedEmployee[]>> {
  try {
    const supabase = await createClient();

    // Fetch all users with role information
    const { data, error } = await supabase
      .from('user_attributes')
      .select('user_id, user_name, employee_id')
      .eq('employment_status', 'regular')
      .order('user_id', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      return { error: `Failed to fetch employees: ${error.message}` };
    }

    // Transform database response to match AssignedEmployee type
    const employees: AssignedEmployee[] = (data || []).map((item) => ({
      id: item.user_id,
      name: item.user_name,
      empId: item.employee_id || '',
      tenure: undefined,
      assignedTasks: [],
      completedAttempts: 0,
    }));

    return { error: null, data: employees };
  } catch (error) {
    console.error('Error in fetchEmployeeList:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching employees' };
  }
}

/**
 * Assign a task to employees
 */
export async function addTaskAssignmentAction(
  taskId: string,
  employeeIds: string[],
  startDate: string,
  endDate: string,
  maxAttempts?: number
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();
    
    // 1. Check for existing active assignments for these employees in THIS task category
    const { data: existing, error: checkError } = await supabase
      .from('KPITask')
      .select('assigned_to')
      .eq('category_id', taskId)
      .in('assigned_to', employeeIds)
      .not('status', 'eq', 'completed'); // Only block if they haven't finished the old one

    if (checkError) throw checkError;

    // 2. Identify who is already busy
    const busyEmployeeIds = new Set(existing?.map(e => e.assigned_to) || []);
    const validEmployeeIds = employeeIds.filter(id => !busyEmployeeIds.has(id));

    if (validEmployeeIds.length === 0) {
      return { error: 'All selected employees are already assigned to an active instance of this task.' };
    }

    // 3. Proceed with valid assignments only
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { error: 'Unauthorized' };

    const assignments = validEmployeeIds.map((empId) => ({
      assigned_by: user.id,
      assigned_to: empId,
      category_id: taskId,
      status: 'pending',
      created_at: startDate,
      deadline_date: endDate,
      max_attempts: maxAttempts || 1,
    }));

    const { error: insertError } = await supabase.from('KPITask').insert(assignments);
    
    if (insertError) throw insertError;
    return { error: null, data: undefined };

  } catch (error: any) {
    return { error: error.message || 'Failed to assign tasks' };
  }
}
