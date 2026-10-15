import type { DayKey, PuzzleSpec } from "../domain/shared/types";
import type { FriendChallenge } from "../domain/challenge/challenge";

/** Why a puzzle is being played — affects what we record and what we offer at the end. */
export type PlayMode =
  | { kind: "free" }
  | { kind: "daily"; day: DayKey }
  | { kind: "challenge"; challenge: FriendChallenge };

export interface GameProps {
  spec: PuzzleSpec;
  mode: PlayMode;
  /** Reports a finished play; the shell takes care of storage, sharing and analytics. */
  onFinish(outcome: { solved: boolean; timeMs: number; mistakes: number; hintsUsed: number }): void;
}
