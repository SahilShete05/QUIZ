import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  EmptyState,
  ErrorState,
  PageIntro,
  LoadingSkeleton,
} from '../student/ui';

import {
  useDeleteQuizMutation,
  usePublishQuizMutation,
  useTeacherQuizzesQuery,
  useUnpublishQuizMutation,
} from './hooks';

import { getApiErrorMessage } from '../../lib/api';

function QuizStatus({ isPublished }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[10px] font-semibold uppercase tracking-wide',
        isPublished
          ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-400'
          : 'border-white/[0.08] bg-white/[0.04] text-slate-400',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          isPublished
            ? 'bg-emerald-400'
            : 'bg-slate-500',
        ].join(' ')}
      />

      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

function QuizCard({
  quiz,
  onPublish,
  onUnpublish,
  onDelete,
}) {
  const questionCount =
    quiz._count?.questions ?? 0;

  return (
    <article className="glass-panel group flex h-full flex-col overflow-hidden rounded-2xl">
      {/* Card accent */}
      <div className="h-1 bg-gradient-to-r from-emerald-400/70 via-teal-400/30 to-transparent opacity-70 transition-opacity group-hover:opacity-100" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Metadata */}
        <div className="flex items-center justify-between gap-3">
          <QuizStatus
            isPublished={quiz.isPublished}
          />

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <BookOpen size={13} />
            {questionCount}{' '}
            {questionCount === 1
              ? 'question'
              : 'questions'}
          </span>
        </div>

        {/* Content */}
        <div className="mt-5 flex-1">
          <h2 className="line-clamp-2 text-lg font-semibold leading-7 tracking-tight text-slate-100 transition-colors group-hover:text-emerald-300">
            {quiz.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
            {quiz.description ||
              'No description provided.'}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
          <Link
            className="button button-ghost"
            to={`/teacher/quizzes/${quiz.id}`}
          >
            Manage
          </Link>

          <Link
            className="button button-ghost"
            to={`/teacher/quizzes/${quiz.id}/edit`}
          >
            Edit
          </Link>

          {quiz.isPublished ? (
            <button
              type="button"
              className="button button-ghost"
              onClick={() =>
                onUnpublish(quiz.id)
              }
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={() =>
                onPublish(quiz.id)
              }
            >
              Publish
            </button>
          )}

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400 transition hover:border-red-400/20 hover:bg-red-400/10"
            aria-label={`Delete ${quiz.title}`}
            onClick={() =>
              onDelete(quiz.id)
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function QuizGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(
        (item) => (
          <div
            key={item}
            className="glass-panel h-64 animate-pulse rounded-2xl p-5"
          >
            <div className="h-5 w-20 rounded-full bg-white/[0.06]" />
            <div className="mt-6 h-6 w-3/4 rounded bg-white/[0.06]" />
            <div className="mt-3 h-4 w-full rounded bg-white/[0.05]" />
            <div className="mt-2 h-4 w-5/6 rounded bg-white/[0.05]" />

            <div className="mt-8 flex gap-2">
              <div className="h-10 w-20 rounded-xl bg-white/[0.05]" />
              <div className="h-10 w-16 rounded-xl bg-white/[0.05]" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function TeacherQuizzesPage() {
  const [params, setParams] =
    useSearchParams();

  const search =
    params.get('search') || '';

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useTeacherQuizzesQuery({
    search,
    page: 1,
    limit: 50,
  });

  const remove =
    useDeleteQuizMutation();

  const publish =
    usePublishQuizMutation();

  const unpublish =
    useUnpublishQuizMutation();

  const quizzes =
    data?.quizzes || [];

  const run = async (
    mutation,
    id,
    message
  ) => {
    try {
      await mutation.mutateAsync(id);

      toast.success(message);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'The request failed.'
        )
      );
    }
  };

  const deleteQuiz = (id) => {
    if (
      window.confirm(
        'Delete this quiz? This cannot be undone.'
      )
    ) {
      run(
        remove,
        id,
        'Quiz deleted.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="QUIZ MANAGEMENT"
          title="My quizzes."
          description="Loading your quizzes."
        />

        <div className="mt-7">
          <QuizGridSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Could not load quizzes"
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
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="QUIZ MANAGEMENT"
        title="My quizzes."
        description="Create, refine, and publish quizzes from one workspace."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="button button-ghost"
              to="/teacher/ai-generator"
            >
              <Sparkles size={16} />
              Generate with AI
            </Link>

            <Link
              className="button button-primary"
              to="/teacher/quizzes/new"
            >
              <Plus size={16} />
              Create quiz
            </Link>
          </div>
        }
      />

      {/* Search toolbar */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xl">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setParams(
                event.target.value
                  ? {
                      search:
                        event.target.value,
                    }
                  : {}
              )
            }
            placeholder="Search your quizzes"
            aria-label="Search your quizzes"
            className={[
              'h-12 w-full rounded-2xl border border-white/[0.08]',
              'bg-white/[0.035] pl-11 pr-4',
              'text-sm text-slate-100',
              'placeholder:text-slate-500',
              'outline-none backdrop-blur-md',
              'transition-all duration-200',
              'focus:border-emerald-400/30',
              'focus:bg-white/[0.05]',
              'focus:ring-4 focus:ring-emerald-400/10',
            ].join(' ')}
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          {quizzes.length}{' '}
          {quizzes.length === 1
            ? 'quiz'
            : 'quizzes'}
          {search
            ? ' matching your search'
            : ''}
        </div>
      </div>

      {/* Quiz grid */}
      <div className="mt-7">
        {quizzes.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onPublish={(id) =>
                  run(
                    publish,
                    id,
                    'Quiz published.'
                  )
                }
                onUnpublish={(id) =>
                  run(
                    unpublish,
                    id,
                    'Quiz unpublished.'
                  )
                }
                onDelete={deleteQuiz}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No quizzes found"
            description={
              search
                ? 'Try a different search.'
                : 'Create a quiz to see it here.'
            }
            action={
              <div className="flex flex-wrap gap-2">
                <Link
                  className="button button-ghost"
                  to="/teacher/ai-generator"
                >
                  <Sparkles size={16} />
                  Generate with AI
                </Link>

                <Link
                  className="button button-primary"
                  to="/teacher/quizzes/new"
                >
                  <Plus size={16} />
                  Create quiz
                </Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}