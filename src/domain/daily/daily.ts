import type { DayKey, Difficulty, GameId, Locale, PuzzleSpec } from "../shared/types";
import { hashString } from "../shared/rng";
import { parseDayKey } from "../shared/day";

/**
 * The daily challenge is a pure function of the date: every player, on any
 * device, gets the same puzzles without a server.
 */
export interface DailyChallenge {
  day: DayKey;
  specs: readonly PuzzleSpec[];
}

export const DAILY_GAMES: readonly GameId[] = ["sudoku", "wordsearch", "nonogram", "riddle"];

/** Difficulty rotates through the week: easier on Mondays, harder towards the weekend. */
const WEEKDAY_DIFFICULTY: Record<number, Difficulty> = {
  0: "hard", // domingo
  1: "easy",
  2: "easy",
  3: "medium",
  4: "medium",
  5: "medium",
  6: "hard",
};

export function dailySeed(day: DayKey, game: GameId): number {
  return hashString(`mindarcade:${day}:${game}`);
}

export function dailyDifficulty(day: DayKey): Difficulty {
  return WEEKDAY_DIFFICULTY[parseDayKey(day).getDay()]!;
}

export function dayIndex(day: DayKey): number {
  const d = parseDayKey(day);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

export function dailyChallenge(day: DayKey, locale: Locale): DailyChallenge {
  const difficulty = dailyDifficulty(day);
  return {
    day,
    specs: DAILY_GAMES.map((game) => ({
      game,
      difficulty,
      // A riddle seed is its position in the collection; the day index cycles through all of them.
      seed: game === "riddle" ? dayIndex(day) : dailySeed(day, game),
      locale,
    })),
  };
}
