/**
 * Manager Task Assignment Types
 * ==============================
 * Types related to task assignment functionality
 */

/**
 * Task interface for task selection
 */
export interface Task {
  id: string;
  name: string;
  type: string;
  isRepeatable: boolean;
  points: number;
  xp: number;
  maxOrders: number;
}

/**
 * Assigned employee in a task
 */
export interface AssignedEmployee {
  id: string;
  name: string;
  empId: string;
  tenure?: string;
  assignedTasks: AssignedTask[];
  completedOrders: number;
}

/**
 * Assigned task with employee assignments
 */
export interface AssignedTask {
  id: string;
  taskId: string;
  taskName: string;
  taskType: string;
  isRepeatable: boolean;
  points: number;
  xp: number;
  dateRange: {
    start: string;
    end: string;
  };
  maxOrders: number;
  assignedEmployees: AssignedEmployee[];
}

/**
 * Selected filters for task assignment
 */
export interface SelectedFilters {
  employees: AssignedEmployee[];
  tasks: { id: string; maxOrders: number }[];
  deadline: Date | null;
}

/**
 * Manager Task Assignment Types
 * ==============================
 * Types related to task assignment functionality
 */

// /**
//  * Task interface for task selection (from KPICategory)
//  */
// export interface Task {
//   id: string;
//   name: string;
//   description?: string; // from KPICategory.description
//   type: string; // from KPICategory.type
//   isRepeatable: boolean; // from KPICategory.is_repeatable
//   points: number; // from KPICategory.points
//   xp?: number; // optional, if you add XP later
//   maxOrders: number; // default 1, but editable if repeatable
// }

// /**
//  * Assigned employee in a task (from User + Role)
//  */
// export interface AssignedEmployee {
//   id: string; // User.id
//   name: string; // User.name
//   empId: string; // User.employee_id
//   roleName?: string; // Role.type (optional)
//   tenure?: string; // optional field if you track tenure
//   assignedTasks: AssignedTask[];
//   completedOrders: number; // from KPITask.completed_orders
// }

// /**
//  * Assigned task with employee assignments (from task_info_view)
//  */
// export interface AssignedTask {
//   id: string; // KPITask.id
//   taskId: string; // KPICategory.id
//   taskName: string; // KPICategory.name
//   taskType: string; // KPICategory.type or description
//   isRepeatable: boolean; // KPICategory.is_repeatable
//   points: number; // KPICategory.points
//   xp?: number; // optional
//   dateRange: {
//     start: string; // KPITask.created_at
//     end: string; // KPITask.deadline_date
//   };
//   maxOrders: number; // KPITask.max_orders
//   pendingOrders?: number; // KPITask.pending_orders
//   assignedEmployees: AssignedEmployee[];
// }

// /**
//  * Selected filters for task assignment (used in dialogs)
//  */
// export interface SelectedFilters {
//   employees: AssignedEmployee[];
//   tasks: { id: string; maxOrders: number }[];
//   deadline: Date | null;
// }
