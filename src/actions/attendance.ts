'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/lib/utils/safe-action';
import type { AttendanceConfig, AttendanceLog, AttendanceStatus } from '@/types';
import { attendanceConfig } from '@/lib/attendance-config';

function normalizeConfig(config?: Partial<AttendanceConfig>): AttendanceConfig {
  return {
    timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
    timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
    lateAfter: config?.lateAfter ?? config?.timeInAt ?? attendanceConfig.lateAfter,
    overtimeAfter: config?.overtimeAfter ?? config?.timeOutAt ?? attendanceConfig.overtimeAfter,
    autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
  };
}

function parseTimeOnDate(base: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map((v) => Number(v));
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function getDayRange(base: Date): { start: Date; end: Date } {
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function isOpenLog(log: AttendanceLog): boolean {
  const timeIn = new Date(log.timein_time).getTime();
  const timeOut = new Date(log.timeout_time).getTime();
  return (log.no_timeout ?? false) === false && timeOut === timeIn;
}

async function getTodayLog(employeeId: string): Promise<AttendanceLog | null> {
  const supabase = await createClient();
  const now = new Date();
  const { start, end } = getDayRange(now);

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

    const timeInAt = parseTimeOnDate(now, normalized.timeInAt);
    const timeOutAt = parseTimeOnDate(now, normalized.timeOutAt);
    const lateAfter = parseTimeOnDate(now, normalized.lateAfter);
    const overtimeAfter = parseTimeOnDate(now, normalized.overtimeAfter);
    const autoTimeoutAt = parseTimeOnDate(now, normalized.autoTimeoutAt);

    let log = await getTodayLog(employeeId);

    if (!log && now >= overtimeAfter) {
      const { data: absent, error: absentError } = await supabase
        .from('AttendanceLog')
        .insert({
          timein_time: overtimeAfter.toISOString(),
          timeout_time: overtimeAfter.toISOString(),
          is_ontime: false,
          employee_id: employeeId,
          is_overtime: false,
          is_absent: true,
          no_timeout: false,
          is_undertime: false,
        })
        .select('*')
        .single();

      if (!absentError && absent) {
        log = absent as AttendanceLog;
      }
    }

    if (log && isOpenLog(log) && now >= autoTimeoutAt) {
      const isOvertime = autoTimeoutAt > overtimeAfter;
      const isUndertime = autoTimeoutAt < timeOutAt;
      const { data: updated, error: updateError } = await supabase
        .from('AttendanceLog')
        .update({
          timeout_time: autoTimeoutAt.toISOString(),
          no_timeout: true,
          is_overtime: isOvertime,
          is_undertime: isUndertime,
        })
        .eq('id', log.id)
        .select('*')
        .single();

      if (!updateError && updated) {
        log = updated as AttendanceLog;
      }
    }

    const isAbsent = log?.is_absent ?? false;
    const hasTimedIn = !!log && !isAbsent;
    const open = log ? isOpenLog(log) : false;
    const hasTimedOut = hasTimedIn && !open;

    const canTimeIn = !hasTimedIn && !isAbsent && now >= timeInAt && now <= autoTimeoutAt;
    const canTimeOut = hasTimedIn && open;

    const status: AttendanceStatus = {
      logId: log?.id,
      timeInTime: log?.timein_time,
      timeOutTime: hasTimedOut ? log?.timeout_time : undefined,
      hasTimedIn,
      hasTimedOut,
      canTimeIn,
      canTimeOut,
      isLate: log ? !(log.is_ontime ?? true) : undefined,
      isOvertime: log ? log.is_overtime ?? undefined : undefined,
      isUndertime: log ? log.is_undertime ?? undefined : undefined,
      noTimeout: log ? log.no_timeout ?? undefined : undefined,
      isAbsent,
      message: !hasTimedIn
        ? now < timeInAt
          ? `Time in starts at ${normalized.timeInAt}`
          : now > autoTimeoutAt
            ? 'Time in closed for today'
            : 'Ready to time in'
        : hasTimedOut
          ? 'Already timed out'
          : 'Ready to time out',
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

    const timeInAt = parseTimeOnDate(now, normalized.timeInAt);
    const lateAfter = parseTimeOnDate(now, normalized.lateAfter);
    const autoTimeoutAt = parseTimeOnDate(now, normalized.autoTimeoutAt);

    if (now < timeInAt) {
      return { error: `Time in starts at ${normalized.timeInAt}` };
    }

    if (now > autoTimeoutAt) {
      return { error: 'Time in is closed for today' };
    }

    const existing = await getTodayLog(employeeId);
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

    const timeOutAt = parseTimeOnDate(now, normalized.timeOutAt);
    const overtimeAfter = parseTimeOnDate(now, normalized.overtimeAfter);

    let log = logId ? null : await getTodayLog(employeeId);

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
