'use client';

import { useEffect, useMemo, useState } from 'react';
import { UserCheck, LogIn } from 'lucide-react';
import type { AttendanceConfig } from '@/types';
import { useGetTodayAttendanceStatus, useTimeInAttendance, useTimeOutAttendance } from '@/hooks/tanstack';
import { attendanceConfig } from '@/lib/attendance-config';

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

interface AttendanceWidgetProps {
  config?: Partial<AttendanceConfig>;
}

export default function AttendanceIcon({ config }: AttendanceWidgetProps) {
  const mergedConfig: AttendanceConfig = useMemo(
    () => ({
      timeInAt: config?.timeInAt ?? attendanceConfig.timeInAt,
      timeOutAt: config?.timeOutAt ?? attendanceConfig.timeOutAt,
      lateAfter: config?.lateAfter ?? config?.timeInAt ?? attendanceConfig.lateAfter,
      overtimeAfter: config?.overtimeAfter ?? config?.timeOutAt ?? attendanceConfig.overtimeAfter,
      autoTimeoutAt: config?.autoTimeoutAt ?? attendanceConfig.autoTimeoutAt,
    }),
    [config]
  );

  const { data: status } = useGetTodayAttendanceStatus(mergedConfig);
  const timeInMutation = useTimeInAttendance(mergedConfig);
  const timeOutMutation = useTimeOutAttendance(mergedConfig);

  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [nowTime, setNowTime] = useState<Date>(new Date());

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setNowTime(now);
      const nextReset = getNextResetTime(mergedConfig.timeInAt);
      const diff = nextReset.getTime() - now.getTime();
      setTimeRemaining(formatTimeRemaining(diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mergedConfig.timeInAt]);

  const isBusy = timeInMutation.isPending || timeOutMutation.isPending;
  const canTimeIn = status?.canTimeIn ?? false;
  const canTimeOut = status?.canTimeOut ?? false;
  const hasTimedOut = status?.hasTimedOut ?? false;
  const timeOutAt = parseTimeOnDate(nowTime, mergedConfig.timeOutAt);
  const overtimeAfter = parseTimeOnDate(nowTime, mergedConfig.overtimeAfter);

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

  const buttonLabel = status?.isAbsent
    ? 'Absent'
    : canTimeIn
    ? 'Time In'
    : canTimeOut
      ? 'Time Out'
      : hasTimedOut
        ? 'Timed Out'
        : 'Attendance Locked';

  const handleClick = () => {
    if (canTimeIn) {
      timeInMutation.mutate();
      return;
    }
    if (canTimeOut) {
      timeOutMutation.mutate(status?.logId);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {status?.isAbsent ? (
        <span className="text-xs font-semibold text-red-600">
          Marked absent for today
        </span>
      ) : !status?.hasTimedIn ? (
        <span className="text-xs font-semibold text-green-600">
          {status?.message || 'Time in available soon'}
        </span>
      ) : hasTimedOut ? (
        <span className="text-xs text-muted-foreground">Reset in: {timeRemaining}</span>
      ) : (
        <span className="text-xs text-muted-foreground">Ready to time out</span>
      )}

      <button
        onClick={handleClick}
        disabled={isBusy || status?.isAbsent || (!canTimeIn && !canTimeOut)}
        className="relative flex items-center cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="bg-green-100 text-green-800 font-medium px-6 py-1 rounded-full text-sm">
          {buttonLabel}
        </div>

        <div className="absolute -left-3">
          {canTimeOut || hasTimedOut ? (
            <UserCheck className="w-6 h-6 text-green-500" />
          ) : (
            <LogIn className="w-6 h-6 text-gray-500" />
          )}
        </div>
      </button>

      {warningText && (
        <span className="text-[11px] text-[#7a3d3d]">
          {warningText}
        </span>
      )}
    </div>
  );
}
