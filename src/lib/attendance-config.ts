import type { AttendanceConfig } from '@/types';

export const attendanceConfig: AttendanceConfig = {
  timeInAt: '07:00',
  lateAfter: '07:30',
  timeOutAt: '17:00',
  overtimeAfter: '20:00',
  autoTimeoutAt: '23:59',
  breaktime_duration: '01:00', //1 hr.
};
