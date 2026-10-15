import { describe, expect, it } from "vitest";
import { CROSSED, FILLED, UNKNOWN, clueOf, generateNonogram, isLineSolvable, isNonogramSolved, solveLine } from "./nonogram";
import { PICTURES } from "./pictures";
import { DIFFICULTIES } from "../shared/types";

describe("nonogram", () => {
  it("computes clues", () => {
    expect(clueOf([true, true, false, true, false])).toEqual([2, 1]);
    expect(clueOf([false, false])).toEqual([]);
  });

  it("deduces overlapping cells in a line", () => {
    // A block of 4 in 5 cells must cover the middle 3.
    const line = solveLine([4], [UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN])!;
    expect(line).toEqual([UNKNOWN, FILLED, FILLED, FILLED, UNKNOWN]);
    expect(solveLine([3], [FILLED, CROSSED, FILLED, UNKNOWN, UNKNOWN])).toBeNull();
  });

  it("only ships pictures that are solvable without guessing", () => {
    for (const p of PICTURES) {
      expect(p.rows.every((r) => r.length === p.rows.length), p.name).toBe(true);
      expect(isLineSolvable(p.rows.map((r) => [...r].map((ch) => ch === "#"))), p.name).toBe(true);
    }
  });

  it.each(DIFFICULTIES)("generates a line-solvable %s puzzle", (difficulty) => {
    for (const seed of [1, 2, 3]) {
      const p = generateNonogram(difficulty, seed);
      expect(isLineSolvable(p.solution)).toBe(true);
      const marks = p.solution.map((row) => row.map((f) => (f ? FILLED : CROSSED)));
      expect(isNonogramSolved(marks, p.solution)).toBe(true);
    }
  });
});
