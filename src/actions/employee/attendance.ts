'use server';

import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/lib/utils/safe-action';
import type { AttendanceConfig, AttendanceLog, AttendanceStatus, AttendanceTimelineEntry } from '@/types';
import { attendanceConfig } from '@/lib/attendance-config';

const DEFAULT_TIMEZONE = attendanceConfig.timezone || 'Asia/Manila';

function normalizeConfig(config?: Partial<AttendanceConfig>): AttendanceConfig {
  return {
    timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
    timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
    lateAfter: config?.lateAfter ?? config?.timeInAt ?? attendanceConfig.lateAfter,
    overtimeAfter: config?.overtimeAfter ?? config?.timeOutAt ?? attendanceConfig.overtimeAfter,
    autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
    breaktime_duration: config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
    timezone: config?.timezone ?? attendanceConfig.timezone ?? DEFAULT_TIMEZONE,
  };
}

function parseTimeOnDate(baseUtc: Date, time: string, timeZone: string): Date {
  const [hours, minutes] = time.split(':').map((v) => Number(v));
  const datePart = formatInTimeZone(baseUtc, timeZone, 'yyyy-MM-dd');
  const hour = String(hours).padStart(2, '0');
  const minute = String(minutes).padStart(2, '0');
  // Interpret HH:mm in the configured timezone, return as UTC Date for consistent comparisons
  return zonedTimeToUtc(`${datePart} ${hour}:${minute}:00`, timeZone);
}

function formatTo12Hour(time24: string): string {
  const [hoursRaw, minutesRaw] = time24.split(':').map((v) => Number(v));
  const period = hoursRaw >= 12 ? 'PM' : 'AM';
  const hours12 = hoursRaw % 12 || 12;
  const minutes = String(minutesRaw).padStart(2, '0');
  return `${hours12}:${minutes} ${period}`;
}

function getDayRange(base: Date, timeZone: string): { start: Date; end: Date } {
  const datePart = formatInTimeZone(base, timeZone, 'yyyy-MM-dd');
  const start = zonedTimeToUtc(`${datePart} 00:00:00.000`, timeZone);
  const end = zonedTimeToUtc(`${datePart} 23:59:59.999`, timeZone);
  return { start, end };
}

function isOpenLog(log: AttendanceLog): boolean {
  const timeIn = new Date(log.timein_time).getTime();
  const timeOut = new Date(log.timeout_time).getTime();
  return (log.no_timeout ?? false) === false && timeOut === timeIn;
}

function isOnBreak(log: AttendanceLog): boolean {
  return !!log.breaktime_start && !log.breaktime_end;
}

function calculateBreakDuration(breakStart: string, breakEnd: string): number {
  const start = new Date(breakStart).getTime();
  const end = new Date(breakEnd).getTime();
  return end - start; // milliseconds
}

function parseDurationToMs(duration: string): number {
  const [hours, minutes] = duration.split(':').map((v) => Number(v));
  return (hours * 60 + minutes) * 60 * 1000; // milliseconds
}

function toIsoString(value?: string | Date | null): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.toISOString();
}

