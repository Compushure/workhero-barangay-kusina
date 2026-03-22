// import { useEffect, useMemo, useState } from 'react';
// import type { AttendanceConfig } from '@/types';
// import {
//   useGetTodayAttendanceStatus,
//   useTimeInAttendance,
//   useTimeOutAttendance,
//   useStartBreak,
//   useEndBreak,
// } from '@/hooks/tanstack';
// import { attendanceConfig } from '@/lib/attendance-config';

// import {
//   parseTimeOnDate,
//   getNextResetTime,
//   formatTimeRemaining,
//   parseDurationToMs,
//   calculateBreakElapsed,
// } from './attendance-utils';

// import StatusIndicator from './status-indicator';
// import AttendanceButtons from './attendance-buttons';
// import AttendanceWarnings from './attendance-warnings'; // ✅ restored import
// import type { AttendanceLog } from './attendance-logs';

// interface AttendanceWidgetProps {
//   config?: Partial<AttendanceConfig>;
//   addLog: (action: AttendanceLog['action'], note?: string) => void;
// }

// export default function AttendanceIcon({ config, addLog }: AttendanceWidgetProps) {
//   const mergedConfig: AttendanceConfig = useMemo(
//     () => ({
//       timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
//       timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
//       lateAfter: config?.lateAfter ?? attendanceConfig.lateAfter,
//       overtimeAfter: config?.overtimeAfter ?? attendanceConfig.overtimeAfter,
//       autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
//       breaktime_duration: config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
//     }),
//     [config]
//   );

//   const { data: status } = useGetTodayAttendanceStatus(mergedConfig);
//   const timeInMutation = useTimeInAttendance(mergedConfig);
//   const timeOutMutation = useTimeOutAttendance(mergedConfig);
//   const startBreakMutation = useStartBreak(mergedConfig);
//   const endBreakMutation = useEndBreak(mergedConfig);

//   const [timeRemaining, setTimeRemaining] = useState<string>('');
//   const [breakTimer, setBreakTimer] = useState<string>('');
//   const [lateTimer, setLateTimer] = useState<string>('');
//   const [absentTimer, setAbsentTimer] = useState<string>('');
//   const [nowTime, setNowTime] = useState<Date>(new Date());

//   const [isTimeInLoading, setIsTimeInLoading] = useState(false);

//   const canTimeIn = status?.canTimeIn ?? false;
//   const canTimeOut = status?.canTimeOut ?? false;
//   const hasTimedOut = status?.hasTimedOut ?? false;
//   const isOnBreak = status?.isOnBreak ?? false;

//   useEffect(() => {
//     const updateTimer = () => {
//       const now = new Date();
//       setNowTime(now);
//       const nextReset = getNextResetTime(mergedConfig.timeInAt);
//       const diff = nextReset.getTime() - now.getTime();
//       setTimeRemaining(formatTimeRemaining(diff));

//       if (status?.isOnBreak && status?.breakStartTime) {
//         const elapsedMs = calculateBreakElapsed(status.breakStartTime, now);
//         const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
//         const remainingMs = allowedMs - elapsedMs;
//         setBreakTimer(formatTimeRemaining(Math.abs(remainingMs)));
//       }

//       if (!status?.hasTimedIn && !status?.isAbsent && canTimeIn) {
//         const lateAfterTime = parseTimeOnDate(now, mergedConfig.lateAfter);
//         const timeDiff = lateAfterTime.getTime() - now.getTime();
//         setLateTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
//       }

//       if (!status?.hasTimedIn && !status?.isAbsent) {
//         const autoTimeoutTime = parseTimeOnDate(now, mergedConfig.autoTimeoutAt);
//         const timeDiff = autoTimeoutTime.getTime() - now.getTime();
//         setAbsentTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
//       }
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);
//     return () => clearInterval(interval);
//   }, [mergedConfig, status, canTimeIn]);

//   const isBusy =
//     timeInMutation.isPending ||
//     timeOutMutation.isPending ||
//     startBreakMutation.isPending ||
//     endBreakMutation.isPending;

//   const lateAfter = parseTimeOnDate(nowTime, mergedConfig.lateAfter);
//   const timeOutAt = parseTimeOnDate(nowTime, mergedConfig.timeOutAt);
//   const overtimeAfter = parseTimeOnDate(nowTime, mergedConfig.overtimeAfter);

