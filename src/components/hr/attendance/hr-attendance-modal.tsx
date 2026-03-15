'use client';

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetTodayAttendanceStatus } from '@/hooks/tanstack/queries/attendanceQueries';
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

export function HrAttendanceModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: status, isLoading, isFetching } = useGetTodayAttendanceStatus();
  const timeInMutation = useTimeInAttendance();
  const timeOutMutation = useTimeOutAttendance();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();

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
  const isOnBreak = status?.isOnBreak ?? false;
  const actionLabel = canTimeOut ? 'Time Out' : canTimeIn ? 'Time In' : 'Attendance Locked';
  const breakLabel = canStartBreak ? 'Start Break' : canEndBreak ? 'End Break' : 'Break Locked';

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

  const logs: AttendanceLogRow[] = [
    status?.timeInTime
      ? {
          action: 'timein',
          time: status.timeInTime,
          note: status.isLate ? 'Late timing in' : 'On time',
        }
      : null,
    status?.breakStartTime
      ? {
          action: 'startbreak',
          time: status.breakStartTime,
        }
      : null,
    status?.breakEndTime
      ? {
          action: 'endbreak',
          time: status.breakEndTime,
          note: status.isOverBreaktime ? 'Over break time' : undefined,
        }
      : null,
    status?.timeOutTime
      ? {
          action: 'timeout',
          time: status.timeOutTime,
          note: status.isUndertime
            ? 'Working undertime'
            : status.isOvertime
              ? 'Overtime logged'
              : undefined,
        }
      : null,
  ].filter((row): row is AttendanceLogRow => !!row);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>HR Attendance</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {status?.message ?? 'Checking attendance status...'}
          </div>

          {isOnBreak && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              You are currently on break.
            </div>
          )}

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
            <span className={status?.isLate ? 'text-orange-600' : 'text-emerald-600'}>
              {status?.isLate ? 'Late' : 'On Time'}
            </span>
          </div>

          <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-border bg-muted/20 p-2">
            {logs.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">No logs yet</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={`${log.action}-${log.time}-${index}`}
                  className="rounded bg-background px-2 py-1.5 text-xs"
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
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{log.note}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAction}
              disabled={isBusy || (!canTimeIn && !canTimeOut)}
              className="flex-1"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : actionLabel}
            </Button>
            <Button
              variant="secondary"
              onClick={handleBreakAction}
              disabled={isBusy || (!canStartBreak && !canEndBreak)}
              className="flex-1"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : breakLabel}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