function buildTimelineFromLog(log: AttendanceLog | null): AttendanceTimelineEntry[] {
  if (!log) {
    return [];
  }

  const entries: AttendanceTimelineEntry[] = [];
  const timeIn = toIsoString(log.timein_time);
  const breakStart = toIsoString(log.breaktime_start);
  const breakEnd = toIsoString(log.breaktime_end);
  const timeOut = toIsoString(log.timeout_time);

  if (timeIn) {
    entries.push({
      action: 'timein',
      time: timeIn,
      note: log.is_ontime === false ? 'Late timing in' : undefined,
    });
  }

  if (breakStart) {
    entries.push({ action: 'startbreak', time: breakStart });
  }

  if (breakEnd) {
    entries.push({
      action: 'endbreak',
      time: breakEnd,
      note: log.over_breaktime ? 'Over break time' : undefined,
    });
  }

  const shouldShowTimeout =
    !!timeOut &&
    (!!(log.is_absent ?? false) ||
      !timeIn ||
      new Date(timeOut).getTime() !== new Date(timeIn).getTime());

  if (shouldShowTimeout && timeOut) {
    const timedOutFromBreakWithoutReturn =
      !!(log.is_absent ?? false) && !!breakStart && !breakEnd && !!(log.no_timeout ?? false);

    entries.push({
      action: 'timeout',
      time: timeOut,
      note: timedOutFromBreakWithoutReturn
        ? 'Did not return from break; system marked absent.'
        : log.is_absent
          ? 'System marked absent.'
          : log.is_undertime
            ? 'Working undertime'
            : log.is_overtime
              ? 'Overtime logged'
              : undefined,
    });
  }

  return entries.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

async function getTodayLog(employeeId: string, timeZone: string): Promise<AttendanceLog | null> {
  const supabase = await createClient();
  const now = new Date();
  const { start, end } = getDayRange(now, timeZone);

  const { data, error } = await supabase
    .from('AttendanceLog')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('timein_time', start.toISOString())
    .lte('timein_time', end.toISOString())
    .order('timein_time', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today attendance log:', error);
    return null;
  }

  return data as AttendanceLog | null;
}

export async function getAttendanceConfigAction(): Promise<ServerActionResponse<AttendanceConfig>> {
  return { error: null, data: attendanceConfig };
}

export async function getTodayAttendanceTimelineAction(): Promise<ServerActionResponse<AttendanceTimelineEntry[]>> {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { error: 'No active session found' };
    }

    const employeeId = sessionData.session.user.id;
    const timeZone = attendanceConfig.timezone ?? DEFAULT_TIMEZONE;
    const log = await getTodayLog(employeeId, timeZone);
    return { error: null, data: buildTimelineFromLog(log) };
  } catch (error) {
    console.error('Error in getTodayAttendanceTimelineAction:', error);
    return { error: 'Failed to fetch attendance logs' };
  }
}

