import type { VerificationRequest } from '@/types';

export const verificationTaskMockData: VerificationRequest = {
  kpitask_id: 'task-1',
  assigned_by: 'manager-1',
  assigned_to: 'employee-1',
  status: 'in review',
  id: 'task-1',
  date: new Date('2026-04-03T08:00:00.000Z'),
  employeeName: 'Employee Seed',
  employeeId: 'EMP-001',
  task: 'Kitchen Checklist',
  repeat: 1,
  totalPoints: 15,
  kpitask_created_at: new Date('2026-04-01T08:00:00.000Z'),
  kpitask_completed_at: new Date('2026-04-03T07:00:00.000Z'),
  kpitask_verification_requested_at: new Date('2026-04-03T08:00:00.000Z'),
  pending_orders: 1,
  completed_orders: 2,
  max_orders: 5,
  assigned_by_role_id: 'role-manager',
  assigned_by_name: 'Manager Seed',
  assigned_by_employee_id: 'MGR-001',
  assigned_by_role_name: 'manager',
  assigned_to_role_id: 'role-regular',
  assigned_to_name: 'Employee Seed',
  assigned_to_employee_id: 'EMP-001',
  assigned_to_role_name: 'regular',
  category_id: 'category-1',
  category_name: 'Kitchen Checklist',
  category_description: 'Daily kitchen quality checklist',
  category_points: 15,
  category_xp: 5,
  k_deadline_date: new Date('2026-04-05T08:00:00.000Z'),
  remark: null,
};

export const approvalRemarkMockData = 'Approved after review';
export const rejectionRemarkMockData = 'Please complete the missing steps';
