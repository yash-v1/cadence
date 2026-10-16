import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addPreset, mergePresets, pickPresetValues, sanitizePresetList,
} from "../core/customPresets";

export const DEFAULTS = {
  fontFamily: "lexend",
  fontSize: 20,
  letterSpacing: 0.05,
  wordSpacing: 0.15,
  lineHeight: 1.8,
  bionic: true,
  tunnel: true,
  tunnelDim: 0.25,
  wpm: 120,
  sensitivity: "standard",
  theme: "dark",
  lineLength: 65,
  onboarded: false,
  speakOnClick: true,
  voiceName: "",
  speechRate: 0.9,
  speechPitch: 1,
};

export const useSettings = create(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      customPresets: [],

      update: (changes) => set(changes),
      reset: () => set(DEFAULTS), // settings only: your custom setups stay
      resetAll: () => set({ ...DEFAULTS, customPresets: [] }),

      // Saves the current look under a name. Returns an error message, or "" if it worked.
      saveCustomPreset: (name) => {
        const { list, error } = addPreset(get().customPresets, name, pickPresetValues(get()));
        if (!error) set({ customPresets: list });
        return error;
      },
      deleteCustomPreset: (id) =>
        set({ customPresets: get().customPresets.filter((p) => p.id !== id) }),

      // Adds presets from a settings file. Returns how many were added.
      importCustomPresets: (incoming) => {
        const before = get().customPresets;
        const after = mergePresets(before, incoming);
        set({ customPresets: after });
        return after.length - before.length;
      },
    }),
    {
      name: "cadence-settings",
      // Never trust what was saved: clean the preset list whenever settings load.
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        customPresets: sanitizePresetList(persisted?.customPresets),
      }),
    }
  )
);