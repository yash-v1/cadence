import { useCallback, useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { createAttentionTracker, isAttending, limitsFor } from "../core/attention";
import { extractSignals } from "../core/faceSignals";

const BASE = import.meta.env.BASE_URL;
const FACE_LOST_MS = 3000; // how long without a face before we show a hint
const BLINK_MS = 400; // a real blink is shorter than this

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
    return "Camera permission was denied. You can keep reading without it, or allow the camera in your browser's address bar and try again.";
  if (err?.name === "NotFoundError")
    return "No camera was found. You can keep reading without it.";
  return "The camera couldn't start. You can keep reading without it.";
}

export function useAttention(sensitivity) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(0);
  const blinkSince = useRef(null);
  const lastVideoTime = useRef(-1);
  const lastRun = useRef(0);
  const lastRaw = useRef(false);
  const lastSeen = useRef(0);
  const tracker = useRef(createAttentionTracker());
  const prevState = useRef("away");
  const prevLost = useRef(false);

  // The loop reads sensitivity from a ref, so changing it takes effect immediately.
  const sensRef = useRef(sensitivity);
  useEffect(() => { sensRef.current = sensitivity; }, [sensitivity]);

  const [status, setStatus] = useState("off"); // off | loading | on | error
  const [message, setMessage] = useState("");
  const [state, setState] = useState("away");  // away | attending
  const [faceLost, setFaceLost] = useState(false);

  const shutdown = useCallback((nextStatus = "off", msg = "") => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop()); // camera light off
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    prevState.current = "away";
    prevLost.current = false;
    setState("away");
    setFaceLost(false);
    setStatus(nextStatus);
    setMessage(msg);
  }, []);

  const stop = useCallback(() => shutdown("off", ""), [shutdown]);

  const handleFrame = useCallback((result, now) => {
    const sig = extractSignals(result);
    const limits = limitsFor(sensRef.current);

    const raw = sig.present && sig.blink > 0.5 ? lastRaw.current : isAttending(sig, limits);
    lastRaw.current = raw;

    if (sig.present) lastSeen.current = now;
    const lost = now - lastSeen.current > FACE_LOST_MS;
    if (lost !== prevLost.current) {
      prevLost.current = lost;
      setFaceLost(lost);
    }

    const next = tracker.current.update(raw, now, limits);
    if (next !== prevState.current) {
      prevState.current = next;
      setState(next);
    }
  }, []);

  const start = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const fileset = await FilesetResolver.forVisionTasks(`${BASE}mediapipe/wasm`);
      try {
        landmarkerRef.current = await createLandmarker(fileset, "GPU");
      } catch {
        landmarkerRef.current = await createLandmarker(fileset, "CPU");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      tracker.current = createAttentionTracker();
      lastRaw.current = false;
      lastSeen.current = performance.now();
      setStatus("on");

      const loop = () => {
        rafRef.current = requestAnimationFrame(loop); // schedule the next frame first
        const video = videoRef.current;
        const model = landmarkerRef.current;
        const now = performance.now();
        if (video && model && video.readyState >= 2 &&
            video.currentTime !== lastVideoTime.current && now - lastRun.current >= 66) {
          lastVideoTime.current = video.currentTime;
          lastRun.current = now;
          try {
            handleFrame(model.detectForVideo(video, now), now);
          } catch (err) {
            console.error("Frame error:", err); // visible in the console, but the loop keeps going
          }
        }
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      shutdown("error", friendlyError(err));
    }
  }, [handleFrame, shutdown]);

  // Turn the camera off if the tab is hidden (SRS NFR-S5).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && streamRef.current) {
        shutdown("off", "The camera was turned off because this tab was hidden.");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [shutdown]);

  // Release the camera if the component disappears.
  useEffect(() => shutdown, [shutdown]);

  return { videoRef, status, message, state, faceLost, start, stop };
}