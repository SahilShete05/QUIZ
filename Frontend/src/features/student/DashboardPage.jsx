import {
  Activity,
  Award,
  BarChart3,
  Flame,
  History,
  TrendingUp,
} from 'lucide-react';

import { useStudentDashboardQuery } from './hooks';

import {
  ErrorState,
  LoadingSkeleton,
  PageIntro,
  SectionTitle,
  StatCard,
  EmptyState,
} from './ui';

function AttemptStatus({ status }) {
  const normalized = String(status || '').toLowerCase();

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
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border',
        'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        statusStyles,
      ].join(' ')}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {String(status || '').replaceAll('_', ' ')}
    </span>
  );
}

function DashboardHero({ stats }) {
  const xp = stats.xp ?? 0;
  const completed = stats.completedAttempts ?? 0;

  return (
    <section className="glass-panel relative mt-7 overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
            <Flame size={14} />
            PERFORMANCE SNAPSHOT
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            You have completed{' '}
            <span className="text-emerald-600 dark:text-emerald-300">
              {completed}
            </span>{' '}
            quizzes so far.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            Keep the streak going with fresh quizzes, consistent reviews, and
            focused practice.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.035] px-5 py-4 dark:border-emerald-400/10 dark:bg-emerald-400/[0.035]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            <TrendingUp size={20} />
          </div>

          <div>
            <strong className="block text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {xp}
            </strong>

            <span className="text-[10px] font-bold tracking-[0.14em] text-[var(--text-subtle)]">
              XP EARNED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } =
    useStudentDashboardQuery();

  const dashboard = data?.dashboard;

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="STUDENT OVERVIEW"
          title="Your learning dashboard."
          description="Loading your latest learning activity and performance."
        />

        <div className="mt-7">
          <LoadingSkeleton type="hero" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <LoadingSkeleton key={item} />
          ))}
        </div>

        <div className="mt-5">
          <LoadingSkeleton type="hero" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="STUDENT OVERVIEW"
          title="Your learning dashboard."
          description="We couldn't load your latest dashboard data."
        />

        <div className="mt-7">
          <ErrorState
            title="Could not load dashboard"
            description="We could not retrieve your latest learning activity from the server."
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
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="STUDENT OVERVIEW"
          title="Your learning dashboard."
          description="Your learning data is not available yet."
        />

        <div className="mt-7">
          <EmptyState
            icon={<Activity size={18} />}
            title="No dashboard data"
            description="There is no student dashboard information available right now."
          />
        </div>
      </main>
    );
  }

  const stats = dashboard.stats || {};
  const recentAttempts = dashboard.recentAttempts || [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="STUDENT OVERVIEW"
        title="Your learning dashboard."
        description="Track your quiz activity, performance, and progress from one place."
      />

      {/* Performance snapshot */}
      <DashboardHero stats={stats} />

      {/* Overview metrics */}
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BarChart3 size={17} />}
          label="Attempts"
          value={stats.totalAttempts ?? 0}
        />

        <StatCard
          icon={<Activity size={17} />}
          label="Completed"
          value={stats.completedAttempts ?? 0}
        />

        <StatCard
          icon={<TrendingUp size={17} />}
          label="Average score"
          value={Number(stats.averageScore ?? 0).toFixed(2)}
        />

        <StatCard
          icon={<Award size={17} />}
          label="Badges"
          value={stats.badges ?? 0}
        />
      </section>

      {/* Recent attempts */}
      <section className="glass-panel mt-5 overflow-hidden rounded-2xl">
        <div className="p-5 sm:p-6">
          <SectionTitle
            title="Recent attempts"
            description="Your latest quiz activity returned by the backend."
          />
        </div>

        {recentAttempts.length === 0 ? (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <EmptyState
              icon={<History size={18} />}
              title="No attempts yet"
              description="Your recent quiz attempts will appear here once you start taking quizzes."
            />
          </div>
        ) : (
          <div className="border-t border-[var(--border)]">
            {recentAttempts.map((attempt) => (
              <div
                className="group flex items-center gap-3 border-b border-[var(--border)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)] sm:gap-4 sm:px-6"
                key={attempt.id}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] transition-colors group-hover:border-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:border-emerald-400/15 dark:group-hover:text-emerald-300">
                  <History size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold text-[var(--text-primary)] sm:text-[15px]">
                    {attempt.quiz?.title || 'Quiz attempt'}
                  </strong>

                  <span className="mt-1 block text-xs capitalize text-[var(--text-subtle)]">
                    {String(attempt.status || '').replaceAll('_', ' ')}

                    <span className="mx-1.5">
                      ·
                    </span>

                    <span className="text-[var(--text-muted)]">
                      {attempt.score ?? 0} score
                    </span>
                  </span>
                </div>

                <AttemptStatus status={attempt.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}