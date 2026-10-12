import { CalendarDays, RefreshCw } from 'lucide-react';

const PERIODS = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
];

export default function AnalyticsFilters({
  days = 30,
  onDaysChange,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <CalendarDays size={18} />
        <span>Analytics period</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1">
          {PERIODS.map((period) => {
            const active = Number(days) === Number(period.value);

            return (
              <button
                key={period.value}
                type="button"
                onClick={() => onDaysChange?.(Number(period.value))}
                aria-pressed={active}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {period.label}
              </button>
            );
          })}
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="button button-ghost inline-flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