//   const isCurrentlyOverBreak = useMemo(() => {
//     if (!isOnBreak || !status?.breakStartTime) return false;
//     const elapsedMs = calculateBreakElapsed(status.breakStartTime, nowTime);
//     const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
//     return elapsedMs > allowedMs;
//   }, [isOnBreak, status?.breakStartTime, nowTime, mergedConfig.breaktime_duration]);

//   const isCurrentlyLate = useMemo(() => {
//     if (status?.hasTimedIn || status?.isAbsent) return false;
//     return nowTime > lateAfter && canTimeIn;
//   }, [nowTime, lateAfter, status?.hasTimedIn, status?.isAbsent, canTimeIn]);

//   const warningText = canTimeOut
//     ? nowTime < timeOutAt
//       ? 'Timing out now will be marked as undertime.'
//       : nowTime >= overtimeAfter
//         ? 'Timing out now will be marked as overtime.'
//         : 'Timing out now will be marked on time.'
//     : hasTimedOut
//       ? status?.isUndertime
//         ? 'You were marked undertime.'
//         : status?.isOvertime
//           ? 'You were marked overtime.'
//           : 'You were marked on time.'
//       : undefined;

//   const breakWarningText = isOnBreak
//     ? isCurrentlyOverBreak
//       ? `⚠️ Break exceeded by ${breakTimer}.`
//       : `Break time remaining: ${breakTimer}`
//     : undefined;

//   const handleClick = (action: 'timein' | 'timeout') => {
//     if (action === 'timein' && canTimeIn) {
//       setIsTimeInLoading(true);
//       addLog('timein');
//       timeInMutation.mutate(undefined, { onSettled: () => setIsTimeInLoading(false) });
//     }
//     if (action === 'timeout' && canTimeOut) {
//       addLog('timeout', warningText);
//       timeOutMutation.mutate(status?.logId);
//     }
//   };

//   const handleBreakClick = (action: 'startbreak' | 'endbreak') => {
//     if (action === 'startbreak' && status?.canStartBreak) {
//       addLog('startbreak');
//       startBreakMutation.mutate();
//     }
//     if (action === 'endbreak' && status?.canEndBreak) {
//       addLog('endbreak');
//       endBreakMutation.mutate(status?.logId);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4">
//       <StatusIndicator
//         status={status}
//         nowTime={nowTime}
//         lateTimer={lateTimer}
//         absentTimer={absentTimer}
//         timeRemaining={timeRemaining}
//         breakTimer={breakTimer}
//         isCurrentlyLate={isCurrentlyLate}
//         isApproachingAbsent={false}
//         isCurrentlyOverBreak={isCurrentlyOverBreak}
//         lateAfter={lateAfter}
//         hasTimedOut={hasTimedOut}
//         isOnBreak={isOnBreak}
//       />

//       {/* <AttendanceWarnings
//         status={status}
//         warningText={warningText}
//         breakWarningText={breakWarningText}
//         isCurrentlyLate={isCurrentlyLate}
//         isApproachingAbsent={false}
//         lateTimer={lateTimer}
//         absentTimer={absentTimer}
//         nowTime={nowTime}
//         lateAfter={lateAfter}
//         isCurrentlyOverBreak={isCurrentlyOverBreak}
//         hasTimedOut={hasTimedOut}
//       /> */}

//       <AttendanceButtons
//         status={status}
//         isBusy={isBusy}
//         isTimeInLoading={isTimeInLoading}
//         handleClick={handleClick}
//         handleBreakClick={handleBreakClick}
//       />
//     </div>
//   );
// }

// import { useEffect, useMemo, useState } from 'react';
// import type { AttendanceConfig } from '@/types';
// import {
//   useGetTodayAttendanceStatus,
//   useTimeInAttendance,
//   useTimeOutAttendance,
//   useStartBreak,
//   useEndBreak,
// } from '@/hooks/tanstack';
// import { attendanceConfig } from '@/lib/attendance-config';

// import {
//   parseTimeOnDate,
//   getNextResetTime,
//   formatTimeRemaining,
//   parseDurationToMs,
//   calculateBreakElapsed,
// } from './attendance-utils';

// import StatusIndicator from './status-indicator';
// import AttendanceButtons from './attendance-buttons';
// import AttendanceLogs, { AttendanceLog } from './attendance-logs';

