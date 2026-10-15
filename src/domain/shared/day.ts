import type { DayKey } from "./types";

/** Local calendar day — players expect "today" to follow their own clock. */
export function toDayKey(date: Date): DayKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDayKey(day: DayKey): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function addDays(day: DayKey, delta: number): DayKey {
  const date = parseDayKey(day);
  date.setDate(date.getDate() + delta);
  return toDayKey(date);
}

export function isDayKey(value: string): value is DayKey {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
