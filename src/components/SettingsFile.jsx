import { useRef, useState } from "react";
import { Download, Upload, Check } from "lucide-react";
import { useSettings } from "../store/useSettings";
import { exportSettings, sanitizeSettings } from "../core/settingsSchema";
import { sanitizePresetList } from "../core/customPresets";

const MAX_BYTES = 100 * 1024; // a real settings file is under 1 KB

export default function SettingsFile() {
  const inputRef = useRef(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const data = exportSettings(useSettings.getState());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cadence-settings.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Settings file saved to your downloads.");
  }

  async function handleImport(file) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setMessage("That file is too large to be a Cadence settings file.");
      return;
    }
    try {
      const data = JSON.parse(await file.text());
      if (data?.app !== "cadence") throw new Error("not a Cadence file");

      const { settings, ignored } = sanitizeSettings(data.settings);
      const incoming = sanitizePresetList(data.customPresets);
      const count = Object.keys(settings).length;
      if (count === 0 && incoming.length === 0) throw new Error("nothing usable");

      const store = useSettings.getState();
      if (count > 0) store.update(settings);
      const added = incoming.length > 0 ? store.importCustomPresets(incoming) : 0;

      const parts = [];
      if (count) parts.push(`${count} settings`);
      if (added) parts.push(`${added} custom ${added === 1 ? "setup" : "setups"}`);
      setMessage(
        `Loaded ${parts.join(" and ") || "nothing new"}.` +
          (ignored.length ? ` ${ignored.length} unrecognised or invalid values were skipped.` : "")
      );
    } catch {
      setMessage("That doesn't look like a Cadence settings file.");
    }
  }

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-ink">Move your settings</h3>
      <p className="text-xs text-muted leading-relaxed">
        Save your settings as a small file, then load it on another device or browser.
        The file contains only your settings, never your text or camera.
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 active:scale-[0.98]"
          onClick={handleExport}
        >
          <Download size={14} />
          Save settings file
        </button>
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 active:scale-[0.98]"
          onClick={() => inputRef.current.click()}
        >
          <Upload size={14} />
          Load settings file
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          handleImport(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {message && (
        <div className="flex items-center gap-1.5 rounded-xl bg-panel p-2.5 text-xs text-ink" role="status">
          <Check size={14} className="shrink-0 text-ok" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}