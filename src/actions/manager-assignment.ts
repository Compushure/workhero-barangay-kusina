'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse, Task, AssignedEmployee, AssignedTask } from '@/types';
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
      maxOrders: 1,
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
      .eq('role_type', 'regular')
      .order('employee_id', { ascending: true });

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
      completedOrders: 0,
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
 * Assign a task to employees and return the created assignment data
 */
export async function addTaskAssignmentAction(
  taskId: string,
  employeeIds: string[],
  startDate: string,
  endDate: string,
  maxOrders?: number
): Promise<ServerActionResponse<AssignedTask[]>> {
  try {
    const supabase = await createClient();

    // First, get the task details from KPICategory
    const { data: taskData, error: taskError } = await supabase
      .from('KPICategory')
      .select('id, name, type, is_repeatable, points')
      .eq('id', taskId)
      .single();

    if (taskError || !taskData) {
      return { error: `Task not found: ${taskError?.message || 'Unknown error'}`, data: undefined };
    }

    // Get employee details
    const { data: employeeData, error: employeeError } = await supabase
      .from('user_attributes')
      .select('user_id, user_name, employee_id')
      .in('user_id', employeeIds);

    if (employeeError) {
      return { error: `Failed to fetch employee data: ${employeeError.message}`, data: undefined };
    }

    // Check for existing active assignments for these employees in THIS task category
    const { data: existing, error: checkError } = await supabase
      .from('KPITask')
      .select('assigned_to')
      .eq('category_id', taskId)
      .in('assigned_to', employeeIds)
      .in('status', ['assigned', 'in review', 'rejected', 'approved']); // Only check active assignments

    if (checkError) throw checkError;

    // Identify who is already busy
    const busyEmployeeIds = new Set(existing?.map(e => e.assigned_to) || []);
    const validEmployeeIds = employeeIds.filter(id => !busyEmployeeIds.has(id));

    if (validEmployeeIds.length === 0) {
      return { error: 'All selected employees are already assigned to an active instance of this task.', data: undefined };
    }

    // Proceed with valid assignments only
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { error: 'Unauthorized', data: undefined };

    const assignments = validEmployeeIds.map((empId) => ({
      assigned_by: user.id,
      assigned_to: empId,
      category_id: taskId,
      status: 'assigned',
      created_at: startDate,
      deadline_date: endDate,
      max_orders: maxOrders || 1,
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from('KPITask')
      .insert(assignments)
      .select();

    if (insertError) throw insertError;

    // Group assignments by task to create one AssignedTask with multiple employees
    const taskGroups = new Map<string, {
      id: string;
      taskId: string;
      taskName: string;
      taskType: string;
      isRepeatable: boolean;
      points: number;
      xp: number;
      status?: string;
      dateRange: {
        start: string;
        end: string;
      };
      maxOrders: number;
      assignedEmployees: AssignedEmployee[];
    }>();

    (insertedData || []).forEach((row) => {
      const employee = (employeeData as any[])?.find((emp: any) => emp.user_id === row.assigned_to);
      if (!employee) return; // Skip if employee data not found
      
      const assignedEmployee: AssignedEmployee = {
        id: employee.user_id,
        name: employee.user_name || 'Unknown Employee',
        empId: employee.employee_id || '',
        assignedTasks: [],
        completedOrders: 0,
      };

      const key = `${row.category_id}-${row.created_at}-${row.deadline_date}-${row.max_orders}`;
      
      if (taskGroups.has(key)) {
        // Add employee to existing task group
        const existingTask = taskGroups.get(key)!;
        existingTask.assignedEmployees.push(assignedEmployee);
      } else {
        // Create new task group
        taskGroups.set(key, {
          id: row.id, // Use the first assignment's ID as the group ID
          taskId: row.category_id,
          taskName: taskData.name,
          taskType: taskData.type || 'General',
          isRepeatable: taskData.is_repeatable,
          points: taskData.points,
          xp: taskData.points,
          status: 'assigned',
          dateRange: {
            start: row.created_at,
            end: row.deadline_date,
          },
          maxOrders: row.max_orders || 1,
          assignedEmployees: [assignedEmployee],
        });
      }
    });

    const assignedTasks = Array.from(taskGroups.values());

    return { error: null, data: assignedTasks };
  } catch (error: any) {
    return { error: error.message || 'Failed to assign tasks', data: undefined };
  }
}
