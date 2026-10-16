import { FileText, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PageNav({ name, page, total, onPrev, onNext, onClose }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 shadow-xs">
      <div className="flex min-w-0 items-center gap-2 flex-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel text-ink">
          <FileText size={16} />
        </div>
        <span className="truncate text-xs font-semibold text-ink" title={name}>
          {name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 disabled:opacity-40"
          onClick={onPrev}
          disabled={page <= 1}
        >
          <ChevronLeft size={15} />
          <span>Previous page</span>
        </button>

        <span
          className="rounded-full bg-panel px-3 py-1 text-xs font-semibold text-muted border border-line"
          aria-live="polite"
        >
          Page {page} of {total}
        </span>

        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover hover:border-muted/40 disabled:opacity-40"
          onClick={onNext}
          disabled={page >= total}
        >
          <span>Next page</span>
          <ChevronRight size={15} />
        </button>

        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-bad-bg hover:text-bad hover:border-bad-line"
          onClick={onClose}
          title="Close document"
        >
          <X size={15} />
          <span className="hidden sm:inline">Close document</span>
        </button>
      </div>
    </div>
  );
}