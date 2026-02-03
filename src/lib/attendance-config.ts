import type { AttendanceConfig } from '@/types';

export const attendanceConfig: AttendanceConfig = {
  timeInAt: '01:45',
  lateAfter: '01:47',
  timeOutAt: '18:00',
  overtimeAfter: '20:00',
  autoTimeoutAt: '23:59',
  breaktime_duration: '00:01', //1 minu
};
