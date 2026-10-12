
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Layers3,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';

import {
  useQuizQuery,
  useQuizQuestionsQuery,
  useStartAttemptMutation,
} from './hooks';

import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  QuizMeta,
} from './ui';

export function QuizDetailsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuizQuery(quizId);

  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    isError: isQuestionsError,
    refetch: refetchQuestions,
  } = useQuizQuestionsQuery(quizId);

  const quiz = data?.quiz;
  const startAttempt = useStartAttemptMutation();

  const durationMinutes = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil((quiz?.durationSeconds || 0) / 60),
      ),
    [quiz?.durationSeconds],
  );

  /*
   * Question count is derived from the separate questions endpoint.
   * Adjust the response mapping if your backend uses another structure.
   */
  const questions =
    Array.isArray(questionsData?.questions)
      ? questionsData.questions
      : Array.isArray(questionsData?.quizQuestions)
        ? questionsData.quizQuestions
        : Array.isArray(questionsData?.data)
          ? questionsData.data
          : Array.isArray(questionsData?.quiz?.questions)
            ? questionsData.quiz.questions
            : Array.isArray(quiz?.questions)
              ? quiz.questions
              : null;

  const questionCount = questions?.length ?? 0;

  const handleStart = async () => {
    try {
      const response =
        await startAttempt.mutateAsync(quizId);

      if (!response?.attempt?.id) {
        throw new Error(
          'The server did not return an attempt ID.',
        );
      }

      navigate(
        `/student/attempts/${response.attempt.id}`,
        { state: { quizId } },
      );
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 h-5 w-20 animate-pulse rounded bg-[var(--surface-hover)]" />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <LoadingSkeleton type="hero" />
            <LoadingSkeleton type="hero" />
          </div>

          <LoadingSkeleton type="hero" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Quiz not available"
          description="The backend could not load this quiz."
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
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <EmptyState
          icon={<Layers3 size={18} />}
          title="Quiz not found"
          description="This quiz does not exist or is no longer published."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <button
        type="button"
        className={[
          'mb-6 inline-flex items-center gap-2',
          'text-sm font-medium text-[var(--text-muted)]',
          'transition-colors hover:text-emerald-600',
          'dark:hover:text-emerald-300',
        ].join(' ')}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={15} />
        Back to quizzes
      </button>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <section className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/[0.07] blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <CheckCircle2 size={12} />
                  {quiz.isPublished
                    ? 'Published quiz'
                    : 'Quiz'}
                </span>

                <span className="text-xs text-[var(--text-subtle)]">
                  Live quiz
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                {quiz.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                {quiz.description ||
                  'No quiz description was provided by the backend.'}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5">
                  <Clock3
                    size={15}
                    className="text-emerald-600 dark:text-emerald-300"
                  />

                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {durationMinutes} minutes
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5">
                  <Layers3
                    size={15}
                    className="text-emerald-600 dark:text-emerald-300"
                  />

                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {isQuestionsLoading
                      ? 'Loading questions…'
                      : isQuestionsError
                        ? 'Count unavailable'
                        : `${questionCount} questions`}
                  </span>
                </div>
              </div>

              {isQuestionsError && (
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-300"
                  onClick={() => refetchQuestions()}
                >
                  Retry loading question count
                </button>
              )}
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                Quiz overview
              </h2>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Review the quiz information before starting your attempt.
              </p>
            </div>

            <QuizMeta quiz={quiz} />
          </section>

          <section className="glass-panel mt-5 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/15 bg-sky-500/10 text-sky-600 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-300">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Before you start
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                  Starting this quiz creates a real attempt on the
                  server. Make sure you are ready before beginning.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-6">
          <section className="glass-panel overflow-hidden rounded-2xl">
            <div className="border-b border-[var(--border)] p-5 sm:p-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                Ready to begin?
              </span>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Start your attempt
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                You will have {durationMinutes} minutes to complete this
                quiz.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Clock3 size={16} />
                  </div>

                  <span className="text-sm text-[var(--text-muted)]">
                    Time limit
                  </span>
                </div>

                <strong className="text-sm font-semibold text-[var(--text-primary)]">
                  {durationMinutes} min
                </strong>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Layers3 size={16} />
                  </div>

                  <span className="text-sm text-[var(--text-muted)]">
                    Questions
                  </span>
                </div>

                <strong className="text-sm font-semibold text-[var(--text-primary)]">
                  {isQuestionsLoading
                    ? '…'
                    : isQuestionsError
                      ? '—'
                      : questionCount}
                </strong>
              </div>

              <button
                type="button"
                className={[
                  'mt-5 inline-flex min-h-12 w-full items-center',
                  'justify-center gap-2 rounded-xl',
                  'border border-emerald-500/20',
                  'bg-emerald-500 px-4 py-3',
                  'text-sm font-bold text-emerald-950',
                  'shadow-lg shadow-emerald-500/10',
                  'transition-all duration-200',
                  'hover:-translate-y-0.5 hover:bg-emerald-400',
                  'active:translate-y-0',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'disabled:hover:translate-y-0',
                ].join(' ')}
                onClick={handleStart}
                disabled={
                  startAttempt.isPending ||
                  isQuestionsLoading ||
                  isQuestionsError ||
                  questionCount === 0
                }
              >
                <PlayCircle size={18} />

                {startAttempt.isPending
                  ? 'Starting…'
                  : isQuestionsLoading
                    ? 'Loading questions…'
                    : isQuestionsError
                      ? 'Questions unavailable'
                      : questionCount === 0
                        ? 'No questions available'
                        : 'Start quiz'}
              </button>

              {startAttempt.isError && (
                <p
                  role="alert"
                  className="mt-3 text-sm text-red-500"
                >
                  {startAttempt.error?.response?.data?.message ||
                    startAttempt.error?.message ||
                    'Unable to start this quiz. Please try again.'}
                </p>
              )}

              <p className="mt-4 text-center text-[11px] leading-5 text-[var(--text-subtle)]">
                Your attempt is created and managed by the backend.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