export async function getTodayAttendanceStatusAction(
  config?: Partial<AttendanceConfig>
): Promise<ServerActionResponse<AttendanceStatus>> {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { error: 'No active session found' };
    }

    const employeeId = sessionData.session.user.id;
    const now = new Date();
    const normalized = normalizeConfig(config);

    const timeInAt = parseTimeOnDate(now, normalized.timeInAt, normalized.timezone);
    const timeOutAt = parseTimeOnDate(now, normalized.timeOutAt, normalized.timezone);
    const lateAfter = parseTimeOnDate(now, normalized.lateAfter, normalized.timezone);
    const overtimeAfter = parseTimeOnDate(now, normalized.overtimeAfter, normalized.timezone);
    const autoTimeoutAt = parseTimeOnDate(now, normalized.autoTimeoutAt, normalized.timezone);

    let log = await getTodayLog(employeeId, normalized.timezone);

    // Auto-mark absent if no time-in by timeoutAt.
    if (!log && now >= timeOutAt) {
      const { data: absent, error: absentError } = await supabase
        .from('AttendanceLog')
        .insert({
          timein_time: timeOutAt.toISOString(),
          timeout_time: timeOutAt.toISOString(),
          is_ontime: false,
          employee_id: employeeId,
          is_overtime: false,
          is_absent: true,
          no_timeout: true,
          is_undertime: false,
        })
        .select('*')
        .single();

      if (!absentError && absent) {
        log = absent as AttendanceLog;
      }
    }

    // Mark over-breaktime while currently on break.
    if (log && isOnBreak(log) && log.breaktime_start) {
      const breakStartIso =
        typeof log.breaktime_start === 'string'
          ? log.breaktime_start
          : log.breaktime_start.toISOString();
      const breakDurationMs = calculateBreakDuration(breakStartIso, now.toISOString());
      const allowedBreakMs = parseDurationToMs(normalized.breaktime_duration);
      const isOverBreaktime = breakDurationMs > allowedBreakMs;

      if (isOverBreaktime && !(log.over_breaktime ?? false)) {
        const { data: updated, error: updateError } = await supabase
          .from('AttendanceLog')
          .update({
            over_breaktime: true,
          })
          .eq('id', log.id)
          .select('*')
          .single();

        if (!updateError && updated) {
          log = updated as AttendanceLog;
        }
      }
    }

    // Auto-mark absent only if still on break at/after autoTimeoutAt.
    if (log && isOnBreak(log) && now >= autoTimeoutAt) {
      const { data: updated, error: updateError } = await supabase
        .from('AttendanceLog')
        .update({
          is_absent: true,
          over_breaktime: true,
          no_timeout: true,
          timeout_time: autoTimeoutAt.toISOString(),
        })
        .eq('id', log.id)
        .select('*')
        .single();

      if (!updateError && updated) {
        log = updated as AttendanceLog;
      }
    }

    // Auto-mark absent if not timed out by autoTimeoutAt.
    if (log && isOpenLog(log) && !isOnBreak(log) && now >= autoTimeoutAt) {
      const { data: updated, error: updateError } = await supabase
        .from('AttendanceLog')
        .update({
          timeout_time: autoTimeoutAt.toISOString(),
          is_absent: true,
          no_timeout: true,
          is_overtime: false,
          is_undertime: false,
        })
        .eq('id', log.id)
        .select('*')
        .single();

      if (!updateError && updated) {
        log = updated as AttendanceLog;
      }
    }

    const isAbsent = log?.is_absent ?? false;
    const hasTimedIn = !!log;
    const open = log ? isOpenLog(log) : false;
    const hasTimedOut = !!log && !open;
    const onBreak = log ? !isAbsent && isOnBreak(log) : false;

    const canTimeIn = !hasTimedIn && !isAbsent && now >= timeInAt && now <= timeOutAt;
    const canTimeOut = hasTimedIn && open && !onBreak;
    const canStartBreak = hasTimedIn && !hasTimedOut && !onBreak && !log?.breaktime_end;
    const canEndBreak = hasTimedIn && onBreak;

    let message: string;
    const timeInLabel = formatTo12Hour(normalized.timeInAt);
    const timeOutLabel = formatTo12Hour(normalized.timeOutAt);
    const autoTimeoutLabel = formatTo12Hour(normalized.autoTimeoutAt);

    if (isAbsent) {
      if (log?.breaktime_start && !log?.breaktime_end) {
        message = `You did not return from break. The system marked you absent for today. Next time in is ${timeInLabel} tomorrow.`;
      } else {
        message = `You are marked absent for today. Next time in is ${timeInLabel} tomorrow.`;
      }
    } else if (!hasTimedIn) {
      if (now < timeInAt) {
        message = `Time in starts at ${timeInLabel}`;
      } else if (now > autoTimeoutAt) {
        message = 'Time in closed for today';
      } else {
        // Check if currently in the late window
        if (now >= lateAfter) {
          message = 'Ready to time in - Late';
        } else {
          message = 'Ready to time in';
        }
      }
    } else if (onBreak) {
      message = 'On break - end break to continue';
    } else if (hasTimedOut) {
      message = `You have already timed out for today. Next time in is ${timeInLabel} tomorrow.`;
    } else {
      const oneHourBeforeAutoTimeout = new Date(autoTimeoutAt.getTime() - 60 * 60 * 1000);
      const isNearAutoTimeout = now >= oneHourBeforeAutoTimeout && now < autoTimeoutAt;

      if (now >= overtimeAfter) {
        message = `You are currently working overtime. Please time out before ${autoTimeoutLabel} to avoid being marked absent.`;
      } else if (now >= timeOutAt) {
        message = 'Ready to time out';
      } else {
        message = `Regular timeout time should be at ${timeOutLabel}. Any time out before this is considered undertime.`;
      }

      if (isNearAutoTimeout) {
        message += ` Reminder: If you do not time out before ${autoTimeoutLabel}, you will be marked absent.`;
      }
    }

    const status: AttendanceStatus = {
      logId: log?.id,
      timeInTime: log?.timein_time ? (typeof log.timein_time === 'string' ? log.timein_time : log.timein_time.toISOString()) : undefined,
      timeOutTime: hasTimedOut ? (log?.timeout_time ? (typeof log.timeout_time === 'string' ? log.timeout_time : log.timeout_time.toISOString()) : undefined) : undefined,
      hasTimedIn,
      hasTimedOut,
      canTimeIn,
      canTimeOut,
      isLate: log ? !(log.is_ontime ?? true) : undefined,
      isOvertime: log ? log.is_overtime ?? undefined : undefined,
      isUndertime: log ? log.is_undertime ?? undefined : undefined,
      noTimeout: log ? log.no_timeout ?? undefined : undefined,
      isAbsent,
      breakStartTime: log?.breaktime_start ? (typeof log.breaktime_start === 'string' ? log.breaktime_start : log.breaktime_start.toISOString()) : undefined,
      breakEndTime: log?.breaktime_end ? (typeof log.breaktime_end === 'string' ? log.breaktime_end : log.breaktime_end.toISOString()) : undefined,
      isOnBreak: onBreak,
      canStartBreak,
      canEndBreak,
      isOverBreaktime: log?.over_breaktime ?? undefined,
      message,
    };

    return { error: null, data: status };
  } catch (error) {
    console.error('Error in getTodayAttendanceStatusAction:', error);
    return { error: 'Failed to fetch attendance status' };
  }
}

