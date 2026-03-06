'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';
import type { AssignedTask, AssignedEmployee } from '@/types';
import { insertNotification } from '@/lib/notifications';

/**
 * Fetch paginated current assigned tasks
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param sortBy - Sort order option
 * @param searchTerm - Optional search term for filtering tasks by name
 */
export async function fetchCurrentAssignedTasksPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'recently added',
  searchTerm: string = ''
): Promise<
  ServerActionResponse<{
    data: AssignedTask[];
    count: number;
    totalPages: number;
    employeeCount: number;
  }>
> {
  const supabase = await createClient();

  // Calculate range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Determine sort order for database query
  let orderByColumn = 'kpitask_created_at';
  let ascending = false;

  switch (sortBy) {
    case 'oldest':
      orderByColumn = 'kpitask_created_at';
      ascending = true;
      break;
    case 'recently added':
      orderByColumn = 'kpitask_created_at';
      ascending = false;
      break;
    case 'closest':
      orderByColumn = 'k_deadline_date';
      ascending = true;
      break;
    case 'farthest':
      orderByColumn = 'k_deadline_date';
      ascending = false;
      break;
    default:
      orderByColumn = 'kpitask_created_at';
      ascending = false;
  }

  // First, get ALL data sorted properly for grouping with optional search filtering
  let query = supabase
    .from('task_info_view')
    .select(
      'status, kpitask_id, category_id, category_name, category_description, category_points, category_xp, max_orders, pending_orders, assigned_to, assigned_to_name, assigned_to_employee_id, completed_orders, kpitask_created_at, k_deadline_date'
    );
  // .eq('status', 'assigned');
  // Only include currently assigned tasks

  // Apply search filter if provided
  if (searchTerm && searchTerm.trim()) {
    query = query.ilike('category_name', `%${searchTerm.trim()}%`);
  }

  const { data: allSortedData, error: allError } = await query.order(orderByColumn, { ascending });

  if (allError) {
    return { error: 'Failed to fetch assigned tasks: ' + allError.message, data: undefined };
  }

  // Group assignments by task first
  const taskGroups = new Map<
    string,
    {
      id: string;
      taskId: string;
      taskName: string;
      taskDescription: string;
      isRepeatable: boolean;
      points: number;
      xp: number;
      status?: string;
      dateRange: {
        start: string;
        end: string;
      };
      maxOrders: number;
      pendingOrders?: number;
      assignedEmployees: AssignedEmployee[];
      sortKey: string; // For maintaining sort order
    }
  >();

  (allSortedData ?? []).forEach((row: any) => {
    const employee: AssignedEmployee = {
      assignmentId: row.kpitask_id,
      id: row.assigned_to ?? '',
      name: row.assigned_to_name ?? '',
      empId: row.assigned_to_employee_id ?? '',
      assignedTasks: [],
      pendingOrders: row.pending_orders ?? 0,
      completedOrders: row.completed_orders ?? 0,
      status: row.status || 'assigned',
    };

    const key = `${row.category_id}-${row.kpitask_created_at}-${row.k_deadline_date}-${row.max_orders}`;

    if (taskGroups.has(key)) {
      const existingTask = taskGroups.get(key)!;
      existingTask.assignedEmployees.push(employee);
    } else {
      taskGroups.set(key, {
        id: row.kpitask_id,
        taskId: row.category_id,
        taskName: row.category_name || 'Unnamed Task',
        taskDescription: row.category_description || '',
        isRepeatable: true,
        points: row.category_points,
        xp: row.category_xp,
        status: row.status || 'assigned',
        dateRange: {
          start: row.kpitask_created_at,
          end: row.k_deadline_date,
        },
        maxOrders: row.max_orders ?? 1,
        pendingOrders: row.pending_orders,
        assignedEmployees: [employee],
        sortKey: row[orderByColumn], // Store the sort key
      });
    }
  });

  // Convert to array and maintain sort order
  const allTasks = Array.from(taskGroups.values());

  const uniqueEmployeeIds = new Set<string>();
  allTasks.forEach((task) => {
    (task.assignedEmployees ?? []).forEach((emp) => {
      if (emp.id) uniqueEmployeeIds.add(emp.id);
    });
  });
  const employeeCount = uniqueEmployeeIds.size;

  // Apply final sorting based on the sort key to maintain order
  allTasks.sort((a, b) => {
    const aVal = a.sortKey;
    const bVal = b.sortKey;
    if (ascending) {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  const totalCount = allTasks.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Apply pagination to the sorted and grouped results
  const paginatedTasks = allTasks.slice(start, end + 1);

  // Remove sortKey from final result
  const finalTasks = paginatedTasks.map(({ sortKey, ...task }) => task);

  return {
    error: null,
    data: {
      data: finalTasks,
      count: totalCount,
      totalPages,
      employeeCount,
    },
  };
}

/**
 * Fetch paginated current assigned tasks for EMPLOYEE view
 * Groups by employee instead of task for proper employee pagination
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param sortBy - Sort order option
 * @param searchTerm - Optional search term for filtering employees by name or employee ID
 */
export async function fetchCurrentAssignedEmployeesPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'recently added',
  searchTerm: string = ''
): Promise<
  ServerActionResponse<{
    data: AssignedTask[];
    count: number;
    totalPages: number;
    taskCount: number;
  }>
> {
  const supabase = await createClient();

  // Determine sort order for database query
  let orderByColumn = 'assigned_to_name';
  let ascending = true;

  switch (sortBy) {
    case 'oldest':
      orderByColumn = 'kpitask_created_at';
      ascending = true;
      break;
    case 'recently added':
      orderByColumn = 'kpitask_created_at';
      ascending = false;
      break;
    case 'name-asc':
      orderByColumn = 'assigned_to_name';
      ascending = true;
      break;
    case 'name-desc':
      orderByColumn = 'assigned_to_name';
      ascending = false;
      break;
    default:
      orderByColumn = 'kpitask_created_at';
      ascending = false;
  }

  // Get ALL employee assignments sorted properly for grouping with optional search filtering
  let query = supabase
    .from('task_info_view')
    .select(
      'status, kpitask_id, category_id, category_name, category_description, category_points, category_xp, max_orders, pending_orders, assigned_to, assigned_to_name, assigned_to_employee_id, completed_orders, kpitask_created_at, k_deadline_date'
    )
    // Only include employees with currently assigned tasks
    .not('assigned_to', 'is', null);
  // .eq('status', 'assigned');

  // Apply search filter if provided (search by employee name or employee ID)
  if (searchTerm && searchTerm.trim()) {
    const trimmedSearch = searchTerm.trim();
    query = query.or(
      `assigned_to_name.ilike.%${trimmedSearch}%,assigned_to_employee_id.ilike.%${trimmedSearch}%`
    );
  }

  const { data: allSortedData, error } = await query.order(orderByColumn, { ascending });

  if (error) {
    return { error: 'Failed to fetch assigned tasks: ' + error.message, data: undefined };
  }

  const uniqueTaskKeys = new Set<string>();
  (allSortedData ?? []).forEach((row: any) => {
    if (!row.assigned_to) return;
    uniqueTaskKeys.add(
      `${row.category_id}-${row.kpitask_created_at}-${row.k_deadline_date}-${row.max_orders}`
    );
  });
  const taskCount = uniqueTaskKeys.size;

  // Group assignments by employee to get their latest task date and sort key
  const employeeGroups = new Map<
    string,
    {
      id: string;
      name: string;
      empId: string;
      latestDate: string;
      sortKey: string;
      assignments: any[]; // Store ALL assignments for this employee
    }
  >();

  (allSortedData ?? []).forEach((row: any) => {
    const empId = row.assigned_to;

    if (!employeeGroups.has(empId)) {
      employeeGroups.set(empId, {
        id: empId,
        name: row.assigned_to_name || '',
        empId: row.assigned_to_employee_id || '',
        latestDate: row.kpitask_created_at,
        sortKey: row[orderByColumn],
        assignments: [],
      });
    }

    const group = employeeGroups.get(empId)!;
    group.assignments.push(row);

    // Keep track of the latest date for sorting
    if (row.kpitask_created_at > group.latestDate) {
      group.latestDate = row.kpitask_created_at;
      group.sortKey = row[orderByColumn];
    }
  });

  // Convert to array and maintain sort order
  const sortedEmployees = Array.from(employeeGroups.values());

  // Apply final sorting based on the sort key to maintain order
  sortedEmployees.sort((a, b) => {
    const aVal = a.sortKey;
    const bVal = b.sortKey;
    if (ascending) {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  const totalCount = sortedEmployees.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate range for pagination based on SORTED employees
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Get the specific employees for this page from the SORTED list
  const employeesForPage = sortedEmployees.slice(start, end + 1);

  if (employeesForPage.length === 0) {
    return {
      error: null,
      data: {
        data: [],
        count: totalCount,
        totalPages,
        taskCount,
      },
    };
  }

  // Create the final result - one entry per employee with ALL their tasks
  const result: AssignedTask[] = employeesForPage.flatMap((employee) => {
    // Group this employee's assignments by task (category_id + created_at + deadline_date)
    const taskGroups = new Map<
      string,
      {
        taskKey: string;
        categoryId: string;
        categoryName: string;
        categoryDescription: string;
        categoryPoints: number;
        categoryXP: number;
        pendingOrders: number;
        maxOrders: number;
        createdAt: string;
        deadlineDate: string;
        status: string;
        assignments: any[];
      }
    >();

    employee.assignments.forEach((assignment: any) => {
      const taskKey = `${assignment.category_id}_${assignment.kpitask_created_at}_${assignment.k_deadline_date}`;

      if (!taskGroups.has(taskKey)) {
        taskGroups.set(taskKey, {
          taskKey,
          categoryId: assignment.category_id,
          categoryName: assignment.category_name || 'Unnamed Task',
          categoryDescription: assignment.category_description || '',
          categoryPoints: assignment.category_points || 1,
          categoryXP: assignment.category_xp || 1,
          pendingOrders: assignment.pending_orders || 0,
          maxOrders: assignment.max_orders || 1,
          createdAt: assignment.kpitask_created_at,
          deadlineDate: assignment.k_deadline_date,
          status: assignment.status || 'assigned',
          assignments: [],
        });
      }

      taskGroups.get(taskKey)!.assignments.push(assignment);
    });

    // Convert each task group to an AssignedTask with this employee
    return Array.from(taskGroups.values()).map((taskGroup) => {
      const employeeData: AssignedEmployee = {
        assignmentId: taskGroup.assignments[0]?.kpitask_id,
        id: employee.id,
        name: employee.name,
        empId: employee.empId,
        assignedTasks: [],
        pendingOrders: taskGroup.assignments[0]?.pending_orders ?? 0,
        completedOrders: taskGroup.assignments[0]?.completed_orders ?? 0,
        status: taskGroup.status,
      };

      return {
        id: taskGroup.assignments[0]?.kpitask_id || taskGroup.taskKey,
        taskId: taskGroup.categoryId,
        taskName: taskGroup.categoryName,
        taskDescription: taskGroup.categoryDescription,
        isRepeatable: true,
        points: taskGroup.categoryPoints,
        xp: taskGroup.categoryXP,
        status: taskGroup.status,
        dateRange: {
          start: taskGroup.createdAt,
          end: taskGroup.deadlineDate,
        },
        maxOrders: taskGroup.maxOrders,
        pendingOrders: taskGroup.assignments[0]?.pending_orders,
        assignedEmployees: [employeeData],
      };
    });
  });

  return {
    error: null,
    data: {
      data: result,
      count: totalCount,
      totalPages,
      taskCount,
    },
  };
}

export async function clearAssignedTasks(): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  // Delete all KPITask entries that are not in 'done' status (i.e., all active assignments)
  const { error } = await supabase.from('KPITask').delete().in('status', ['assigned']);

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

export async function clearAllEmployeeTasks(
  employeeId: string
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  // Delete all KPITask entries for a specific employee
  const { error } = await supabase
    .from('KPITask')
    .delete()
    .eq('assigned_to', employeeId)
    .in('status', ['assigned']);

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

// unnassigns one employee from a task instance
export async function deleteTask(taskId: string): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase.from('KPITask').delete().eq('id', taskId);

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

// unnassigns all employees assigned to a task instace, thus delete the task instance entirely
export async function deleteTaskForAllEmployees(
  categoryId: string,
  deadlineDate: string,
  maxOrders: number,
  createdAt: string
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('KPITask')
    .delete()
    .eq('category_id', categoryId)
    .eq('deadline_date', deadlineDate)
    .eq('max_orders', maxOrders)
    .eq('created_at', createdAt);

  if (error) return { error: error.message, data: undefined };
  return { error: null, data: true };
}

/**
 * Update task assignment including max orders, deadline, and reassigning employees
 * Handles adding/removing employees from a task assignment group
 */
export async function updateTaskAssignment(
  taskId: string,
  maxOrders: number,
  newDueDate: string,
  employeeIds: string[]
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  try {
    // Validate maxOrders limit
    if (maxOrders > 99) {
      return { error: 'Maximum orders cannot exceed 99', data: undefined };
    }
    // Get the current task to find all related assignments
    const { data: currentTask, error: fetchError } = await supabase
      .from('KPITask')
      .select('category_id, created_at, deadline_date, assigned_by')
      .eq('id', taskId)
      .single();

    if (fetchError || !currentTask) {
      return { error: 'Task not found', data: undefined };
    }

    const { data: categoryRow, error: categoryError } = await supabase
      .from('KPICategory')
      .select('name')
      .eq('id', currentTask.category_id)
      .single();

    if (categoryError) {
      return { error: 'Failed to fetch task details for notification', data: undefined };
    }

    const taskName = categoryRow?.name || 'Task';

    // Find all assignments in this task group
    const { data: existingAssignments, error: groupError } = await supabase
      .from('KPITask')
      .select('id, assigned_to')
      .eq('category_id', currentTask.category_id)
      .eq('created_at', currentTask.created_at)
      .eq('deadline_date', currentTask.deadline_date);

    if (groupError) {
      return { error: groupError.message, data: undefined };
    }

    type TaskAssignment = { id: string; assigned_to: string };
    const existingEmployeeIds = new Set(
      ((existingAssignments as TaskAssignment[]) || []).map((a) => a.assigned_to)
    );
    const newEmployeeIds = new Set(employeeIds);

    // Remove employees not in the new list BEFORE updating
    const employeesToRemove = ((existingAssignments as TaskAssignment[]) || [])
      .filter((a) => !newEmployeeIds.has(a.assigned_to))
      .map((a) => a.id);

    if (employeesToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('KPITask')
        .delete()
        .in('id', employeesToRemove);

      if (deleteError) {
        return { error: deleteError.message, data: undefined };
      }
    }

    // Update max_orders and deadline for remaining assignments
    const employeesToKeep = ((existingAssignments as TaskAssignment[]) || [])
      .filter((a) => newEmployeeIds.has(a.assigned_to))
      .map((a) => a.id);

    if (employeesToKeep.length > 0) {
      const { error: updateError } = await supabase
        .from('KPITask')
        .update({
          max_orders: maxOrders,
          deadline_date: newDueDate,
        })
        .in('id', employeesToKeep);

      if (updateError) {
        return { error: updateError.message, data: undefined };
      }
    }

    // Add new employees
    const employeesToAdd = employeeIds.filter((empId) => !existingEmployeeIds.has(empId));

    if (employeesToAdd.length > 0) {
      const newAssignments = employeesToAdd.map((empId) => ({
        assigned_by: currentTask.assigned_by,
        assigned_to: empId,
        category_id: currentTask.category_id,
        status: 'assigned',
        created_at: currentTask.created_at,
        deadline_date: newDueDate,
        max_orders: maxOrders,
      }));

      const { data: insertedRows, error: insertError } = await supabase
        .from('KPITask')
        .insert(newAssignments)
        .select('id, assigned_to, deadline_date, max_orders, category_id');

      if (insertError) {
        return { error: insertError.message, data: undefined };
      }

      if (insertedRows?.length) {
        await Promise.all(
          insertedRows.map((row: any) =>
            insertNotification({
              userId: row.assigned_to,
              type: 'task',
              message: `You have been assigned to a task: ${taskName}`,
              metadata: {
                taskId: row.id,
                categoryId: row.category_id,
                taskName,
                deadline: row.deadline_date,
                maxOrders: row.max_orders,
              },
            })
          )
        );
      }
    }

    return { error: null, data: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update task assignment', data: undefined };
  }
}
