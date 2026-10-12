import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AnalyticsError({
  message = 'Unable to load analytics. Please try again.',
  onRetry,
}) {
  return (
    <div
      className="glass-panel rounded-2xl p-6 sm:p-8"
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
          <AlertCircle size={22} className="text-rose-500" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--text-primary)]">
            Analytics unavailable
          </h3>

          <p className="mt-2 break-words text-sm leading-6 text-[var(--text-muted)]">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="button button-primary mt-4 inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}