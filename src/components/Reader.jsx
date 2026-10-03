import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useSettings } from "../store/useSettings";
import { FONTS } from "../core/fonts";
import { groupIntoLines } from "../core/lines";
import BionicText from "./BionicText";

export default function Reader({ text }) {
  const s = useSettings();
  const reduce = useReducedMotion(); // true if the user's OS asks for less motion
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const placed = useRef(false);

  const [lines, setLines] = useState([]);
  const [index, setIndex] = useState(0);

  // The ruler's vertical position, animated like a spring.
  const y = useSpring(0, { stiffness: 300, damping: 35 });
  const focusY = useTransform(y, (v) => `${v}px`); // for the CSS mask

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

  // Re-measure whenever anything that affects layout changes.
  // useLayoutEffect runs before the screen is painted, so you never see a wrong frame.
  useLayoutEffect(measure, [
    measure, text, s.fontFamily, s.fontSize, s.letterSpacing,
    s.wordSpacing, s.lineHeight, s.bionic,
  ]);

  // Also re-measure when the box resizes or a font finishes loading.
  useEffect(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(textRef.current);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [measure]);

  // Keep the active line index valid if the number of lines shrinks.
  const safeIndex = Math.min(index, Math.max(lines.length - 1, 0));
  const center = lines[safeIndex]?.center;

  // --- Move the ruler (and keep it on screen) when the active line changes ---
  useEffect(() => {
    if (center === undefined) return;
    if (!placed.current || reduce) y.jump(center); // no animation on first show
    else y.set(center);

    if (placed.current) {
      const pageY = wrapRef.current.getBoundingClientRect().top + window.scrollY + center;
      const viewTop = window.scrollY;
      const viewBottom = viewTop + window.innerHeight;
      if (pageY < viewTop + 120 || pageY > viewBottom - 120) {
        window.scrollTo({
          top: pageY - window.innerHeight / 2,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }
    placed.current = true;
  }, [center, reduce, y]);

  // --- Keyboard: Up/Down arrows move the ruler ---
  useEffect(() => {
    const onKey = (e) => {
      // Don't steal arrow keys while the user is using a form control.
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, lines.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lines.length]);

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

  // --- The focus tunnel: a gradient mask that is see-through except on the active line ---
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
    <div ref={wrapRef} className="relative" style={{ maxWidth: "65ch" }} onClick={jumpToClick}>
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
  );
}