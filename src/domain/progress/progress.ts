import type { DayKey, Difficulty, GameId, PlayResult, PuzzleSpec } from "../shared/types";
import { addDays, toDayKey } from "../shared/day";

/**
 * Everything we remember about a player. Stored locally for the MVP; the
 * same shape can later be synced to an account without changing the domain.
 */
export interface PlayerProgress {
  version: 1;
  results: PlayResult[];
}

export const EMPTY_PROGRESS: PlayerProgress = { version: 1, results: [] };

const MAX_RESULTS = 1000;

export function recordResult(progress: PlayerProgress, result: PlayResult): PlayerProgress {
  return { ...progress, results: [...progress.results, result].slice(-MAX_RESULTS) };
}

export function specKey(spec: PuzzleSpec): string {
  return `${spec.game}:${spec.difficulty}:${spec.seed}:${spec.locale}`;
}

/** The finished daily play for a game (a solve wins over a give-up). */
export function dailyResult(progress: PlayerProgress, day: DayKey, game: GameId): PlayResult | undefined {
  const plays = progress.results.filter((r) => r.day === day && r.spec.game === game);
  return plays.find((r) => r.solved) ?? plays[0];
}

/** Days on which the player solved at least one daily puzzle. */
export function activeDays(progress: PlayerProgress): Set<DayKey> {
  return new Set(progress.results.filter((r) => r.day && r.solved).map((r) => r.day!));
}

export interface Streak {
  current: number;
  best: number;
}

/**
 * Current streak counts back from today; if today isn't played yet, a streak
 * ending yesterday is still alive (the player has until midnight).
 */
export function computeStreak(progress: PlayerProgress, today: DayKey): Streak {
  const days = activeDays(progress);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  let best = 0;
  for (const day of days) {
    if (days.has(addDays(day, -1))) continue; // not the start of a run
    let len = 0;
    let d = day;
    while (days.has(d)) {
      len++;
      d = addDays(d, 1);
    }
    best = Math.max(best, len);
  }
  return { current, best };
}

export interface GameStats {
  played: number;
  solved: number;
  bestTimeMs: Partial<Record<Difficulty, number>>;
  averageTimeMs: number | null;
}

export function gameStats(progress: PlayerProgress, game: GameId): GameStats {
  const plays = progress.results.filter((r) => r.spec.game === game);
  const solved = plays.filter((r) => r.solved);
  const bestTimeMs: Partial<Record<Difficulty, number>> = {};
  for (const r of solved) {
    const prev = bestTimeMs[r.spec.difficulty];
    if (prev === undefined || r.timeMs < prev) bestTimeMs[r.spec.difficulty] = r.timeMs;
  }
  return {
    played: plays.length,
    solved: solved.length,
    bestTimeMs,
    averageTimeMs: solved.length ? solved.reduce((s, r) => s + r.timeMs, 0) / solved.length : null,
  };
}

/** Days in the last 7 (including today) with activity — the "3 days a week" validation metric. */
export function activeDaysThisWeek(progress: PlayerProgress, today: DayKey): number {
  const days = new Set(progress.results.map((r) => toDayKey(new Date(r.finishedAt))));
  let count = 0;
  for (let i = 0; i < 7; i++) if (days.has(addDays(today, -i))) count++;
  return count;
}
