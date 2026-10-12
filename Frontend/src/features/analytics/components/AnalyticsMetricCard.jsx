import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function AnalyticsMetricCard({
  label,
  value,
  description,
  icon: Icon,
  change,
  changeLabel = 'vs. previous period',
}) {
  const numericChange =
    typeof change === 'number' ? change : Number(change);

  const hasChange =
    change !== null &&
    change !== undefined &&
    change !== '' &&
    Number.isFinite(numericChange);

  const isPositive = hasChange && numericChange > 0;
  const isNegative = hasChange && numericChange < 0;

  const ChangeIcon = isPositive
    ? ArrowUpRight
    : isNegative
      ? ArrowDownRight
      : Minus;

  const changeColor = isPositive
    ? 'text-emerald-500'
    : isNegative
      ? 'text-rose-500'
      : 'text-[var(--text-muted)]';

  return (
    <article className="glass-panel min-w-0 rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {label}
          </p>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {value ?? '—'}
          </p>
        </div>

        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
            <Icon
              size={21}
              aria-hidden="true"
              className="text-[var(--text-primary)]"
            />
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm leading-5 text-[var(--text-muted)]">
          {description}
        </p>
      )}

      {hasChange && (
        <div className={`mt-4 flex items-center gap-1.5 text-xs ${changeColor}`}>
          <ChangeIcon size={15} aria-hidden="true" />

          <span className="font-semibold">
            {Math.abs(numericChange).toFixed(1)}%
          </span>

          <span className="text-[var(--text-muted)]">
            {changeLabel}
          </span>
        </div>
      )}
    </article>
  );
}