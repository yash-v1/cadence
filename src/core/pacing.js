export const MIN_WPM = 60;
export const MAX_WPM = 250;

// How long the ruler stays on a line, in seconds.
export function dwellSeconds(wordCount, wpm, min = 1, max = 12) {
  const seconds = (wordCount / wpm) * 60;
  return Math.min(max, Math.max(min, seconds));
}

// Friendly name for a speed, shown next to the slider.
export function paceLabel(wpm) {
  if (wpm < 100) return "Relaxed";
  if (wpm <= 150) return "Steady";
  return "Quick";
}