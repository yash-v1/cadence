import { describe, it, expect } from "vitest";
import { splitWord, bionicSegments } from "./bionic";

describe("splitWord", () => {
  it("bolds 40% rounded up", () => {
    expect(splitWord("reading")).toEqual({ bold: "rea", rest: "ding" });
  });
  it("bolds a one-letter word fully", () => {
    expect(splitWord("a")).toEqual({ bold: "a", rest: "" });
  });
});

describe("bionicSegments", () => {
  it("keeps punctuation and spaces untouched", () => {
    expect(bionicSegments("Hi, you!")).toEqual([
      { type: "word", bold: "H", rest: "i" },
      { type: "text", text: ", " },
      { type: "word", bold: "yo", rest: "u" },
      { type: "text", text: "!" },
    ]);
  });
  it("returns an empty list for empty text", () => {
    expect(bionicSegments("")).toEqual([]);
  });
});