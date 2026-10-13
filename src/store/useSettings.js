import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULTS = {
    fontFamily: "lexend",
    fontSize: 20,        // pixels
    letterSpacing: 0.05, // em (1em = one font size)
    wordSpacing: 0.15,   // em
    lineHeight: 1.8,     // multiple of font size
    bionic: false,       // off by default, as in the SRS
    tunnel: true,        // dim the lines that aren't active
    tunnelDim: 0.25,     // brightness of dimmed text (0 to 1)
    wpm: 120,            // reading speed, words per minute
    sensitivity:"standard", // relaxed | standard | strict
};

export const useSettings = create(
    persist(
        (set) => ({
            ...DEFAULTS,
            update: (changes) => set(changes), // update({ fontSize: 24 })
            reset: () => set(DEFAULTS),
        }),
        { name: "cadence-settings" } // the key used in localStorage
    )
);