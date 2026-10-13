import { useEffect, useState } from "react";
import Controls from "./components/Controls";
import Reader from "./components/Reader";
import CameraPanel from "./components/CameraPanel";
import Welcome from "./components/Welcome";
import HelpPanel from "./components/HelpPanel";
import { useAttention } from "./hooks/useAttention";
import { useSettings } from "./store/useSettings";
import DocumentLoader from "./components/DocumentLoader";
import PageNav from "./components/PageNav";

export default function App() {
  const [pasted, setPasted] = useState(
    "Cadence helps people read with less effort. Paste your own text here, then change the settings and watch the text change. Try a longer passage to see how line height and spacing feel."
  );
  const [doc, setDoc] = useState(null); // { name, pages: [text, text, ...] }
  const [pageIndex, setPageIndex] = useState(0);

  const text = doc ? doc.pages[pageIndex] : pasted;

  // When the last line of a page finishes: move to the next page that has text.
  const goToNextReadablePage = () => {
    if (!doc) return false;
    for (let i = pageIndex + 1; i < doc.pages.length; i++) {
      if (doc.pages[i].trim()) {
        setPageIndex(i);
        return true;
      }
    }
    return false;
  };

  const sensitivity = useSettings((s) => s.sensitivity);
  const theme = useSettings((s) => s.theme);
  const attention = useAttention(sensitivity);

  // Tell the page which colour set to use.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Welcome />

      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <aside className="space-y-4 md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:self-start md:overflow-y-auto md:pr-1">
          <h1 className="text-3xl font-bold">Cadence</h1>
          <CameraPanel attention={attention} />
          <Controls />
          <HelpPanel />
        </aside>

        <div className="space-y-4">
          {doc ? (
            <>
              <PageNav
                name={doc.name}
                page={pageIndex + 1}
                total={doc.pages.length}
                onPrev={() => setPageIndex((i) => Math.max(i - 1, 0))}
                onNext={() => setPageIndex((i) => Math.min(i + 1, doc.pages.length - 1))}
                onClose={() => { setDoc(null); setPageIndex(0); }}
              />
              {!text.trim() && (
                <p className="text-sm text-muted">
                  This page has no readable text. It may be a picture. Try the next page.
                </p>
              )}
            </>
          ) : (
            <>
              <DocumentLoader
                onLoaded={(d) => {
                  setDoc(d);
                  setPageIndex(Math.max(0, d.pages.findIndex((p) => p.trim())));
                }}
              />
              <textarea
                aria-label="Your text"
                className="w-full rounded border p-2"
                rows={5}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
              />
            </>
          )}
          <Reader text={text} attention={attention} onEnd={goToNextReadablePage} />
        </div>
      </div>
    </main>
  );
}