export async function timeInAttendanceAction(
  config?: Partial<AttendanceConfig>
): Promise<ServerActionResponse<AttendanceStatus>> {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { error: 'No active session found' };
    }

    const employeeId = sessionData.session.user.id;
    const now = new Date();
    const normalized = normalizeConfig(config);

    const timeInAt = parseTimeOnDate(now, normalized.timeInAt, normalized.timezone);
    const lateAfter = parseTimeOnDate(now, normalized.lateAfter, normalized.timezone);
    const timeOutAt = parseTimeOnDate(now, normalized.timeOutAt, normalized.timezone);

    if (now < timeInAt) {
      return { error: `Time in starts at ${normalized.timeInAt}` };
    }

    if (now > timeOutAt) {
      return { error: 'Time in is closed for today' };
    }

    const existing = await getTodayLog(employeeId, normalized.timezone);
    if (existing) {
      if (existing.is_absent) {
        return { error: 'Attendance already marked absent for today' };
      }
      return { error: 'Already timed in for today' };
    }

    const isOnTime = now <= lateAfter;

    const { data: created, error } = await supabase
      .from('AttendanceLog')
      .insert({
        timein_time: now.toISOString(),
        timeout_time: now.toISOString(),
        is_ontime: isOnTime,
        employee_id: employeeId,
        is_overtime: false,
        is_absent: false,
        no_timeout: false,
        is_undertime: false,
      })
      .select('*')
      .single();

    if (error || !created) {
      return { error: `Failed to time in: ${error?.message || 'Unknown error'}` };
    }

    return {
      error: null,
      data: {
        logId: created.id,
        timeInTime: created.timein_time,
        hasTimedIn: true,
        hasTimedOut: false,
        canTimeIn: false,
        canTimeOut: true,
        isLate: !isOnTime,
        message: 'Timed in successfully',
      },
    };
  } catch (error) {
    console.error('Error in timeInAttendanceAction:', error);
    return { error: 'Failed to time in' };
  }
}

export async function timeOutAttendanceAction(
  logId?: string,
  config?: Partial<AttendanceConfig>
): Promise<ServerActionResponse<AttendanceStatus>> {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { error: 'No active session found' };
    }

    const employeeId = sessionData.session.user.id;
    const now = new Date();
    const normalized = normalizeConfig(config);

    const timeOutAt = parseTimeOnDate(now, normalized.timeOutAt, normalized.timezone);
    const overtimeAfter = parseTimeOnDate(now, normalized.overtimeAfter, normalized.timezone);

    let log = logId ? null : await getTodayLog(employeeId, normalized.timezone);

    if (logId) {
      const { data, error } = await supabase
        .from('AttendanceLog')
        .select('*')
        .eq('id', logId)
        .eq('employee_id', employeeId)
        .single();
      if (error || !data) {
        return { error: 'Attendance log not found' };
      }
      log = data as AttendanceLog;
    }

    if (!log) {
      return { error: 'No active time in found for today' };
    }

    if (log.is_absent) {
      return { error: 'Attendance already marked absent for today' };
    }

    if (isOnBreak(log)) {
      return { error: 'Cannot time out while on break. End your break first.' };
    }

    if (!isOpenLog(log)) {
      return { error: 'Already timed out for today' };
    }

    const isOvertime = now > overtimeAfter;
    const isUndertime = now < timeOutAt;

    const { data: updated, error: updateError } = await supabase
      .from('AttendanceLog')
      .update({
        timeout_time: now.toISOString(),
        is_overtime: isOvertime,
        is_undertime: isUndertime,
        no_timeout: false,
      })
      .eq('id', log.id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return { error: `Failed to time out: ${updateError?.message || 'Unknown error'}` };
    }

    return {
      error: null,
      data: {
        logId: updated.id,
        timeInTime: updated.timein_time,
        timeOutTime: updated.timeout_time,
        hasTimedIn: true,
        hasTimedOut: true,
        canTimeIn: false,
        canTimeOut: false,
        isOvertime,
        isUndertime,
        noTimeout: false,
        message: 'Timed out successfully',
      },
    };
  } catch (error) {
    console.error('Error in timeOutAttendanceAction:', error);
    return { error: 'Failed to time out' };
  }
}

