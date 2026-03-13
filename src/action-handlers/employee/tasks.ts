/**
 * Employee Tasks Action Handlers
 * ==============================
 * Client-side wrappers for employee task management actions.
 * These handlers provide error handling and UI feedback (toasts) for task operations.
 */

import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import {
  fetchEmployeeTasks,
  submitTaskVerification,
  claimTaskPointsAndXP,
  redoTask,
  type EmployeeTasksData,
  type ClaimTaskResult,
  type SubmitVerificationResult,
} from '@/actions/employee/tasks';
import type { TaskStatusItem } from '@/components/employee/task-status/types';

/**
 * Fetches all tasks for the current employee, organized by status
 * @returns Promise with tasks data or null on error
 */
export async function handleFetchEmployeeTasks(): Promise<EmployeeTasksData | null> {
  const result = await safeAction(() => fetchEmployeeTasks());

  if (!result.success || result.data?.error) {
    toast.error(result.data?.error || 'Failed to load tasks');
    return null;
  }

  return result.data?.data || null;
}

/**
 * Submits a task for verification with specified pending orders
 * @param kpitaskId - The ID of the task to submit
 * @param pendingOrders - Number of orders to submit for verification
 * @returns Promise with submission result or null on error
 */
export async function handleSubmitTaskVerification(
  kpitaskId: string,
  pendingOrders: number
): Promise<SubmitVerificationResult | null> {
  const result = await safeAction(() => submitTaskVerification(kpitaskId, pendingOrders));

  if (!result.success || result.data?.error) {
    const errorMessage = result.data?.error || result.error || 'Failed to submit task for verification';
    toast.error(errorMessage);
    return null;
  }

  return result.data?.data || null;
}

/**
 * Claims points and XP for an approved task
 * @param kpitaskId - The ID of the task to claim rewards for
 * @param taskName - The name of the task for toast messages
 * @param completedOrders - Current number of completed orders
 * @param maxOrders - Maximum number of orders for the task
 * @returns Promise with claim result or null on error
 */
export async function handleClaimTaskPointsAndXP(
  kpitaskId: string,
  taskName: string,
  pendingOrders: number,
  completedOrders: number,
  maxOrders: number
): Promise<ClaimTaskResult | null> {
  const result = await safeAction(() => claimTaskPointsAndXP(kpitaskId));

  if (!result.success || result.data?.error) {
    const errorMessage = result.data?.error || result.error || 'Failed to claim task rewards';
    toast.error(errorMessage);
    return null;
  }

  return result.data?.data || null;
}

/**
 * Redoes a rejected task, setting it back to 'assigned' status
 * @param kpitaskId - The ID of the rejected task to redo
 * @returns Promise with success status or null on error
 */
export async function handleRedoTask(
  kpitaskId: string
): Promise<boolean | null> {
  const result = await safeAction(() => redoTask(kpitaskId));

  if (!result.success || result.data?.error) {
    const errorMessage = result.data?.error || result.error || 'Failed to redo task';
    toast.error(errorMessage);
    return null;
  }

  return true;
}

/**
 * Helper function to get tasks by status from the fetched data
 * @param tasksData - The complete tasks data object
 * @param status - The status to filter by ('current', 'onReview', 'verified', 'denied')
 * @returns Array of tasks with the specified status
 */
export function getTasksByStatus(
  tasksData: EmployeeTasksData | null,
  status: 'current' | 'onReview' | 'verified' | 'denied'
): TaskStatusItem[] {
  if (!tasksData) return [];

  switch (status) {
    case 'current':
      return tasksData.currentTasks;
    case 'onReview':
      return tasksData.onReviewTasks;
    case 'verified':
      return tasksData.verifiedTasks;
    case 'denied':
      return tasksData.deniedTasks;
    default:
      return [];
  }
}

/**
 * Helper function to check if a task can be submitted for verification
 * @param task - The task to check
 * @returns True if the task can be submitted
 */
export function canSubmitForVerification(task: TaskStatusItem): boolean {
  return task.status === 'assigned' && !task.claimedAt;
}

/**
 * Helper function to check if a task can be claimed for rewards
 * @param task - The task to check
 * @returns True if the task can be claimed
 */
export function canClaimRewards(task: TaskStatusItem): boolean {
  return task.status === 'approved';
}

/**
 * Helper function to get task status display text
 * @param task - The task to get status for
 * @returns Human-readable status text
 */
export function getTaskStatusText(task: TaskStatusItem): string {
  if (task.claimedAt) return 'Claimed';
  
  switch (task.status) {
    case 'assigned':
      return 'In Progress';
    case 'in review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
} 