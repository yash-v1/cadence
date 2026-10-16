import { useSettings } from "../store/useSettings";
import { FONTS } from "../core/fonts";
import { speechSupported } from "../lib/speech";
import { useVoices } from "../hooks/useVoices";
import { Sliders, Type, AlignLeft, Sparkles, Volume2, RotateCcw } from "lucide-react";

function Slider({ label, value, min, max, step, unit = "", onChange }) {
  return (
    <label className="block space-y-1">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-ink">{label}</span>
        <span className="rounded-md bg-panel px-1.5 py-0.5 text-xs text-muted font-mono">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={`${label}: ${value}${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1 min-h-[44px]">
      <span className="text-xs font-medium text-ink">{label}</span>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="h-6 w-11 rounded-full border border-line bg-panel transition-colors peer-checked:bg-ink peer-checked:border-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-xs transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

export default function Controls() {
  const s = useSettings();
  const voices = useVoices();

  return (
    <section aria-label="Reading settings" className="space-y-3 rounded-2xl border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel text-ink">
          <Sliders size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Reading Settings</h2>
          <p className="text-xs text-muted">Customize your reading comfort</p>
        </div>
      </div>

      {/* Group: Typography */}
      <details open className="group rounded-xl border border-line bg-surface p-3 transition-colors">
        <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-ink select-none list-none">
          <span className="flex items-center gap-2">
            <Type size={15} className="text-muted" />
            Text &amp; Appearance
          </span>
          <span className="text-muted text-xs transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-3 space-y-3.5 border-t border-line/60 pt-3">
          <label className="block text-xs">
            <span className="font-medium text-ink">Font</span>
            <select
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:border-muted/50 focus:border-ink"
              value={s.fontFamily}
              onChange={(e) => s.update({ fontFamily: e.target.value })}
            >
              {Object.entries(FONTS).map(([key, f]) => (
                <option key={key} value={key}>{f.label}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs">
            <span className="font-medium text-ink">Colours</span>
            <select
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:border-muted/50 focus:border-ink"
              value={s.theme}
              onChange={(e) => s.update({ theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="cream">Cream (softer on eyes)</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <Slider label="Text size" value={s.fontSize} min={14} max={36} step={1} unit="px"
            onChange={(v) => s.update({ fontSize: v })} />

          <Slider label="Line length" value={s.lineLength} min={40} max={90} step={5} unit=" chars"
            onChange={(v) => s.update({ lineLength: v })} />
        </div>
      </details>

      {/* Group: Spacing */}
      <details open className="group rounded-xl border border-line bg-surface p-3 transition-colors">
        <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-ink select-none list-none">
          <span className="flex items-center gap-2">
            <AlignLeft size={15} className="text-muted" />
            Spacing
          </span>
          <span className="text-muted text-xs transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-3 space-y-3.5 border-t border-line/60 pt-3">
          <Slider label="Line height" value={s.lineHeight} min={1.2} max={2.6} step={0.1}
            onChange={(v) => s.update({ lineHeight: v })} />
          <Slider label="Letter spacing" value={s.letterSpacing} min={0} max={0.3} step={0.01} unit="em"
            onChange={(v) => s.update({ letterSpacing: v })} />
          <Slider label="Word spacing" value={s.wordSpacing} min={0} max={0.6} step={0.05} unit="em"
            onChange={(v) => s.update({ wordSpacing: v })} />
        </div>
      </details>

      {/* Group: Focus & Assistance */}
      <details open className="group rounded-xl border border-line bg-surface p-3 transition-colors">
        <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-ink select-none list-none">
          <span className="flex items-center gap-2">
            <Sparkles size={15} className="text-muted" />
            Focus &amp; Assistance
          </span>
          <span className="text-muted text-xs transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-3 space-y-3 border-t border-line/60 pt-3">
          <Toggle
            label="Focus tunnel (dim other lines)"
            checked={s.tunnel}
            onChange={(e) => s.update({ tunnel: e.target.checked })}
          />

          {s.tunnel && (
            <div className="pl-1">
              <Slider label="Dimmed text brightness" value={s.tunnelDim} min={0.1} max={0.6} step={0.05}
                onChange={(v) => s.update({ tunnelDim: v })} />
            </div>
          )}

          <Toggle
            label="Bionic reading"
            checked={s.bionic}
            onChange={(e) => s.update({ bionic: e.target.checked })}
          />
        </div>
      </details>

      {/* Group: Speech */}
      {speechSupported && (
        <details className="group rounded-xl border border-line bg-surface p-3 transition-colors">
          <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-ink select-none list-none">
            <span className="flex items-center gap-2">
              <Volume2 size={15} className="text-muted" />
              Speech &amp; Pronunciation
            </span>
            <span className="text-muted text-xs transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3 space-y-3.5 border-t border-line/60 pt-3">
            <fieldset>
              <legend className="sr-only">Speech</legend>
              <Toggle
                label="Click a word to hear it"
                checked={s.speakOnClick}
                onChange={(e) => s.update({ speakOnClick: e.target.checked })}
              />

              {s.speakOnClick && (
                <div className="mt-3 space-y-3">
                  <label className="block text-xs">
                    <span className="font-medium text-ink">Voice</span>
                    <select
                      className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:border-muted/50 focus:border-ink"
                      value={s.voiceName}
                      onChange={(e) => s.update({ voiceName: e.target.value })}
                    >
                      <option value="">Device default</option>
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </label>

                  <Slider label="Speech speed" value={s.speechRate} min={0.5} max={1.5} step={0.1}
                    onChange={(v) => s.update({ speechRate: v })} />
                  <Slider label="Speech pitch" value={s.speechPitch} min={0.5} max={1.5} step={0.1}
                    onChange={(v) => s.update({ speechPitch: v })} />
                </div>
              )}
            </fieldset>
          </div>
        </details>
      )}

      {/* Reset button */}
      <button
        type="button"
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-ink active:scale-[0.98]"
        onClick={s.reset}
      >
        <RotateCcw size={14} />
        Reset to defaults
      </button>
    </section>
  );
}