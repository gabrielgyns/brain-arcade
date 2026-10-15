import type { Difficulty } from "../shared/types";
import { createRng, type Rng } from "../shared/rng";

/** 81 cells, row-major. 0 = empty, 1..9 = digit. */
export type SudokuGrid = readonly number[];

export interface SudokuPuzzle {
  givens: SudokuGrid;
  solution: SudokuGrid;
  difficulty: Difficulty;
  seed: number;
}

export const SIZE = 9;
export const CELLS = 81;

/** Target number of givens per difficulty. Fewer givens = harder. */
const TARGET_GIVENS: Record<Difficulty, number> = {
  easy: 40,
  medium: 32,
  hard: 27,
  expert: 23,
};

export const rowOf = (i: number) => Math.floor(i / SIZE);
export const colOf = (i: number) => i % SIZE;
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

/** Indices of every cell that shares a row, column or box with `i` (excluding i). */
const PEERS: readonly (readonly number[])[] = Array.from({ length: CELLS }, (_, i) => {
  const peers: number[] = [];
  for (let j = 0; j < CELLS; j++) {
    if (j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i))) {
      peers.push(j);
    }
  }
  return peers;
});

export function peersOf(i: number): readonly number[] {
  return PEERS[i]!;
}

const ALL = 0b1111111110; // bits 1..9

function candidatesMask(grid: number[], i: number): number {
  let used = 0;
  for (const p of PEERS[i]!) used |= 1 << grid[p]!;
  return ALL & ~used;
}

function bitCount(n: number): number {
  let c = 0;
  while (n) {
    n &= n - 1;
    c++;
  }
  return c;
}

/**
 * Counts solutions up to `limit` using backtracking with the
 * minimum-remaining-values heuristic. `limit = 2` answers "is it unique?".
 */
export function countSolutions(input: SudokuGrid, limit = 2, rng?: Rng, out?: number[]): number {
  const grid = [...input];
  let found = 0;

  const search = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < CELLS; i++) {
      if (grid[i] !== 0) continue;
      const mask = candidatesMask(grid, i);
      const c = bitCount(mask);
      if (c === 0) return false;
      if (c < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = c;
        if (c === 1) break;
      }
    }
    if (best === -1) {
      found++;
      if (out && found === 1) out.splice(0, CELLS, ...grid);
      return found >= limit;
    }
    let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => bestMask & (1 << d));
    if (rng) digits = rng.shuffle(digits);
    for (const d of digits) {
      grid[best] = d;
      if (search()) return true;
    }
    grid[best] = 0;
    return false;
  };

  if (!isConsistent(input)) return 0;
  search();
  return found;
}

export function solve(grid: SudokuGrid): SudokuGrid | null {
  const out: number[] = [];
  return countSolutions(grid, 1, undefined, out) === 1 ? out : null;
}

/** No digit repeated in any row, column or box (ignores empty cells). */
export function isConsistent(grid: SudokuGrid): boolean {
  for (let i = 0; i < CELLS; i++) {
    const v = grid[i]!;
    if (v === 0) continue;
    for (const p of PEERS[i]!) if (grid[p] === v) return false;
  }
  return true;
}

export function generateSudoku(difficulty: Difficulty, seed: number): SudokuPuzzle {
  const rng = createRng(seed);
  const solution: number[] = [];
  countSolutions(new Array(CELLS).fill(0), 1, rng, solution);

  const givens = [...solution];
  let remaining = CELLS;
  const target = TARGET_GIVENS[difficulty];

  // Remove cells in symmetric pairs while the puzzle keeps a unique solution.
  for (const i of rng.shuffle([...Array(CELLS).keys()])) {
    if (remaining <= target) break;
    const mirror = CELLS - 1 - i;
    if (givens[i] === 0) continue;
    const backup = [givens[i]!, givens[mirror]!];
    givens[i] = 0;
    givens[mirror] = 0;
    if (countSolutions(givens, 2) !== 1) {
      givens[i] = backup[0]!;
      givens[mirror] = backup[1]!;
    } else {
      remaining -= i === mirror ? 1 : 2;
    }
  }

  // Symmetric removal can stall above the target; finish with single cells.
  for (const i of rng.shuffle([...Array(CELLS).keys()])) {
    if (remaining <= target) break;
    if (givens[i] === 0) continue;
    const backup = givens[i]!;
    givens[i] = 0;
    if (countSolutions(givens, 2) !== 1) givens[i] = backup;
    else remaining--;
  }

  return { givens, solution, difficulty, seed };
}

/** Cells whose current value conflicts with a peer — what "verificação de erros" highlights. */
export function findConflicts(grid: SudokuGrid): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < CELLS; i++) {
    const v = grid[i]!;
    if (v === 0) continue;
    for (const p of PEERS[i]!) if (grid[p] === v) conflicts.add(i);
  }
  return conflicts;
}

export function isSolved(grid: SudokuGrid, solution: SudokuGrid): boolean {
  return grid.every((v, i) => v === solution[i]);
}

/** Picks an empty or wrong cell to reveal as a hint. */
export function pickHint(grid: SudokuGrid, solution: SudokuGrid, seed: number): number | null {
  const open = grid
    .map((v, i) => (v !== solution[i] ? i : -1))
    .filter((i) => i !== -1);
  if (open.length === 0) return null;
  // Prefer the most constrained cell: it's the one a human would solve next.
  const working = grid.map((v, i) => (v === solution[i] ? v : 0));
  let best = open[0]!;
  let bestCount = 10;
  for (const i of open) {
    const c = bitCount(candidatesMask(working, i));
    if (c < bestCount) {
      best = i;
      bestCount = c;
    }
  }
  return bestCount <= 1 ? best : createRng(seed).pick(open);
}
