import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Coffee,
  PanelLeftClose,
  PanelLeft,
  X,
  BookOpen,
  FileText,
  SlidersHorizontal
} from "lucide-react";
import Controls from "./components/Controls";
import Reader from "./components/Reader";
import CameraPanel from "./components/CameraPanel";
import Welcome from "./components/Welcome";
import HelpPanel from "./components/HelpPanel";
import AttentionStatusPill from "./components/AttentionStatusPill";
import { useAttention } from "./hooks/useAttention";
import { useSettings } from "./store/useSettings";
import DocumentLoader from "./components/DocumentLoader";
import PageNav from "./components/PageNav";
import Presets from "./components/Presets";

export default function App() {
  const [pasted, setPasted] = useState(
    "Cadence helps people read with less effort. Paste your own text here, then change the settings and watch the text change. Try a longer passage to see how line height and spacing feel."
  );
  const [doc, setDoc] = useState(null); // { name, pages: [text, text, ...] }
  const [pageIndex, setPageIndex] = useState(0);

  // Responsive sidebar states:
  // Desktop sidebar is open by default, with preference remembered for the session
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Tab for text input vs PDF when no doc is loaded
  const [inputMode, setInputMode] = useState("paste"); // "paste" | "pdf"

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
  const updateSettings = useSettings((s) => s.update);
  const attention = useAttention(sensitivity);

  // Tell the page which colour set to use.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Ambient attention cue styling
  const ambientCue =
    attention.status === "on"
      ? attention.state === "attending"
        ? "border-t-2 border-ok shadow-[0_-4px_16px_-2px_var(--color-ok-bg)]"
        : "border-t-2 border-bad shadow-[0_-4px_16px_-2px_var(--color-bad-bg)]"
      : "border-t border-transparent";

  const renderSidebarContent = () => (
    <div className="space-y-4">
      <CameraPanel attention={attention} />
      <Presets />
      <Controls />
      <HelpPanel />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-ink transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-surface shadow-xs">
              <BookOpen size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-ink">Cadence</span>
                <span className="hidden rounded-full bg-panel px-2 py-0.5 text-[10px] font-semibold text-muted sm:inline">
                  Assistive Reading
                </span>
              </div>
            </div>
          </div>

          {/* Center/Right Controls: Attention status pill, Theme Switch, and Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <AttentionStatusPill attention={attention} compact />

            {/* Quick Theme Switcher */}
            <div
              role="radiogroup"
              aria-label="Theme selection"
              className="flex items-center rounded-xl border border-line bg-panel p-1 text-xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === "light"}
                title="Light theme"
                onClick={() => updateSettings({ theme: "light" })}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  theme === "light" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
                }`}
              >
                <Sun size={13} />
                <span className="hidden md:inline">Light</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === "cream"}
                title="Cream theme (warm and soft on eyes)"
                onClick={() => updateSettings({ theme: "cream" })}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  theme === "cream" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
                }`}
              >
                <Coffee size={13} />
                <span className="hidden md:inline">Cream</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === "dark"}
                title="Dark theme"
                onClick={() => updateSettings({ theme: "dark" })}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  theme === "dark" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
                }`}
              >
                <Moon size={13} />
                <span className="hidden md:inline">Dark</span>
              </button>
            </div>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((prev) => !prev)}
              aria-label={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={desktopSidebarOpen ? "Collapse sidebar (distraction-free mode)" : "Expand sidebar"}
              className="hidden min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-xs transition-colors hover:bg-surface-hover lg:flex"
            >
              {desktopSidebarOpen ? (
                <>
                  <PanelLeftClose size={16} />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <PanelLeft size={16} />
                  <span>Settings</span>
                </>
              )}
            </button>

            {/* Mobile / Tablet Settings Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open reading settings"
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-xs transition-colors hover:bg-surface-hover lg:hidden"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex gap-8 items-start">
          {/* Unified Responsive Settings Sidebar:
              - Desktop (lg:): In-line sidebar alongside reading stage; smoothly collapses width without unmounting.
              - Mobile (< lg): Slide-over drawer overlay when mobileDrawerOpen is true.
              - Never unmounted so the Camera video element and attention loop are never destroyed.
          */}
          <aside
            aria-label="Settings and tools"
            onClick={(e) => {
              if (e.target === e.currentTarget && mobileDrawerOpen) {
                setMobileDrawerOpen(false);
              }
            }}
            className={`
              /* Desktop behavior */
              lg:static lg:z-0 lg:block lg:shrink-0 lg:sticky lg:top-22 lg:max-h-[calc(100vh-6.5rem)]
              lg:transition-[width,opacity] lg:duration-300 lg:ease-in-out
              ${
                desktopSidebarOpen
                  ? "lg:w-[22rem] lg:opacity-100 lg:overflow-y-auto lg:pr-2 lg:pb-6"
                  : "lg:w-0 lg:opacity-0 lg:pointer-events-none lg:overflow-hidden lg:pr-0 lg:pb-0 lg:m-0"
              }
              /* Mobile/Tablet Drawer overlay behavior */
              max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:transition-all max-lg:duration-300
              ${
                mobileDrawerOpen
                  ? "max-lg:flex max-lg:justify-end max-lg:bg-black/40 max-lg:backdrop-blur-xs max-lg:opacity-100 max-lg:pointer-events-auto"
                  : "max-lg:pointer-events-none max-lg:opacity-0 max-lg:invisible"
              }
            `}
          >
            <div
              className={`
                w-full
                max-lg:h-full max-lg:w-full max-lg:max-w-md max-lg:bg-surface max-lg:shadow-2xl max-lg:flex max-lg:flex-col
                max-lg:transition-transform max-lg:duration-300
                ${mobileDrawerOpen ? "max-lg:translate-x-0" : "max-lg:translate-x-full"}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Drawer Header with Close Button */}
              <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-ink" />
                  <h2 className="text-sm font-bold text-ink">Settings &amp; Tools</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close settings drawer"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-panel hover:text-ink"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="max-lg:flex-1 max-lg:overflow-y-auto max-lg:p-5 max-lg:pb-safe">
                {renderSidebarContent()}
              </div>
            </div>
          </aside>

          {/* Reading Stage */}
          <section
            aria-label="Reading stage"
            className={`min-w-0 flex-1 transition-all rounded-3xl ${ambientCue}`}
          >
            <div className="space-y-6">
              <Welcome />

              {doc ? (
                <div className="space-y-4">
                  <PageNav
                    name={doc.name}
                    page={pageIndex + 1}
                    total={doc.pages.length}
                    onPrev={() => setPageIndex((i) => Math.max(i - 1, 0))}
                    onNext={() => setPageIndex((i) => Math.min(i + 1, doc.pages.length - 1))}
                    onClose={() => {
                      setDoc(null);
                      setPageIndex(0);
                    }}
                  />
                  {!text.trim() && (
                    <div className="rounded-2xl border border-line bg-panel p-4 text-center text-xs text-muted">
                      This page has no readable text. It may be an image. Try the next page.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 shadow-xs">
                  {/* Selector tabs between Pasted text and Document upload */}
                  <div className="flex items-center justify-between border-b border-line/60 pb-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setInputMode("paste")}
                        className={`flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                          inputMode === "paste"
                            ? "bg-panel text-ink shadow-xs"
                            : "text-muted hover:text-ink hover:bg-surface-hover"
                        }`}
                      >
                        <FileText size={14} />
                        <span>Paste text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode("pdf")}
                        className={`flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                          inputMode === "pdf"
                            ? "bg-panel text-ink shadow-xs"
                            : "text-muted hover:text-ink hover:bg-surface-hover"
                        }`}
                      >
                        <BookOpen size={14} />
                        <span>Open PDF</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-muted">Reading input</span>
                  </div>

                  {inputMode === "paste" ? (
                    <textarea
                      aria-label="Your text"
                      className="w-full resize-y rounded-xl border border-line bg-surface p-3.5 text-sm text-ink transition-colors hover:border-muted/40 focus:border-ink focus:outline-none"
                      rows={5}
                      value={pasted}
                      placeholder="Paste your text here to read…"
                      onChange={(e) => setPasted(e.target.value)}
                    />
                  ) : (
                    <DocumentLoader
                      onLoaded={(d) => {
                        setDoc(d);
                        setPageIndex(Math.max(0, d.pages.findIndex((p) => p.trim())));
                      }}
                    />
                  )}
                </div>
              )}

              {/* Reader with centered text column and anchored playback dock */}
              <Reader text={text} attention={attention} onEnd={goToNextReadablePage} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}