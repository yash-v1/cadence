import { describe, it, expect } from "vitest";
import { createAttentionTracker, isAttending, limitsFor } from "./attention";

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

describe("limitsFor", () => {
  it("falls back to standard for unknown names", () => {
    expect(limitsFor("nonsense")).toEqual(limitsFor("standard"));
  });
  it("strict allows less head turn than relaxed", () => {
    expect(limitsFor("strict").yaw).toBeLessThan(limitsFor("relaxed").yaw);
  });
});

describe("isAttending", () => {
  const limits = limitsFor("standard");
  const facing = { present: true, yaw: 5, pitch: 5, down: 0.1, side: 0.1, blink: 0 };

  it("is true when the reader faces the screen", () => {
    expect(isAttending(facing, limits)).toBe(true);
  });
  it("is false when no face is present", () => {
    expect(isAttending({ ...facing, present: false }, limits)).toBe(false);
  });
  it("is false when the head is turned too far", () => {
    expect(isAttending({ ...facing, yaw: 40 }, limits)).toBe(false);
  });
});