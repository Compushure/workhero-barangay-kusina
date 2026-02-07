/**
 * Employee Points Types
 * =====================
 * Types related to employee reward points
 */

/**
 * Input for editing employee points
 */
export type EditPointsInput = {
  userId: string;
  pointsToAdd: number;
};

export interface EmployeePointsData {
  points: number;
  deductedPoints: number;
}
