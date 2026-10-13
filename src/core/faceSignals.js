// Reads the numbers we care about out of one MediaPipe result.
export function extractSignals(result) {
  const none = { present: false, yaw: 0, pitch: 0, down: 0, side: 0, blink: 0 };
  if (!result?.faceLandmarks?.length) return none;

  const scores = {};
  for (const c of result.faceBlendshapes?.[0]?.categories ?? []) {
    scores[c.categoryName] = c.score;
  }
  const m = result.facialTransformationMatrixes?.[0]?.data;
  if (!m) return none;

  const deg = (r) => (r * 180) / Math.PI;
  const avg = (a, b) => ((scores[a] ?? 0) + (scores[b] ?? 0)) / 2;

  return {
    present: true,
    yaw: Math.abs(deg(Math.atan2(m[8], m[10]))),    // head turn
    pitch: Math.abs(deg(Math.atan2(-m[9], m[10]))), // head tilt
    down: avg("eyeLookDownLeft", "eyeLookDownRight"),
    side:
      Math.abs(
        (scores.eyeLookOutLeft ?? 0) + (scores.eyeLookInRight ?? 0) -
        (scores.eyeLookInLeft ?? 0) - (scores.eyeLookOutRight ?? 0)
      ) / 2,
    blink: avg("eyeBlinkLeft", "eyeBlinkRight"),
  };
}