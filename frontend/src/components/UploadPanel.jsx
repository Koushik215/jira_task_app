import { useRef, useState } from "react";

const SAMPLE = {
  value: [
    {
      speaker: "John",
      text: "We need to finish API by Friday",
      startTime: "00:01:10",
    },
  ],
};

export default function UploadPanel({ onSubmit, isLoading }) {
  const inputRef = useRef(null);
  const [rawJson, setRawJson] = useState(JSON.stringify(SAMPLE, null, 2));
  const [error, setError] = useState("");

  function loadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawJson(String(reader.result || ""));
    reader.readAsText(file);
  }

  function handleSubmit() {
    try {
      const parsed = JSON.parse(rawJson);
      setError("");
      onSubmit(parsed);
    } catch {
      setError("Please provide valid Microsoft Teams transcript JSON.");
    }
  }

  return (
    <section className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-ink/60">Upload</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Transcript Intake</h2>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
        >
          Choose JSON
        </button>
      </div>

      <input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={loadFile} />
      <textarea
        value={rawJson}
        onChange={(event) => setRawJson(event.target.value)}
        className="h-72 w-full rounded-2xl border border-ink/10 bg-white/80 p-4 font-mono text-sm text-ink outline-none transition focus:border-coral"
      />
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="rounded-full bg-coral px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Processing..." : "Process Meeting"}
        </button>
        <p className="text-sm text-ink/65">Accepts the native Teams transcript `value` array.</p>
      </div>
    </section>
  );
}
