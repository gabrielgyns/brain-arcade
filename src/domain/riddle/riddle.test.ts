import { describe, expect, it } from "vitest";
import { RIDDLES, checkRiddleAnswer } from "./riddles";
import { generateSequence } from "./sequence";
import { DIFFICULTIES } from "../shared/types";

describe("riddles", () => {
  it("have unique ids and at least one answer each", () => {
    expect(new Set(RIDDLES.map((r) => r.id)).size).toBe(RIDDLES.length);
    for (const r of RIDDLES) expect(r.answers.length).toBeGreaterThan(0);
  });

  it("accepts answers regardless of case, accents and articles", () => {
    const r = RIDDLES.find((x) => x.id === "elevador")!;
    expect(checkRiddleAnswer(r, "Um Guarda-Chuva")).toBe(true);
    expect(checkRiddleAnswer(RIDDLES.find((x) => x.id === "irmaos")!, " CINCO ")).toBe(true);
    expect(checkRiddleAnswer(r, "")).toBe(false);
  });
});

describe("sequences", () => {
  it.each(DIFFICULTIES)("generate a deterministic %s sequence", (d) => {
    const a = generateSequence(d, 10);
    expect(a).toEqual(generateSequence(d, 10));
    expect(a.terms.length).toBeGreaterThanOrEqual(5);
    expect(Number.isInteger(a.answer)).toBe(true);
  });
});
