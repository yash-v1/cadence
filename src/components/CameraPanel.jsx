import { useState } from "react";
import { useSettings } from "../store/useSettings";

export default function CameraPanel({ attention }) {
  const { videoRef, status, message, faceLost, start, stop } = attention;
  const sensitivity = useSettings((s) => s.sensitivity);
  const update = useSettings((s) => s.update);
  const [showNotice, setShowNotice] = useState(false);

  const on = status === "on";
  const loading = status === "loading";

  return (
    <section aria-label="Attention camera" className="space-y-3 rounded border p-4">
      <h2 className="font-semibold">Pause when I look away</h2>

      {/* Always in the page, so the camera can attach to it. Mirrored like a mirror. */}
      <video
        ref={videoRef}
        playsInline
        muted
        aria-label="Camera preview"
        className={on ? "w-32 rounded bg-gray-900" : "pointer-events-none absolute h-px w-px opacity-0"}
        style={{ transform: "scaleX(-1)" }}
      />

      {on && (
        <>
          <p className="text-sm font-medium text-green-700">● Camera is on</p>
          {faceLost && (
            <p className="text-sm text-amber-700" role="status">
              We can't see your face. Try more light or move closer.
            </p>
          )}
          <label className="block text-sm">
            <span className="font-medium">Sensitivity</span>
            <select
              className="mt-1 w-full rounded border p-2"
              value={sensitivity}
              onChange={(e) => update({ sensitivity: e.target.value })}
            >
              <option value="relaxed">Relaxed (pauses less often)</option>
              <option value="standard">Standard</option>
              <option value="strict">Strict (pauses sooner)</option>
            </select>
          </label>
          <button className="rounded border px-3 py-1 text-sm" onClick={stop}>
            Turn camera off
          </button>
        </>
      )}

      {!on && !showNotice && (
        <button
          className="rounded border px-3 py-3 text-sm disabled:opacity-50"
          onClick={() => setShowNotice(true)}
          disabled={loading}
        >
          {loading ? "Starting…" : "Use my camera"}
        </button>
      )}

      {!on && showNotice && !loading && (
        <div className="space-y-2 rounded bg-panel p-3 text-sm">
          <p>
            Cadence uses your camera only to notice when you look away, so it can pause
            the ruler. The video stays on your device and is never saved or sent anywhere.
            Your camera light will be on while this is active.
          </p>
          <div className="flex gap-2">
            <button
              className="rounded bg-ink px-3 py-1 text-surface"
              onClick={() => { setShowNotice(false); start(); }}
            >
              Turn on camera
            </button>
            <button className="rounded border px-3 py-1" onClick={() => setShowNotice(false)}>
              Not now
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-sm text-red-700" role="alert">{message}</p>
      )}
    </section>
  );
}