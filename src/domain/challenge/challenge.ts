import { DIFFICULTIES, GAME_IDS, type GameId, type PuzzleSpec } from "../shared/types";
import { isDayKey } from "../shared/day";

/**
 * "Desafiar um amigo": the whole challenge travels inside the link, so the
 * friend can play the exact same puzzle with no account and no backend.
 */
export interface FriendChallenge {
  spec: PuzzleSpec;
  /** Challenger's time to beat. */
  timeMs: number;
  mistakes: number;
  name?: string;
  day?: string;
}

const GAME_CODES: Record<GameId, string> = { sudoku: "s", wordsearch: "w", nonogram: "n", riddle: "r", sequence: "q" };
const DIFF_CODES = { easy: "e", medium: "m", hard: "h", expert: "x" } as const;

const invert = <K extends string, V extends string>(rec: Record<K, V>) =>
  Object.fromEntries(Object.entries(rec).map(([k, v]) => [v, k])) as Record<V, K>;

/** Compact, URL-safe and human-inspectable: s.m.1a2b3c.BR.272000.0.Ana.2026-10-15 */
export function encodeChallenge(c: FriendChallenge): string {
  const parts = [
    GAME_CODES[c.spec.game],
    DIFF_CODES[c.spec.difficulty],
    c.spec.seed.toString(36),
    c.spec.locale === "pt-PT" ? "PT" : "BR",
    Math.round(c.timeMs / 1000).toString(36),
    c.mistakes.toString(36),
    encodeURIComponent((c.name ?? "").slice(0, 24)),
    c.day ?? "",
  ];
  return parts.join("~");
}

export function decodeChallenge(code: string): FriendChallenge | null {
  const [g, d, seed, loc, time, mistakes, name, day] = code.split("~");
  const game = invert(GAME_CODES)[g ?? ""];
  const difficulty = invert(DIFF_CODES)[(d ?? "") as (typeof DIFF_CODES)[keyof typeof DIFF_CODES]];
  const seedNum = parseInt(seed ?? "", 36);
  const timeSec = parseInt(time ?? "", 36);
  if (!game || !GAME_IDS.includes(game) || !difficulty || !DIFFICULTIES.includes(difficulty)) return null;
  if (!Number.isFinite(seedNum) || !Number.isFinite(timeSec)) return null;
  let decodedName = "";
  try {
    decodedName = decodeURIComponent(name ?? "");
  } catch {
    decodedName = "";
  }
  return {
    spec: { game, difficulty, seed: seedNum >>> 0, locale: loc === "PT" ? "pt-PT" : "pt-BR" },
    timeMs: timeSec * 1000,
    mistakes: parseInt(mistakes ?? "0", 36) || 0,
    name: decodedName || undefined,
    day: day && isDayKey(day) ? day : undefined,
  };
}

export type ChallengeVerdict = "won" | "lost" | "tie";

/** Faster wins; on equal time, fewer mistakes wins. */
export function compareToChallenge(c: FriendChallenge, timeMs: number, mistakes: number): ChallengeVerdict {
  const a = Math.round(timeMs / 1000);
  const b = Math.round(c.timeMs / 1000);
  if (a !== b) return a < b ? "won" : "lost";
  if (mistakes !== c.mistakes) return mistakes < c.mistakes ? "won" : "lost";
  return "tie";
}
