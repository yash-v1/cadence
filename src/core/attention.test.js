import { describe, it, expect } from "vitest";
import { createAttentionTracker } from "./attention";

// A tracker that is already in the "attending" state (time is now 300).
function attendingTracker() {
  const t = createAttentionTracker();
  t.update(true, 0);
  t.update(true, 300);
  return t;
}

describe("createAttentionTracker", () => {
  it("starts away and needs the resume delay before attending", () => {
    const t = createAttentionTracker();
    expect(t.state).toBe("away");
    t.update(true, 0);
    expect(t.update(true, 200)).toBe("away");
    expect(t.update(true, 300)).toBe("attending");
  });

  it("ignores a brief glance away", () => {
    const t = attendingTracker();
    t.update(false, 1000);
    expect(t.update(false, 1300)).toBe("attending"); // only 300 ms
    t.update(true, 1400); // looked back: timer resets
    t.update(false, 1500);
    expect(t.update(false, 1900)).toBe("attending"); // only 400 ms
  });

  it("pauses after looking away for the full pause delay", () => {
    const t = attendingTracker();
    t.update(false, 1000);
    expect(t.update(false, 1499)).toBe("attending");
    expect(t.update(false, 1500)).toBe("away");
  });

  it("respects custom delays", () => {
    const t = attendingTracker();
    t.update(false, 1000, { pauseMs: 200 });
    expect(t.update(false, 1200, { pauseMs: 200 })).toBe("away");
  });
});