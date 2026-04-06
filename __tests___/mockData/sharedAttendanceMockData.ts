import type { AttendanceConfig, AttendanceLog } from '@/types';

export const attendanceUnitTestConfig: AttendanceConfig = {
  timeInAt: '07:00',
  lateAfter: '07:30',
  timeOutAt: '17:30',
  overtimeAfter: '17:30',
  autoTimeoutAt: '23:59',
  breaktime_duration: '01:00',
  timezone: 'UTC',
};

export const attendanceTimelineLogMockData: AttendanceLog = {
  id: 'attendance-log-1',
  employee_id: 'employee-1',
  timein_time: '2026-04-06T07:40:00.000Z',
  timeout_time: '2026-04-06T16:30:00.000Z',
  is_ontime: false,
  is_overtime: false,
  is_absent: false,
  no_timeout: false,
  is_undertime: true,
  breaktime_start: '2026-04-06T12:00:00.000Z',
  breaktime_end: '2026-04-06T13:15:00.000Z',
  over_breaktime: true,
};

export const attendanceOpenLogMockData: AttendanceLog = {
  id: 'attendance-log-open',
  employee_id: 'employee-1',
  timein_time: '2026-04-06T07:05:00.000Z',
  timeout_time: '2026-04-06T07:05:00.000Z',
  is_ontime: true,
  is_overtime: false,
  is_absent: false,
  no_timeout: false,
  is_undertime: false,
  breaktime_start: null,
  breaktime_end: null,
  over_breaktime: false,
};

