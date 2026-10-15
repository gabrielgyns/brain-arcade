import { describe, expect, it } from "vitest";
import { compareToChallenge, decodeChallenge, encodeChallenge, type FriendChallenge } from "./challenge";

const sample: FriendChallenge = {
  spec: { game: "sudoku", difficulty: "hard", seed: 3_000_000_000, locale: "pt-PT" },
  timeMs: 272_000,
  mistakes: 2,
  name: "João & Ana",
  day: "2026-10-15",
};

describe("friend challenge links", () => {
  it("round-trips through the URL code", () => {
    const code = encodeChallenge(sample);
    expect(code).not.toMatch(/[\s&?#/]/);
    expect(decodeChallenge(code)).toEqual(sample);
  });

  it("rejects garbage", () => {
    expect(decodeChallenge("")).toBeNull();
    expect(decodeChallenge("z~m~1~BR~1~0~~")).toBeNull();
  });

  it("compares by time, then mistakes", () => {
    expect(compareToChallenge(sample, 200_000, 5)).toBe("won");
    expect(compareToChallenge(sample, 300_000, 0)).toBe("lost");
    expect(compareToChallenge(sample, 272_000, 1)).toBe("won");
    expect(compareToChallenge(sample, 272_400, 2)).toBe("tie");
  });
});
