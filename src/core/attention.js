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