'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, Task, AssignedEmployee } from '@/types';
import { assignTaskToMultipleEmployeesSchema } from '@/zod/schemas/task-assignment';

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
      .select('id, name, status')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      return { error: `Failed to fetch tasks: ${error.message}` };
    }

    // Transform database response to match Task type
    const tasks: Task[] = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      type: 'KPI', // we can add task_type column in schema if we could, or just remove this data column entirely
      isRepeatable: true,
      points: 0,
      xp: 0,
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
      .from('user_role_attribute')
      .select('user_id, user_name, role_attribute_value')
      .eq('role_attribute_name', 'employee_id')
      .order('user_id', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      return { error: `Failed to fetch employees: ${error.message}` };
    }

    // Transform database response to match AssignedEmployee type
    const employees: AssignedEmployee[] = (data || []).map((item) => ({
      id: item.user_id,
      name: item.user_name,
      empId: item.role_attribute_value || '',
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
    // Validate input manually
    if (!taskId || taskId.trim() === '') {
      return { error: 'Task ID is required' };
    }

    if (!employeeIds || employeeIds.length === 0) {
      return { error: 'At least one employee must be selected' };
    }

    if (!startDate || !endDate) {
      return { error: 'Start date and end date are required' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return { error: 'End date must be after start date' };
    }

    const supabase = await createClient();

    // Get current user (manager)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized: User not authenticated' };
    }

    // Create task assignments for each employee
    const assignments = employeeIds.map((empId) => ({
      assigned_by: user.id,
      assigned_to: empId,
      category_id: taskId,
      status: 'pending',
      start_date: startDate,
      end_date: endDate,
      max_attempts: maxAttempts || 1,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('KPITask').insert(assignments);

    if (error) {
      console.error('Error adding task assignments:', error);
      return { error: `Failed to assign tasks: ${error.message}` };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in addTaskAssignmentAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while assigning tasks' };
  }
}
