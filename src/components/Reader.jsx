import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useSettings } from "../store/useSettings";
import { FONTS } from "../core/fonts";
import { groupIntoLines } from "../core/lines";
import { dwellSeconds, MIN_WPM, MAX_WPM } from "../core/pacing";
import BionicText from "./BionicText";
import PlaybackBar from "./PlaybackBar";

export default function Reader({ text }) {
  const s = useSettings();
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const placed = useRef(false);

  const [lines, setLines] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false); // Always starts paused

  const y = useSpring(0, { stiffness: 300, damping: 35 });
  const focusY = useTransform(y, (v) => `${v}px`);
  const rulerHeight = s.fontSize * s.lineHeight;

  // --- Measure where every line is ---
  const measure = useCallback(() => {
    const root = textRef.current;
    if (!root) return;
    const rootTop = root.getBoundingClientRect().top;
    const rects = [...root.querySelectorAll("[data-word]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top - rootTop, height: r.height };
    });
    setLines(groupIntoLines(rects));
  }, []);

  useLayoutEffect(measure, [
    measure, text, s.fontFamily, s.fontSize, s.letterSpacing,
    s.wordSpacing, s.lineHeight, s.bionic,
  ]);

  useEffect(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(textRef.current);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [measure]);

  const safeIndex = Math.min(index, Math.max(lines.length - 1, 0));
  const center = lines[safeIndex]?.center;

  // --- The pacing timer ---
  useEffect(() => {
    if (!playing || lines.length === 0) return;
    const ms = dwellSeconds(lines[safeIndex].wordCount, s.wpm) * 1000;
    const id = setTimeout(() => {
      if (safeIndex >= lines.length - 1) setPlaying(false); // reached the end
      else setIndex(safeIndex + 1);
    }, ms);
    return () => clearTimeout(id); // cancel if anything changes first
  }, [playing, safeIndex, lines, s.wpm]);

  // --- Move the ruler, and keep it on screen ---
  useEffect(() => {
    if (center === undefined) return;
    if (!placed.current || reduce) y.jump(center);
    else y.set(center);

    if (placed.current) {
      const pageY = wrapRef.current.getBoundingClientRect().top + window.scrollY + center;
      const viewTop = window.scrollY;
      const viewBottom = viewTop + window.innerHeight;
      // Bottom margin is bigger so the ruler stays above the playback bar
      if (pageY < viewTop + 120 || pageY > viewBottom - 180) {
        window.scrollTo({
          top: pageY - window.innerHeight / 2,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }
    placed.current = true;
  }, [center, reduce, y]);

  // --- Small actions the bar and the keyboard share ---
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(i + 1, Math.max(lines.length - 1, 0))),
    [lines.length]
  );
  const restart = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);
  const togglePlay = useCallback(() => {
    if (lines.length) setPlaying((p) => !p);
  }, [lines.length]);

  // --- Keyboard ---
  const { wpm, update } = s;
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if (e.key === "ArrowDown") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      // NEW: Space = play/pause (a focused button already handles Space itself)
      else if (e.key === " " && tag !== "BUTTON") { e.preventDefault(); togglePlay(); }
      // NEW: + and - change the speed
      else if (e.key === "+" || e.key === "=") update({ wpm: Math.min(MAX_WPM, wpm + 10) });
      else if (e.key === "-") update({ wpm: Math.max(MIN_WPM, wpm - 10) });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, togglePlay, wpm, update]);

  // --- Click: jump to the nearest line ---
  const jumpToClick = (e) => {
    if (!lines.length) return;
    const clickY = e.clientY - textRef.current.getBoundingClientRect().top;
    let best = 0;
    lines.forEach((l, i) => {
      if (Math.abs(l.center - clickY) < Math.abs(lines[best].center - clickY)) best = i;
    });
    setIndex(best);
  };

  // --- Focus tunnel mask ---
  const dim = s.tunnelDim;
  const mask = `linear-gradient(to bottom,
    rgba(0,0,0,${dim}) 0px,
    rgba(0,0,0,${dim}) calc(var(--focus-y) - var(--half) - 4px),
    rgba(0,0,0,1) calc(var(--focus-y) - var(--half)),
    rgba(0,0,0,1) calc(var(--focus-y) + var(--half)),
    rgba(0,0,0,${dim}) calc(var(--focus-y) + var(--half) + 4px),
    rgba(0,0,0,${dim}) 100%)`;
  const maskStyle = s.tunnel && lines.length
    ? { maskImage: mask, WebkitMaskImage: mask }
    : {};

  return (
    <div style={{ maxWidth: "65ch" }}>
      <div ref={wrapRef} className="relative" onClick={jumpToClick}>
        <motion.div
          ref={textRef}
          style={{
            fontFamily: FONTS[s.fontFamily].css,
            fontSize: `${s.fontSize}px`,
            letterSpacing: `${s.letterSpacing}em`,
            wordSpacing: `${s.wordSpacing}em`,
            lineHeight: s.lineHeight,
            "--focus-y": focusY,
            "--half": `${rulerHeight / 2}px`,
            ...maskStyle,
          }}
        >
          <BionicText text={text} bionic={s.bionic} />
        </motion.div>

        {lines.length > 0 && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 rounded bg-yellow-300/25 ring-1 ring-yellow-500/40"
            style={{ y, top: -rulerHeight / 2, height: rulerHeight }}
          />
        )}
      </div>

      <PlaybackBar
        playing={playing}
        onToggle={togglePlay}
        onPrev={goPrev}
        onNext={goNext}
        onRestart={restart}
        lineNumber={safeIndex + 1}
        lineTotal={lines.length}
      />
    </div>
  );
}