import { describe, expect, it } from "vitest";
import { countSolutions, findConflicts, generateSudoku, isConsistent, pickHint } from "./sudoku";
import { DIFFICULTIES } from "../shared/types";

describe("sudoku generator", () => {
  it.each(DIFFICULTIES)("produces a valid, uniquely solvable %s puzzle", (difficulty) => {
    const p = generateSudoku(difficulty, 12345);
    expect(isConsistent(p.solution)).toBe(true);
    expect(p.solution.every((v) => v >= 1 && v <= 9)).toBe(true);
    expect(p.givens.every((v, i) => v === 0 || v === p.solution[i])).toBe(true);
    expect(countSolutions(p.givens, 2)).toBe(1);
  });

  it("is deterministic for a given seed", () => {
    expect(generateSudoku("medium", 7).givens).toEqual(generateSudoku("medium", 7).givens);
    expect(generateSudoku("medium", 7).givens).not.toEqual(generateSudoku("medium", 8).givens);
  });

  it("removes more clues on harder difficulties", () => {
    const clues = (d: (typeof DIFFICULTIES)[number]) =>
      generateSudoku(d, 99).givens.filter((v) => v !== 0).length;
    expect(clues("easy")).toBeGreaterThan(clues("medium"));
    expect(clues("medium")).toBeGreaterThan(clues("hard"));
  });

  it("flags conflicting cells and suggests hints", () => {
    const p = generateSudoku("easy", 1);
    const grid = [...p.givens];
    const empty = grid.indexOf(0);
    const peerValue = grid.find((v, i) => v !== 0 && Math.floor(i / 9) === Math.floor(empty / 9))!;
    grid[empty] = peerValue;
    expect(findConflicts(grid).has(empty)).toBe(true);
    const hint = pickHint(p.givens, p.solution, 1);
    expect(hint).not.toBeNull();
    expect(p.givens[hint!]).toBe(0);
  });
});
