import { describe, it, expect } from "vitest";
import { PRESETS } from "./presets";
import { sanitizeSettings } from "./settingsSchema";

describe("PRESETS", () => {
  it("only contain valid settings", () => {
    for (const p of PRESETS) {
      const { settings, ignored } = sanitizeSettings(p.values);
      expect(ignored).toEqual([]);
      expect(settings).toEqual(p.values);
    }
  });

  it("never change camera, privacy or speech settings", () => {
    const forbidden = ["sensitivity", "onboarded", "speakOnClick", "voiceName", "speechRate", "speechPitch"];
    for (const p of PRESETS) {
      for (const key of forbidden) expect(p.values).not.toHaveProperty(key);
    }
  });
});