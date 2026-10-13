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
      className={`flex h-11 w-11 items-center justify-center rounded-full border ${
        primary ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function PlaybackBar({
  playing, onToggle, onPrev, onNext, onRestart, lineNumber, lineTotal,
}) {
  const wpm = useSettings((s) => s.wpm);
  const update = useSettings((s) => s.update);

  return (
    <div
      role="group"
      aria-label="Reading pace controls"
      className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow"
    >
      <IconButton label="Restart from the top" onClick={onRestart}>
        <RotateCcw size={18} />
      </IconButton>
      <IconButton label="Previous line" onClick={onPrev}>
        <SkipBack size={18} />
      </IconButton>
      <IconButton label={playing ? "Pause" : "Play"} onClick={onToggle} primary>
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </IconButton>
      <IconButton label="Next line" onClick={onNext}>
        <SkipForward size={18} />
      </IconButton>

      <label className="min-w-40 flex-1">
        <span className="flex justify-between text-sm font-medium">
          Speed: {paceLabel(wpm)}
          <span className="text-gray-500">{wpm} WPM</span>
        </span>
        <input
          type="range"
          className="w-full"
          min={MIN_WPM}
          max={MAX_WPM}
          step={10}
          value={wpm}
          onChange={(e) => update({ wpm: Number(e.target.value) })}
        />
      </label>

      <span className="text-sm text-gray-500" aria-live="off">
        Line {lineTotal ? lineNumber : 0} / {lineTotal}
      </span>
    </div>
  );
}