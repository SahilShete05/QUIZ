export default function AnalyticsLoading({ cards = 4 }) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading analytics"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div
            key={index}
            className="glass-panel animate-pulse rounded-2xl p-5"
          >
            <div className="h-4 w-28 rounded bg-[var(--surface-hover)]" />
            <div className="mt-5 h-8 w-36 max-w-full rounded bg-[var(--surface-hover)]" />
            <div className="mt-4 h-3 w-44 max-w-full rounded bg-[var(--surface-hover)]" />
          </div>
        ))}
      </div>

      <div className="glass-panel animate-pulse rounded-2xl p-5">
        <div className="h-5 w-48 rounded bg-[var(--surface-hover)]" />
        <div className="mt-6 h-64 rounded-xl bg-[var(--surface-hover)]" />
      </div>

      <span className="sr-only">Loading analytics data…</span>
    </div>
  );
}