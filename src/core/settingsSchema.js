import { FONTS } from "./fonts";

const num = (min, max) => (v) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const bool = (v) => typeof v === "boolean";
const oneOf = (list) => (v) => list.includes(v);

// Every setting that can be saved or imported, with what counts as a valid value.
// (The welcome-card flag "onboarded" is deliberately not here.)
export const RULES = {
  fontFamily: oneOf(Object.keys(FONTS)),
  fontSize: num(14, 36),
  letterSpacing: num(0, 0.3),
  wordSpacing: num(0, 0.6),
  lineHeight: num(1.2, 2.6),
  bionic: bool,
  tunnel: bool,
  tunnelDim: num(0.1, 0.6),
  wpm: num(60, 250),
  sensitivity: oneOf(["relaxed", "standard", "strict"]),
  theme: oneOf(["light", "cream", "dark"]),
  lineLength: num(40, 90),
  speakOnClick: bool,
  voiceName: (v) => typeof v === "string" && v.length <= 200,
  speechRate: num(0.5, 1.5),
  speechPitch: num(0.5, 1.5),
};

// Keeps only known settings with valid values. Reports what it threw away.
export function sanitizeSettings(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { settings: {}, ignored: [] };
  }
  const settings = {};
  const ignored = [];
  for (const [key, value] of Object.entries(raw)) {
    if (Object.hasOwn(RULES, key) && RULES[key](value)) settings[key] = value;
    else ignored.push(key);
  }
  return { settings, ignored };
}

export function exportSettings(state) {
  const settings = {};
  for (const key of Object.keys(RULES)) settings[key] = state[key];
  return { app: "cadence", version: 1, settings, customPresets: state.customPresets ?? [] };
}