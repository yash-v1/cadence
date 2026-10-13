import { useEffect, useState } from "react";
import { speechSupported } from "../lib/speech";

// The list of voices installed on this device. It fills in a moment after page load.
export function useVoices() {
  const [voices, setVoices] = useState(() =>
    speechSupported ? window.speechSynthesis.getVoices() : []
  );

  useEffect(() => {
    if (!speechSupported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return voices;
}