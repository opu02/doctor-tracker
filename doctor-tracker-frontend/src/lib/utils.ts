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
