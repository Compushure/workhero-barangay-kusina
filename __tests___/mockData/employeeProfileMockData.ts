import type { UserWithExtras } from '@/types';

export const employeeProfileViewRow = {
  user_id: 'user-profile-1',
  user_name: 'Profile Employee',
  user_email: 'profile.employee@example.com',
  role_type: 'regular',
  user_date_added: '2026-04-01T10:00:00.000Z',
  employee_id: 'EMP-PROFILE-001',
  employment_status: 'regular',
  contact_details: '09123456789',
  home_address: '123 Kitchen Street',
  tin_id: '123456789',
  sss_id: '1234567890',
  pagibig_id: '123456789012',
  xp: 12,
  user_level: 2,
  points: 35,
  total_points_earned: 55,
  deducted_points: 5,
  is_tenured: false,
  total_xp: 212,
  performance_score: 110,
} as const;

export const employeeAttendanceStatsRow = {
  total_absences: 1,
  total_lates: 2,
  total_undertimes: 0,
  total_overtimes: 3,
};

export const employeeProfileUpdateInput = {
  name: 'Updated Profile Employee',
  contactNumber: '09999888777',
  address: '456 Updated Street',
};

export const expectedEmployeeProfile: UserWithExtras = {
  id: employeeProfileViewRow.user_id,
  name: employeeProfileViewRow.user_name,
  email: employeeProfileViewRow.user_email,
  employeeType: 'regular',
  date_added: new Date(employeeProfileViewRow.user_date_added),
  profilePictureUrl: 'https://cdn.example.com/employees/user-profile-1/profile.png',
  employeeId: employeeProfileViewRow.employee_id,
  employmentStatus: employeeProfileViewRow.employment_status,
  contactNumber: employeeProfileViewRow.contact_details,
  address: employeeProfileViewRow.home_address,
  tin: employeeProfileViewRow.tin_id,
  sss: employeeProfileViewRow.sss_id,
  pagibig: employeeProfileViewRow.pagibig_id,
  xp: employeeProfileViewRow.xp,
  user_level: employeeProfileViewRow.user_level,
  points: employeeProfileViewRow.points,
  total_points_earned: employeeProfileViewRow.total_points_earned,
  deducted_points: employeeProfileViewRow.deducted_points,
  is_tenured: employeeProfileViewRow.is_tenured,
  total_xp: employeeProfileViewRow.total_xp,
  performance_score: employeeProfileViewRow.performance_score,
  total_absences: employeeAttendanceStatsRow.total_absences,
  total_lates: employeeAttendanceStatsRow.total_lates,
  total_undertimes: employeeAttendanceStatsRow.total_undertimes,
  total_overtimes: employeeAttendanceStatsRow.total_overtimes,
};

export function createProfilePictureFile() {
  return new File([Buffer.from('profile-image')], 'profile.png', {
    type: 'image/png',
  });
}
