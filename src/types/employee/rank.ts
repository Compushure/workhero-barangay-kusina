/**
 * Employee Rank Types
 * ===================
 * Types related to employee ranking based on total XP
 */

/**
 * Employee rank data
 * Contains the employee's rank, performance score, and total count
 */
export type EmployeeRank = {
  rank: number;
  performanceScore: number;
  totalEmployees: number;
};

/**
 * Single entry in the top 10 weekly leaderboard (employee dashboard).
 * Used for displaying rank, full name, and performance score; isCurrentUser highlights the logged-in employee.
 */
export type EmployeeTopRankEntry = {
  rank: number;
  userId: string;
  name: string;
  performanceScore: number;
  isCurrentUser: boolean;
  profilePictureUrl: string | null;
};
