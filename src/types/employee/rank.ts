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
