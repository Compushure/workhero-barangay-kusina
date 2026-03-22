import type { AttendanceConfig } from '@/types';

export const attendanceConfig: AttendanceConfig = {
  timeInAt: '07:00',
  lateAfter: '07:30',
  timeOutAt: '17:30',
  overtimeAfter: '17:30',
  autoTimeoutAt: '23:59',
  breaktime_duration: '01:00', // 1 hr
  timezone: 'Asia/Manila', // UTC+08:00
};
