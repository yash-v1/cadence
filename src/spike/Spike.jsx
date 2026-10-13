import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { createAttentionTracker } from "../core/attention";

const BASE = import.meta.env.BASE_URL; // "/" locally; works on sub-paths too

// MediaPipe gives eye/face "scores" as a list; turn it into { name: score }.
function scoresByName(result) {
  const map = {};
  const cats = result.faceBlendshapes?.[0]?.categories ?? [];
  for (const c of cats) map[c.categoryName] = c.score;
  return map;
}

// Head turn (yaw) and tilt (pitch) in degrees, from the 4x4 rotation matrix.
function headAngles(matrix) {
  const m = matrix.data;
  const deg = (r) => (r * 180) / Math.PI;
  return { yaw: deg(Math.atan2(m[8], m[10])), pitch: deg(Math.atan2(-m[9], m[10])) };
}

async function createLandmarker(fileset, delegate) {
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: `${BASE}mediapipe/face_landmarker.task`, delegate },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
}

function friendlyError(err) {
  if (err?.name === "NotAllowedError")
    return "Camera permission was denied. Allow it in the address bar and try again.";
  if (err?.name === "NotFoundError") return "No camera was found on this device.";
  return `Something went wrong: ${err?.message ?? err}`;
}

function Bar({ label, value, max, limit, unit = "" }) {
  const over = value > limit;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={over ? "font-semibold text-red-600" : "text-gray-600"}>
          {value.toFixed(unit === "°" ? 0 : 2)}{unit} (limit {limit})
        </span>
      </div>
      <div className="h-2 rounded bg-gray-200">
        <div
          className={`h-2 rounded ${over ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${Math.min(value / max, 1) * 100}%` }}
        />
      </div>
    </div>
  );
}

