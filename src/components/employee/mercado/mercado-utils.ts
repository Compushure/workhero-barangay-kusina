/**
 * Check if a month stall is unlocked based on the current date
 * Stalls are unlocked if the month has already occurred in the current year
 * @param month - Month number (1-12)
 * @returns true if the stall is unlocked, false if locked
 */
export function isMonthUnlocked(month: number): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = now.getFullYear();

  // A month is unlocked if it's in the current year and has already occurred
  // (i.e., current month >= target month)
  return month <= currentMonth;
}

/**
 * Get the current month number (1-12)
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}
