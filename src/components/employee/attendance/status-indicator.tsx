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
  const statusLabel = status?.isAbsent
    ? '❌ Marked absent for today'
    : !status?.hasTimedIn
      ? '🕘 Ready to time in'
      : hasTimedOut
        ? `✅ Timed out. Reset in: ${timeRemaining}`
        : isOnBreak
          ? '🍩 On break'
          : '✅ On duty';

  return (
    <div className="flex flex-col items-center gap-1 text-xl">
      <span
        className={`font-semibold ${
          status?.isAbsent
            ? 'text-red-600 animate-pulse'
            : isOnBreak
              ? isCurrentlyOverBreak
                ? 'text-red-600 animate-pulse'
                : 'text-orange-600'
              : 'text-green-600'
        }`}
      >
        {statusLabel}
      </span>
    </div>
  );
}
