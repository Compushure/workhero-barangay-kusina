/**
 * Employee XP Types
 * =================
 * Types related to employee experience points
 */

/**
 * Employee XP data
 */
export type EmployeeXP = {
  currentXP: number;
  totalXP: number;
};

/**
 * Input for editing employee XP
 */
export type EditXPInput = {
  userId: string;
  xpToAdd: number;
};

/**
 * Result after editing XP
 */
export type EditXPResult = {
  newXP: number;
  newLevel: number;
};
