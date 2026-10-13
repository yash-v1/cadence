import { describe, it, expect } from "vitest";
import { dwellSeconds, paceLabel } from "./pacing";

describe("dwellSeconds", () => {
  it("is words divided by WPM, in seconds", () => {
    expect(dwellSeconds(12, 150)).toBeCloseTo(4.8);
  });
  it("never goes below the minimum", () => {
    expect(dwellSeconds(1, 120)).toBe(1);
  });
  it("never goes above the maximum", () => {
    expect(dwellSeconds(100, 60)).toBe(12);
  });
  it("gives the minimum for an empty line", () => {
    expect(dwellSeconds(0, 120)).toBe(1);
  });
});

describe("paceLabel", () => {
  it("names the speed ranges", () => {
    expect(paceLabel(80)).toBe("Relaxed");
    expect(paceLabel(120)).toBe("Steady");
    expect(paceLabel(200)).toBe("Quick");
  });
});