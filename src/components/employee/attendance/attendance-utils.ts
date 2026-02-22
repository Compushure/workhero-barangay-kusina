// app/attendance/attendance-utils.ts
export function parseTimeOnDate(base: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function getNextResetTime(timeInAt: string): Date {
  const now = new Date();
  const reset = parseTimeOnDate(now, timeInAt);
  if (now >= reset) reset.setDate(reset.getDate() + 1);
  return reset;
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function parseDurationToMs(duration: string): number {
  const [hours, minutes] = duration.split(':').map(Number);
  return (hours * 60 + minutes) * 60 * 1000;
}

export function calculateBreakElapsed(breakStartTime: string, now: Date): number {
  return now.getTime() - new Date(breakStartTime).getTime();
}
