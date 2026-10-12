import {
  AlertCircle,
  Award,
  BookOpen,
  Check,
  RefreshCw,
  Tags,
  Users,
} from 'lucide-react';

import {
  useAdminBadgesQuery,
  useAdminCategoriesQuery,
  useAdminDashboardQuery,
} from './hooks';

function Metric({ label, value, icon: Icon }) {
  return (
    <div
      className={[
        'group relative overflow-hidden rounded-2xl',
        'border border-[var(--border)]',
        'bg-[var(--surface)] p-5',
        'shadow-[var(--shadow-soft)]',
        'backdrop-blur-md',
        'transition-all duration-200',
        'hover:-translate-y-0.5',
        'hover:border-[var(--border-strong)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon size={18} />
        </div>

        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          Live
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium leading-5 text-[var(--text-muted)]">
          {label}
        </p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--surface-hover)]" />

        <div className="mt-3 h-9 w-72 animate-pulse rounded-lg bg-[var(--surface-hover)]" />

        <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded bg-[var(--surface-soft)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div
            className="h-36 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            key={item}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="h-96 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
        <div className="h-96 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      </div>
    </main>
  );
}

function ErrorState({ onRetry }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div
        className={[
          'w-full max-w-lg rounded-2xl',
          'border border-red-500/15',
          'bg-[var(--surface)] p-8 text-center',
          'shadow-[var(--shadow-card)] backdrop-blur-xl',
        ].join(' ')}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300">
          <AlertCircle size={23} />
        </div>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-300">
          System Overview
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Admin data could not be loaded
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          Check the backend response and try again.
        </p>

        <button
          type="button"
          className="button button-primary mt-6"
          onClick={onRetry}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  count,
  icon: Icon,
  iconClassName,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
      </div>

      {count !== undefined ? (
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]">
          {count}
        </span>
      ) : (
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            iconClassName,
          ].join(' ')}
        >
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}

function ActivityItem({ quiz }) {
  const published = quiz.isPublished;

  return (
    <div
      className={[
        'group flex items-center gap-3 rounded-xl',
        'border border-[var(--border)]',
        'bg-[var(--surface-soft)] p-3.5',
        'transition-all duration-200',
        'hover:border-[var(--border-strong)]',
        'hover:bg-[var(--surface-hover)]',
      ].join(' ')}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
        <BookOpen size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {quiz.title}
        </p>

        <p className="mt-1 text-xs text-[var(--text-subtle)]">
          {quiz._count?.questions ?? 0}{' '}
          {quiz._count?.questions === 1
            ? 'question'
            : 'questions'}
        </p>
      </div>

      <span
        className={[
          'inline-flex shrink-0 items-center gap-1.5 rounded-full border',
          'px-2.5 py-1 text-[11px] font-semibold',
          published
            ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300'
            : 'border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300',
        ].join(' ')}
      >
        <span
          className={[
            'h-1.5 w-1.5 rounded-full',
            published ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400',
          ].join(' ')}
        />

        {published ? 'Published' : 'Draft'}
      </span>
    </div>
  );
}

function CapabilityItem({
  title,
  description,
  enabled = true,
}) {
  return (
    <div
      className={[
        'flex gap-3 rounded-xl border p-4',
        enabled
          ? 'border-[var(--border)] bg-[var(--surface-soft)]'
          : 'border-[var(--border)] bg-[var(--surface-soft)] opacity-65',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          enabled
            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300'
            : 'bg-[var(--surface-hover)] text-[var(--text-subtle)]',
        ].join(' ')}
      >
        {enabled ? (
          <Check size={16} />
        ) : (
          <span className="text-sm font-bold">—</span>
        )}
      </div>

      <div>
        <p
          className={[
            'text-sm font-semibold',
            enabled
              ? 'text-[var(--text-secondary)]'
              : 'text-[var(--text-muted)]',
          ].join(' ')}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--text-subtle)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const dashboard = useAdminDashboardQuery();
  const categories = useAdminCategoriesQuery();
  const badges = useAdminBadgesQuery();

  const isLoading =
    dashboard.isLoading ||
    categories.isLoading ||
    badges.isLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  const hasError =
    dashboard.isError ||
    categories.isError ||
    badges.isError;

  if (hasError) {
    const handleRetry = () => {
      dashboard.refetch();
      categories.refetch();
      badges.refetch();
    };

    return <ErrorState onRetry={handleRetry} />;
  }

  const stats = dashboard.data?.dashboard?.stats ?? {};

  const recentQuizzes = dashboard.data?.dashboard?.recentQuizzes ?? [];

  const categoryCount =
    categories.data?.count ??
    categories.data?.categories?.length ??
    0;

  const badgeCount =
    badges.data?.count ??
    badges.data?.badges?.length ??
    0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          SYSTEM OVERVIEW
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Platform operations.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
          Live operational data returned by the backend.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Metric
          label="Students reached"
          value={stats.totalStudents}
          icon={Users}
        />

        <Metric
          label="Total quizzes"
          value={stats.totalQuizzes}
          icon={BookOpen}
        />

        <Metric
          label="Published quizzes"
          value={stats.totalPublishedQuizzes}
          icon={BookOpen}
        />

        <Metric
          label="Total questions"
          value={stats.totalQuestions}
          icon={Tags}
        />

        <Metric
          label="Attempts"
          value={stats.totalAttempts}
          icon={RefreshCw}
        />

        <Metric
          label="Categories"
          value={categoryCount}
          icon={Tags}
        />

        <Metric
          label="Badges"
          value={badgeCount}
          icon={Award}
        />
      </div>

      {/* Dashboard sections */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent quizzes */}
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <SectionHeader
            eyebrow="RECENT QUIZZES"
            title="Platform activity"
            count={recentQuizzes.length}
          />

          {recentQuizzes.length > 0 ? (
            <div className="mt-6 space-y-2.5">
              {recentQuizzes.map((quiz) => (
                <ActivityItem
                  key={quiz.id}
                  quiz={quiz}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-subtle)]">
                <BookOpen size={19} />
              </div>

              <p className="mt-3 text-sm text-[var(--text-muted)]">
                No quizzes returned.
              </p>
            </div>
          )}
        </section>

        {/* Supported scope */}
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <SectionHeader
            eyebrow="SUPPORTED SCOPE"
            title="Admin capabilities"
            icon={Award}
            iconClassName="border border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300"
          />

          <div className="mt-6 space-y-2.5">
            <CapabilityItem
              title="Quiz oversight"
              description="Manage and review platform quizzes."
            />

            <CapabilityItem
              title="Quiz analytics"
              description="Access per-quiz performance data."
            />

            <CapabilityItem
              title="Categories & badges"
              description="Manage supported categories and badges."
            />

            <CapabilityItem
              title="Advanced user management"
              description="Role changes and platform-wide analytics are not exposed by the current API."
              enabled={false}
            />
          </div>
        </section>
      </div>
    </main>
  );
}