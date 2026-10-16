import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { useSettings } from "../store/useSettings";
import { MIN_WPM, MAX_WPM, paceLabel } from "../core/pacing";

function IconButton({ label, onClick, primary = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${
        primary
          ? "border-transparent bg-ink text-surface shadow-md hover:opacity-90"
          : "border-line bg-surface text-ink hover:bg-surface-hover hover:border-muted/40 shadow-xs"
      }`}
    >
      {children}
    </button>
  );
}

export default function PlaybackBar({
  playing,
  onToggle,
  onPrev,
  onNext,
  onRestart,
  lineNumber,
  lineTotal,
  statusText,
}) {
  const wpm = useSettings((s) => s.wpm);
  const update = useSettings((s) => s.update);

  return (
    <div
      role="group"
      aria-label="Reading pace controls"
      className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-lg backdrop-blur-md transition-all max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-none max-md:border-x-0 max-md:border-b-0 max-md:z-30 pb-safe"
    >
      {/* Playback action buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <IconButton label="Restart from the top" onClick={onRestart}>
          <RotateCcw size={17} />
        </IconButton>
        <IconButton label="Previous line" onClick={onPrev}>
          <SkipBack size={18} />
        </IconButton>
        <IconButton label={playing ? "Pause" : "Play"} onClick={onToggle} primary>
          {playing ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current translate-x-0.5" />}
        </IconButton>
        <IconButton label="Next line" onClick={onNext}>
          <SkipForward size={18} />
        </IconButton>
      </div>

      {/* Speed Slider */}
      <div className="min-w-[160px] flex-1 px-1">
        <label className="block">
          <div className="flex items-center justify-between text-xs font-medium pb-1.5">
            <span className="text-ink">
              Speed: <span className="font-semibold">{paceLabel(wpm)}</span>
            </span>
            <span className="rounded-full bg-panel px-2 py-0.5 text-xs font-semibold text-muted">
              {wpm} WPM
            </span>
          </div>
          <input
            type="range"
            className="w-full"
            min={MIN_WPM}
            max={MAX_WPM}
            step={10}
            value={wpm}
            aria-label="Reading speed in words per minute"
            onChange={(e) => update({ wpm: Number(e.target.value) })}
          />
        </label>
      </div>

      {/* Status & Line Counter */}
      <div className="flex items-center gap-2 text-xs">
        {statusText && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-panel px-2.5 py-1 font-medium text-muted border border-line"
            aria-live="polite"
          >
            {statusText}
          </span>
        )}
        <span
          className="rounded-full bg-panel px-2.5 py-1 font-medium text-muted border border-line"
          aria-live="off"
        >
          Line {lineTotal ? lineNumber : 0} / {lineTotal}
        </span>
      </div>
    </div>
  );
}