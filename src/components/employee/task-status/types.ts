/**
 * Minimal task type for task-status card and mock data.
 */

export interface TaskStatusItem {
  id: string;
  taskType: string;
  title: string;
  progressCurrent: number;
  progressMax: number;
  points: number;
  xp: number;
  dueDate: string;
}

export type TaskStatusKind =
  | 'Current'
  | 'On Review'
  | 'Verified'
  | 'Denied Approval';
