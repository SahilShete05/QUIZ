import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  SectionTitle,
} from '../student/ui';

import { useQuizAttemptsQuery } from './hooks';

const RISK_STYLES = {
  LOW: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-400',
  MEDIUM: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  HIGH: 'border-red-400/25 bg-red-400/10 text-red-300',
};

function formatStatus(status) {
  return String(status || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function RiskBadge({ level }) {
  const Icon = level === 'LOW' ? ShieldCheck : ShieldAlert;

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border',
        'px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
        RISK_STYLES[level] || RISK_STYLES.LOW,
      ].join(' ')}
    >
      <Icon size={12} />
      {level}
    </span>
  );
}

function AttemptRow({ attempt }) {
  const { violations } = attempt;

  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.06] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <strong className="block truncate text-sm font-semibold text-slate-200">
          {attempt.user?.name || attempt.user?.email || 'Student'}
        </strong>

        <span className="mt-1 block text-xs text-slate-500">
          {formatStatus(attempt.status)}
          {' · '}
          {attempt.score ?? 0} score
          {' · '}
          {new Date(attempt.startedAt).toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
        <span className="text-xs text-slate-500">
          Tab switches{' '}
          <strong className="text-slate-300">{violations.tabSwitches}</strong>
          {' · '}
          Copy{' '}
          <strong className="text-slate-300">{violations.copyAttempts}</strong>
          {' · '}
          Paste{' '}
          <strong className="text-slate-300">{violations.pasteAttempts}</strong>
          {' · '}
          Right-click{' '}
          <strong className="text-slate-300">
            {violations.rightClickAttempts}
          </strong>
        </span>

        <span className="text-sm font-semibold tabular-nums text-slate-200">
          {attempt.totalViolations}
        </span>

        <RiskBadge level={attempt.riskLevel} />
      </div>
    </div>
  );
}

export function AttemptIntegritySection({ quizId }) {
  const { data, isLoading, isError, refetch } = useQuizAttemptsQuery(quizId);

  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const attempts = data?.attempts || [];

  const flaggedCount = attempts.filter(
    (attempt) => attempt.riskLevel !== 'LOW',
  ).length;

  const visible = flaggedOnly
    ? attempts.filter((attempt) => attempt.riskLevel !== 'LOW')
    : attempts;

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6">
      <SectionTitle
        title="Attempt monitoring"
        description="Anti-cheat activity recorded during each attempt."
        action={
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(event) => setFlaggedOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-emerald-400"
            />
            Flagged only ({flaggedCount})
          </label>
        }
      />

      <div className="mt-5">
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load attempts"
            action={
              <button
                type="button"
                className="button button-primary"
                onClick={() => refetch()}
              >
                Try again
              </button>
            }
          />
        ) : visible.length ? (
          visible.map((attempt) => (
            <AttemptRow key={attempt.id} attempt={attempt} />
          ))
        ) : (
          <EmptyState
            title={flaggedOnly ? 'No flagged attempts' : 'No attempts yet'}
            description={
              flaggedOnly
                ? 'No attempt has reached the medium risk level.'
                : 'Attempts will appear here when students take this quiz.'
            }
          />
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600">
        Risk level: Low under 5 violations, Medium from 5, High from 10.
      </p>
    </section>
  );
}