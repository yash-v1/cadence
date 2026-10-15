import { useState } from "react";
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
    <section aria-label="Quick setups" className="space-y-3 rounded border p-4">
      <h2 className="font-semibold">Quick setups</h2>
      <p className="text-sm text-muted">A starting point. You can change anything afterwards.</p>

      <div className="space-y-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="block w-full rounded border p-2 text-left"
            onClick={() => apply(p)}
          >
            <span className="block font-medium">{p.label}</span>
            <span className="block text-sm text-muted">{p.description}</span>
          </button>
        ))}
      </div>

      {custom.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <h3 className="text-sm font-medium">Your setups</h3>
          {custom.map((p) => (
            <div key={p.id} className="flex gap-2">
              <button
                type="button"
                className="min-w-0 flex-1 truncate rounded border p-2 text-left"
                onClick={() => apply(p)}
                title={p.name}
              >
                {p.name}
              </button>
              <button
                type="button"
                className="rounded border px-3 text-sm"
                aria-label={`Delete ${p.name}`}
                onClick={() => handleDelete(p)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 border-t pt-3">
        <label className="block text-sm font-medium" htmlFor="preset-name">
          Save my current settings as…
        </label>
        <div className="flex gap-2">
          <input
            id="preset-name"
            type="text"
            maxLength={MAX_NAME}
            placeholder="e.g. Evening reading"
            className="min-w-0 flex-1 rounded border bg-panel p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button type="button" className="rounded border px-3" onClick={handleSave}>
            Save
          </button>
        </div>
        <p className="text-xs text-muted">
          Remembers font, spacing, colours, dimming, line length and speed. Not your camera
          or speech settings.
        </p>
      </div>

      <p className="text-sm" role="status">{message}</p>
    </section>
  );
}