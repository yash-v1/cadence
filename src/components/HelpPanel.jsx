import { HelpCircle, Keyboard, Shield, AlertOctagon, Trash2 } from "lucide-react";
import { useSettings } from "../store/useSettings";
import SettingsFile from "./SettingsFile";

export default function HelpPanel() {
  const resetAll = useSettings((s) => s.resetAll);

  const deleteEverything = () => {
    if (!window.confirm("Delete all saved settings and custom setups on this device?")) return;
    resetAll();
    useSettings.persist.clearStorage(); // removes the saved copy from the browser
  };

  return (
    <details className="group rounded-2xl border border-line bg-surface p-4 shadow-xs">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink select-none list-none">
        <span className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel text-ink">
            <HelpCircle size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold text-ink">Help &amp; Privacy</span>
            <p className="text-xs font-normal text-muted">Shortcuts, privacy and data storage</p>
          </div>
        </span>
        <span className="text-muted text-xs transition-transform group-open:rotate-180">▾</span>
      </summary>

      <div className="mt-4 space-y-4 border-t border-line/60 pt-3 text-xs">
        {/* Keyboard shortcuts */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-ink">
            <Keyboard size={15} className="text-muted" />
            <span>Keyboard shortcuts</span>
          </div>
          <p className="text-muted leading-relaxed">
            Click on the text first, then use these keys to navigate smoothly:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-muted">
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink">Space</kbd>
              <span>Play or pause</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink">↑ ↓</kbd>
              <span>Change line</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink">+ −</kbd>
              <span>Change speed</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink">Esc</kbd>
              <span>Pause reading</span>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-2 border-t border-line/60 pt-3">
          <div className="flex items-center gap-1.5 font-semibold text-ink">
            <Shield size={15} className="text-muted" />
            <span>Your privacy</span>
          </div>
          <p className="text-muted leading-relaxed">
            Cadence runs entirely in your browser. There is no server and no account.
            Camera video is analyzed frame-by-frame on your device and instantly discarded. It is never recorded, saved, or uploaded.
          </p>
          <p className="text-muted leading-relaxed">
            Text you paste and PDFs you load remain private on your computer.
            Only your preferences and custom setups are stored locally in your browser.
          </p>
        </div>

        {/* Settings File transfer */}
        <div className="border-t border-line/60 pt-3">
          <SettingsFile />
        </div>

        {/* Destructive Action */}
        <div className="space-y-2.5 rounded-xl border border-bad-line bg-bad-bg/50 p-3">
          <div className="flex items-center gap-1.5 font-semibold text-bad">
            <AlertOctagon size={15} />
            <span>Delete my data</span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            This will permanently reset all settings and remove your saved setups from this browser.
          </p>
          <button
            type="button"
            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-bad-line bg-surface px-4 py-2 text-xs font-medium text-bad transition-colors hover:bg-bad-bg active:scale-[0.98]"
            onClick={deleteEverything}
          >
            <Trash2 size={14} />
            Delete my saved data
          </button>
        </div>
      </div>
    </details>
  );
}