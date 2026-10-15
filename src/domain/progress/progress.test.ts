import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, computeStreak, dailyResult, gameStats, recordResult, type PlayerProgress } from "./progress";
import type { PlayResult } from "../shared/types";

const play = (day: string, overrides: Partial<PlayResult> = {}): PlayResult => ({
  spec: { game: "sudoku", difficulty: "easy", seed: 1, locale: "pt-BR" },
  day,
  solved: true,
  timeMs: 60_000,
  mistakes: 0,
  hintsUsed: 0,
  finishedAt: `${day}T10:00:00`,
  ...overrides,
});

const withDays = (...days: string[]): PlayerProgress =>
  days.reduce((p, d) => recordResult(p, play(d)), EMPTY_PROGRESS);

describe("streaks", () => {
  it("counts consecutive daily days, crossing month boundaries", () => {
    const p = withDays("2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02");
    expect(computeStreak(p, "2026-10-02")).toEqual({ current: 4, best: 4 });
  });

  it("keeps yesterday's streak alive until today ends", () => {
    expect(computeStreak(withDays("2026-10-13", "2026-10-14"), "2026-10-15").current).toBe(2);
    expect(computeStreak(withDays("2026-10-12", "2026-10-13"), "2026-10-15").current).toBe(0);
  });

  it("tracks the best run", () => {
    const p = withDays("2026-10-01", "2026-10-02", "2026-10-03", "2026-10-10");
    expect(computeStreak(p, "2026-10-10")).toEqual({ current: 1, best: 3 });
  });
});

describe("game stats", () => {
  it("aggregates best and average times", () => {
    let p = recordResult(EMPTY_PROGRESS, play("2026-10-01", { timeMs: 100_000 }));
    p = recordResult(p, play("2026-10-02", { timeMs: 50_000 }));
    p = recordResult(p, play("2026-10-03", { solved: false }));
    const s = gameStats(p, "sudoku");
    expect(s).toMatchObject({ played: 3, solved: 2, averageTimeMs: 75_000 });
    expect(s.bestTimeMs.easy).toBe(50_000);
  });
});

describe("daily results", () => {
  it("counts a give-up as played but not towards the streak", () => {
    const p = recordResult(EMPTY_PROGRESS, play("2026-10-15", { solved: false }));
    expect(dailyResult(p, "2026-10-15", "sudoku")?.solved).toBe(false);
    expect(computeStreak(p, "2026-10-15").current).toBe(0);
  });
});
