'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';
import type { AssignedTask, AssignedEmployee } from '@/types';

/**
 * Fetch paginated current assigned tasks
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param sortBy - Sort order option
 * @param searchTerm - Optional search term for filtering tasks by name
 */
export async function fetchCurrentAssignedTasksPaginated(
  page: number = 1,
  pageSize: number = 4,
  sortBy: string = 'recently added',
  searchTerm: string = ''
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
      'status, kpitask_id, category_id, category_name, category_description, category_points, max_orders, pending_orders, assigned_to, assigned_to_name, assigned_to_employee_id, completed_orders, kpitask_created_at, k_deadline_date'
    )
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
    pendingOrders?: number;
    assignedEmployees: AssignedEmployee[];
    sortKey: string; // For maintaining sort order
  }>();

  (allSortedData ?? []).forEach((row: any) => {
    const employee: AssignedEmployee = {
      id: row.assigned_to ?? '',
      name: row.assigned_to_name ?? '',
      empId: row.assigned_to_employee_id ?? '',
      assignedTasks: [],
      completedOrders: row.completed_orders ?? 0,
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
        taskType: row.category_description || '',
        isRepeatable: true,
        points: row.category_points,
        xp: row.category_points,
        status: row.status || 'assigned',
        dateRange: {
          start: row.kpitask_created_at,
          end: row.k_deadline_date,
        },
        maxOrders: row.max_orders ?? 1,
        pendingOrders: row.pending_orders,
        assignedEmployees: [employee],
        sortKey: row[orderByColumn] // Store the sort key
      });
    }
  });

  // Convert to array and maintain sort order
  const allTasks = Array.from(taskGroups.values());
  
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
  pageSize: number = 4,
  sortBy: string = 'recently added',
  searchTerm: string = ''
): Promise<
  ServerActionResponse<{
    data: AssignedTask[];
    count: number;
    totalPages: number;
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
      'status, kpitask_id, category_id, category_name, category_description, category_points, max_orders, pending_orders, assigned_to, assigned_to_name, assigned_to_employee_id, completed_orders, kpitask_created_at, k_deadline_date'
    )
    // Only include employees with currently assigned tasks
    .not('assigned_to', 'is', null);

  // Apply search filter if provided (search by employee name or employee ID)
  if (searchTerm && searchTerm.trim()) {
    const trimmedSearch = searchTerm.trim();
    query = query.or(`assigned_to_name.ilike.%${trimmedSearch}%,assigned_to_employee_id.ilike.%${trimmedSearch}%`);
  }

  const { data: allSortedData, error } = await query.order(orderByColumn, { ascending });

  if (error) {
    return { error: 'Failed to fetch assigned tasks: ' + error.message, data: undefined };
  }

  // Group assignments by employee to get their latest task date and sort key
  const employeeGroups = new Map<string, {
    id: string;
    name: string;
    empId: string;
    latestDate: string;
    sortKey: string; // For maintaining sort order
    firstAssignment: any; // Store first assignment for task details
  }>();
  
  (allSortedData ?? []).forEach((row: any) => {
    const empId = row.assigned_to;
    const currentLatest = employeeGroups.get(empId)?.latestDate || '';
    
    // Keep the latest (most recent) task assignment date for each employee
    if (row.kpitask_created_at > currentLatest || !employeeGroups.has(empId)) {
      employeeGroups.set(empId, {
        id: empId,
        name: row.assigned_to_name || '',
        empId: row.assigned_to_employee_id || '',
        latestDate: row.kpitask_created_at,
        sortKey: row[orderByColumn], // Store the sort key
        firstAssignment: row // Store the first assignment for task details
      });
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
      },
    };
  }

  // Create the final result - one entry per employee with their task details
  const result: AssignedTask[] = employeesForPage.map((employee) => {
    const employeeData: AssignedEmployee = {
      id: employee.id,
      name: employee.name,
      empId: employee.empId,
      assignedTasks: [],
      completedOrders: employee.firstAssignment?.completed_orders ?? 0,
    };

    return {
      id: employee.firstAssignment?.kpitask_id || employee.id,
      taskId: employee.firstAssignment?.category_id || '',
      taskName: employee.firstAssignment?.category_name || 'Unnamed Task',
      taskType: employee.firstAssignment?.category_description || '',
      isRepeatable: true,
      points: employee.firstAssignment?.category_points || 0,
      xp: employee.firstAssignment?.category_points || 0,
      status: employee.firstAssignment?.status || 'assigned',
      dateRange: {
        start: employee.firstAssignment?.kpitask_created_at || employee.latestDate,
        end: employee.firstAssignment?.k_deadline_date || '',
      },
      maxOrders: employee.firstAssignment?.max_orders ?? 1,
      pendingOrders: employee.firstAssignment?.pending_orders,
      assignedEmployees: [employeeData],
    };
  });

  return {
    error: null,
    data: {
      data: result,
      count: totalCount,
      totalPages,
    },
  };
}

export async function clearAllTasks(): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();
  // Delete all KPITask entries that are not in 'done' status (i.e., all active assignments)
  const { error } = await supabase
    .from('KPITask')
    .delete()
    .in('status', ['assigned', 'in review', 'rejected', 'approved']);

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
