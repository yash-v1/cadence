import { Sparkles, X, Check } from "lucide-react";
import { useSettings } from "../store/useSettings";

export default function Welcome() {
  const onboarded = useSettings((s) => s.onboarded);
  const update = useSettings((s) => s.update);
  if (onboarded) return null;

  const dismiss = () => update({ onboarded: true });

  const steps = [
    {
      title: "Make the text comfortable.",
      desc: "Paste your own text, then try the font, spacing and colour settings on the side.",
    },
    {
      title: "Press Play.",
      desc: "A highlighted line moves down the text at your pace, and everything else fades. Use ↑ and ↓ to adjust lines, and the slider to adjust pace.",
    },
    {
      title: "Optional: use your camera.",
      desc: "The ruler pauses when you look away. Sit at arm's length with good lighting. Video never leaves your device.",
    },
    {
      title: "Optional: hear a hard word.",
      desc: "Turn on 'Click a word to hear it' in reading settings, then click any word to hear pronunciation.",
    },
  ];

  return (
    <section
      aria-label="Welcome"
      className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-ink">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink sm:text-lg">Welcome to Cadence</h2>
            <p className="text-xs text-muted">A quiet, focused reading assistant designed for clarity</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Dismiss welcome message"
          onClick={dismiss}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-hover hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3 rounded-xl bg-panel/60 p-3 text-xs">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface border border-line font-semibold text-ink shadow-xs">
              {idx + 1}
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold text-ink">{step.title}</p>
              <p className="text-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-ink px-5 py-2 text-xs font-medium text-surface shadow-xs transition-opacity hover:opacity-90 active:scale-[0.98]"
          onClick={dismiss}
        >
          <Check size={16} />
          Got it, let's read
        </button>
      </div>
    </section>
  );
}