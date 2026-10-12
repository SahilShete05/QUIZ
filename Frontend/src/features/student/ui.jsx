import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Medal,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
  children,
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-400">
          {eyebrow}
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      {action || children ? (
        <div className="shrink-0">{action || children}</div>
      ) : null}
    </div>
  );
}

export function StatCard({ icon, label, value, tone = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-[var(--border)]',
        'bg-[var(--surface)] p-5',
        'shadow-[var(--shadow-soft)]',
        'backdrop-blur-md',
        'transition-all duration-200',
        'hover:border-[var(--border-strong)] hover:-translate-y-0.5',
        tone,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
          {icon}
        </div>

        <div className="min-w-0 text-right">
          <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </span>

          <strong className="mt-1 block text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {value}
          </strong>
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon = <BookOpen size={18} />,
  title,
  description,
  action,
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] px-6 py-10 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)]">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  action,
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/[0.035] px-6 py-10 text-center dark:border-red-400/10 dark:bg-red-400/[0.025]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/15 bg-red-500/10 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-400">
        <AlertCircle size={18} />
      </div>

      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        {description || 'We could not load the latest data from the server.'}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingSkeleton({ type = 'card' }) {
  const isHero = type === 'hero';

  return (
    <div
      className={[
        'animate-pulse rounded-2xl border border-[var(--border)]',
        'bg-[var(--surface-soft)]',
        isHero ? 'h-52' : 'h-64',
      ].join(' ')}
      aria-hidden="true"
    >
      <div className="h-full w-full rounded-2xl bg-gradient-to-br from-[var(--surface-hover)] to-transparent" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} />
      ))}
    </div>
  );
}

export function QuizCard({ quiz }) {
  const accent = ['art-0', 'art-1', 'art-2', 'art-3'][quiz.id.length % 4];

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-[var(--surface-hover)] dark:hover:border-emerald-400/15">
      <div
        className={[
          'relative flex h-36 items-center justify-between overflow-hidden px-6',
          'border-b border-[var(--border)]',
          'bg-gradient-to-br',
          accent === 'art-0'
            ? 'from-emerald-500/15 via-emerald-500/[0.04] to-transparent'
            : '',
          accent === 'art-1'
            ? 'from-cyan-500/15 via-cyan-500/[0.04] to-transparent'
            : '',
          accent === 'art-2'
            ? 'from-violet-500/15 via-violet-500/[0.04] to-transparent'
            : '',
          accent === 'art-3'
            ? 'from-amber-500/15 via-amber-500/[0.04] to-transparent'
            : '',
        ].join(' ')}
      >
        <span className="text-xs font-bold tracking-[0.2em] text-[var(--text-muted)]">
          QUIZ
        </span>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] text-emerald-600 backdrop-blur-sm transition-transform duration-200 group-hover:scale-105 dark:text-emerald-300">
          <Sparkles size={24} />
        </div>

        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-emerald-500/[0.06] blur-2xl dark:bg-emerald-400/[0.06]" />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} />
            {Math.max(
              1,
              Math.ceil((quiz.durationSeconds || 0) / 60)
            )}{' '}
            min
          </span>

          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={13} />
            {quiz._count?.questions ?? 0} questions
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-7 text-[var(--text-primary)]">
          {quiz.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[var(--text-muted)]">
          {quiz.description || 'A published quiz ready for you to attempt.'}
        </p>

        <Link
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          to={`/student/quizzes/${quiz.id}`}
        >
          Open quiz
          <Star
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}

export function BadgeCard({ badge, awardedAt }) {
  return (
    <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-md transition-colors duration-200 hover:border-emerald-500/20 hover:bg-[var(--surface-hover)] dark:hover:border-emerald-400/15">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
        <Medal size={18} />
      </div>

      <strong className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
        {badge?.name}
      </strong>

      <span className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {badge?.description}
      </span>

      {awardedAt ? (
        <span className="mt-4 text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
          Awarded {new Date(awardedAt).toLocaleDateString()}
        </span>
      ) : null}
    </article>
  );
}

export function NotificationItem({ notification, onMarkRead }) {
  const isRead = Boolean(notification.isRead);

  return (
    <div
      className={[
        'flex flex-col gap-4 rounded-2xl border p-5 transition-colors sm:flex-row sm:items-start sm:justify-between',
        isRead
          ? 'border-[var(--border)] bg-[var(--surface-soft)]'
          : 'border-emerald-500/15 bg-emerald-500/[0.045] dark:border-emerald-400/10 dark:bg-emerald-400/[0.035]',
      ].join(' ')}
    >
      <div className="flex min-w-0 gap-3">
        <div
          className={[
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            isRead
              ? 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
              : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
          ].join(' ')}
        >
          {isRead ? (
            <CheckCircle2 size={17} />
          ) : (
            <Sparkles size={17} />
          )}
        </div>

        <div className="min-w-0">
          <strong className="block text-sm font-semibold text-[var(--text-primary)]">
            {notification.title}
          </strong>

          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {notification.message}
          </p>

          <span className="mt-2 block text-xs text-[var(--text-subtle)]">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {!isRead ? (
        <button
          type="button"
          className="button button-ghost self-start whitespace-nowrap"
          onClick={() => onMarkRead(notification.id)}
        >
          Mark read
        </button>
      ) : null}
    </div>
  );
}

export function AttemptStatusPill({ status }) {
  const normalized = String(status || '').toLowerCase();

  const tone =
    normalized === 'submitted'
      ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-400'
      : normalized === 'auto_submitted'
        ? 'border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-400'
        : normalized === 'in_progress'
          ? 'border-cyan-500/15 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-400'
          : 'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)]';

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1',
        'text-[11px] font-semibold uppercase tracking-wide',
        tone,
      ].join(' ')}
    >
      {String(status || '').replaceAll('_', ' ')}
    </span>
  );
}

export function QuizMeta({ quiz }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
        <Clock3 size={14} className="text-emerald-600 dark:text-emerald-400" />
        {Math.max(
          1,
          Math.ceil((quiz.durationSeconds || 0) / 60)
        )}{' '}
        minutes
      </span>

      <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
        <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
        {quiz._count?.questions ?? 0} questions
      </span>

      {quiz.createdBy?.name ? (
        <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--text-muted)]">
          <UserRound size={14} className="text-emerald-600 dark:text-emerald-400" />
          {quiz.createdBy.name}
        </span>
      ) : null}
    </div>
  );
}

export function formatAttemptStatus(status) {
  return String(status || '').replaceAll('_', ' ');
}