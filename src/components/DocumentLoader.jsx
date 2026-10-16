import { useRef, useState } from "react";
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
      className={`rounded-xl border-2 border-dashed p-5 text-center ${
        dragging ? "bg-panel" : ""
      }`}
    >
      <p className="text-sm text-muted">Drag a PDF here, or</p>
      <button
        type="button"
        className="mt-2 rounded border px-4 py-2 disabled:opacity-50"
        onClick={() => inputRef.current.click()}
        disabled={busy}
      >
        {busy ? "Reading…" : "Choose a PDF"}
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
        <p className="mt-2 text-sm text-muted" role="status">
          Reading page {progress.n} of {progress.total}…
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-bad" role="alert">{error}</p>
      )}
    </div>
  );
}