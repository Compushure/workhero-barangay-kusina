'use client';

import { useEffect, useState } from 'react';
import { UserCheck, LogIn } from 'lucide-react';

function getNextResetTime(): Date {
  const now = new Date();
  const reset = new Date();
  reset.setHours(7, 0, 0, 0);
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

export default function AttendanceIcon() {
  const [hasLoggedInToday, setHasLoggedInToday] = useState(false);
  const [loginCount, setLoginCount] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const nextReset = getNextResetTime();
      const diff = nextReset.getTime() - new Date().getTime();
      setTimeRemaining(formatTimeRemaining(diff));
      if (diff <= 0) setHasLoggedInToday(false);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginToggle = () => {
    if (!hasLoggedInToday) {
      setHasLoggedInToday(true);
      setLoginCount(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Top message OR timer */}
      {!hasLoggedInToday ? (
        <span className="text-xs font-semibold text-green-600">Login in here!</span>
      ) : (
        <span className="text-xs text-muted-foreground">Reset in: {timeRemaining}</span>
      )}

      {/* Pill background with overlapping icon */}
      <button
        onClick={handleLoginToggle}
        disabled={hasLoggedInToday}
        className="relative flex items-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {/* Pill background */}
        <div className="bg-green-100 text-green-800 font-medium px-6 py-1 rounded-full text-sm">
          {hasLoggedInToday ? `Logged #${loginCount}` : 'Log Attendance'}
        </div>

        {/* Overlapping icon */}
        <div className="absolute -left-3">
          {hasLoggedInToday ? (
            <UserCheck className="w-6 h-6 text-green-500" />
          ) : (
            <LogIn className="w-6 h-6 text-gray-500" />
          )}
        </div>
      </button>
    </div>
  );
}
