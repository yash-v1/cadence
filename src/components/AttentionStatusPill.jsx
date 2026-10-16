import { Loader2, AlertTriangle, AlertCircle, Pause, VideoOff } from "lucide-react";

export default function AttentionStatusPill({ attention, compact = false }) {
  const { status, state, faceLost } = attention || {};

  let config = {
    bg: "bg-panel text-muted border-line",
    label: "Camera off",
    ariaText: "Attention camera is off",
    icon: <VideoOff size={14} className="shrink-0" />,
  };

  if (status === "loading") {
    config = {
      bg: "bg-panel text-muted border-line",
      label: "Starting camera…",
      ariaText: "Camera is starting",
      icon: <Loader2 size={14} className="animate-spin shrink-0" />,
    };
  } else if (status === "error") {
    config = {
      bg: "bg-bad-bg text-bad border-bad-line",
      label: "Camera error",
      ariaText: "Camera error occurred",
      icon: <AlertTriangle size={14} className="shrink-0" />,
    };
  } else if (status === "on") {
    if (faceLost) {
      config = {
        bg: "bg-warn-bg text-warn border-warn-line",
        label: "Can't see face",
        ariaText: "Camera cannot detect your face",
        icon: <AlertCircle size={14} className="shrink-0" />,
      };
    } else if (state === "attending") {
      config = {
        bg: "bg-ok-bg text-ok border-ok-line",
        label: "Following you",
        ariaText: "Camera following your attention",
        icon: (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ok" />
          </span>
        ),
      };
    } else {
      config = {
        bg: "bg-bad-bg text-bad border-bad-line",
        label: "Paused, waiting for you",
        ariaText: "Paused because you looked away, waiting for you",
        icon: <Pause size={14} className="shrink-0" />,
      };
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={config.ariaText}
      title={config.ariaText}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${config.bg}`}
    >
      {config.icon}
      <span className={compact ? "hidden sm:inline" : ""}>{config.label}</span>
    </div>
  );
}
