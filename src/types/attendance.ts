/**
 * Attendance Types
 * ================
 * Types for attendance logging and configuration.
 */

export interface AttendanceConfig {
  timeInAt: string; // HH:mm
  timeOutAt: string; // HH:mm
  lateAfter: string; // HH:mm
  overtimeAfter: string; // HH:mm
  autoTimeoutAt: string; // HH:mm
}

export interface AttendanceLog {
  id: string;
  timein_time: string;
  timeout_time: string;
  is_ontime: boolean | null;
  employee_id: string;
  is_overtime: boolean | null;
  is_absent: boolean | null;
  no_timeout: boolean | null;
  is_undertime: boolean | null;
}

export interface AttendanceStatus {
  logId?: string;
  timeInTime?: string;
  timeOutTime?: string;
  hasTimedIn: boolean;
  hasTimedOut: boolean;
  canTimeIn: boolean;
  canTimeOut: boolean;
  isLate?: boolean;
  isOvertime?: boolean;
  isUndertime?: boolean;
  noTimeout?: boolean;
  isAbsent?: boolean;
  message?: string;
}
