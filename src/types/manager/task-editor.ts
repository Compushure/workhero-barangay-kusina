/**
 * Manager Task Editor Types
 * ==============================
 * Types related to task creation functionality
 */

/**
 * Task interface for task creation/editing
 */
export interface TaskCategory {
  id: string;
  name: string;
  type: string;
  description: string;
  isRepeatable: boolean;
  points: number;
  xp: number;
  createdAt: string; // ISO date string
}