// export default function AttendanceIcon({ config }: { config?: Partial<AttendanceConfig> }) {
//   const mergedConfig: AttendanceConfig = useMemo(
//     () => ({
//       timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
//       timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
//       lateAfter: config?.lateAfter ?? attendanceConfig.lateAfter,
//       overtimeAfter: config?.overtimeAfter ?? attendanceConfig.overtimeAfter,
//       autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
//       breaktime_duration: config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
//     }),
//     [config]
//   );

//   const { data: status } = useGetTodayAttendanceStatus(mergedConfig);
//   const timeInMutation = useTimeInAttendance(mergedConfig);
//   const timeOutMutation = useTimeOutAttendance(mergedConfig);
//   const startBreakMutation = useStartBreak(mergedConfig);
//   const endBreakMutation = useEndBreak(mergedConfig);

//   const [timeRemaining, setTimeRemaining] = useState<string>('');
//   const [breakTimer, setBreakTimer] = useState<string>('');
//   const [lateTimer, setLateTimer] = useState<string>('');
//   const [absentTimer, setAbsentTimer] = useState<string>('');
//   const [nowTime, setNowTime] = useState<Date>(new Date());

//   useEffect(() => {
//     const updateTimer = () => {
//       const now = new Date();
//       setNowTime(now);
//       const nextReset = getNextResetTime(mergedConfig.timeInAt);
//       const diff = nextReset.getTime() - now.getTime();
//       setTimeRemaining(formatTimeRemaining(diff));

//       if (status?.isOnBreak && status?.breakStartTime) {
//         const elapsedMs = calculateBreakElapsed(status.breakStartTime, now);
//         const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
//         const remainingMs = allowedMs - elapsedMs;
//         setBreakTimer(formatTimeRemaining(Math.abs(remainingMs)));
//       }

//       if (!status?.hasTimedIn && !status?.isAbsent && status?.canTimeIn) {
//         const lateAfterTime = parseTimeOnDate(now, mergedConfig.lateAfter);
//         const timeDiff = lateAfterTime.getTime() - now.getTime();
//         setLateTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
//       }

//       if (!status?.hasTimedIn && !status?.isAbsent) {
//         const autoTimeoutTime = parseTimeOnDate(now, mergedConfig.autoTimeoutAt);
//         const timeDiff = autoTimeoutTime.getTime() - now.getTime();
//         setAbsentTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
//       }
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);
//     return () => clearInterval(interval);
//   }, [mergedConfig, status]);

//   const isBusy =
//     timeInMutation.isPending ||
//     timeOutMutation.isPending ||
//     startBreakMutation.isPending ||
//     endBreakMutation.isPending;

//   const handleClick = (action: 'timein' | 'timeout') => {
//     if (action === 'timein' && status?.canTimeIn) {
//       timeInMutation.mutate();
//     }
//     if (action === 'timeout' && status?.canTimeOut) {
//       timeOutMutation.mutate(status?.logId);
//     }
//   };

//   const handleBreakClick = (action: 'startbreak' | 'endbreak') => {
//     if (action === 'startbreak' && status?.canStartBreak) {
//       startBreakMutation.mutate();
//     }
//     if (action === 'endbreak' && status?.canEndBreak) {
//       endBreakMutation.mutate(status?.logId);
//     }
//   };

//   // ✅ Derive logs with contextual notes
//   const logs = useMemo(() => {
//     const arr: AttendanceLog[] = [];

//     if (status?.timeInTime) {
//       arr.push({
//         action: 'timein',
//         time: status.timeInTime,
//         note: status?.isLate ? '⚠️ Late timing in' : undefined,
//       });
//     }

//     if (status?.breakStartTime) {
//       arr.push({
//         action: 'startbreak',
//         time: status.breakStartTime,
//       });
//     }

//     if (status?.breakEndTime) {
//       arr.push({
//         action: 'endbreak',
//         time: status.breakEndTime,
//         note: status?.isOverBreaktime ? '⚠️ Over break' : undefined,
//       });
//     }

//     if (status?.timeOutTime) {
//       arr.push({
//         action: 'timeout',
//         time: status.timeOutTime,
//         note: status?.isUndertime
//           ? '⚠️ Working undertime'
//           : status?.isOvertime
//           ? '✅ Overtime logged'
//           : undefined,
//       });
//     }

