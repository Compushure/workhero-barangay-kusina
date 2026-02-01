/**
 * Utility functions for date-related operations in task assignment
 */

/**
 * Checks if a task is overdue based on its end date
 * @param endDate - The end date of the task
 * @returns boolean - true if the task is overdue, false otherwise
 */
export function isTaskOverdue(endDate: string): boolean {
  const taskEnd = new Date(new Date(endDate).setHours(0, 0, 0, 0));
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  return taskEnd.getTime() < today.getTime();
}

/**
 * Gets the CSS classes for overdue styling
 * @param endDate - The end date of the task
 * @returns string - CSS classes for overdue styling
 */
// export function getOverdueClasses(endDate: string): string {
//   return isTaskOverdue(endDate) ? 'text-red-700 font-semibold' : '';
// }