function LimitSlider({ label, value, min, max, step, onChange }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between">{label}<span>{value}</span></span>
      <input type="range" className="w-full" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default function Spike() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(0);
  const lastVideoTime = useRef(-1);
  const lastRun = useRef(0);
  const lastUiUpdate = useRef(0);
  const lastRaw = useRef(true);
  const prevState = useRef("away");
  const tracker = useRef(createAttentionTracker());

  const [status, setStatus] = useState("idle"); // idle | loading | running | error
  const [message, setMessage] = useState("");
  const [signals, setSignals] = useState({ present: false, yaw: 0, pitch: 0, down: 0, side: 0, blink: 0 });
  const [state, setState] = useState("away");
  const [log, setLog] = useState([]);
  const [limits, setLimits] = useState({ yaw: 25, pitch: 30, down: 0.7, side: 0.5, pauseMs: 500, resumeMs: 300 });

  // The camera loop reads settings from a ref so it always sees the latest values.
  const limitsRef = useRef(limits);
  useEffect(() => { limitsRef.current = limits; }, [limits]);
  const setLimit = (key) => (v) => setLimits((l) => ({ ...l, [key]: v }));

  // Look at one camera frame's result and decide: attending or not?
  function process(result, now) {
    const L = limitsRef.current;
    let sig = { present: false, yaw: 0, pitch: 0, down: 0, side: 0, blink: 0 };
    let raw = false;

    if (result.faceLandmarks.length > 0) {
      const b = scoresByName(result);
      const { yaw, pitch } = headAngles(result.facialTransformationMatrixes[0]);
      const blink = ((b.eyeBlinkLeft ?? 0) + (b.eyeBlinkRight ?? 0)) / 2;
      const down = ((b.eyeLookDownLeft ?? 0) + (b.eyeLookDownRight ?? 0)) / 2;
      const side =
        Math.abs(
          (b.eyeLookOutLeft ?? 0) + (b.eyeLookInRight ?? 0) -
          (b.eyeLookInLeft ?? 0) - (b.eyeLookOutRight ?? 0)
        ) / 2;

      sig = { present: true, yaw: Math.abs(yaw), pitch: Math.abs(pitch), down, side, blink };

      // While blinking, the eye readings are unreliable: keep the previous verdict.
      raw =
        blink > 0.5
          ? lastRaw.current
          : sig.yaw < L.yaw && sig.pitch < L.pitch && down < L.down && side < L.side;
    }
    lastRaw.current = raw;

    const next = tracker.current.update(raw, now, L);
    if (next !== prevState.current) {
      prevState.current = next;
      setState(next);
      const when = new Date().toLocaleTimeString();
      setLog((old) => [`${when}  ${next === "away" ? "⏸ paused" : "▶ resumed"}`, ...old].slice(0, 12));
    }

    // Update the numbers on screen about 10 times a second, not 15+.
    if (now - lastUiUpdate.current > 100) {
      lastUiUpdate.current = now;
      setSignals(sig);
    }
  }

  async function start() {
    setStatus("loading");
    setMessage("");
    try {
      const fileset = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`);
      try {
        landmarkerRef.current = await createLandmarker(fileset, "GPU");
      } catch {
        landmarkerRef.current = await createLandmarker(fileset, "CPU"); // fallback
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      tracker.current = createAttentionTracker();
      prevState.current = "away";
      setState("away");
      setStatus("running");

      const loop = () => {
        const video = videoRef.current;
        const now = performance.now();
        // Only analyse a frame if it is new, and at most ~15 times a second.
        if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime.current && now - lastRun.current >= 66) {
          lastVideoTime.current = video.currentTime;
          lastRun.current = now;
          process(landmarkerRef.current.detectForVideo(video, now), now);
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      stop();
      setStatus("error");
      setMessage(friendlyError(err));
    }
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop()); // turns the camera light off
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus((s) => (s === "error" ? s : "idle"));
  }

  // Make sure the camera is released if you leave the page.
  useEffect(() => stop, []);

  const running = status === "running";

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Cadence camera spike</h1>
      <p className="text-sm text-gray-600">
        Video stays in this page only. Nothing is saved or sent anywhere.
      </p>

      <div className="flex flex-wrap items-start gap-6">
        <div className="space-y-3">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-64 rounded bg-gray-900"
            style={{ transform: "scaleX(-1)" }} // mirror, like a mirror
          />
          {running ? (
            <button className="rounded border px-3 py-2" onClick={stop}>Stop camera</button>
          ) : (
            <button
              className="rounded bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
              onClick={start}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Loading…" : "Start camera"}
            </button>
          )}
          {message && <p className="max-w-64 text-sm text-red-600">{message}</p>}
        </div>

        <div className="min-w-72 flex-1 space-y-3">
          <div
            className={`rounded-lg p-4 text-center text-xl font-bold ${
              state === "attending" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {!running ? "Camera off" : state === "attending" ? "▶ Attending (ruler would move)" : "⏸ Away (ruler would pause)"}
          </div>
          <p className="text-sm">Face detected: <b>{signals.present ? "yes" : "no"}</b> · Blink: {signals.blink.toFixed(2)}</p>
          <Bar label="Head turn (yaw)" value={signals.yaw} max={60} limit={limits.yaw} unit="°" />
          <Bar label="Head tilt (pitch)" value={signals.pitch} max={60} limit={limits.pitch} unit="°" />
          <Bar label="Eyes looking down" value={signals.down} max={1} limit={limits.down} />
          <Bar label="Eyes looking sideways" value={signals.side} max={1} limit={limits.side} />
        </div>
      </div>

      <section className="grid gap-4 rounded border p-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Limits (drag to tune)</h2>
        <LimitSlider label="Max head turn (°)" value={limits.yaw} min={5} max={60} step={1} onChange={setLimit("yaw")} />
        <LimitSlider label="Max head tilt (°)" value={limits.pitch} min={5} max={60} step={1} onChange={setLimit("pitch")} />
        <LimitSlider label="Max eyes-down score" value={limits.down} min={0.1} max={1} step={0.05} onChange={setLimit("down")} />
        <LimitSlider label="Max eyes-sideways score" value={limits.side} min={0.1} max={1} step={0.05} onChange={setLimit("side")} />
        <LimitSlider label="Pause after looking away (ms)" value={limits.pauseMs} min={200} max={2000} step={100} onChange={setLimit("pauseMs")} />
        <LimitSlider label="Resume after looking back (ms)" value={limits.resumeMs} min={100} max={1500} step={100} onChange={setLimit("resumeMs")} />
      </section>

      <section>
        <h2 className="mb-1 font-semibold">State changes</h2>
        <ul className="font-mono text-sm text-gray-700">
          {log.length === 0 ? <li>(none yet)</li> : log.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </section>
    </main>
  );
}