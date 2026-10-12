import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Eye,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useAdminQuizzesQuery,
  useDeleteAdminQuizMutation,
  usePublishAdminQuizMutation,
  useUnpublishAdminQuizMutation,
} from './hooks';

import { getApiErrorMessage } from '../../lib/api';

function QuizStatus({ published }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[11px] font-semibold',
        published
          ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300'
          : 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300',
      ].join(' ')}
    >
      {published ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}

      {published ? 'Published' : 'Draft'}
    </span>
  );
}

function QuizManagementRow({
  quiz,
  onPublish,
  onUnpublish,
  onDelete,
  isPublishing,
  isDeleting,
}) {
  const questionCount = quiz._count?.questions ?? 0;

  return (
    <article className="group flex flex-col gap-5 px-4 py-5 transition-colors hover:bg-[var(--surface-hover)] sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      {/* Quiz identity */}
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
          <BookOpen size={19} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
            {quiz.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {questionCount}{' '}
              {questionCount === 1
                ? 'question'
                : 'questions'}
            </span>

            <span className="text-[var(--text-subtle)]">•</span>

            <QuizStatus published={quiz.isPublished} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <Link
          to={`/admin/quizzes/${quiz.id}`}
          className="button button-ghost min-h-9 rounded-lg px-3 py-2 text-xs"
        >
          <Eye size={14} />
          <span>Inspect</span>
        </Link>

        {quiz.isPublished ? (
          <button
            type="button"
            disabled={isPublishing}
            onClick={onUnpublish}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-amber-300"
          >
            <XCircle size={14} />

            <span>
              {isPublishing
                ? 'Updating...'
                : 'Unpublish'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isPublishing}
            onClick={onPublish}
            className="button button-primary min-h-9 rounded-lg px-3 py-2 text-xs"
          >
            <CheckCircle2 size={14} />

            <span>
              {isPublishing
                ? 'Publishing...'
                : 'Publish'}
            </span>
          </button>
        )}

        <button
          type="button"
          aria-label={`Delete ${quiz.title}`}
          disabled={isDeleting}
          onClick={onDelete}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-500/75 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-400/10 dark:bg-red-400/5 dark:text-red-400/70 dark:hover:border-red-400/20 dark:hover:bg-red-400/10 dark:hover:text-red-300"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--surface-hover)]" />

        <div className="mt-3 h-9 w-80 animate-pulse rounded-lg bg-[var(--surface-hover)]" />

        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-[var(--surface-soft)]" />
      </div>

      <section className="glass-panel overflow-hidden rounded-3xl">
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--surface-hover)]" />

          <div className="mt-3 h-6 w-44 animate-pulse rounded bg-[var(--surface-hover)]" />
        </div>

        <div className="divide-y divide-[var(--border)]">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[var(--surface-hover)]" />

                <div className="min-w-0 flex-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--surface-hover)]" />

                  <div className="mt-3 h-3 w-32 animate-pulse rounded bg-[var(--surface-soft)]" />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="h-9 w-20 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
                <div className="h-9 w-24 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ErrorState({ onRetry }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-3xl border border-red-500/15 bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300">
          <AlertCircle size={23} />
        </div>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-300">
          Quiz Oversight
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Quizzes could not be loaded
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

export function AdminQuizzesPage() {
  const query = useAdminQuizzesQuery();

  const publish = usePublishAdminQuizMutation();
  const unpublish = useUnpublishAdminQuizMutation();
  const remove = useDeleteAdminQuizMutation();

  const run = (mutation, id, successMessage) => {
    mutation.mutate(id, {
      onSuccess: (data) => {
        toast.success(
          data?.message || successMessage
        );
      },

      onError: (error) => {
        toast.error(
          getApiErrorMessage(
            error,
            'Request failed'
          )
        );
      },
    });
  };

  if (query.isLoading) {
    return <LoadingState />;
  }

  if (query.isError) {
    return (
      <ErrorState
        onRetry={() => query.refetch()}
      />
    );
  }

  const quizzes = query.data?.quizzes ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            Quiz Oversight
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Every quiz, one view.
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Manage publication state and inspect real
            quiz analytics.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
            <BookOpen size={17} />
          </div>

          <div>
            <p className="text-2xl font-bold leading-none text-[var(--text-primary)]">
              {quizzes.length}
            </p>

            <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
              {quizzes.length === 1
                ? 'quiz'
                : 'quizzes'}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz management */}
      <section className="glass-panel overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
              All Quizzes
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Quiz management
            </h2>
          </div>

          <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
            {quizzes.length} total
          </span>
        </div>

        {quizzes.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {quizzes.map((quiz) => (
              <QuizManagementRow
                key={quiz.id}
                quiz={quiz}
                onPublish={() =>
                  run(
                    publish,
                    quiz.id,
                    'Quiz published successfully'
                  )
                }
                onUnpublish={() =>
                  run(
                    unpublish,
                    quiz.id,
                    'Quiz unpublished successfully'
                  )
                }
                onDelete={() => {
                  const confirmed = window.confirm(
                    `Delete ${quiz.title}?`
                  );

                  if (confirmed) {
                    run(
                      remove,
                      quiz.id,
                      'Quiz deleted successfully'
                    );
                  }
                }}
                isPublishing={
                  publish.isPending ||
                  unpublish.isPending
                }
                isDeleting={remove.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">
              <BookOpen size={21} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[var(--text-secondary)]">
              No quizzes yet
            </h3>

            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
              No quizzes were returned by the backend.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}