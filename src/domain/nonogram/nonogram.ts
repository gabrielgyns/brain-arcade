import type { Difficulty } from "../shared/types";
import { createRng, type Rng } from "../shared/rng";
import { PICTURES } from "./pictures";

/** true = filled. */
export type Solution = readonly (readonly boolean[])[];
export type Clue = readonly number[];

export interface NonogramPuzzle {
  size: number;
  rowClues: readonly Clue[];
  colClues: readonly Clue[];
  solution: Solution;
  /** Name of the picture revealed, if it came from the curated library. */
  title?: string;
  difficulty: Difficulty;
  seed: number;
}

/** Player's marks: unknown, filled, or crossed out. */
export type Mark = 0 | 1 | 2;
export const UNKNOWN: Mark = 0;
export const FILLED: Mark = 1;
export const CROSSED: Mark = 2;

const SIZE_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 5, medium: 8, hard: 10, expert: 15 };

export function clueOf(line: readonly boolean[]): Clue {
  const clue: number[] = [];
  let run = 0;
  for (const filled of line) {
    if (filled) run++;
    else if (run > 0) {
      clue.push(run);
      run = 0;
    }
  }
  if (run > 0) clue.push(run);
  return clue;
}

const column = <T,>(grid: readonly (readonly T[])[], c: number) => grid.map((row) => row[c]!);

/**
 * Deduces everything a single line can tell on its own: a cell is forced if
 * it has the same value in every arrangement of the clue consistent with what
 * is already known. Returns null when no arrangement fits (contradiction).
 */
export function solveLine(clue: Clue, line: readonly Mark[]): Mark[] | null {
  const n = line.length;
  const canFill = new Array<boolean>(n).fill(false);
  const canEmpty = new Array<boolean>(n).fill(false);
  const memo = new Map<number, boolean>();

  // fits(pos, k): can clue[k..] be placed in line[pos..]? Records reachable cell values.
  const fits = (pos: number, k: number): boolean => {
    const key = pos * 64 + k;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let ok = false;
    if (k === clue.length) {
      ok = true;
      for (let i = pos; i < n; i++) if (line[i] === FILLED) ok = false;
      if (ok) for (let i = pos; i < n; i++) canEmpty[i] = true;
    } else {
      const len = clue[k]!;
      for (let start = pos; start + len <= n; start++) {
        // Cells before the block must be empty.
        if (start > pos && line[start - 1] === FILLED) break;
        let blockOk = true;
        for (let i = start; i < start + len; i++) if (line[i] === CROSSED) blockOk = false;
        const end = start + len;
        if (!blockOk || (end < n && line[end] === FILLED)) continue;
        const next = end < n ? end + 1 : end;
        if (fits(next, k + 1)) {
          ok = true;
          for (let i = pos; i < start; i++) canEmpty[i] = true;
          for (let i = start; i < end; i++) canFill[i] = true;
          if (end < n) canEmpty[end] = true;
        }
      }
    }
    memo.set(key, ok);
    return ok;
  };

  if (!fits(0, 0)) return null;
  return line.map((m, i) => {
    if (canFill[i] && !canEmpty[i]) return FILLED;
    if (canEmpty[i] && !canFill[i]) return CROSSED;
    return m;
  });
}

/**
 * Repeatedly applies line logic to rows and columns. If it fills the board,
 * the puzzle has exactly one solution and needs no guessing.
 */
export function solveByLogic(rowClues: readonly Clue[], colClues: readonly Clue[]): Mark[][] | null {
  const rows = rowClues.length;
  const cols = colClues.length;
  const grid: Mark[][] = Array.from({ length: rows }, () => new Array<Mark>(cols).fill(UNKNOWN));
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < rows; r++) {
      const next = solveLine(rowClues[r]!, grid[r]!);
      if (!next) return null;
      if (next.some((m, c) => m !== grid[r]![c])) {
        grid[r] = next;
        changed = true;
      }
    }
    for (let c = 0; c < cols; c++) {
      const next = solveLine(colClues[c]!, column(grid, c));
      if (!next) return null;
      next.forEach((m, r) => {
        if (m !== grid[r]![c]) {
          grid[r]![c] = m;
          changed = true;
        }
      });
    }
  }
  return grid;
}

export function isLineSolvable(solution: Solution): boolean {
  const { rowClues, colClues } = cluesOf(solution);
  const result = solveByLogic(rowClues, colClues);
  return !!result && result.every((row, r) => row.every((m, c) => (m === FILLED) === solution[r]![c]));
}

export function cluesOf(solution: Solution) {
  const size = solution[0]?.length ?? 0;
  return {
    rowClues: solution.map(clueOf),
    colClues: Array.from({ length: size }, (_, c) => clueOf(column(solution, c))),
  };
}

function randomPicture(size: number, rng: Rng): boolean[][] {
  // Random noise smoothed by one cellular-automaton pass gives blob-like shapes
  // that feel more like pictures than pure static.
  const noise = Array.from({ length: size }, () => Array.from({ length: size }, () => rng.next() < 0.58));
  return noise.map((row, r) =>
    row.map((cell, c) => {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) if ((dr || dc) && noise[r + dr]?.[c + dc]) n++;
      return n >= 5 ? true : n <= 2 ? false : cell;
    }),
  );
}

export function generateNonogram(difficulty: Difficulty, seed: number): NonogramPuzzle {
  const rng = createRng(seed);
  const size = SIZE_BY_DIFFICULTY[difficulty];

  // Half the time (when one exists) reveal a hand-drawn picture instead of abstract art.
  const library = PICTURES.filter((p) => p.rows.length === size);
  if (library.length > 0 && rng.next() < 0.5) {
    const picture = rng.pick(library);
    const solution = picture.rows.map((row) => [...row].map((ch) => ch === "#"));
    if (isLineSolvable(solution)) return build(solution, difficulty, seed, picture.name);
  }

  for (let attempt = 0; attempt < 500; attempt++) {
    const solution = randomPicture(size, rng);
    const filled = solution.flat().filter(Boolean).length;
    if (filled < size * size * 0.35) continue;
    if (solution.some((row) => !row.includes(true))) continue;
    if (isLineSolvable(solution)) return build(solution, difficulty, seed);
  }
  throw new Error(`could not generate a ${size}x${size} nonogram`);
}

function build(solution: boolean[][], difficulty: Difficulty, seed: number, title?: string): NonogramPuzzle {
  const { rowClues, colClues } = cluesOf(solution);
  return { size: solution.length, rowClues, colClues, solution, title, difficulty, seed };
}

/** Solved when every filled mark matches the picture; crosses are just notes. */
export function isNonogramSolved(marks: readonly (readonly Mark[])[], solution: Solution): boolean {
  return solution.every((row, r) => row.every((filled, c) => (marks[r]![c] === FILLED) === filled));
}

/** A clue is "satisfied" when the player's filled cells already produce it. */
export function lineMatchesClue(marks: readonly Mark[], clue: Clue): boolean {
  const got = clueOf(marks.map((m) => m === FILLED));
  return got.length === clue.length && got.every((v, i) => v === clue[i]);
}

export function colMarks(marks: readonly (readonly Mark[])[], c: number): Mark[] {
  return column(marks, c);
}
