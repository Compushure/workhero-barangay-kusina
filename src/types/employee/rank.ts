/**
 * Employee Rank Types
 * ===================
 * Types related to employee ranking based on total XP
 */

/**
 * Employee rank data
 * Contains the employee's rank among all regular employees and total count
 */
export type EmployeeRank = {
  rank: number;
  totalEmployees: number;
};
