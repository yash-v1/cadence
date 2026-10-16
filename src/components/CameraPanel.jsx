import { useState, useEffect } from "react";
import { Camera, ShieldCheck, AlertCircle, VideoOff, RefreshCw } from "lucide-react";
import { useSettings } from "../store/useSettings";

let activeStream = null;

export default function CameraPanel({ attention }) {
  const { videoRef, status, message, faceLost, start, stop } = attention;
  const sensitivity = useSettings((s) => s.sensitivity);
  const update = useSettings((s) => s.update);
  const [showNotice, setShowNotice] = useState(false);

  const on = status === "on";
  const loading = status === "loading";

  // Re-verify stream attachment and playback whenever camera status changes
  useEffect(() => {
    if (on && videoRef.current) {
      if (videoRef.current.srcObject) {
        activeStream = videoRef.current.srcObject;
      } else if (activeStream) {
        videoRef.current.srcObject = activeStream;
      }
      if (videoRef.current.srcObject && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    } else if (!on) {
      activeStream = null;
    }
  }, [on, videoRef, faceLost]);

  const handleStop = () => {
    activeStream = null;
    stop();
  };

  return (
    <section aria-label="Attention camera" className="space-y-3 rounded-2xl border border-line bg-surface p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel text-ink">
          <Camera size={18} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Pause when I look away</h2>
          <p className="text-xs text-muted">Follows your gaze to pause reading pace</p>
        </div>
      </div>

      {/* Always in the page, so the camera can attach to it. Mirrored like a mirror. */}
      <video
        ref={videoRef}
        playsInline
        muted
        aria-label="Camera preview"
        className={on ? "aspect-4/3 w-full max-w-[200px] mx-auto rounded-xl border border-line object-cover bg-gray-900 shadow-inner" : "pointer-events-none absolute h-px w-px opacity-0"}
        style={{ transform: "scaleX(-1)" }}
      />

      {on && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-ok-bg border border-ok-line p-2.5 text-xs font-medium text-ok">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ok" />
            </span>
            <span>Camera is active and tracking</span>
          </div>

          {faceLost && (
            <div className="flex items-start gap-2 rounded-xl bg-warn-bg border border-warn-line p-2.5 text-xs text-warn" role="status">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>We can't see your face. Try more light or move closer.</span>
            </div>
          )}

          <label className="block text-xs">
            <span className="font-medium text-ink">Sensitivity</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors hover:border-muted/50 focus:border-ink"
              value={sensitivity}
              onChange={(e) => update({ sensitivity: e.target.value })}
            >
              <option value="relaxed">Relaxed (pauses less often)</option>
              <option value="standard">Standard</option>
              <option value="strict">Strict (pauses sooner)</option>
            </select>
          </label>

          <button
            type="button"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 active:scale-[0.98]"
            onClick={handleStop}
          >
            <VideoOff size={15} />
            Turn camera off
          </button>
        </div>
      )}

      {!on && !showNotice && (
        <button
          type="button"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-medium text-ink transition-all hover:bg-surface-hover hover:border-muted/40 active:scale-[0.98] disabled:opacity-50"
          onClick={() => setShowNotice(true)}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Camera size={15} />
              Use my camera
            </>
          )}
        </button>
      )}

      {!on && showNotice && !loading && (
        <div className="space-y-3 rounded-xl border border-line bg-panel/60 p-3.5 text-xs text-ink">
          <div className="flex items-start gap-2 text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ink" />
            <p className="leading-relaxed">
              Cadence uses your camera only to notice when you look away, so it can pause
              the ruler. The video stays on your device and is never saved or sent anywhere.
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-ink px-3 py-2 text-xs font-medium text-surface shadow-xs transition-opacity hover:opacity-90 active:scale-[0.98]"
              onClick={() => { setShowNotice(false); start(); }}
            >
              Turn on camera
            </button>
            <button
              type="button"
              className="flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-surface px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-surface-hover active:scale-[0.98]"
              onClick={() => setShowNotice(false)}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="rounded-xl border border-bad-line bg-bad-bg p-2.5 text-xs text-bad" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}