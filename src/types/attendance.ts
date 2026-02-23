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
  breaktime_duration: string; // HH:mm - Duration allowed for break
}

/**
 * AttendanceLog - Database record for daily attendance
 * Stores actual attendance timestamps and calculated flags
 */
export interface AttendanceLog {
  id: string;
  timein_time: string | Date; // ISO 8601 or Date object (timestamptz in DB)
  timeout_time: string | Date; // ISO 8601 or Date object (timestamptz in DB)
  is_ontime: boolean | null;
  employee_id: string;
  is_overtime: boolean | null;
  is_absent: boolean | null;
  no_timeout: boolean | null;
  is_undertime: boolean | null;
  breaktime_start: string | Date | null; // ISO 8601 or Date object
  breaktime_end: string | Date | null; // ISO 8601 or Date object
  over_breaktime: boolean | null;
  created_at?: string | Date; // Server timestamp
  updated_at?: string | Date; // Server timestamp
}

/**
 * AttendanceLogInput - Input for creating/updating attendance logs
 * Used in server actions
 */
export interface AttendanceLogInput {
  timein_time: string | Date;
  timeout_time?: string | Date;
  is_ontime?: boolean;
  is_overtime?: boolean;
  is_absent?: boolean;
  no_timeout?: boolean;
  is_undertime?: boolean;
  breaktime_start?: string | Date | null;
  breaktime_end?: string | Date | null;
  over_breaktime?: boolean;
}

/**
 * AttendanceLogWithUser - View result joining attendance log with user data
 * Returned from database view: attendance_log_view
 */
export interface AttendanceLogWithUser extends AttendanceLog {
  user_name?: string;
  user_email?: string;
  user_employee_id?: string;
  role_type?: string;
  role_id?: string;
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
  breakStartTime?: string;
  breakEndTime?: string;
  isOnBreak?: boolean;
  canStartBreak?: boolean;
  canEndBreak?: boolean;
  isOverBreaktime?: boolean;
}
