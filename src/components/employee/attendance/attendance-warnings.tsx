// app/attendance/AttendanceWarnings.tsx
'use client';

interface Props {
  status: any;
  warningText?: string;
  breakWarningText?: string;
  isCurrentlyLate?: boolean;
  isApproachingAbsent?: boolean;
  lateTimer: string;
  absentTimer: string;
  nowTime: Date;
  lateAfter?: Date;
  isCurrentlyOverBreak?: boolean;
  hasTimedOut?: boolean;
}

export default function AttendanceWarnings({
  status,
  warningText,
  breakWarningText,
  isCurrentlyLate,
  isApproachingAbsent,
  lateTimer,
  absentTimer,
  nowTime,
  lateAfter,
  isCurrentlyOverBreak,
  hasTimedOut,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
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
          {status?.canTimeIn && nowTime < (lateAfter ?? nowTime) && !isCurrentlyLate && (
            <span className="text-[11px] text-yellow-700">
              ℹ️ Time in within {lateTimer} to be marked on-time.
            </span>
          )}
        </>
      )}

      {warningText && (
        <span className="text-[11px] text-[#7a3d3d]">{warningText}</span>
      )}

      {breakWarningText && (
        <span
          className={`text-[11px] font-medium ${
            isCurrentlyOverBreak ? 'text-red-600' : 'text-orange-600'
          }`}
        >
          {breakWarningText}
        </span>
      )}

      {status?.hasTimedIn && status?.isLate && !hasTimedOut && (
        <span className="text-[11px] text-orange-600">
          📋 Note: You were marked late for today.
        </span>
      )}
    </div>
  );
}
