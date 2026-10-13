import { describe, it, expect } from "vitest";
import { itemsToText } from "./pdfText";

const item = (str, y) => ({ str, y, height: 10 });

describe("itemsToText", () => {
  it("joins pieces on the same line", () => {
    const items = [item("Hel", 700), item("lo ", 700), item("world", 688)];
    expect(itemsToText(items)).toBe("Hello world");
  });

  it("joins the lines of one paragraph with spaces", () => {
    const items = [item("one", 700), item("two", 688), item("three", 676)];
    expect(itemsToText(items)).toBe("one two three");
  });

  it("starts a new paragraph after a bigger gap", () => {
    const items = [
      item("First line", 700),
      item("continues here", 688),
      item("still here", 676),
      item("Second paragraph", 640),
      item("goes on", 628),
    ];
    expect(itemsToText(items)).toBe(
      "First line continues here still here\n\nSecond paragraph goes on"
    );
  });

  it("repairs a word split by a hyphen at the end of a line", () => {
    const items = [item("inter-", 700), item("national law", 688)];
    expect(itemsToText(items)).toBe("international law");
  });

  it("returns an empty string when there is no text", () => {
    expect(itemsToText([])).toBe("");
    expect(itemsToText([item("   ", 700)])).toBe("");
  });
});