//     return arr;
//   }, [status]);

//   return (
//     <div className="flex flex-col gap-4">
//       <StatusIndicator
//         status={status}
//         nowTime={nowTime}
//         lateTimer={lateTimer}
//         absentTimer={absentTimer}
//         timeRemaining={timeRemaining}
//         breakTimer={breakTimer}
//         isCurrentlyLate={status?.isLate ?? false}
//         isApproachingAbsent={false}
//         isCurrentlyOverBreak={status?.isOverBreaktime ?? false}
//         lateAfter={parseTimeOnDate(nowTime, mergedConfig.lateAfter)}
//         hasTimedOut={status?.hasTimedOut ?? false}
//         isOnBreak={status?.isOnBreak ?? false}
//       />

//       <AttendanceButtons
//         status={status}
//         isBusy={isBusy}
//         isTimeInLoading={timeInMutation.isPending}
//         handleClick={handleClick}
//         handleBreakClick={handleBreakClick}
//       />

//       {/* Logs with contextual notes */}
//       <AttendanceLogs logs={logs} />
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import type { AttendanceConfig } from '@/types';
// import {
//   useGetTodayAttendanceStatus,
//   useTimeInAttendance,
//   useTimeOutAttendance,
//   useStartBreak,
//   useEndBreak,
// } from '@/hooks/tanstack';
// import { attendanceConfig } from '@/lib/attendance-config';

// import {
//   parseTimeOnDate,
//   getNextResetTime,
//   formatTimeRemaining,
//   parseDurationToMs,
//   calculateBreakElapsed,
// } from './attendance-utils';

// import StatusIndicator from './status-indicator';
// import AttendanceButtons from './attendance-buttons';
// import AttendanceLogs, { AttendanceLog } from './attendance-logs';
// // import AttendanceWarnings from './attendance-warnings';

// export default function AttendanceIcon({ config }: { config?: Partial<AttendanceConfig> }) {
//   const mergedConfig: AttendanceConfig = useMemo(
//     () => ({
//       timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
//       timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
//       lateAfter: config?.lateAfter ?? attendanceConfig.lateAfter,
//       overtimeAfter: config?.overtimeAfter ?? attendanceConfig.overtimeAfter,
//       autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
//       breaktime_duration: config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
//     }),
//     [config]
//   );

//   const { data: status } = useGetTodayAttendanceStatus(mergedConfig);
//   const timeInMutation = useTimeInAttendance(mergedConfig);
//   const timeOutMutation = useTimeOutAttendance(mergedConfig);
//   const startBreakMutation = useStartBreak(mergedConfig);
//   const endBreakMutation = useEndBreak(mergedConfig);

//   const [timeRemaining, setTimeRemaining] = useState<string>('');
//   const [breakTimer, setBreakTimer] = useState<string>('');
//   const [lateTimer, setLateTimer] = useState<string>('');
//   const [absentTimer, setAbsentTimer] = useState<string>('');
//   const [nowTime, setNowTime] = useState<Date>(new Date());

//   useEffect(() => {
//     const updateTimer = () => {
//       const now = new Date();
//       setNowTime(now);
//       const nextReset = getNextResetTime(mergedConfig.timeInAt);
//       const diff = nextReset.getTime() - now.getTime();
//       setTimeRemaining(formatTimeRemaining(diff));

//       if (status?.isOnBreak && status?.breakStartTime) {
//         const elapsedMs = calculateBreakElapsed(status.breakStartTime, now);
//         const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
//         const remainingMs = allowedMs - elapsedMs;
//         setBreakTimer(formatTimeRemaining(Math.abs(remainingMs)));
//       }

//       if (!status?.hasTimedIn && !status?.isAbsent && status?.canTimeIn) {
//         const lateAfterTime = parseTimeOnDate(now, mergedConfig.lateAfter);
//         const timeDiff = lateAfterTime.getTime() - now.getTime();
//         setLateTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
//       }

//       if (!status?.hasTimedIn && !status?.isAbsent) {
//         const autoTimeoutTime = parseTimeOnDate(now, mergedConfig.autoTimeoutAt);
//         const timeDiff = autoTimeoutTime.getTime() - now.getTime();
//         setAbsentTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
//       }
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);
//     return () => clearInterval(interval);
//   }, [mergedConfig, status]);

