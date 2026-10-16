import { useState } from "react";
import { Bookmark, BookmarkPlus, Trash2, Check } from "lucide-react";
import { useSettings } from "../store/useSettings";
import { PRESETS } from "../core/presets";
import { MAX_NAME } from "../core/customPresets";

export default function Presets() {
  const update = useSettings((s) => s.update);
  const custom = useSettings((s) => s.customPresets);
  const savePreset = useSettings((s) => s.saveCustomPreset);
  const deletePreset = useSettings((s) => s.deleteCustomPreset);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function apply(p) {
    update(p.values);
    setMessage(`Applied: ${p.label ?? p.name}`);
  }

  function handleSave() {
    const error = savePreset(name);
    if (error) {
      setMessage(error);
    } else {
      setMessage(`Saved "${name.trim()}".`);
      setName("");
    }
  }

  function handleDelete(p) {
    if (window.confirm(`Delete "${p.name}"?`)) {
      deletePreset(p.id);
      setMessage(`Deleted "${p.name}".`);
    }
  }

  return (
    <section aria-label="Quick setups" className="space-y-3.5 rounded-2xl border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel text-ink">
          <Bookmark size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Quick Setups</h2>
          <p className="text-xs text-muted">A starting point. You can change anything afterwards.</p>
        </div>
      </div>

      <div className="space-y-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="group block w-full rounded-xl border border-line bg-surface p-3 text-left transition-all hover:border-muted/50 hover:bg-surface-hover active:scale-[0.99]"
            onClick={() => apply(p)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink group-hover:text-ink">{p.label}</span>
              <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">Apply →</span>
            </div>
            <span className="mt-0.5 block text-xs text-muted leading-relaxed">{p.description}</span>
          </button>
        ))}
      </div>

      {custom.length > 0 && (
        <div className="space-y-2 border-t border-line/60 pt-3">
          <h3 className="text-xs font-semibold text-ink">Your Saved Setups</h3>
          <div className="space-y-1.5">
            {custom.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate rounded-xl border border-line bg-surface px-3 py-2 text-left text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 min-h-[44px]"
                  onClick={() => apply(p)}
                  title={p.name}
                >
                  {p.name}
                </button>
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-bad-line hover:bg-bad-bg hover:text-bad"
                  aria-label={`Delete ${p.name}`}
                  onClick={() => handleDelete(p)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-line/60 pt-3">
        <label className="block text-xs font-semibold text-ink" htmlFor="preset-name">
          Save current settings as…
        </label>
        <div className="flex gap-2">
          <input
            id="preset-name"
            type="text"
            maxLength={MAX_NAME}
            placeholder="e.g. Evening reading"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors hover:border-muted/50 focus:border-ink min-h-[44px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button
            type="button"
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 active:scale-[0.98]"
            onClick={handleSave}
          >
            <BookmarkPlus size={15} />
            Save
          </button>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          Remembers font, spacing, colours, dimming, line length and speed. Not your camera
          or speech settings.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-1.5 rounded-xl bg-panel px-3 py-2 text-xs text-ink" role="status">
          <Check size={14} className="shrink-0 text-ok" />
          <span>{message}</span>
        </div>
      )}
    </section>
  );
}