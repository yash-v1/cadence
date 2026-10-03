// rects: one { top, height } per word, in reading order.
// Returns: one { center, wordCount } per visual line.
export function groupIntoLines(rects) {
  const lines = [];
  for (const r of rects) {
    const center = r.top + r.height / 2;
    const last = lines[lines.length - 1];
    // Same line if the vertical centres are within half a word-height.
    if (last && Math.abs(center - last.center) < r.height / 2) {
      last.wordCount += 1;
    } else {
      lines.push({ center, wordCount: 1 });
    }
  }
  return lines;
}