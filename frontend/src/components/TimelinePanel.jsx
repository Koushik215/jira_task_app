export default function TimelinePanel({ cleanedTranscript }) {
  return (
    <section className="glass-card rounded-3xl p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.3em] text-ink/60">Timeline</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Conversation Flow</h2>

      <div className="mt-6 space-y-4">
        {cleanedTranscript.length ? (
          cleanedTranscript.map((entry, index) => (
            <div key={`${entry.timestamp}-${index}`} className="rounded-2xl border border-ink/10 bg-white/75 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-ink">{entry.speaker}</span>
                <span className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/70">{entry.timestamp}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/85">{entry.text}</p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-ink/20 p-6 text-sm text-ink/60">
            Process a meeting to see a cleaned timeline here.
          </p>
        )}
      </div>
    </section>
  );
}
