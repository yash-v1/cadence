// Bold the first 40% of a word, rounded up.
export function splitWord(word) {
    const stemLength = Math.ceil(word.length * 0.4);
    return { bold: word.slice(0, stemLength), rest: word.slice(stemLength) };
  }
  
  // Turn text into pieces: words (split into bold + rest) and
  // "text" pieces (spaces, punctuation, line breaks) kept exactly as typed.
  export function bionicSegments(text) {
    const segments = [];
    const wordPattern = /[\p{L}\p{N}'’]+/gu; // letters, digits, apostrophes
    let lastIndex = 0;
    let match;
  
    while ((match = wordPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", text: text.slice(lastIndex, match.index) });
      }
      const { bold, rest } = splitWord(match[0]);
      segments.push({ type: "word", bold, rest });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: "text", text: text.slice(lastIndex) });
    }
    return segments;
  }