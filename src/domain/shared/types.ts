/** Core vocabulary shared by every game in the arcade. */

export type GameId = "sudoku" | "wordsearch" | "nonogram" | "riddle" | "sequence";

export const GAME_IDS: readonly GameId[] = ["sudoku", "wordsearch", "nonogram", "riddle", "sequence"];

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard", "expert"];

/** pt-BR and pt-PT share the UI; content (word lists) may differ per variant. */
export type Locale = "pt-BR" | "pt-PT";

/** A calendar day in ISO form (YYYY-MM-DD), used as the identity of a daily challenge. */
export type DayKey = string;

/**
 * Everything needed to reproduce a puzzle exactly. Two players holding the
 * same PuzzleSpec see the same puzzle — this is what makes daily challenges
 * and "Desafiar um amigo" links work without a server.
 */
export interface PuzzleSpec {
  game: GameId;
  difficulty: Difficulty;
  seed: number;
  locale: Locale;
}

/** The outcome of one finished play, the unit we store, share and compare. */
export interface PlayResult {
  spec: PuzzleSpec;
  /** Set when the play was a daily challenge. */
  day?: DayKey;
  solved: boolean;
  timeMs: number;
  mistakes: number;
  hintsUsed: number;
  finishedAt: string;
}
