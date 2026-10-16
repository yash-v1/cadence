import { useRef, useState } from "react";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { extractPdfPages } from "../lib/pdf";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function friendlyError(err) {
  if (err?.name === "PasswordException")
    return "This PDF is password-protected. Remove the password and try again.";
  if (err?.name === "InvalidPDFException")
    return "This file doesn't look like a valid PDF.";
  return "Sorry, this PDF couldn't be read.";
}

export default function DocumentLoader({ onLoaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    setError("");

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("This PDF is larger than 50 MB. Please try a smaller one.");
      return;
    }

    setBusy(true);
    try {
      const pages = await extractPdfPages(file, (n, total) => setProgress({ n, total }));
      const chars = pages.reduce((sum, p) => sum + p.length, 0);

      // Almost no text across the whole file = pages are pictures (scanned).
      if (pages.length === 0 || chars / pages.length < 25) {
        setError(
          "This PDF looks like scanned images, so there is no text to read. " +
          "Cadence can't read scanned pages yet. Try a PDF where you can select the text with your mouse."
        );
        return;
      }
      onLoaded({ name: file.name, pages });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
        dragging
          ? "border-ink bg-panel/80 scale-[1.01]"
          : "border-line bg-surface/50 hover:border-muted/40"
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-panel text-muted mb-2.5">
        <FileUp size={22} />
      </div>
      <p className="text-xs font-medium text-ink">Drag &amp; drop a PDF document here, or</p>
      <button
        type="button"
        className="mt-3 flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2 text-xs font-medium text-ink shadow-xs transition-colors hover:bg-surface-hover hover:border-muted/40 active:scale-[0.98] disabled:opacity-50"
        onClick={() => inputRef.current.click()}
        disabled={busy}
      >
        {busy ? (
          <>
            <Loader2 size={15} className="animate-spin text-muted" />
            Reading document…
          </>
        ) : (
          "Choose a PDF file"
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files[0]);
          e.target.value = ""; // lets you choose the same file again later
        }}
      />

      {progress && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-panel px-3 py-1.5 text-xs text-muted" role="status">
          <Loader2 size={13} className="animate-spin text-ink" />
          <span>Reading page {progress.n} of {progress.total}…</span>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-bad-line bg-bad-bg p-3 text-xs text-bad text-left" role="alert">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}