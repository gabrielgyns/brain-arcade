import type { Difficulty } from "../shared/types";
import { createRng, type Rng } from "../shared/rng";

/** A generated "what comes next?" puzzle — unlimited supply for sequências e padrões. */
export interface SequencePuzzle {
  terms: readonly number[];
  answer: number;
  rule: string;
  difficulty: Difficulty;
  seed: number;
}

type Pattern = (rng: Rng) => { terms: number[]; rule: string };

const arithmetic: Pattern = (rng) => {
  const a = 1 + rng.int(20);
  const d = 2 + rng.int(9);
  return { terms: Array.from({ length: 6 }, (_, i) => a + d * i), rule: `Soma-se ${d} a cada termo.` };
};

const geometric: Pattern = (rng) => {
  const a = 1 + rng.int(4);
  const r = 2 + rng.int(2);
  return { terms: Array.from({ length: 6 }, (_, i) => a * r ** i), rule: `Multiplica-se por ${r} a cada termo.` };
};

const growingStep: Pattern = (rng) => {
  const a = 1 + rng.int(10);
  const step = 1 + rng.int(3);
  const terms = [a];
  for (let i = 1; i < 6; i++) terms.push(terms[i - 1]! + step * i);
  return { terms, rule: `As diferenças crescem: +${step}, +${step * 2}, +${step * 3}…` };
};

const squares: Pattern = (rng) => {
  const start = 1 + rng.int(6);
  const offset = rng.int(3);
  return {
    terms: Array.from({ length: 6 }, (_, i) => (start + i) ** 2 + offset),
    rule: offset ? `Quadrados perfeitos mais ${offset}.` : "Quadrados perfeitos.",
  };
};

const fibonacciLike: Pattern = (rng) => {
  const terms = [1 + rng.int(5), 1 + rng.int(5)];
  for (let i = 2; i < 7; i++) terms.push(terms[i - 1]! + terms[i - 2]!);
  return { terms, rule: "Cada termo é a soma dos dois anteriores." };
};

const alternating: Pattern = (rng) => {
  const a = 2 + rng.int(10);
  const up = 3 + rng.int(6);
  const down = 1 + rng.int(up - 1);
  const terms = [a];
  for (let i = 1; i < 7; i++) terms.push(terms[i - 1]! + (i % 2 ? up : -down));
  return { terms, rule: `Alterna: +${up}, −${down}.` };
};

const multiplyAdd: Pattern = (rng) => {
  const a = 1 + rng.int(4);
  const add = 1 + rng.int(3);
  const terms = [a];
  for (let i = 1; i < 6; i++) terms.push(terms[i - 1]! * 2 + add);
  return { terms, rule: `Multiplica-se por 2 e soma-se ${add}.` };
};

const PATTERNS: Record<Difficulty, Pattern[]> = {
  easy: [arithmetic, geometric],
  medium: [arithmetic, geometric, growingStep, squares],
  hard: [growingStep, squares, fibonacciLike, alternating],
  expert: [fibonacciLike, alternating, multiplyAdd, squares],
};

export function generateSequence(difficulty: Difficulty, seed: number): SequencePuzzle {
  const rng = createRng(seed);
  const { terms, rule } = rng.pick(PATTERNS[difficulty])(rng);
  return { terms: terms.slice(0, -1), answer: terms.at(-1)!, rule, difficulty, seed };
}
