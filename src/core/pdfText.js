// items: [{ str, y, height }] in reading order, as PDF.js gives them.
// Returns readable text, with a blank line between paragraphs.
export function itemsToText(items) {
  // 1. Group pieces into lines: same y (within half a text height) = same line.
  const rawLines = [];
  for (const it of items) {
    if (typeof it.str !== "string") continue;
    const last = rawLines[rawLines.length - 1];
    const tolerance = Math.max(it.height || 0, 1) * 0.5;
    if (last && Math.abs(it.y - last.y) <= tolerance) {
      last.text += it.str;
    } else if (it.str.trim() !== "") {
      rawLines.push({ y: it.y, text: it.str });
    }
  }

  const lines = rawLines
    .map((l) => ({ y: l.y, text: l.text.replace(/\s+/g, " ").trim() }))
    .filter((l) => l.text);
  if (lines.length === 0) return "";

  // 2. A gap clearly bigger than the usual line spacing starts a new paragraph.
  const gaps = lines.slice(1).map((l, i) => Math.abs(lines[i].y - l.y));
  const sorted = [...gaps].sort((a, b) => a - b);
  const typicalGap = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const threshold = typicalGap * 1.5;

  // 3. Join the lines back together.
  let out = lines[0].text;
  for (let i = 1; i < lines.length; i++) {
    const text = lines[i].text;
    if (gaps[i - 1] > threshold) {
      out += "\n\n" + text;
    } else if (/\p{L}-$/u.test(out) && /^\p{Ll}/u.test(text)) {
      out = out.slice(0, -1) + text; // "inter-" + "national" = "international"
    } else {
      out += " " + text;
    }
  }
  return out;
}