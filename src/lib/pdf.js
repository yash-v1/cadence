import { itemsToText } from "../core/pdfText";
const workerUrl = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;

// Reads a PDF file entirely in the browser. Returns one text string per page.
export async function extractPdfPages(file, onProgress) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data }); // keep the task so we can clean up
  const pages = [];

  try {
    const pdf = await loadingTask.promise;
    for (let n = 1; n <= pdf.numPages; n++) {
      onProgress?.(n, pdf.numPages);
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const items = content.items
        .filter((it) => typeof it.str === "string")
        .map((it) => ({
          str: it.str,
          y: it.transform[5],
          height: it.height || Math.abs(it.transform[3]),
        }));
      pages.push(itemsToText(items));
      page.cleanup?.();
    }
  } finally {
    // Cleanup must never break reading, so it is guarded and its errors ignored.
    try {
      await loadingTask.destroy?.();
    } catch {
      /* ignore */
    }
  }
  return pages;
}