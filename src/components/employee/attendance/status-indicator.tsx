// app/attendance/StatusIndicator.tsx
'use client';

interface Props {
  status: any;
  nowTime: Date;
  lateTimer: string;
  absentTimer: string;
  timeRemaining: string;
  breakTimer: string;
  isCurrentlyLate?: boolean;
  isApproachingAbsent?: boolean;
  isCurrentlyOverBreak?: boolean;
  lateAfter?: Date;
  hasTimedOut?: boolean;
  isOnBreak?: boolean;
}

export default function StatusIndicator({
  status,
  nowTime,
  lateTimer,
  absentTimer,
  timeRemaining,
  breakTimer,
  isCurrentlyLate,
  isApproachingAbsent,
  isCurrentlyOverBreak,
  lateAfter,
  hasTimedOut,
  isOnBreak,
}: Props) {
  return (
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
        ) : status?.canTimeIn && nowTime < (lateAfter ?? nowTime) ? (
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
  );
}
