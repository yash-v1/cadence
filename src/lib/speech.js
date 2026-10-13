export const speechSupported =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

// Says one word. Returns the utterance so the caller can tell which one is current.
export function speakWord(word, { voiceName, rate, pitch }, { onEnd }) {
  const synth = window.speechSynthesis;
  synth.cancel(); // stop anything still being said

  const u = new SpeechSynthesisUtterance(word);
  const voice = voiceName && synth.getVoices().find((v) => v.name === voiceName);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  }
  u.rate = rate;
  u.pitch = pitch;
  u.onend = onEnd;
  u.onerror = onEnd; // an interrupted or failed word counts as finished
  synth.speak(u);
  return u;
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel();
}