//   const isBusy =
//     timeInMutation.isPending ||
//     timeOutMutation.isPending ||
//     startBreakMutation.isPending ||
//     endBreakMutation.isPending;

//   const handleClick = (action: 'timein' | 'timeout') => {
//     if (action === 'timein' && status?.canTimeIn) {
//       timeInMutation.mutate();
//     }
//     if (action === 'timeout' && status?.canTimeOut) {
//       timeOutMutation.mutate(status?.logId);
//     }
//   };

//   const handleBreakClick = (action: 'startbreak' | 'endbreak') => {
//     if (action === 'startbreak' && status?.canStartBreak) {
//       startBreakMutation.mutate();
//     }
//     if (action === 'endbreak' && status?.canEndBreak) {
//       endBreakMutation.mutate(status?.logId);
//     }
//   };

//   // ✅ Derive logs with contextual notes
//   const logs = useMemo(() => {
//     const arr: AttendanceLog[] = [];

//     if (status?.timeInTime) {
//       arr.push({
//         action: 'timein',
//         time: status.timeInTime,
//         note: status?.isLate ? '⚠️ Late timing in' : undefined,
//       });
//     }

//     if (status?.breakStartTime) {
//       arr.push({
//         action: 'startbreak',
//         time: status.breakStartTime,
//       });
//     }

//     if (status?.breakEndTime) {
//       arr.push({
//         action: 'endbreak',
//         time: status.breakEndTime,
//         note: status?.isOverBreaktime ? '⚠️ Over break' : undefined,
//       });
//     }

//     if (status?.timeOutTime) {
//       arr.push({
//         action: 'timeout',
//         time: status.timeOutTime,
//         note: status?.isUndertime
//           ? '⚠️ Working undertime'
//           : status?.isOvertime
//           ? '✅ Overtime logged'
//           : undefined,
//       });
//     }

//     return arr;
//   }, [status]);

//   return (
//     <div className="flex flex-col gap-4">
//       <StatusIndicator
//         status={status}
//         nowTime={nowTime}
//         lateTimer={lateTimer}
//         absentTimer={absentTimer}
//         timeRemaining={timeRemaining}
//         breakTimer={breakTimer}
//         isCurrentlyLate={status?.isLate ?? false}
//         isApproachingAbsent={false}
//         isCurrentlyOverBreak={status?.isOverBreaktime ?? false}
//         lateAfter={parseTimeOnDate(nowTime, mergedConfig.lateAfter)}
//         hasTimedOut={status?.hasTimedOut ?? false}
//         isOnBreak={status?.isOnBreak ?? false}
//       />

//       <AttendanceButtons
//         status={status}
//         isBusy={isBusy}
//         isTimeInLoading={timeInMutation.isPending}
//         handleClick={handleClick}
//         handleBreakClick={handleBreakClick}
//       />

//       {/* Logs with contextual notes + warnings */}
//       <AttendanceLogs logs={logs} />

//       {/* <AttendanceWarnings
//         status={status}
//         warningText={
//           status?.canTimeOut
//             ? status?.isUndertime
//               ? 'Timing out now will be marked as undertime.'
//               : status?.isOvertime
//               ? 'Timing out now will be marked as overtime.'
//               : 'Timing out now will be marked on time.'
//             : undefined
//         }
//         breakWarningText={
//           status?.isOnBreak
//             ? status?.isOverBreaktime
//               ? `⚠️ Break exceeded by ${breakTimer}.`
//               : `Break time remaining: ${breakTimer}`
//             : undefined
//         }
//         isCurrentlyLate={status?.isLate ?? false}
//         isApproachingAbsent={false}
//         lateTimer={lateTimer}
//         absentTimer={absentTimer}
//         nowTime={nowTime}
//         lateAfter={parseTimeOnDate(nowTime, mergedConfig.lateAfter)}
//         isCurrentlyOverBreak={status?.isOverBreaktime ?? false}
//         hasTimedOut={status?.hasTimedOut ?? false}
//       /> */}
//     </div>
//   );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AttendanceConfig } from '@/types';
import {
  useGetTodayAttendanceStatus,
  useGetTodayAttendanceTimeline,
  useTimeInAttendance,
  useTimeOutAttendance,
  useStartBreak,
  useEndBreak,
} from '@/hooks/tanstack';
import { attendanceConfig } from '@/lib/attendance-config';

