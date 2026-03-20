'use client';

import PixelBadge from './warning-badges';

interface Props {
  status: any;
  warningText?: string;
  breakWarningText?: string;
  timeInAvailabilityText?: string;
  canTimeIn?: boolean;
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
  timeInAvailabilityText,
  canTimeIn,
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
    <div className="flex flex-col gap-2">
      {!status?.hasTimedIn && !status?.isAbsent && (
        <>
          {isApproachingAbsent && (
            <PixelBadge color="red">
              🚨 URGENT: You will be marked ABSENT if you don&apos;t time in within {absentTimer}!
            </PixelBadge>
          )}
          {isCurrentlyLate && !isApproachingAbsent && (
            <PixelBadge color="orange">
              ⚠️ Late arrival detected. Time in immediately to minimize impact on your record.
            </PixelBadge>
          )}
          {!isCurrentlyLate && !isApproachingAbsent && timeInAvailabilityText && (
            <PixelBadge color={canTimeIn ? 'green' : 'blue'}>
              {timeInAvailabilityText}
            </PixelBadge>
          )}
        </>
      )}

      {warningText && (
        <PixelBadge color="yellow">{warningText}</PixelBadge>
      )}

      {breakWarningText && (
        <PixelBadge color={isCurrentlyOverBreak ? 'red' : 'orange'}>
          {breakWarningText}
        </PixelBadge>
      )}

    </div>
  );
}