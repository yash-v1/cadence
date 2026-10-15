import { describe, it, expect } from "vitest";
import { sanitizeSettings } from "./settingsSchema";

describe("sanitizeSettings", () => {
  it("accepts valid values", () => {
    const input = { fontSize: 24, theme: "dark", bionic: true, fontFamily: "lexend" };
    expect(sanitizeSettings(input)).toEqual({ settings: input, ignored: [] });
  });

  it("ignores unknown keys", () => {
    const { settings, ignored } = sanitizeSettings({ fontSize: 20, hacker: "yes" });
    expect(settings).toEqual({ fontSize: 20 });
    expect(ignored).toEqual(["hacker"]);
  });

  it("rejects numbers outside the allowed range", () => {
    const { settings, ignored } = sanitizeSettings({ fontSize: 500, wpm: 10 });
    expect(settings).toEqual({});
    expect(ignored).toEqual(["fontSize", "wpm"]);
  });

  it("rejects values of the wrong type", () => {
    const { settings } = sanitizeSettings({ fontSize: "20", bionic: "yes" });
    expect(settings).toEqual({});
  });

  it("rejects option names that don't exist", () => {
    const { settings } = sanitizeSettings({ theme: "neon", fontFamily: "comic" });
    expect(settings).toEqual({});
  });

  it("returns nothing for input that isn't an object", () => {
    for (const bad of [null, undefined, "text", 42, [1, 2]]) {
      expect(sanitizeSettings(bad)).toEqual({ settings: {}, ignored: [] });
    }
  });
});