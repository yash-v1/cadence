import { describe, it, expect } from "vitest";
import { groupIntoLines } from "./lines";

describe("groupIntoLines", () => {
  it("groups words with the same height into one line", () => {
    const rects = [
      { top: 0, height: 20 },
      { top: 0, height: 20 },
      { top: 0, height: 20 },
    ];
    expect(groupIntoLines(rects)).toEqual([{ center: 10, wordCount: 3 }]);
  });

  it("starts a new line when the position drops", () => {
    const rects = [
      { top: 0, height: 20 },
      { top: 0, height: 20 },
      { top: 36, height: 20 },
    ];
    expect(groupIntoLines(rects)).toEqual([
      { center: 10, wordCount: 2 },
      { center: 46, wordCount: 1 },
    ]);
  });

  it("returns nothing for no words", () => {
    expect(groupIntoLines([])).toEqual([]);
  });
});