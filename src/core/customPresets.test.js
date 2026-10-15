import { describe, it, expect } from "vitest";
import {
  PRESET_KEYS, MAX_PRESETS, MAX_NAME,
  pickPresetValues, sanitizePresetList, addPreset, mergePresets,
} from "./customPresets";

const look = { fontSize: 24, theme: "dark" };
const preset = (name) => ({ id: `id-${name}`, name, values: look });
const fullList = () => Array.from({ length: MAX_PRESETS }, (_, i) => preset(`Setup ${i}`));

describe("pickPresetValues", () => {
  it("copies only the look and pace settings", () => {
    const state = {
      fontSize: 22, theme: "cream", wpm: 100,
      sensitivity: "strict", voiceName: "X", onboarded: true, customPresets: [],
    };
    const picked = pickPresetValues(state);
    expect(Object.keys(picked).sort()).toEqual([...PRESET_KEYS].sort());
    expect(picked.sensitivity).toBeUndefined();
  });
});

describe("sanitizePresetList", () => {
  it("returns an empty list for anything that isn't a list", () => {
    for (const bad of [null, undefined, "x", 42, {}]) {
      expect(sanitizePresetList(bad)).toEqual([]);
    }
  });

  it("keeps a valid preset", () => {
    expect(sanitizePresetList([preset("Mine")])).toEqual([preset("Mine")]);
  });

  it("keeps only valid look settings inside a preset", () => {
    const raw = [
      { id: "a", name: "Mixed", values: { fontSize: 24, banana: 1, theme: "neon", sensitivity: "strict" } },
      { id: "b", name: "Useless", values: { theme: "neon" } },
    ];
    expect(sanitizePresetList(raw)).toEqual([
      { id: "a", name: "Mixed", values: { fontSize: 24 } },
    ]);
  });

  it("tidies names and drops empty ones", () => {
    const raw = [
      { id: "a", name: "  Hello   world  ", values: look },
      { id: "b", name: "x".repeat(50), values: look },
      { id: "c", name: "   ", values: look },
    ];
    expect(sanitizePresetList(raw).map((p) => p.name)).toEqual([
      "Hello world",
      "x".repeat(MAX_NAME),
    ]);
  });

  it("removes duplicate names and enforces the maximum", () => {
    expect(sanitizePresetList([preset("Same"), preset("same")])).toHaveLength(1);
    const many = Array.from({ length: MAX_PRESETS + 5 }, (_, i) => preset(`P${i}`));
    expect(sanitizePresetList(many)).toHaveLength(MAX_PRESETS);
  });
});

describe("addPreset", () => {
  it("adds a preset with a tidy name", () => {
    const { list, error } = addPreset([], "  My   setup ", look);
    expect(error).toBe("");
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("My setup");
    expect(list[0].values).toEqual(look);
    expect(typeof list[0].id).toBe("string");
  });

  it("rejects an empty name", () => {
    const { list, error } = addPreset([], "   ", look);
    expect(error).not.toBe("");
    expect(list).toEqual([]);
  });

  it("rejects a name that is already used, ignoring capitals", () => {
    const start = [preset("Evening")];
    const { list, error } = addPreset(start, "evening", look);
    expect(error).not.toBe("");
    expect(list).toBe(start);
  });

  it("rejects a new preset when the list is full", () => {
    const { list, error } = addPreset(fullList(), "One more", look);
    expect(error).not.toBe("");
    expect(list).toHaveLength(MAX_PRESETS);
  });
});

describe("mergePresets", () => {
  it("adds new names, skips existing ones, and respects the maximum", () => {
    const merged = mergePresets([preset("A")], [preset("a"), preset("B")]);
    expect(merged.map((p) => p.name)).toEqual(["A", "B"]);
    expect(mergePresets(fullList(), [preset("New")])).toHaveLength(MAX_PRESETS);
  });
});