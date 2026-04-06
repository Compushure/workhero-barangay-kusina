/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Fetch remote attendance configuration, status, and timeline data
 * - Time in, start break, end break, and time out remotely
 * - Verify the matching remote action handlers for attendance flows
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/shared/attendance.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  handleEndBreak,
  handleGetTodayAttendanceStatus,
  handleGetTodayAttendanceTimeline,
  handleStartBreak,
  handleTimeInAttendance,
  handleTimeOutAttendance,
} from '@/action-handlers/employee/attendance';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import type { AttendanceConfig } from '@/types';

const remoteContext = new RemoteSupabaseTestContext('shared-attendance');

let currentServerClient: typeof remoteContext.admin = remoteContext.admin;

const toastSuccess = jest.fn();
const toastError = jest.fn();

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<(message?: unknown) => unknown>;
    error: jest.MockedFunction<(message?: unknown) => unknown>;
  };
};

// Formats a Date into the HH:mm value expected by the attendance config.
function formatUtcClock(date: Date): string {
  return date.toISOString().slice(11, 16);
}

// Builds a UTC attendance config around the current runtime so remote tests stay deterministic.
function buildRelativeAttendanceConfig(
  now: Date,
  offsets: {
    timeIn: number;
    lateAfter: number;
    timeOut: number;
    overtimeAfter: number;
    autoTimeout: number;
    breakDuration?: string;
  }
): AttendanceConfig {
  const addMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60 * 1000);

  return {
    timeInAt: formatUtcClock(addMinutes(offsets.timeIn)),
    lateAfter: formatUtcClock(addMinutes(offsets.lateAfter)),
    timeOutAt: formatUtcClock(addMinutes(offsets.timeOut)),
    overtimeAfter: formatUtcClock(addMinutes(offsets.overtimeAfter)),
    autoTimeoutAt: formatUtcClock(addMinutes(offsets.autoTimeout)),
    breaktime_duration: offsets.breakDuration ?? '01:00',
    timezone: 'UTC',
  };
}

beforeEach(() => {
  // Reset toast assertions before each remote attendance scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
  toast.success.mockReset();
  toast.error.mockReset();
});

afterEach(async () => {
  // Remove seeded logs first and fall back to user cascade cleanup if needed.
  await remoteContext.cleanup();
});

describe('When the employee loads remote attendance status without timing in', () => {
  test('Then the attendance status handler creates an absent remote log after the timeout window closes', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Attendance Absent Employee',
      emailPrefix: 'attendance.absent.employee',
    });
    const now = new Date();
    const absentConfig = buildRelativeAttendanceConfig(now, {
      timeIn: -600,
      lateAfter: -570,
      timeOut: -60,
      overtimeAfter: -30,
      autoTimeout: 180,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const status = await handleGetTodayAttendanceStatus(absentConfig);
    const { data: absentLog, error } = await remoteContext.admin
      .from('AttendanceLog')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    if (absentLog?.id) {
      remoteContext.trackAttendanceLogId(absentLog.id);
    }

    expect(status.error).toBeNull();
    expect(status.data?.isAbsent).toBe(true);
    expect(error).toBeNull();
    expect(absentLog?.is_absent).toBe(true);
  });
});

describe('When the employee completes a remote attendance lifecycle', () => {
  test('Then the attendance handlers time in, start break, end break, time out, and return the remote timeline entries', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Attendance Lifecycle Employee',
      emailPrefix: 'attendance.lifecycle.employee',
    });
    const now = new Date();
    const timeInConfig = buildRelativeAttendanceConfig(now, {
      timeIn: -120,
      lateAfter: 60,
      timeOut: 240,
      overtimeAfter: 300,
      autoTimeout: 720,
    });
    const overtimeConfig = buildRelativeAttendanceConfig(now, {
      timeIn: -240,
      lateAfter: -180,
      timeOut: -60,
      overtimeAfter: -30,
      autoTimeout: 720,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const timeInResult = await handleTimeInAttendance(timeInConfig);
    const { data: createdLog, error: createdLogError } = await remoteContext.admin
      .from('AttendanceLog')
      .select('*')
      .eq('employee_id', employee.id)
      .single();

    expect(timeInResult.error).toBeNull();
    expect(createdLogError).toBeNull();
    expect(createdLog?.id).toBeTruthy();

    remoteContext.trackAttendanceLogId(createdLog!.id);

    // Backdate the initial time-in so the later synthetic over-break window still remains chronological.
    await remoteContext.admin
      .from('AttendanceLog')
      .update({
        timein_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        timeout_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', createdLog!.id);

    const breakStartResult = await handleStartBreak(timeInConfig);
    expect(breakStartResult.error).toBeNull();

    // Move the break start backward enough to trigger the over-break branch while keeping it after time in.
    await remoteContext.admin
      .from('AttendanceLog')
      .update({
        breaktime_start: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      })
      .eq('id', createdLog!.id);

    const breakEndResult = await handleEndBreak(createdLog!.id, timeInConfig);
    const timeOutResult = await handleTimeOutAttendance(createdLog!.id, overtimeConfig);
    const timelineResult = await handleGetTodayAttendanceTimeline();
    const { data: finalLog, error: finalLogError } = await remoteContext.admin
      .from('AttendanceLog')
      .select('*')
      .eq('id', createdLog!.id)
      .single();

    expect(breakEndResult.error).toBeNull();
    expect(breakEndResult.data?.isOverBreaktime).toBe(true);
    expect(timeOutResult.error).toBeNull();
    expect(timeOutResult.data?.isOvertime).toBe(true);
    expect(finalLogError).toBeNull();
    expect(finalLog?.breaktime_end).toBeTruthy();
    expect(finalLog?.over_breaktime).toBe(true);
    expect(finalLog?.is_overtime).toBe(true);
    expect(timelineResult.error).toBeNull();
    expect(timelineResult.data?.map((entry) => entry.action)).toEqual([
      'timein',
      'startbreak',
      'endbreak',
      'timeout',
    ]);
    expect(toast.success).toHaveBeenCalledWith('Timed in successfully');
    expect(toast.success).toHaveBeenCalledWith('Break started successfully');
    expect(toast.success).toHaveBeenCalledWith('Break ended - exceeded recommended duration');
    expect(toast.success).toHaveBeenCalledWith('Timed out successfully');
  });
});
