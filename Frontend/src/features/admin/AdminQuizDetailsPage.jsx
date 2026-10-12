import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useParams } from 'react-router-dom';

import {
  useAdminQuestionAnalyticsQuery,
  useAdminQuizAnalyticsQuery,
  useAdminQuizQuery,
} from './hooks';

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon size={18} />
        </div>

        <div className="min-w-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-8">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--surface-hover)]" />

        <div className="mt-3 h-9 w-full max-w-xl animate-pulse rounded-lg bg-[var(--surface-hover)]" />

        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--surface-soft)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
          />
        ))}
      </div>

      <div className="mt-6 h-96 animate-pulse rounded-3xl border border-[var(--border)] bg-[var(--surface)]" />
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
          Quiz Inspection
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Quiz inspection failed
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          The quiz analytics could not be loaded from the backend.
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

export function AdminQuizDetailsPage() {
  const { quizId } = useParams();

  const quiz = useAdminQuizQuery(quizId);
  const analytics = useAdminQuizAnalyticsQuery(quizId);
  const questions = useAdminQuestionAnalyticsQuery(quizId);

  if (
    quiz.isLoading ||
    analytics.isLoading ||
    questions.isLoading
  ) {
    return <LoadingState />;
  }

  if (
    quiz.isError ||
    analytics.isError ||
    questions.isError
  ) {
    return (
      <ErrorState
        onRetry={() => {
          quiz.refetch();
          analytics.refetch();
          questions.refetch();
        }}
      />
    );
  }

  const item = quiz.data?.quiz;
  const stats = analytics.data?.analytics ?? {};

  const questionAnalytics =
    questions.data?.analytics ?? [];

  const totalQuestions =
    questions.data?.totalQuestions ?? 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 border-b border-[var(--border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            Quiz Inspection
          </p>

          <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {item?.title}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            {item?.description || 'No description returned.'}
          </p>
        </div>

        {item?.isPublished !== undefined && (
          <span
            className={[
              'inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
              item.isPublished
                ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300'
                : 'border-amber-500/15 bg-amber-500/10 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300',
            ].join(' ')}
          >
            <span
              className={[
                'h-1.5 w-1.5 rounded-full',
                item.isPublished
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-amber-500 dark:bg-amber-400',
              ].join(' ')}
            />

            {item.isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {/* Analytics metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Attempts"
          value={stats.totalAttempts ?? 0}
          icon={ClipboardList}
        />

        <MetricCard
          label="Students"
          value={stats.totalStudents ?? 0}
          icon={Users}
        />

        <MetricCard
          label="Average score"
          value={stats.averageScore ?? 0}
          icon={BarChart3}
        />

        <MetricCard
          label="Completion rate"
          value={`${stats.completionRate ?? 0}%`}
          icon={CheckCircle2}
        />
      </div>

      {/* Question analytics */}
      <section className="glass-panel mt-6 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
              Question Analytics
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {totalQuestions}{' '}
              {totalQuestions === 1
                ? 'question'
                : 'questions'}
            </h2>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Accuracy and response data for each question.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
            <BookOpen size={18} />
          </div>
        </div>

        {questionAnalytics.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
            {/* Desktop table header */}
            <div className="hidden grid-cols-[minmax(0,1fr)_130px_150px] gap-4 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:grid">
              <span>Question</span>
              <span>Responses</span>
              <span>Accuracy</span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {questionAnalytics.map((question, index) => (
                <div
                  className="grid gap-4 px-4 py-4 transition-colors hover:bg-[var(--surface-hover)] sm:grid-cols-[minmax(0,1fr)_130px_150px] sm:items-center"
                  key={question.questionId}
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-muted)]">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">
                          {question.question}
                        </p>

                        <span className="mt-1 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pl-10 sm:pl-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:hidden">
                      Responses
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)] sm:mt-0">
                      {question.totalAnswers}{' '}
                      {question.totalAnswers === 1
                        ? 'answer'
                        : 'answers'}
                    </p>
                  </div>

                  <div className="pl-10 sm:pl-0">
                    <div className="flex items-center justify-between gap-3 sm:block">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:hidden">
                        Accuracy
                      </p>

                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300 sm:mt-0">
                        {question.accuracy}%
                      </p>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-400"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              Number(question.accuracy) || 0,
                              0,
                            ),
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] px-5 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-muted)]">
              <BookOpen size={19} />
            </div>

            <p className="mt-3 text-sm text-[var(--text-muted)]">
              No question analytics returned.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}