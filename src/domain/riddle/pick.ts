import { RIDDLES, type Riddle } from "./riddles";
import type { Difficulty } from "../shared/types";
import { createRng } from "../shared/rng";

/**
 * For riddles the seed *is* the position in the collection, so a daily seed
 * (the day index) cycles through every riddle before repeating, and a
 * challenge link points at exactly one riddle.
 */
export function riddleForSeed(seed: number): Riddle {
  const n = RIDDLES.length;
  return RIDDLES[((seed % n) + n) % n]!;
}

/** A seed for a random riddle of the requested difficulty. */
export function riddleSeedFor(difficulty: Difficulty, randomSeed: number): number {
  const indices = RIDDLES.map((r, i) => (r.difficulty === difficulty ? i : -1)).filter((i) => i >= 0);
  return createRng(randomSeed).pick(indices.length ? indices : RIDDLES.map((_, i) => i));
}
