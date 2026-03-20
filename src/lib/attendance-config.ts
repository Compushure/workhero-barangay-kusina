import type { AttendanceConfig } from '@/types';

export const attendanceConfig: AttendanceConfig = {
  timeInAt: '7:00',
  lateAfter: '7:30',
  timeOutAt: '17:30',
  overtimeAfter: '17:30',
  autoTimeoutAt: '23:59',
  breaktime_duration: '01:00', //1 hr.
};
