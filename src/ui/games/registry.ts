import type { ComponentType } from "react";
import type { Difficulty, GameId } from "../../domain/shared/types";
import type { GameProps } from "../../app/session";
import { randomSeed } from "../../domain/shared/rng";
import { riddleSeedFor } from "../../domain/riddle/pick";
import { SudokuGame } from "./SudokuGame";
import { WordSearchGame } from "./WordSearchGame";
import { NonogramGame } from "./NonogramGame";
import { RiddleGame, SequenceGame } from "./RiddleGame";

export const GAME_COMPONENTS: Record<GameId, ComponentType<GameProps>> = {
  sudoku: SudokuGame,
  wordsearch: WordSearchGame,
  nonogram: NonogramGame,
  riddle: RiddleGame,
  sequence: SequenceGame,
};

export const GAME_ICONS: Record<GameId, string> = {
  sudoku: "🔢",
  wordsearch: "🔤",
  nonogram: "🖼️",
  riddle: "🧩",
  sequence: "📈",
};

/** A fresh seed for free play. Riddle seeds index the curated collection. */
export function newSeed(game: GameId, difficulty: Difficulty): number {
  return game === "riddle" ? riddleSeedFor(difficulty, randomSeed()) : randomSeed();
}
