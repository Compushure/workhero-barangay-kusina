/**
 * Employee Types
 * ==============
 * Core employee entity types
 */

import type { Task } from '../manager/task-assignment';

/**
 * Basic employee interface
 */
export interface Employee {
  id: string;
  name: string;
  empId?: string;
  tenure?: string;
  assignedTasks?: Task[];
}
