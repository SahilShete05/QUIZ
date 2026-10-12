import { Link } from 'react-router-dom';
import {
  ArrowRight,
  History,
  PlayCircle,
} from 'lucide-react';

import { useMyAttemptsQuery } from './hooks';

import {
  EmptyState,
  ErrorState,
  PageIntro,
  LoadingSkeleton,
  formatAttemptStatus,
} from './ui';

const COMPLETED_STATUSES = ['SUBMITTED', 'AUTO_SUBMITTED'];

function AttemptStatus({ status }) {
  const normalized = String(status || '').toLowerCase();
  const label = formatAttemptStatus(status);

  const statusStyles =
    normalized === 'submitted'
      ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300'
      : normalized === 'auto_submitted'
        ? 'border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300'
        : normalized === 'in_progress'
          ? 'border-sky-500/15 bg-sky-500/10 text-sky-600 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300'
          : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]';

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center rounded-full border',
        'px-2.5 py-1 text-[11px] font-semibold',
        statusStyles,
      ].join(' ')}
    >
      {label}
    </span>
  );
}

export function AttemptsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useMyAttemptsQuery();

  const attempts = data?.attempts || [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="ATTEMPT HISTORY"
        title="Your attempts."
        description="Review your quiz activity and results from the live backend."
      />

      {isLoading ? (
        <div className="mt-7">
          <LoadingSkeleton type="hero" />
        </div>
      ) : isError ? (
        <div className="mt-7">
          <ErrorState
            title="Could not load attempts"
            description="The attempts history endpoint returned an error."
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
        </div>
      ) : attempts.length === 0 ? (
        <div className="mt-7">
          <div className="glass-panel rounded-2xl p-2">
            <EmptyState
              icon={<History size={18} />}
              title="No attempts yet"
              description="Your history will appear here after your first quiz."
            />
          </div>
        </div>
      ) : (
        <section className="glass-panel mt-7 overflow-hidden rounded-2xl">
          {/* List header */}
          <div className="hidden grid-cols-[1fr_auto] items-center border-b border-[var(--border)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:grid">
            <span>Quiz attempt</span>
            <span>Status</span>
          </div>

          {/* Attempts */}
          <div className="divide-y divide-[var(--border)]">
            {attempts.map((attempt) => {
              const status = formatAttemptStatus(attempt.status);

              // Finished attempts open the result directly; only attempts
              // still in progress open the quiz page.
              const isCompleted = COMPLETED_STATUSES.includes(attempt.status);

              return (
                <Link
                  key={attempt.id}
                  to={
                    isCompleted
                      ? `/student/attempts/${attempt.id}/result`
                      : `/student/attempts/${attempt.id}`
                  }
                  className={[
                    'group flex items-center gap-3',
                    'px-4 py-4 sm:gap-4 sm:px-5',
                    'transition-colors duration-200',
                    'hover:bg-[var(--surface-hover)]',
                  ].join(' ')}
                >
                  {/* Icon */}
                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center',
                      'rounded-xl border border-[var(--border)]',
                      'bg-[var(--surface-soft)]',
                      'text-[var(--text-muted)]',
                      'transition-all duration-200',
                      'group-hover:border-emerald-500/15',
                      'group-hover:bg-emerald-500/10',
                      'group-hover:text-emerald-600',
                      'dark:group-hover:border-emerald-400/15',
                      'dark:group-hover:bg-emerald-400/10',
                      'dark:group-hover:text-emerald-300',
                    ].join(' ')}
                  >
                    <History size={17} />
                  </div>

                  {/* Attempt information */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={[
                        'truncate text-sm font-semibold',
                        'text-[var(--text-primary)]',
                        'transition-colors',
                        'group-hover:text-emerald-700',
                        'dark:group-hover:text-emerald-200',
                        'sm:text-[15px]',
                      ].join(' ')}
                    >
                      {attempt.quiz?.title}
                    </div>

                    <div className="mt-1 text-xs text-[var(--text-subtle)]">
                      {status}

                      <span className="mx-1.5 text-[var(--text-subtle)]">
                        ·
                      </span>

                      <span className="text-[var(--text-muted)]">
                        {attempt.score ?? 0} score
                      </span>
                    </div>
                  </div>

                  {/* Status + arrow */}
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden sm:block">
                      <AttemptStatus status={attempt.status} />
                    </div>

                    <ArrowRight
                      size={16}
                      className={[
                        'text-[var(--text-subtle)]',
                        'transition-all duration-200',
                        'group-hover:translate-x-0.5',
                        'group-hover:text-emerald-600',
                        'dark:group-hover:text-emerald-300',
                      ].join(' ')}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-6">
        <Link
          to="/student/quizzes"
          className={[
            'button button-ghost',
            'inline-flex',
            'hover:border-emerald-500/20',
            'hover:bg-emerald-500/10',
            'hover:text-emerald-700',
            'dark:hover:border-emerald-400/20',
            'dark:hover:bg-emerald-400/10',
            'dark:hover:text-emerald-300',
          ].join(' ')}
        >
          <PlayCircle size={16} />
          Start a new quiz
        </Link>
      </div>
    </main>
  );
}