import { useState } from "react";
import Controls from "./components/Controls";
import Reader from "./components/Reader";
import CameraPanel from "./components/CameraPanel";
import { useAttention } from "./hooks/useAttention";
import { useSettings } from "./store/useSettings";

export default function App() {
  const [text, setText] = useState(
    "Cadence helps people read with less effort. Paste your own text here, then change the settings and watch the text change. Try a longer passage to see how line height and spacing feel.Cadence helps people read with less effort. Paste your own text here, then change the settings and watch the text change. Try a longer passage to see how line height and spacing feel. Cadence helps people read with less effort. Paste your own text here, then change the settings and watch the text change. Try a longer passage to see how line height and spacing feel."
  );
  const sensitivity = useSettings((s) => s.sensitivity);
  const attention = useAttention(sensitivity);
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-[18rem_1fr]">
      <aside className="space-y-4 md:sticky md:top-6 md:self-start">
        <h1 className="text-3xl font-bold">Cadence</h1>
        <CameraPanel attention={attention} />
        <Controls />
      </aside>

      <div className="space-y-4">
        <textarea
          aria-label="Your text"
          className="w-full rounded border p-2"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Reader text={text} attention={attention}/>
      </div>
    </main>
  );
}