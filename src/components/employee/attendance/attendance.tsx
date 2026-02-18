'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AttendanceConfig } from '@/types';
import {
  useGetTodayAttendanceStatus,
  useTimeInAttendance,
  useTimeOutAttendance,
  useStartBreak,
  useEndBreak,
} from '@/hooks/tanstack';
import { attendanceConfig } from '@/lib/attendance-config';

import {
  parseTimeOnDate,
  getNextResetTime,
  formatTimeRemaining,
  parseDurationToMs,
  calculateBreakElapsed,
} from './attendance-utils';

import StatusIndicator from './status-indicator';
import AttendanceButtons from './attendance-buttons';
import AttendanceWarnings from './attendance-warnings'; // ✅ restored import
import type { AttendanceLog } from './attendance-logs';

interface AttendanceWidgetProps {
  config?: Partial<AttendanceConfig>;
  addLog: (action: AttendanceLog['action'], note?: string) => void;
}

export default function AttendanceIcon({ config, addLog }: AttendanceWidgetProps) {
  const mergedConfig: AttendanceConfig = useMemo(
    () => ({
      timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
      timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
      lateAfter: config?.lateAfter ?? attendanceConfig.lateAfter,
      overtimeAfter: config?.overtimeAfter ?? attendanceConfig.overtimeAfter,
      autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
      breaktime_duration: config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
    }),
    [config]
  );

  const { data: status } = useGetTodayAttendanceStatus(mergedConfig);
  const timeInMutation = useTimeInAttendance(mergedConfig);
  const timeOutMutation = useTimeOutAttendance(mergedConfig);
  const startBreakMutation = useStartBreak(mergedConfig);
  const endBreakMutation = useEndBreak(mergedConfig);

  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [breakTimer, setBreakTimer] = useState<string>('');
  const [lateTimer, setLateTimer] = useState<string>('');
  const [absentTimer, setAbsentTimer] = useState<string>('');
  const [nowTime, setNowTime] = useState<Date>(new Date());

  const [isTimeInLoading, setIsTimeInLoading] = useState(false);

  const canTimeIn = status?.canTimeIn ?? false;
  const canTimeOut = status?.canTimeOut ?? false;
  const hasTimedOut = status?.hasTimedOut ?? false;
  const isOnBreak = status?.isOnBreak ?? false;

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setNowTime(now);
      const nextReset = getNextResetTime(mergedConfig.timeInAt);
      const diff = nextReset.getTime() - now.getTime();
      setTimeRemaining(formatTimeRemaining(diff));

      if (status?.isOnBreak && status?.breakStartTime) {
        const elapsedMs = calculateBreakElapsed(status.breakStartTime, now);
        const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
        const remainingMs = allowedMs - elapsedMs;
        setBreakTimer(formatTimeRemaining(Math.abs(remainingMs)));
      }

      if (!status?.hasTimedIn && !status?.isAbsent && canTimeIn) {
        const lateAfterTime = parseTimeOnDate(now, mergedConfig.lateAfter);
        const timeDiff = lateAfterTime.getTime() - now.getTime();
        setLateTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
      }

      if (!status?.hasTimedIn && !status?.isAbsent) {
        const autoTimeoutTime = parseTimeOnDate(now, mergedConfig.autoTimeoutAt);
        const timeDiff = autoTimeoutTime.getTime() - now.getTime();
        setAbsentTimer(timeDiff > 0 ? formatTimeRemaining(timeDiff) : '00:00:00');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mergedConfig, status, canTimeIn]);

  const isBusy =
    timeInMutation.isPending ||
    timeOutMutation.isPending ||
    startBreakMutation.isPending ||
    endBreakMutation.isPending;

  const lateAfter = parseTimeOnDate(nowTime, mergedConfig.lateAfter);
  const timeOutAt = parseTimeOnDate(nowTime, mergedConfig.timeOutAt);
  const overtimeAfter = parseTimeOnDate(nowTime, mergedConfig.overtimeAfter);

  const isCurrentlyOverBreak = useMemo(() => {
    if (!isOnBreak || !status?.breakStartTime) return false;
    const elapsedMs = calculateBreakElapsed(status.breakStartTime, nowTime);
    const allowedMs = parseDurationToMs(mergedConfig.breaktime_duration);
    return elapsedMs > allowedMs;
  }, [isOnBreak, status?.breakStartTime, nowTime, mergedConfig.breaktime_duration]);

  const isCurrentlyLate = useMemo(() => {
    if (status?.hasTimedIn || status?.isAbsent) return false;
    return nowTime > lateAfter && canTimeIn;
  }, [nowTime, lateAfter, status?.hasTimedIn, status?.isAbsent, canTimeIn]);

  const warningText = canTimeOut
    ? nowTime < timeOutAt
      ? 'Timing out now will be marked as undertime.'
      : nowTime >= overtimeAfter
        ? 'Timing out now will be marked as overtime.'
        : 'Timing out now will be marked on time.'
    : hasTimedOut
      ? status?.isUndertime
        ? 'You were marked undertime.'
        : status?.isOvertime
          ? 'You were marked overtime.'
          : 'You were marked on time.'
      : undefined;

  const breakWarningText = isOnBreak
    ? isCurrentlyOverBreak
      ? `⚠️ Break exceeded by ${breakTimer}.`
      : `Break time remaining: ${breakTimer}`
    : undefined;

  const handleClick = (action: 'timein' | 'timeout') => {
    if (action === 'timein' && canTimeIn) {
      setIsTimeInLoading(true);
      addLog('timein');
      timeInMutation.mutate(undefined, { onSettled: () => setIsTimeInLoading(false) });
    }
    if (action === 'timeout' && canTimeOut) {
      addLog('timeout', warningText);
      timeOutMutation.mutate(status?.logId);
    }
  };

  const handleBreakClick = (action: 'startbreak' | 'endbreak') => {
    if (action === 'startbreak' && status?.canStartBreak) {
      addLog('startbreak');
      startBreakMutation.mutate();
    }
    if (action === 'endbreak' && status?.canEndBreak) {
      addLog('endbreak');
      endBreakMutation.mutate(status?.logId);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <StatusIndicator
        status={status}
        nowTime={nowTime}
        lateTimer={lateTimer}
        absentTimer={absentTimer}
        timeRemaining={timeRemaining}
        breakTimer={breakTimer}
        isCurrentlyLate={isCurrentlyLate}
        isApproachingAbsent={false}
        isCurrentlyOverBreak={isCurrentlyOverBreak}
        lateAfter={lateAfter}
        hasTimedOut={hasTimedOut}
        isOnBreak={isOnBreak}
      />

      {/* <AttendanceWarnings
        status={status}
        warningText={warningText}
        breakWarningText={breakWarningText}
        isCurrentlyLate={isCurrentlyLate}
        isApproachingAbsent={false}
        lateTimer={lateTimer}
        absentTimer={absentTimer}
        nowTime={nowTime}
        lateAfter={lateAfter}
        isCurrentlyOverBreak={isCurrentlyOverBreak}
        hasTimedOut={hasTimedOut}
      /> */}

      <AttendanceButtons
        status={status}
        isBusy={isBusy}
        isTimeInLoading={isTimeInLoading}
        handleClick={handleClick}
        handleBreakClick={handleBreakClick}
      />
    </div>
  );
}
