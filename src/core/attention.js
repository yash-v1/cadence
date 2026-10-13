// Turns a flickery yes/no signal ("is the reader looking at the screen right now?")
// into a calm state that only changes after the signal has held for a while.
export function createAttentionTracker() {
  let state = "away"; // start paused until we have seen the reader
  let changingSince = null;

  return {
    get state() {
      return state;
    },
    update(rawAttending, now, { pauseMs = 500, resumeMs = 300 } = {}) {
      const target = rawAttending ? "attending" : "away";

      if (target === state) {
        changingSince = null; // signal agrees with the current state: reset
        return state;
      }
      if (changingSince === null) changingSince = now;

      const needed = target === "away" ? pauseMs : resumeMs;
      if (now - changingSince >= needed) {
        state = target;
        changingSince = null;
      }
      return state;
    },
  };
}

// Starting values from the spike. Tune these once you have real-world results.
export const SENSITIVITY = {
  relaxed:  { yaw: 35, pitch: 40, down: 0.8,  side: 0.6, pauseMs: 800, resumeMs: 300 },
  standard: { yaw: 25, pitch: 30, down: 0.7,  side: 0.5, pauseMs: 500, resumeMs: 300 },
  strict:   { yaw: 18, pitch: 22, down: 0.55, side: 0.4, pauseMs: 300, resumeMs: 300 },
};

export function limitsFor(name) {
  return SENSITIVITY[name] ?? SENSITIVITY.standard;
}

// Is the reader facing the screen, judging from one frame's signals?
export function isAttending(sig, limits) {
  return (
    sig.present &&
    sig.yaw < limits.yaw &&
    sig.pitch < limits.pitch &&
    sig.down < limits.down &&
    sig.side < limits.side
  );
}