import { describe, expect, it } from "vitest";
import { cellsOf, generateWordSearch, matchSelection, normalizeLetters } from "./wordsearch";
import { THEMES } from "./themes";
import { DIFFICULTIES } from "../shared/types";

describe("word search", () => {
  it("normalises accents and spaces", () => {
    expect(normalizeLetters("Café da manhã")).toBe("CAFEDAMANHA");
  });

  it.each(DIFFICULTIES)("places every listed word in the %s grid", (difficulty) => {
    for (const theme of THEMES) {
      const p = generateWordSearch(difficulty, 42, "pt-BR", theme.id);
      expect(p.words.length).toBeGreaterThanOrEqual(5);
      for (const w of p.words) {
        const spelled = cellsOf(w).map(({ r, c }) => p.grid[r]![c]).join("");
        expect(spelled).toBe(w.letters);
      }
      expect(p.grid.flat().every((ch) => /^[A-Z]$/.test(ch))).toBe(true);
    }
  });

  it("uses the regional word for each locale", () => {
    const br = generateWordSearch("expert", 3, "pt-BR", "cotidiano").words.map((w) => w.label);
    const pt = generateWordSearch("expert", 3, "pt-PT", "cotidiano").words.map((w) => w.label);
    expect(br).not.toContain("autocarro");
    expect(pt).not.toContain("ônibus");
  });

  it("matches selections in both directions", () => {
    const p = generateWordSearch("easy", 5, "pt-BR");
    const w = p.words[0]!;
    const cells = cellsOf(w);
    expect(matchSelection(p, cells[0]!, cells.at(-1)!)).toBe(w);
    expect(matchSelection(p, cells.at(-1)!, cells[0]!)).toBe(w);
  });
});
