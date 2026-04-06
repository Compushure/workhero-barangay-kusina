import type {
  BadgeAssignmentUser,
  BadgeAwardDebugEntry,
  BadgeSummary,
} from '@/types/manager/badge-assignment';

export const manualBadgeMockData: BadgeSummary = {
  id: 'badge-manual-1',
  name: 'Manual Appreciation',
  description: 'Awarded manually by a manager',
  points: 30,
  img_link: null,
  award_at_interval: 'none',
};

export const automaticBadgeMockData: BadgeSummary = {
  id: 'badge-auto-1',
  name: 'Automatic Badge',
  description: 'Awarded automatically by the system',
  points: 20,
  img_link: null,
  award_at_interval: 'monthly',
};

export const badgeAssignmentUserMockData: BadgeAssignmentUser = {
  id: 'employee-1',
  employee_id: 'EMP-001',
  name: 'Employee Seed',
  email: 'employee.seed@example.com',
  profilePictureUrl: 'https://cdn.example.com/employees/employee-1/profile.png',
  badge_ids: ['badge-manual-1'],
  collected_badges: [
    {
      userbadge_id: 'userbadge-1',
      badge_id: 'badge-manual-1',
      badge_name: 'Manual Appreciation',
      awarded_by_id: 'manager-1',
      awarded_by_name: 'Manager Seed',
      date_acquired: '2026-04-03T10:00:00.000Z',
    },
  ],
};

export const badgeAwardDebugEntryMockData: BadgeAwardDebugEntry = {
  id: 'userbadge-1',
  badge_id: 'badge-manual-1',
  badge_name: 'Manual Appreciation',
  badge_points: 30,
  awarded_to_id: 'employee-1',
  awarded_to_name: 'Employee Seed',
  employee_id: 'EMP-001',
  awarded_by_id: 'manager-1',
  awarded_by_name: 'Manager Seed',
  user_points: 60,
  date_acquired: '2026-04-03T10:00:00.000Z',
};
