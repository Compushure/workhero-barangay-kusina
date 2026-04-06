/**
 * Test coverage: Unit tests for attendance server actions and attendance action handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/shared/attendance.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  attendanceOpenLogMockData,
  attendanceTimelineLogMockData,
  attendanceUnitTestConfig,
} from '../../mockData/sharedAttendanceMockData';
import {
  endBreakAction,
  getAttendanceConfigAction,
  getTodayAttendanceStatusAction,
  getTodayAttendanceTimelineAction,
  timeInAttendanceAction,
  timeOutAttendanceAction,
} from '@/actions/employee/attendance';
import {
  handleEndBreak,
  handleGetAttendanceConfig,
  handleGetTodayAttendanceStatus,
  handleGetTodayAttendanceTimeline,
  handleStartBreak,
  handleTimeInAttendance,
  handleTimeOutAttendance,
} from '@/action-handlers/employee/attendance';
import { attendanceConfig } from '@/lib/attendance-config';
import type { AttendanceLog } from '@/types';

type QueryError = { message: string } | null;
type SessionUser = { id: string; email: string };
type AttendanceLogRecord = AttendanceLog & { id: string };
type AttendanceState = {
  sessionUser: SessionUser | null;
  logs: AttendanceLogRecord[];
  selectError?: QueryError;
  insertError?: QueryError;
  updateError?: QueryError;
};
type AttendanceSelectResult = { data: AttendanceLogRecord | null; error: QueryError };
type SelectBuilder = {
  eq: (field: string, value: string) => SelectBuilder;
  gte: (field: string, value: string) => SelectBuilder;
  lte: (field: string, value: string) => SelectBuilder;
  order: (field: string, options: { ascending: boolean }) => SelectBuilder;
  limit: (count: number) => SelectBuilder;
  maybeSingle: () => Promise<AttendanceSelectResult>;
  single: () => Promise<AttendanceSelectResult>;
};

let attendanceState: AttendanceState;

const createClientMock = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.MockedFunction<() => Promise<unknown>>;
};

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<(message?: unknown) => unknown>;
    error: jest.MockedFunction<(message?: unknown) => unknown>;
  };
};

// Evaluates the current attendance query filters against the in-memory log state.
function createAttendanceSelectBuilder(state: AttendanceState): SelectBuilder {
  let employeeId: string | null = null;
  let logId: string | null = null;
  let gteTime: string | null = null;
  let lteTime: string | null = null;
  let ascending = false;
  let limitCount = Number.POSITIVE_INFINITY;

  const evaluate = async (): Promise<AttendanceSelectResult> => {
    if (state.selectError) {
      return { data: null, error: state.selectError };
    }

    let rows = [...state.logs];

    if (employeeId) {
      rows = rows.filter((row) => row.employee_id === employeeId);
    }

    if (logId) {
      rows = rows.filter((row) => row.id === logId);
    }

    if (gteTime) {
      const lowerBound = gteTime;
      rows = rows.filter(
        (row) => new Date(row.timein_time).getTime() >= new Date(lowerBound).getTime()
      );
    }

    if (lteTime) {
      const upperBound = lteTime;
      rows = rows.filter(
        (row) => new Date(row.timein_time).getTime() <= new Date(upperBound).getTime()
      );
    }

    rows.sort((left, right) => {
      const leftTime = new Date(left.timein_time).getTime();
      const rightTime = new Date(right.timein_time).getTime();
      return ascending ? leftTime - rightTime : rightTime - leftTime;
    });

    const row = rows.slice(0, limitCount)[0] ?? null;
    return { data: row, error: null };
  };

  const builder = {} as SelectBuilder;

  builder.eq = jest.fn((field: string, value: string) => {
    if (field === 'employee_id') {
      employeeId = value;
    }

    if (field === 'id') {
      logId = value;
    }

    return builder;
  });
  builder.gte = jest.fn((_field: string, value: string) => {
    gteTime = value;
    return builder;
  });
  builder.lte = jest.fn((_field: string, value: string) => {
    lteTime = value;
    return builder;
  });
  builder.order = jest.fn((_field: string, options: { ascending: boolean }) => {
    ascending = options.ascending;
    return builder;
  });
  builder.limit = jest.fn((count: number) => {
    limitCount = count;
    return builder;
  });
  builder.maybeSingle = jest.fn(evaluate);
  builder.single = jest.fn(evaluate);

  return builder;
}

// Applies AttendanceLog inserts into the in-memory state and returns Supabase-like insert chaining.
function createAttendanceInsertBuilder(
  state: AttendanceState,
  payload: Record<string, unknown>
) {
  const insertedLog: AttendanceLogRecord = {
    id: `attendance-log-${state.logs.length + 1}`,
    employee_id: String(payload.employee_id),
    timein_time: String(payload.timein_time),
    timeout_time: String(payload.timeout_time),
    is_ontime: Boolean(payload.is_ontime),
    is_overtime: Boolean(payload.is_overtime),
    is_absent: Boolean(payload.is_absent),
    no_timeout: Boolean(payload.no_timeout),
    is_undertime: Boolean(payload.is_undertime),
    breaktime_start:
      typeof payload.breaktime_start === 'string' || payload.breaktime_start === null
        ? (payload.breaktime_start ?? null)
        : null,
    breaktime_end:
      typeof payload.breaktime_end === 'string' || payload.breaktime_end === null
        ? (payload.breaktime_end ?? null)
        : null,
    over_breaktime: Boolean(payload.over_breaktime),
  };

  return {
    select: jest.fn(() => ({
      single: jest.fn(async () => {
        if (state.insertError) {
          return { data: null, error: state.insertError };
        }

        state.logs.push(insertedLog);
        return { data: insertedLog, error: null };
      }),
    })),
  };
}

// Applies AttendanceLog updates into the in-memory state and returns the updated row.
function createAttendanceUpdateBuilder(
  state: AttendanceState,
  updates: Record<string, unknown>
) {
  return {
    eq: jest.fn((_field: string, value: string) => ({
      select: jest.fn(() => ({
        single: jest.fn(async () => {
          if (state.updateError) {
            return { data: null, error: state.updateError };
          }

          const rowIndex = state.logs.findIndex((row) => row.id === value);
          if (rowIndex === -1) {
            return { data: null, error: { message: 'Attendance log not found' } };
          }

          state.logs[rowIndex] = {
            ...state.logs[rowIndex],
            ...updates,
          };

          return { data: state.logs[rowIndex], error: null };
        }),
      })),
    })),
  };
}

// Creates the mocked Supabase client used by the attendance actions.
function createAttendanceClient(state: AttendanceState) {
  return {
    auth: {
      getSession: jest.fn(async () => ({
        data: {
          session: state.sessionUser
            ? {
                user: state.sessionUser,
              }
            : null,
        },
        error: null,
      })),
    },
    from: jest.fn((table: string) => {
      if (table !== 'AttendanceLog') {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: jest.fn(() => createAttendanceSelectBuilder(state)),
        insert: jest.fn((payload: Record<string, unknown>) =>
          createAttendanceInsertBuilder(state, payload)
        ),
        update: jest.fn((updates: Record<string, unknown>) =>
          createAttendanceUpdateBuilder(state, updates)
        ),
      };
    }),
  };
}

beforeEach(() => {
  // Reset the mocked attendance state before each scenario.
  attendanceState = {
    sessionUser: { id: 'employee-1', email: 'employee.one@example.com' },
    logs: [],
  };
  createClientMock.mockReset();
  createClientMock.mockImplementation(async () => createAttendanceClient(attendanceState));
  createClient.mockImplementation(async () => createAttendanceClient(attendanceState));
  toast.success.mockReset();
  toast.error.mockReset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('When the employee loads attendance configuration data', () => {
  test('Then the getAttendanceConfigAction action returns the configured attendance windows', async () => {
    const result = await getAttendanceConfigAction();

    expect(result.error).toBeNull();
    expect(result.data).toEqual(expect.objectContaining({ ...attendanceConfig }));
  });

  test('Then the handleGetAttendanceConfig handler forwards the configuration without showing an error toast', async () => {
    const result = await handleGetAttendanceConfig();

    expect(result.error).toBeNull();
    expect(result.data).toEqual(expect.objectContaining({ ...attendanceConfig }));
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('When the employee loads the attendance timeline', () => {
  test('Then the getTodayAttendanceTimelineAction action returns the ordered timeline with late, break, and undertime notes', async () => {
    // Use a UTC value that still falls on the same Manila calendar day as the mocked log.
    jest.setSystemTime(new Date('2026-04-06T08:00:00.000Z'));
    attendanceState.logs = [{ ...attendanceTimelineLogMockData }];

    const result = await getTodayAttendanceTimelineAction();

    expect(result.error).toBeNull();
    expect(result.data?.map((entry) => entry.action)).toEqual([
      'timein',
      'startbreak',
      'endbreak',
      'timeout',
    ]);
    expect(result.data?.[0].note).toBe('Late timing in');
    expect(result.data?.[2].note).toBe('Over break time');
    expect(result.data?.[3].note).toBe('Working undertime');
  });

  test('Then the handleGetTodayAttendanceTimeline handler returns the timeline entries when the action succeeds', async () => {
    // Use a UTC value that still falls on the same Manila calendar day as the mocked log.
    jest.setSystemTime(new Date('2026-04-06T08:00:00.000Z'));
    attendanceState.logs = [{ ...attendanceTimelineLogMockData }];

    const result = await handleGetTodayAttendanceTimeline();

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(4);
  });
});

describe('When the employee loads the current attendance status', () => {
  test('Then the getTodayAttendanceStatusAction action auto-marks the day absent when no time in exists after timeout', async () => {
    jest.setSystemTime(new Date('2026-04-06T18:00:00.000Z'));

    const result = await getTodayAttendanceStatusAction(attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.isAbsent).toBe(true);
    expect(result.data?.message).toContain('marked absent');
    expect(attendanceState.logs).toHaveLength(1);
    expect(attendanceState.logs[0].is_absent).toBe(true);
  });

  test('Then the handleGetTodayAttendanceStatus handler returns the current break state without showing a toast', async () => {
    jest.setSystemTime(new Date('2026-04-06T12:30:00.000Z'));
    attendanceState.logs = [
      {
        ...attendanceOpenLogMockData,
        breaktime_start: '2026-04-06T12:10:00.000Z',
        breaktime_end: null,
      },
    ];

    const result = await handleGetTodayAttendanceStatus(attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.isOnBreak).toBe(true);
    expect(result.data?.canEndBreak).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('When the employee records attendance actions', () => {
  test('Then the timeInAttendanceAction action creates the first attendance log for the day', async () => {
    jest.setSystemTime(new Date('2026-04-06T07:10:00.000Z'));

    const result = await timeInAttendanceAction(attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.hasTimedIn).toBe(true);
    expect(result.data?.isLate).toBe(false);
    expect(attendanceState.logs).toHaveLength(1);
  });

  test('Then the timeOutAttendanceAction action prevents timing out while the employee is still on break', async () => {
    jest.setSystemTime(new Date('2026-04-06T18:10:00.000Z'));
    attendanceState.logs = [
      {
        ...attendanceOpenLogMockData,
        breaktime_start: '2026-04-06T12:00:00.000Z',
        breaktime_end: null,
      },
    ];

    const result = await timeOutAttendanceAction(undefined, attendanceUnitTestConfig);

    expect(result.error).toBe('Cannot time out while on break. End your break first.');
  });

  test('Then the startBreakAction action starts the current break and the handler shows a success toast', async () => {
    jest.setSystemTime(new Date('2026-04-06T12:00:00.000Z'));
    attendanceState.logs = [{ ...attendanceOpenLogMockData }];

    const result = await handleStartBreak(attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.isOnBreak).toBe(true);
    expect(attendanceState.logs[0].breaktime_start).toBe('2026-04-06T12:00:00.000Z');
    expect(toast.success).toHaveBeenCalledWith('Break started successfully');
  });

  test('Then the endBreakAction action marks the break as over duration when it exceeds the configured limit', async () => {
    jest.setSystemTime(new Date('2026-04-06T13:20:00.000Z'));
    attendanceState.logs = [
      {
        ...attendanceOpenLogMockData,
        breaktime_start: '2026-04-06T12:00:00.000Z',
        breaktime_end: null,
      },
    ];

    const result = await endBreakAction(undefined, attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.isOverBreaktime).toBe(true);
    expect(result.data?.message).toBe('Break ended - exceeded recommended duration');
  });

  test('Then the handleTimeOutAttendance handler updates the log and shows a success toast after timing out', async () => {
    jest.setSystemTime(new Date('2026-04-06T18:10:00.000Z'));
    attendanceState.logs = [{ ...attendanceOpenLogMockData }];

    const result = await handleTimeOutAttendance(undefined, attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.hasTimedOut).toBe(true);
    expect(attendanceState.logs[0].is_overtime).toBe(true);
    expect(toast.success).toHaveBeenCalledWith('Timed out successfully');
  });

  test('Then the handleTimeInAttendance handler returns an error and shows a toast when time in is outside the allowed window', async () => {
    jest.setSystemTime(new Date('2026-04-06T06:30:00.000Z'));

    const result = await handleTimeInAttendance(attendanceUnitTestConfig);

    expect(result.error).toContain('Time in starts at');
    expect(toast.error).toHaveBeenCalled();
  });

  test('Then the handleEndBreak handler shows the over-break toast when the employee exceeded the break duration', async () => {
    jest.setSystemTime(new Date('2026-04-06T13:20:00.000Z'));
    attendanceState.logs = [
      {
        ...attendanceOpenLogMockData,
        breaktime_start: '2026-04-06T12:00:00.000Z',
        breaktime_end: null,
      },
    ];

    const result = await handleEndBreak(undefined, attendanceUnitTestConfig);

    expect(result.error).toBeNull();
    expect(result.data?.isOverBreaktime).toBe(true);
    expect(toast.success).toHaveBeenCalledWith('Break ended - exceeded recommended duration');
  });
});
