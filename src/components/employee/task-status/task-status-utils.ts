import { isTaskOverdue } from '@/utils/date-utils';
import type { TaskStatusItem } from './types';

export function isIncompleteTask(task: Pick<TaskStatusItem, 'completedOrders' | 'maxOrders'>): boolean {
  return task.completedOrders < task.maxOrders;
}

export function isTaskStatusItemOverdue(
  task: Pick<TaskStatusItem, 'dueDate' | 'completedOrders' | 'maxOrders'>
): boolean {
  return isIncompleteTask(task) && isTaskOverdue(task.dueDate);
}
