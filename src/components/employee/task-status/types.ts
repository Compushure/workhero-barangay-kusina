/**
 * Minimal task type for task-status card and mock data.
 */

export interface TaskStatusItem {
  id: string;
  name: string;
  description: string;
  pendingOrders: number;
  completedOrders: number;
  maxOrders: number;
  claimedOrders: number;
  points: number;
  xp: number;
  dueDate: string;
  /** Manager remark (e.g. for verified/approved tasks). */
  remark?: string;
  /** When the employee claimed points/XP for this task; null if not yet claimed. */
  claimedAt?: string | null;
  /** Task status: assigned | in review | approved | rejected. */
  status?: string;
}

export type TaskStatusKind =
  | 'Current'
  | 'In Review'
  | 'Approved'
  | 'Rejected';
