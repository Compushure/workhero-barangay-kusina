'use client';

import { useEffect, useMemo, useState } from 'react';
import { UserCheck, LogIn, Coffee } from 'lucide-react';
import type { AttendanceConfig } from '@/types';
import {
  useGetTodayAttendanceStatus,
  useTimeInAttendance,
  useTimeOutAttendance,
  useStartBreak,
  useEndBreak,
} from '@/hooks/tanstack';
import { attendanceConfig } from '@/lib/attendance-config';
import { useAttendanceTestStore } from '@/store/attendanceTestStore';
import AttendanceTestPanel from '@/components/attendance/test/AttendanceTestPanel';
import { Button } from "@/components/ui/button";

function parseTimeOnDate(base: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function getNextResetTime(timeInAt: string): Date {
  const now = new Date();
  const reset = parseTimeOnDate(now, timeInAt);
  if (now >= reset) reset.setDate(reset.getDate() + 1);
  return reset;
}

function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function parseDurationToMs(duration: string): number {
  const [hours, minutes] = duration.split(':').map((v) => Number(v));
  return (hours * 60 + minutes) * 60 * 1000;
}

function calculateBreakElapsed(breakStartTime: string, now: Date): number {
  const start = new Date(breakStartTime).getTime();
  const current = now.getTime();
  return current - start;
}

interface AttendanceWidgetProps {
  config?: Partial<AttendanceConfig>;
}

export default function AttendanceIcon({ config }: AttendanceWidgetProps) {
  const { configOverrides, addLog } = useAttendanceTestStore();

  const mergedConfig: AttendanceConfig = useMemo(
    () => ({
      timeInAt: configOverrides?.timeInAt ?? config?.timeInAt ?? attendanceConfig.timeInAt,
      timeOutAt: configOverrides?.timeOutAt ?? config?.timeOutAt ?? attendanceConfig.timeOutAt,
      lateAfter: configOverrides?.lateAfter ?? config?.lateAfter ?? config?.timeInAt ?? attendanceConfig.lateAfter,
      overtimeAfter: configOverrides?.overtimeAfter ?? config?.overtimeAfter ?? config?.timeOutAt ?? attendanceConfig.overtimeAfter,
      autoTimeoutAt: configOverrides?.autoTimeoutAt ?? config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
      breaktime_duration: configOverrides?.breaktime_duration ?? config?.breaktime_duration ?? attendanceConfig.breaktime_duration,
    }),
    [config, configOverrides]
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

  const canTimeIn = status?.canTimeIn ?? false;
  const canTimeOut = status?.canTimeOut ?? false;
  const hasTimedOut = status?.hasTimedOut ?? false;
  const isOnBreak = status?.isOnBreak ?? false;
  const canStartBreak = status?.canStartBreak ?? false;
  const canEndBreak = status?.canEndBreak ?? false;
  const isOverBreaktime = status?.isOverBreaktime ?? false;

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
  const autoTimeoutAt = parseTimeOnDate(nowTime, mergedConfig.autoTimeoutAt);

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

  const isApproachingAbsent = useMemo(() => {
    if (status?.hasTimedIn || status?.isAbsent) return false;
    const timeUntilAbsent = autoTimeoutAt.getTime() - nowTime.getTime();
    return timeUntilAbsent > 0 && timeUntilAbsent <= 30 * 60 * 1000;
  }, [nowTime, autoTimeoutAt, status?.hasTimedIn, status?.isAbsent]);

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
      ? `⚠️ Break exceeded by ${breakTimer}. This may reduce your on-job hours.`
      : `Break time remaining: ${breakTimer}`
    : isOverBreaktime
      ? 'Break exceeded recommended duration. Your on-job hours may be affected.'
      : undefined;

  const buttonLabel = status?.isAbsent
    ? 'Absent'
    : canTimeIn
      ? 'Time In'
      : canTimeOut
        ? 'Time Out'
        : hasTimedOut
          ? 'Timed Out'
          : isOnBreak
            ? 'On Break'
            : 'Attendance Locked';

  const handleClick = () => {
    if (canTimeIn) {
      addLog({ type: 'action', category: 'timein', message: 'Attempting to time in' });
      timeInMutation.mutate();
      return;
    }
    if (canTimeOut) {
      addLog({ type: 'action', category: 'timeout', message: 'Attempting to time out' });
      timeOutMutation.mutate(status?.logId);
    }
  };

    const handleBreakClick = () => {
    if (canStartBreak) {
      addLog({ type: 'action', category: 'break', message: 'Starting break' });
      startBreakMutation.mutate();
      return;
    }
    if (canEndBreak) {
      addLog({ type: 'action', category: 'break', message: 'Ending break' });
      endBreakMutation.mutate(status?.logId);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border bg-white shadow-sm">
      {/* Status Indicators */}
      <div className="flex flex-col items-start gap-1 text-xs">
        {status?.isAbsent ? (
          <span className="font-semibold text-red-600 animate-pulse">
            ❌ Marked absent for today
          </span>
        ) : !status?.hasTimedIn ? (
          isApproachingAbsent ? (
            <span className="font-semibold text-red-600 animate-pulse">
              ⚠️ Time in now! Absent in: {absentTimer}
            </span>
          ) : isCurrentlyLate ? (
            <span className="font-semibold text-orange-600">
              ⚠️ You are late! Time in now.
            </span>
          ) : canTimeIn && nowTime < lateAfter ? (
            <span className="font-semibold text-yellow-600">
              ⏰ Time in before: {lateTimer} (to avoid late mark)
            </span>
          ) : (
            <span className="font-semibold text-green-600">
              {status?.message || 'Time in available soon'}
            </span>
          )
        ) : hasTimedOut ? (
          <span className="text-muted-foreground">Reset in: {timeRemaining}</span>
        ) : isOnBreak ? (
          <span
            className={`font-semibold ${
              isCurrentlyOverBreak ? 'text-red-600 animate-pulse' : 'text-orange-600'
            }`}
          >
            {isCurrentlyOverBreak ? '🚨 Over break time!' : 'On break'}
          </span>
        ) : (
          <span className="text-muted-foreground">Ready to time out</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Main Attendance Button */}
        <Button
          onClick={handleClick}
          disabled={isBusy || status?.isAbsent || (!canTimeIn && !canTimeOut)}
          variant="outline"
          className="relative flex items-center gap-2 px-6 py-2 rounded-full disabled:opacity-50"
        >
          {canTimeOut || hasTimedOut ? (
            <UserCheck className="w-5 h-5 text-green-500" />
          ) : (
            <LogIn className="w-5 h-5 text-gray-500" />
          )}
          <span>{buttonLabel}</span>
        </Button>

        {/* Break Button */}
        {(canStartBreak || canEndBreak) && (
          <Button
            onClick={handleBreakClick}
            disabled={isBusy}
            variant="outline"
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full ${
              isOnBreak ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            <Coffee
              className={`w-5 h-5 ${isOnBreak ? 'text-orange-500' : 'text-blue-500'}`}
            />
            <span>{canStartBreak ? 'Start Break' : 'End Break'}</span>
          </Button>
        )}
      </div>

      {/* Lateness/Absence Warnings */}
      {!status?.hasTimedIn && !status?.isAbsent && (
        <>
          {isApproachingAbsent && (
            <span className="text-[11px] font-bold text-red-600">
              🚨 URGENT: You will be marked ABSENT if you don&apos;t time in within {absentTimer}!
            </span>
          )}
          {isCurrentlyLate && !isApproachingAbsent && (
            <span className="text-[11px] font-medium text-orange-600">
              ⚠️ Late arrival detected. Time in immediately to minimize impact on your record.
            </span>
          )}
          {canTimeIn && nowTime < lateAfter && !isCurrentlyLate && (
            <span className="text-[11px] text-yellow-700">
              ℹ️ Time in within {lateTimer} to be marked on-time.
            </span>
          )}
        </>
      )}

      {/* Timeout Warnings */}
      {warningText && (
        <span className="text-[11px] text-[#7a3d3d]">{warningText}</span>
      )}

      {/* Break Warnings */}
      {breakWarningText && (
        <span
          className={`text-[11px] font-medium ${
            isCurrentlyOverBreak ? 'text-red-600' : 'text-orange-600'
          }`}
        >
          {breakWarningText}
        </span>
      )}

      {/* Historical Status Indicators */}
      {status?.hasTimedIn && status?.isLate && !hasTimedOut && (
        <span className="text-[11px] text-orange-600">
          📋 Note: You were marked late for today.
        </span>
      )}

      {/* Developer Test Panel */}
      <AttendanceTestPanel status={status} />
    </div>
  );
}
