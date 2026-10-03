import { useSettings } from "../store/useSettings";
import { FONTS } from "../core/fonts";

function Slider({ label, value, min, max, step, unit = "", onChange }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm font-medium">
        {label}
        <span className="text-gray-500">{value}{unit}</span>
      </span>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export default function Controls() {
  const s = useSettings();

  return (
    <section aria-label="Reading settings" className="space-y-4 rounded border p-4">
      <label className="block">
        <span className="text-sm font-medium">Font</span>
        <select
          className="mt-1 w-full rounded border p-2"
          value={s.fontFamily}
          onChange={(e) => s.update({ fontFamily: e.target.value })}
        >
          {Object.entries(FONTS).map(([key, f]) => (
            <option key={key} value={key}>{f.label}</option>
          ))}
        </select>
      </label>

      <Slider label="Text size" value={s.fontSize} min={14} max={36} step={1} unit="px"
        onChange={(v) => s.update({ fontSize: v })} />
      <Slider label="Letter spacing" value={s.letterSpacing} min={0} max={0.3} step={0.01} unit="em"
        onChange={(v) => s.update({ letterSpacing: v })} />
      <Slider label="Word spacing" value={s.wordSpacing} min={0} max={0.6} step={0.05} unit="em"
        onChange={(v) => s.update({ wordSpacing: v })} />
      <Slider label="Line height" value={s.lineHeight} min={1.2} max={2.6} step={0.1}
        onChange={(v) => s.update({ lineHeight: v })} />
      
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={s.tunnel}
          onChange={(e) => s.update({ tunnel: e.target.checked })}
        />
        Focus tunnel (dim other lines)
      </label>

      <Slider label="Dimmed text brightness" value={s.tunnelDim} min={0.1} max={0.6} step={0.05}
        onChange={(v) => s.update({ tunnelDim: v })} />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={s.bionic}
          onChange={(e) => s.update({ bionic: e.target.checked })}
        />
        Bionic reading
      </label>

      <button className="rounded border px-3 py-1 text-sm" onClick={s.reset}>
        Reset to defaults
      </button>
    </section>
  );
}