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
    <details className="rounded border p-4">
      <summary className="cursor-pointer font-semibold">Help &amp; privacy</summary>

      <div className="mt-3 space-y-3 text-sm">
        <div>
          <h3 className="font-medium">Keyboard shortcuts</h3>
          <p className="text-muted">
            Click on the text first, then: Space to play or pause · ↑ ↓ to change line ·
            + and − to change speed.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Your privacy</h3>
          <p className="text-muted">
            Cadence runs entirely in your browser. There is no server and no account.
            Camera video is looked at for a moment and thrown away. It is never saved
            or sent anywhere. The text you paste is not saved. 
            PDFs you open are read on your device and never uploaded.
            With "Click a word to hear it" on, click any word to hear it.
          </p>
          <p className="mt-2 text-muted">
            Only your settings and custom setups (font, spacing, colours, speed) are saved, on this device
            only, so they are still here next time.
          </p>
        </div>

        <button className="rounded border px-3 py-1" onClick={deleteEverything}>
          <SettingsFile />
          Delete my saved data
        </button>
      </div>
    </details>
  );
}