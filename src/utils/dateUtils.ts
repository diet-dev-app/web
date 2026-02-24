/**
 * Format a Date object as "YYYY-MM-DD".
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a "YYYY-MM" string into { year, month } (1-indexed month).
 */
export function parseMonthValue(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

/**
 * Get the number of days in a given month.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get the day of the week (0=Mon, 6=Sun) for the first day of a month.
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Get today's date string as "YYYY-MM-DD".
 */
export function today(): string {
  return formatDate(new Date());
}

/**
 * Get the current month as "YYYY-MM".
 */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Extract "YYYY-MM-DD" from an ISO datetime string.
 */
export function isoToDateStr(iso: string): string {
  return iso.substring(0, 10);
}