export async function startBreakAction(
  config?: Partial<AttendanceConfig>
): Promise<ServerActionResponse<AttendanceStatus>> {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { error: 'No active session found' };
    }

    const employeeId = sessionData.session.user.id;
    const now = new Date();
    const normalized = normalizeConfig(config);

    const log = await getTodayLog(employeeId, normalized.timezone);

    if (!log) {
      return { error: 'No active time in found for today' };
    }

    if (log.is_absent) {
      return { error: 'Attendance already marked absent for today' };
    }

    if (!isOpenLog(log)) {
      return { error: 'Already timed out for today' };
    }

    if (isOnBreak(log)) {
      return { error: 'Already on break' };
    }

    if (log.breaktime_end) {
      return { error: 'Break already taken for today' };
    }

    const { data: updated, error: updateError } = await supabase
      .from('AttendanceLog')
      .update({
        breaktime_start: now.toISOString(),
      })
      .eq('id', log.id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return { error: `Failed to start break: ${updateError?.message || 'Unknown error'}` };
    }

    return {
      error: null,
      data: {
        logId: updated.id,
        timeInTime: updated.timein_time,
        breakStartTime: updated.breaktime_start ?? undefined,
        hasTimedIn: true,
        hasTimedOut: false,
        canTimeIn: false,
        canTimeOut: false,
        canStartBreak: false,
        canEndBreak: true,
        isOnBreak: true,
        message: 'Break started successfully',
      },
    };
  } catch (error) {
    console.error('Error in startBreakAction:', error);
    return { error: 'Failed to start break' };
  }
}

export async function endBreakAction(
  logId?: string,
  config?: Partial<AttendanceConfig>
): Promise<ServerActionResponse<AttendanceStatus>> {
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { error: 'No active session found' };
    }

    const employeeId = sessionData.session.user.id;
    const now = new Date();
    const normalized = normalizeConfig(config);

    let log = logId ? null : await getTodayLog(employeeId, normalized.timezone);

    if (logId) {
      const { data, error } = await supabase
        .from('AttendanceLog')
        .select('*')
        .eq('id', logId)
        .eq('employee_id', employeeId)
        .single();
      if (error || !data) {
        return { error: 'Attendance log not found' };
      }
      log = data as AttendanceLog;
    }

    if (!log) {
      return { error: 'No active time in found for today' };
    }

    if (log.is_absent) {
      return { error: 'Attendance already marked absent for today' };
    }

    if (!isOnBreak(log)) {
      return { error: 'Not currently on break' };
    }

    const breakStart = typeof log.breaktime_start === 'string' ? log.breaktime_start : log.breaktime_start?.toISOString() || '';
    const breakDurationMs = calculateBreakDuration(breakStart, now.toISOString());
    const allowedBreakMs = parseDurationToMs(normalized.breaktime_duration);
    const isOverBreaktime = breakDurationMs > allowedBreakMs;

    const { data: updated, error: updateError } = await supabase
      .from('AttendanceLog')
      .update({
        breaktime_end: now.toISOString(),
        over_breaktime: isOverBreaktime,
      })
      .eq('id', log.id)
      .select('*')
      .single();

    if (updateError || !updated) {
      return { error: `Failed to end break: ${updateError?.message || 'Unknown error'}` };
    }

    return {
      error: null,
      data: {
        logId: updated.id,
        timeInTime: updated.timein_time,
        breakStartTime: updated.breaktime_start ?? undefined,
        breakEndTime: updated.breaktime_end ?? undefined,
        isOverBreaktime,
        hasTimedIn: true,
        hasTimedOut: false,
        canTimeIn: false,
        canTimeOut: true,
        canStartBreak: false,
        canEndBreak: false,
        isOnBreak: false,
        message: isOverBreaktime
          ? 'Break ended - exceeded recommended duration'
          : 'Break ended successfully',
      },
    };
  } catch (error) {
    console.error('Error in endBreakAction:', error);
    return { error: 'Failed to end break' };
  }
}

