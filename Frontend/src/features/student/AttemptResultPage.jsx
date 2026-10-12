import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  CircleSlash,
  Clock3,
  Percent,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';

import {
  useAIReviewAttemptMutation,
  useAttemptQuery,
  useQuizQuestionsQuery,
} from './hooks';

import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from './ui';

/* =========================================================
   Helpers
   ========================================================= */

const COMPLETED_STATUSES = ['SUBMITTED', 'AUTO_SUBMITTED'];

function formatStatus(status) {
  return String(status || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatDuration(seconds) {
  if (typeof seconds !== 'number') return '—';

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

function formatValue(value, suffix = '') {
  return value === null || value === undefined ? '—' : `${value}${suffix}`;
}

/*
  Backend shapes used here:
  - GET /attempts/:id  -> attempt.answers[]: { questionId, selectedOption,
    textResponse, isCorrect, pointsAwarded, aiExplanation, question }
    and, once the attempt is finished, attempt.correctAnswers[]:
    { questionId, correctAnswer } for EVERY quiz question (also unanswered).
  - GET /quizzes/:id/questions -> [{ points, question: { id, text } }]
  - POST /ai/review-attempt -> { reviews: [{ questionId, correctAnswer,
    explanation, ... }] }
  Correct answers come from the attempt itself. The AI review only adds
  explanations (and its own correctAnswer, which takes priority if present).
*/
function buildReviewItems(attempt, questions, aiRows) {
  const answers = Array.isArray(attempt?.answers) ? attempt.answers : [];
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  );
  const aiByQuestion = new Map(
    (aiRows || [])
      .filter((row) => row.questionId)
      .map((row) => [row.questionId, row]),
  );
  const correctByQuestion = new Map(
    (Array.isArray(attempt?.correctAnswers) ? attempt.correctAnswers : []).map(
      (item) => [item.questionId, item.correctAnswer],
    ),
  );

  // The review endpoint returns the question text but no id, so rows are
  // also matched by normalised question text.
  const normalize = (value) =>
    String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

  const aiByText = new Map(
    (aiRows || []).map((row) => [normalize(row.question), row]),
  );

  const toItem = (questionId, text, answer, index) => {
    const ai =
      aiByQuestion.get(questionId) ??
      aiByText.get(normalize(text || answer?.question?.text));

    let status = 'unanswered';
    if (answer) {
      if (answer.isCorrect === true) status = 'correct';
      else if (answer.isCorrect === false) status = 'incorrect';
      else status = 'ungraded';
    }

    return {
      key: questionId ?? index,
      text: text || answer?.question?.text || `Question ${index + 1}`,
      status,
      yourAnswer: answer?.selectedOption?.text ?? answer?.textResponse ?? null,
      correctAnswer:
        ai?.correctAnswer ?? correctByQuestion.get(questionId) ?? null,
      explanation: ai?.explanation ?? answer?.aiExplanation ?? null,
    };
  };

  if (questions.length > 0) {
    return questions.map((wrapper, index) =>
      toItem(
        wrapper?.question?.id,
        wrapper?.question?.text,
        answerByQuestion.get(wrapper?.question?.id),
        index,
      ),
    );
  }

  return answers.map((answer, index) =>
    toItem(answer.questionId, answer.question?.text, answer, index),
  );
}

/* =========================================================
   Presentational components
   ========================================================= */

function ResultStat({ icon: Icon, label, value }) {
  return (
    <div
      className={[
        'rounded-2xl border border-[var(--border)]',
        'bg-[var(--surface)] p-5',
        'shadow-[var(--shadow-soft)] backdrop-blur-md',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[var(--border-strong)]',
      ].join(' ')}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold capitalize text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

const BADGES = {
  correct: {
    label: 'Correct',
    styles:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  },
  incorrect: {
    label: 'Incorrect',
    styles:
      'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300',
  },
  unanswered: {
    label: 'Unanswered',
    styles:
      'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  },
  ungraded: {
    label: 'Not auto-graded',
    styles:
      'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)]',
  },
};

function ReviewItem({ item, index }) {
  const badge = BADGES[item.status];

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          Question {index + 1}
        </span>

        <span
          className={[
            'inline-flex rounded-full border px-2.5 py-1',
            'text-[10px] font-bold uppercase tracking-[0.12em]',
            badge.styles,
          ].join(' ')}
        >
          {badge.label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-primary)]">
        {item.text}
      </p>

      <dl className="mt-3 space-y-2 text-sm leading-6">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Your answer
          </dt>
          <dd className="text-[var(--text-secondary)]">
            {item.yourAnswer || 'No answer submitted'}
          </dd>
        </div>

        {item.correctAnswer && item.status !== 'correct' ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Correct answer
            </dt>
            <dd className="font-medium text-emerald-700 dark:text-emerald-300">
              {item.correctAnswer}
            </dd>
          </div>
        ) : null}

        {item.explanation ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Explanation
            </dt>
            <dd className="whitespace-pre-line text-[var(--text-secondary)]">
              {item.explanation}
            </dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

// Accepts the review list whether it is the body itself or nested in a
// common wrapper. Returns null if no list is found.
function extractReviewRows(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.review,
    payload?.reviews,
    payload?.data,
    payload?.data?.review,
    payload?.data?.reviews,
    payload?.result?.review,
    payload?.questions,
  ];

  return candidates.find(Array.isArray) ?? null;
}

function AIReviewPanel({ review, rows, attemptId }) {
  const errorMessage =
    review.error?.response?.data?.message ||
    review.error?.message ||
    'The AI review could not be generated.';

  const malformed = review.isSuccess && !rows;

  return (
    <section className="glass-panel mt-5 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
            AI review
          </p>
          <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
            Explanations for your mistakes
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            This can take a little while when you have several wrong answers.
          </p>
        </div>

        {!review.isSuccess ? (
          <button
            type="button"
            disabled={review.isPending}
            onClick={() => review.mutate(attemptId)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition-all duration-200 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={15} />
            {review.isPending ? 'Reviewing...' : 'Get AI review'}
          </button>
        ) : null}
      </div>

      {review.isPending ? (
        <div className="mt-5 space-y-3" aria-live="polite">
          <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--surface-hover)]" />
          <div className="h-4 w-full animate-pulse rounded bg-[var(--surface-hover)]" />
        </div>
      ) : null}

      {review.isError || malformed ? (
        <div
          role="alert"
          className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>
              {malformed
                ? 'The AI review came back in an unexpected format.'
                : errorMessage}{' '}
              Your score above is not affected.
            </span>
          </div>

          <button
            type="button"
            onClick={() => review.mutate(attemptId)}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          >
            <RotateCcw size={15} />
            Retry
          </button>
        </div>
      ) : null}

      {review.isSuccess && !malformed ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Done. Explanations are now shown in the answer review below.
        </p>
      ) : null}
    </section>
  );
}

/* =========================================================
   Page
   ========================================================= */

export function AttemptResultPage() {
  const { attemptId } = useParams();

  const { data, isLoading, isFetching, isError, refetch } =
    useAttemptQuery(attemptId);

  const attempt = data?.attempt;
  const isCompleted = COMPLETED_STATUSES.includes(attempt?.status);
  const hasDetails = Array.isArray(attempt?.answers);

  // Student-safe endpoint: used only for question text and max score.
  const { data: questionsData } = useQuizQuestionsQuery(
    isCompleted ? attempt?.quizId : undefined,
  );
  const questions = useMemo(
    () => questionsData?.questions || [],
    [questionsData],
  );

  const aiReview = useAIReviewAttemptMutation();
  const aiRows = extractReviewRows(aiReview.data);

  const reviewItems = useMemo(
    () => (isCompleted ? buildReviewItems(attempt, questions, aiRows) : []),
    [attempt, isCompleted, questions, aiRows],
  );

  // Cache can briefly hold a partial or pre-submit attempt; wait for fresh data.
  const waitingForFreshData =
    attempt && (!isCompleted || !hasDetails) && isFetching;

  if (isLoading || waitingForFreshData) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LoadingSkeleton type="hero" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Could not load result"
          description="The attempt result payload is unavailable."
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

  if (!attempt) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <EmptyState
          icon={<Trophy size={18} />}
          title="Result unavailable"
          description="No attempt data was returned for this result."
        />
      </main>
    );
  }

  if (!isCompleted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <EmptyState
          icon={<Clock3 size={18} />}
          title="Attempt not submitted yet"
          description="Results and answers are available after the attempt is submitted."
        />

        <div className="mt-4 text-center">
          <Link
            to={`/student/attempts/${attemptId}`}
            className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-300"
          >
            Return to the attempt
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- Stats (derived only from real data) ---------- */

  const answers = hasDetails ? attempt.answers : null;
  const score = typeof attempt.score === 'number' ? attempt.score : null;

  const totalQuestions = questions.length > 0 ? questions.length : null;
  const maxScore =
    questions.length > 0
      ? questions.reduce((sum, wrapper) => sum + (wrapper.points || 1), 0)
      : null;

  const percentage =
    score !== null && maxScore ? Math.round((score / maxScore) * 100) : null;

  const correctCount = answers
    ? answers.filter((a) => a.isCorrect === true).length
    : null;
  const incorrectCount = answers
    ? answers.filter((a) => a.isCorrect === false).length
    : null;
  const unansweredCount =
    answers && totalQuestions !== null
      ? Math.max(0, totalQuestions - answers.length)
      : null;

  const wasAutoSubmitted = attempt.status === 'AUTO_SUBMITTED';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Result hero */}
      <section className="glass-panel relative overflow-hidden rounded-2xl p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/[0.07] blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            <CheckCircle2 size={32} />
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            {wasAutoSubmitted ? 'Auto-submitted' : 'Attempt completed'}
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {attempt.quiz?.title}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
            {wasAutoSubmitted
              ? 'Time ran out, so your attempt was submitted automatically.'
              : 'Your attempt has been submitted successfully.'}
          </p>

          <div className="mx-auto mt-8 w-fit min-w-48 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] px-8 py-6 dark:border-emerald-400/15 dark:bg-emerald-400/[0.06]">
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-300">
              <Trophy size={17} />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                Final score
              </span>
            </div>

            <div className="mt-2 text-5xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-6xl">
              {formatValue(score)}
            </div>

            <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">
              {maxScore !== null ? `out of ${maxScore}` : 'score'}
            </p>
          </div>
        </div>
      </section>

      {/* Result statistics */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResultStat
          icon={Award}
          label="Status"
          value={formatStatus(attempt.status)}
        />
        <ResultStat
          icon={Percent}
          label="Percentage"
          value={formatValue(percentage, '%')}
        />
        <ResultStat
          icon={Clock3}
          label="Time taken"
          value={formatDuration(attempt.completionTimeSeconds)}
        />
        <ResultStat
          icon={CheckCircle2}
          label="Correct"
          value={formatValue(correctCount)}
        />
        <ResultStat
          icon={XCircle}
          label="Incorrect"
          value={formatValue(incorrectCount)}
        />
        <ResultStat
          icon={CircleSlash}
          label="Unanswered"
          value={formatValue(unansweredCount)}
        />
      </section>

      <AIReviewPanel
        review={aiReview}
        rows={aiRows}
        attemptId={attemptId}
      />

      {/* Answer review (post-submission only) */}
      <section className="glass-panel mt-5 rounded-2xl p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          Answer review
        </p>
        <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
          Your answers
        </h2>

        {reviewItems.length > 0 ? (
          <ol className="mt-4 space-y-3">
            {reviewItems.map((item, index) => (
              <ReviewItem key={item.key} item={item} index={index} />
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No answers were recorded for this attempt.
          </p>
        )}
      </section>

      <div className="mt-6 text-center">
        <Link
          to="/student/attempts"
          className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-300"
        >
          Back to my attempts
        </Link>
      </div>
    </main>
  );
}