export default function PageNav({ name, page, total, onPrev, onNext, onClose }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded border p-3">
      <span className="min-w-0 flex-1 truncate font-medium" title={name}>{name}</span>
      <button className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        onClick={onPrev} disabled={page <= 1}>
        Previous page
      </button>
      <span className="text-sm text-muted" aria-live="polite">
        Page {page} of {total}
      </span>
      <button className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        onClick={onNext} disabled={page >= total}>
        Next page
      </button>
      <button className="rounded border px-3 py-1 text-sm" onClick={onClose}>
        Close document
      </button>
    </div>
  );
}