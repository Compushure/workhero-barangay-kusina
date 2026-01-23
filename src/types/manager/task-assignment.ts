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
  maxAttempts: number;
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
  completedAttempts: number;
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
  maxAttempts: number;
  assignedEmployees: AssignedEmployee[];
}

/**
 * Selected filters for task assignment
 */
export interface SelectedFilters {
  employees: AssignedEmployee[];
  tasks: { id: string; maxAttempts: number }[];
  deadline: Date | null;
}
