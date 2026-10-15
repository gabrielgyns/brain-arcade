import type { Difficulty, Locale } from "../shared/types";
import { createRng, type Rng } from "../shared/rng";
import { THEMES, resolveWord, type WordTheme } from "./themes";

export interface Direction {
  dr: number;
  dc: number;
}

export interface PlacedWord {
  /** How the word is shown in the list (with accents and spaces). */
  label: string;
  /** Normalised letters as they appear in the grid. */
  letters: string;
  start: { r: number; c: number };
  dir: Direction;
}

export interface WordSearchPuzzle {
  size: number;
  grid: readonly string[][];
  words: readonly PlacedWord[];
  theme: Pick<WordTheme, "id" | "title">;
  difficulty: Difficulty;
  seed: number;
  locale: Locale;
}

const FORWARD: Direction[] = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
];
const DIAGONAL: Direction[] = [
  { dr: 1, dc: 1 },
  { dr: -1, dc: 1 },
];
const reverse = (ds: Direction[]) => ds.map((d) => ({ dr: -d.dr, dc: -d.dc }));

const CONFIG: Record<Difficulty, { size: number; words: number; directions: Direction[] }> = {
  easy: { size: 10, words: 7, directions: FORWARD },
  medium: { size: 12, words: 10, directions: [...FORWARD, ...DIAGONAL] },
  hard: { size: 14, words: 12, directions: [...FORWARD, ...DIAGONAL, ...reverse(FORWARD)] },
  expert: {
    size: 15,
    words: 15,
    directions: [...FORWARD, ...DIAGONAL, ...reverse(FORWARD), ...reverse(DIAGONAL)],
  },
};

const ALPHABET = "ABCDEFGHIJLMNOPQRSTUVXZ"; // letters common in Portuguese

/** Strip accents and spaces so "Café da manhã" becomes "CAFEDAMANHA". */
export function normalizeLetters(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
}

function tryPlace(grid: string[][], letters: string, rng: Rng, directions: Direction[]): PlacedWord["start"] & { dir: Direction } | null {
  const size = grid.length;
  for (let attempt = 0; attempt < 200; attempt++) {
    const dir = rng.pick(directions);
    const r = rng.int(size);
    const c = rng.int(size);
    const endR = r + dir.dr * (letters.length - 1);
    const endC = c + dir.dc * (letters.length - 1);
    if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
    let fits = true;
    for (let k = 0; k < letters.length && fits; k++) {
      const cell = grid[r + dir.dr * k]![c + dir.dc * k]!;
      if (cell !== "" && cell !== letters[k]) fits = false;
    }
    if (!fits) continue;
    for (let k = 0; k < letters.length; k++) grid[r + dir.dr * k]![c + dir.dc * k] = letters[k]!;
    return { r, c, dir };
  }
  return null;
}

export function generateWordSearch(
  difficulty: Difficulty,
  seed: number,
  locale: Locale,
  themeId?: string,
): WordSearchPuzzle {
  const rng = createRng(seed);
  const theme = THEMES.find((t) => t.id === themeId) ?? rng.pick(THEMES);
  const { size, words: wanted, directions } = CONFIG[difficulty];
  const grid: string[][] = Array.from({ length: size }, () => new Array<string>(size).fill(""));

  const candidates = rng
    .shuffle(theme.words.map((w) => resolveWord(w, locale)))
    .filter((label) => normalizeLetters(label).length <= size)
    // Longer words first: they are the hardest to fit.
    .sort((a, b) => normalizeLetters(b).length - normalizeLetters(a).length);

  const placed: PlacedWord[] = [];
  for (const label of candidates) {
    if (placed.length >= wanted) break;
    const letters = normalizeLetters(label);
    const spot = tryPlace(grid, letters, rng, directions);
    if (spot) placed.push({ label, letters, start: { r: spot.r, c: spot.c }, dir: spot.dir });
  }

  for (const row of grid) {
    for (let c = 0; c < size; c++) if (row[c] === "") row[c] = ALPHABET[rng.int(ALPHABET.length)]!;
  }

  placed.sort((a, b) => a.label.localeCompare(b.label, "pt"));
  return { size, grid, words: placed, theme: { id: theme.id, title: theme.title }, difficulty, seed, locale };
}

export interface Cell {
  r: number;
  c: number;
}

/** The cells a straight selection from `a` to `b` covers, or null if not a line. */
export function cellsBetween(a: Cell, b: Cell): Cell[] | null {
  const dr = Math.sign(b.r - a.r);
  const dc = Math.sign(b.c - a.c);
  const lenR = Math.abs(b.r - a.r);
  const lenC = Math.abs(b.c - a.c);
  if (lenR !== 0 && lenC !== 0 && lenR !== lenC) return null;
  const len = Math.max(lenR, lenC);
  return Array.from({ length: len + 1 }, (_, k) => ({ r: a.r + dr * k, c: a.c + dc * k }));
}

export function cellsOf(word: PlacedWord): Cell[] {
  return Array.from({ length: word.letters.length }, (_, k) => ({
    r: word.start.r + word.dir.dr * k,
    c: word.start.c + word.dir.dc * k,
  }));
}

/** Matches a player's selection against the hidden words (either reading direction). */
export function matchSelection(puzzle: WordSearchPuzzle, a: Cell, b: Cell): PlacedWord | null {
  const cells = cellsBetween(a, b);
  if (!cells) return null;
  const key = (cs: Cell[]) => cs.map((x) => `${x.r},${x.c}`).join("|");
  const selected = key(cells);
  const reversed = key([...cells].reverse());
  return puzzle.words.find((w) => {
    const k = key(cellsOf(w));
    return k === selected || k === reversed;
  }) ?? null;
}
