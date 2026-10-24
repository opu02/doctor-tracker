import clsx, { ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
});

export function formatDate(value: string | Date): string {
  return dateFormat.format(new Date(value));
}

/** "2026-10-24" -> "24 Oct" (parsed as UTC so the day never shifts). */
export function formatDayKey(key: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
    new Date(`${key}T00:00:00Z`)
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const number = (value: number) => new Intl.NumberFormat("en-US").format(value);

const DHAKA = "Asia/Dhaka";

/** ISO timestamp -> "YYYY-MM-DD" in Dhaka time (value for <input type="date">). */
export function toDateInput(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: DHAKA }).format(new Date(value));
}

export const todayInput = () => toDateInput(new Date());

/** "YYYY-MM-DD" (a Dhaka calendar day) -> ISO timestamp at noon Dhaka time, so the day never shifts. */
export function dateInputToIso(day: string): string {
  return new Date(`${day}T12:00:00+06:00`).toISOString();
}

/** Filter helpers: start / end of a Dhaka calendar day as ISO strings (empty stays empty). */
export const rangeStart = (day: string) => (day ? new Date(`${day}T00:00:00+06:00`).toISOString() : undefined);
export const rangeEnd = (day: string) => (day ? new Date(`${day}T23:59:59.999+06:00`).toISOString() : undefined);