import {
  formatTimeRemaining,
  parseDurationToMs,
  calculateBreakElapsed,
} from './attendance-utils';

import AttendanceButtons from './attendance-buttons';
import AttendanceLogs from './attendance-logs';

export default function AttendanceIcon({ config }: { config?: Partial<AttendanceConfig> }) {
  const mergedConfig: AttendanceConfig = useMemo(
    () => ({
      timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
      timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
      lateAfter: config?.lateAfter ?? attendanceConfig.lateAfter,
      overtimeAfter: config?.overtimeAfter ?? attendanceConfig.overtimeAfter,
      autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
      breaktime_duration: config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
      timezone: config?.timezone ?? attendanceConfig.timezone,
    }),
    [config]
  );

  const { data: status } = useGetTodayAttendanceStatus(mergedConfig);
  const { data: timelineLogs } = useGetTodayAttendanceTimeline();
  const timeInMutation = useTimeInAttendance(mergedConfig);
  const timeOutMutation = useTimeOutAttendance(mergedConfig);
  const startBreakMutation = useStartBreak(mergedConfig);
  const endBreakMutation = useEndBreak(mergedConfig);

  const [breakTimer, setBreakTimer] = useState<string>('');
  const [isCurrentlyOverBreak, setIsCurrentlyOverBreak] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();

      // Break timer + overbreak check
      if (status?.isOnBreak && status?.breakStartTime) {
        const elapsedMs = calculateBreakElapsed(status.breakStartTime, now);
        const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
        const isOverBreak = elapsedMs > allowedMs;
        const timerMs = isOverBreak ? elapsedMs - allowedMs : allowedMs - elapsedMs;

        setBreakTimer(formatTimeRemaining(timerMs));
        setIsCurrentlyOverBreak(isOverBreak);
      } else {
        setBreakTimer('');
        setIsCurrentlyOverBreak(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mergedConfig, status]);

  const isBusy =
    timeInMutation.isPending ||
    timeOutMutation.isPending ||
    startBreakMutation.isPending ||
    endBreakMutation.isPending;

  const handleClick = (action: 'timein' | 'timeout') => {
    if (action === 'timein' && status?.canTimeIn) {
      timeInMutation.mutate();
    }
    if (action === 'timeout' && status?.canTimeOut) {
      timeOutMutation.mutate(status?.logId);
    }
  };

  const handleBreakClick = (action: 'startbreak' | 'endbreak') => {
    if (action === 'startbreak' && status?.canStartBreak) {
      startBreakMutation.mutate();
    }
    if (action === 'endbreak' && status?.canEndBreak) {
      endBreakMutation.mutate(status?.logId);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md bg-muted/40 border border-accent-secondary/50 px-4 py-3 text-center text-xl text-foreground">
        {status?.message ?? 'Checking attendance status...'}
      </div>

      {status?.hasTimedIn && !status?.hasTimedOut && status?.isLate ? (
        <div className="rounded-md border border-orange-400 bg-orange-50 px-4 py-2 text-center text-xl text-orange-700">
          Note: You were marked late for today.
        </div>
      ) : null}

      {status?.hasTimedIn && !status?.hasTimedOut && status?.isOvertime ? (
        <div className="rounded-md border border-red-500 bg-red-50 px-4 py-2 text-center text-xl text-red-700 font-semibold">
          ⚠️ You are currently working overtime.
        </div>
      ) : null}

      {status?.isOnBreak && breakTimer ? (
        <div className={`rounded-md border px-4 py-2 text-center text-xl ${isCurrentlyOverBreak ? 'border-red-500 bg-red-50 text-red-700' : 'border-orange-400 bg-orange-50 text-orange-700'}`}>
          {isCurrentlyOverBreak ? `Break exceeded by ${breakTimer}.` : `Break time remaining: ${breakTimer}`}
        </div>
      ) : null}

      <AttendanceButtons
        status={status}
        isBusy={isBusy}
        isTimeInLoading={timeInMutation.isPending}
        handleClick={handleClick}
        handleBreakClick={handleBreakClick}
      />

      <AttendanceLogs logs={timelineLogs ?? []} />
    </div>
  );
}
