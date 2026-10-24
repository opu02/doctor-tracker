// Bangladesh has no daylight saving: Asia/Dhaka is always UTC+6.
const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
export const DHAKA_OFFSET = 6 * HOUR;
export const DHAKA_TZ = "Asia/Dhaka";

/** "YYYY-MM-DD" of the given moment as seen in Dhaka. */
export function dhakaDayKey(date: Date): string {
  return new Date(date.getTime() + DHAKA_OFFSET).toISOString().slice(0, 10);
}

/** The instant at which the Dhaka day `daysBack` days before `date` began. */
export function startOfDhakaDay(date: Date, daysBack = 0): Date {
  const [y, m, d] = dhakaDayKey(date).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - DHAKA_OFFSET - daysBack * DAY);
}

/** One entry per day from `start`, with 0 for days that have no data. */
export function fillDailySeries(
  start: Date,
  days: number,
  counts: Map<string, number>
): Array<{ date: string; count: number }> {
  return Array.from({ length: days }, (_, i) => {
    const key = dhakaDayKey(new Date(start.getTime() + i * DAY));
    return { date: key, count: counts.get(key) ?? 0 };
  });
}
