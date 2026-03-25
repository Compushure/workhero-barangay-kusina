/**
 * Check whether a month-based stall should be unlocked for the current date.
 * A month is unlocked once we are in that month or past it in the same year.
 * @param month - Month number (1-12)
 * @returns true when unlocked, false when still locked
 */
export function isMonthUnlocked(month: number): boolean {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based, so add 1.

  return month <= currentMonth;
}

// Return the current month in 1-12 format for UI logic.
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}
