/**
 * Manager Task Verification Types
 * ================================
 * Types related to task verification and review
 */

/**
 * Sort option for verification requests
 */
export type SortOption = 'pending' | 'approved' | 'denied';

/**
 * Verification request interface
 * Represents a task submission pending review
 */
export interface VerificationRequest {
  kpitask_id: string;
  assigned_by: string | null;
  assigned_to: string | null;
  status: 'assigned' | 'in review' | 'approved' | 'rejected' | string;
  id: string;
  date: Date;
  employeeName: string;
  employeeId: string;
  task: string;
  repeat: number;
  totalPoints: number;
  kpitask_created_at: Date | null;
  kpitask_completed_at: Date | null;
  repeated_times: number | null;

  // Assigned by (from) user info
  assigned_by_role_id: string | null;
  assigned_by_name: string | null;
  assigned_by_employee_id: string | null;
  assigned_by_role_name: string | null;

  // Assigned to (to) user info
  assigned_to_role_id: string | null;
  assigned_to_name: string | null;
  assigned_to_employee_id: string | null;
  assigned_to_role_name: string | null;

  // Category info
  category_id: string | null;
  category_name: string | null;
  category_description: string | null;
  category_points: number | null;
  k_deadline_date: Date | null;
}
