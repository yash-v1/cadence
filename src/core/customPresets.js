import { sanitizeSettings } from "./settingsSchema";

// Presets remember the look and pace only, never camera, speech or privacy settings.
export const PRESET_KEYS = [
  "fontFamily", "fontSize", "letterSpacing", "wordSpacing", "lineHeight",
  "lineLength", "theme", "bionic", "tunnel", "tunnelDim", "wpm",
];
export const MAX_PRESETS = 12;
export const MAX_NAME = 30;

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cleanName = (n) =>
  typeof n === "string" ? n.trim().replace(/\s+/g, " ").slice(0, MAX_NAME) : "";
const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();

// Copies the current look and pace out of the settings.
export function pickPresetValues(state) {
  const values = {};
  for (const key of PRESET_KEYS) values[key] = state[key];
  return values;
}

// Cleans a list that came from storage or a file: keeps only valid presets.
export function sanitizePresetList(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (out.length >= MAX_PRESETS) break;
    if (!item || typeof item !== "object") continue;

    const name = cleanName(item.name);
    if (!name || out.some((p) => sameName(p.name, name))) continue;

    const src = item.values && typeof item.values === "object" ? item.values : {};
    const onlyLook = {};
    for (const key of PRESET_KEYS) {
      if (Object.hasOwn(src, key)) onlyLook[key] = src[key];
    }
    const { settings } = sanitizeSettings(onlyLook);
    if (Object.keys(settings).length === 0) continue;

    let id = typeof item.id === "string" && item.id ? item.id.slice(0, 64) : newId();
    if (out.some((p) => p.id === id)) id = newId();
    out.push({ id, name, values: settings });
  }
  return out;
}

// Adds a preset. On a problem, returns the unchanged list and a message.
export function addPreset(list, name, values) {
  const clean = cleanName(name);
  if (!clean) return { list, error: "Please give your setup a name." };
  if (list.length >= MAX_PRESETS)
    return { list, error: `You can keep up to ${MAX_PRESETS} custom setups. Delete one first.` };
  if (list.some((p) => sameName(p.name, clean)))
    return { list, error: "You already have a setup with that name." };
  return { list: [...list, { id: newId(), name: clean, values }], error: "" };
}

// Adds imported presets without replacing yours. Skips names you already have.
export function mergePresets(existing, incoming) {
  const out = [...existing];
  for (const p of incoming) {
    if (out.length >= MAX_PRESETS) break;
    if (out.some((q) => sameName(q.name, p.name))) continue;
    out.push({ ...p, id: newId() });
  }
  return out;
}