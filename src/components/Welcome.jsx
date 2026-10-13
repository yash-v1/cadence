import { useSettings } from "../store/useSettings";

export default function Welcome() {
  const onboarded = useSettings((s) => s.onboarded);
  const update = useSettings((s) => s.update);
  if (onboarded) return null;

  return (
    <section aria-label="Welcome" className="mb-6 rounded-xl border bg-panel p-5">
      <h2 className="text-xl font-semibold">Welcome to Cadence</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>
          <b>Make the text comfortable.</b> Paste your own text, then try the font,
          spacing and colour settings on the left.
        </li>
        <li>
          <b>Press Play.</b> A highlighted line moves down the text at your pace, and
          everything else fades. Use ↑ and ↓ to go back or forward, and the speed slider
          to go slower or faster. You are always in control.
        </li>
        <li>
          <b>Optional: use your camera.</b> The ruler can pause when you look away.
          Sit about an arm's length from the screen with light in front of you. The video
          never leaves your device.
        </li>
        <li>
          <b>Optional: hear a hard word.</b> Switch on "Click a word to hear it" in the
          settings, then click any word.
        </li>
      </ol>
      <button
        className="mt-4 rounded bg-ink px-4 py-2 text-surface"
        onClick={() => update({ onboarded: true })}
      >
        Got it
      </button>
    </section>
  );
}