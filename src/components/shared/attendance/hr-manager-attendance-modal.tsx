'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  useGetAttendanceConfig,
  useGetTodayAttendanceTimeline,
  useGetTodayAttendanceStatus,
} from '@/hooks/tanstack/queries/attendanceQueries';
import {
  useTimeInAttendance,
  useTimeOutAttendance,
  useStartBreak,
  useEndBreak,
} from '@/hooks/tanstack/mutations/attendanceMutations';

type AttendanceLogRow = {
  action: 'timein' | 'timeout' | 'startbreak' | 'endbreak';
  time: string;
  note?: string;
};

function formatLogLabel(action: AttendanceLogRow['action']): string {
  if (action === 'timein') return 'Time In';
  if (action === 'timeout') return 'Time Out';
  if (action === 'startbreak') return 'Break Started';
  return 'Back to Work';
}

function parseTimeOnDate(base: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function parseDurationToMs(duration: string): number {
  const [hours, minutes] = duration.split(':').map((value) => Number(value));
  return (hours * 60 + minutes) * 60 * 1000;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

interface HrManagerAttendanceModalProps {
  view: 'manager' | 'hr';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HrManagerAttendanceModal({ view, open, onOpenChange }: HrManagerAttendanceModalProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [open]);

  const { data: attendanceConfig } = useGetAttendanceConfig();
  const { data: status, isLoading, isFetching } = useGetTodayAttendanceStatus(attendanceConfig);
  const { data: timelineLogs } = useGetTodayAttendanceTimeline();
  const timeInMutation = useTimeInAttendance(attendanceConfig);
  const timeOutMutation = useTimeOutAttendance(attendanceConfig);
  const startBreakMutation = useStartBreak(attendanceConfig);
  const endBreakMutation = useEndBreak(attendanceConfig);

  const isBusy =
    isLoading ||
    isFetching ||
    timeInMutation.isPending ||
    timeOutMutation.isPending ||
    startBreakMutation.isPending ||
    endBreakMutation.isPending;

  const canTimeIn = status?.canTimeIn ?? false;
  const canTimeOut = status?.canTimeOut ?? false;
  const canStartBreak = status?.canStartBreak ?? false;
  const canEndBreak = status?.canEndBreak ?? false;
  const hasTimedIn = status?.hasTimedIn ?? false;
  const hasTimedOut = status?.hasTimedOut ?? false;
  const isOnBreak = status?.isOnBreak ?? false;

  const statusPill = useMemo(() => {
    if (status?.isAbsent) {
      return { label: 'Absent', className: 'text-red-600' };
    }

    if (!hasTimedIn) {
      if (attendanceConfig?.lateAfter && attendanceConfig?.timeOutAt) {
        const lateAfterTime = parseTimeOnDate(now, attendanceConfig.lateAfter);
        const timeOutAt = parseTimeOnDate(now, attendanceConfig.timeOutAt);

        if (now > lateAfterTime && now <= timeOutAt) {
          return { label: 'Late (Not Timed In)', className: 'text-orange-600' };
        }
      }

      return { label: 'Not Timed In', className: 'text-muted-foreground' };
    }

    if (status?.isLate) {
      return { label: 'Late', className: 'text-orange-600' };
    }

    return { label: 'On Time', className: 'text-emerald-600' };
  }, [attendanceConfig?.lateAfter, attendanceConfig?.timeOutAt, hasTimedIn, now, status?.isAbsent, status?.isLate]);

  const breakTimingText = useMemo(() => {
    if (!isOnBreak || !status?.breakStartTime || !attendanceConfig?.breaktime_duration) {
      return null;
    }

    const allowedBreakMs = parseDurationToMs(attendanceConfig.breaktime_duration);
    const elapsedBreakMs = now.getTime() - new Date(status.breakStartTime).getTime();
    const remainingBreakMs = allowedBreakMs - elapsedBreakMs;

    if (remainingBreakMs >= 0) {
      return {
        text: `Break remaining: ${formatDuration(remainingBreakMs)}`,
        className: 'text-amber-800',
      };
    }

    return {
      text: `Break exceeded by: ${formatDuration(Math.abs(remainingBreakMs))}`,
      className: 'text-red-700',
    };
  }, [attendanceConfig?.breaktime_duration, isOnBreak, now, status?.breakStartTime]);

  const handleAction = () => {
    if (canTimeIn) {
      timeInMutation.mutate();
      return;
    }

    if (canTimeOut) {
      timeOutMutation.mutate(status?.logId);
    }
  };

  const handleBreakAction = () => {
    if (canStartBreak) {
      startBreakMutation.mutate();
      return;
    }

    if (canEndBreak) {
      endBreakMutation.mutate(status?.logId);
    }
  };

  const logs: AttendanceLogRow[] = (timelineLogs ?? []).map((entry) => ({
    action: entry.action,
    time: entry.time,
    note: entry.note,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>{view === 'manager' ? "Manager" : "HR"} Attendance</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="rounded-md bg-muted/40 border border-accent-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            {status?.message ?? 'Checking attendance status...'}
          </div>

          {isOnBreak && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              You are currently on break.
              {breakTimingText ? <p className={`mt-1 text-xs font-medium ${breakTimingText.className}`}>{breakTimingText.text}</p> : null}
            </div>
          )}

          {hasTimedIn && !hasTimedOut && status?.isOvertime ? (
            <div className="rounded-md border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 font-semibold">
              ⚠️ Employee is currently working overtime.
            </div>
          ) : null}

          {status?.timeInTime && (
            <div className="rounded-md border border-border px-3 py-2 text-sm">
              <p className="font-medium text-foreground">Timed in at</p>
              <p className="text-muted-foreground">
                {new Date(status.timeInTime).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
          )}

          <div className="rounded-md border border-border px-3 py-2 text-sm">
            <span className="font-medium text-foreground">Status: </span>
            <span className={statusPill.className}>
              {statusPill.label}
            </span>
          </div>

          <div className="h-40 sm:h-44 space-y-1.5 overflow-y-auto rounded-md border border-border bg-muted/20 p-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent">
            {logs.length === 0 ? (
              <p className="text-center text-[11px] text-muted-foreground">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={`${log.action}-${log.time}-${index}`}
                  className="rounded bg-background px-2 py-1 text-[11px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {formatLogLabel(log.action)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(log.time).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                  {log.note && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{log.note}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!hasTimedIn && !hasTimedOut && canTimeIn ? (
              <Button
                onClick={handleAction}
                disabled={isBusy}
                className="flex-1 bg-accent text-primary-foreground hover:bg-accent-secondary"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Time In'}
              </Button>
            ) : null}

            {hasTimedIn && !hasTimedOut && !isOnBreak ? (
              <>
                <Button
                  onClick={handleBreakAction}
                  disabled={isBusy || !canStartBreak}
                  className="flex-1 bg-accent text-primary-foreground hover:bg-accent-secondary"
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Break'}
                </Button>
                <Button onClick={handleAction} disabled={isBusy || !canTimeOut} className="flex-1">
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Time Out'}
                </Button>
              </>
            ) : null}

            {isOnBreak && !hasTimedOut ? (
              <Button
                onClick={handleBreakAction}
                disabled={isBusy || !canEndBreak}
                className="flex-1 bg-accent text-primary-foreground hover:bg-accent-secondary"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'End Break'}
              </Button>
            ) : null}

            {hasTimedOut && status?.isAbsent ? (
              <div className="flex-1 flex items-center justify-center rounded-md border border-red-500 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                Absent
              </div>
            ) : null}

            {hasTimedOut && !status?.isAbsent ? (
              <div className="flex-1 flex items-center justify-center rounded-md border border-green-500 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                Already Timed Out
              </div>
            ) : null}

            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy} className='bg-card text-primary hover:bg-gray-200 hover:text-primary sm:px-6'>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
