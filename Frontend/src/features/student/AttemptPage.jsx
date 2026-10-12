import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Send,
} from 'lucide-react';

import {
  useAttemptQuery,
  useAutoSubmitAttemptMutation,
  useLogAttemptEvent,
  useQuizQuestionsQuery,
  useSubmitAnswerMutation,
  useSubmitAttemptMutation,
} from './hooks';

import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from './ui';

function getQuestionText(questionWrapper) {
  return questionWrapper?.question?.text || 'Question';
}

function formatRemaining(seconds) {
  if (seconds === null || seconds === undefined) {
    return '--:--';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
}

function TimerBadge({ remaining }) {
  const isCritical =
    remaining !== null &&
    remaining !== undefined &&
    remaining <= 60;

  const isWarning =
    remaining !== null &&
    remaining !== undefined &&
    remaining <= 300;

  const timerStyles = isCritical
    ? 'border-red-500/20 bg-red-500/10 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300'
    : isWarning
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300'
      : 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300';

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-xl border',
        'px-3.5 py-2.5 text-sm font-bold tabular-nums',
        timerStyles,
      ].join(' ')}
    >
      <Clock3 size={16} />
      <span>{formatRemaining(remaining)}</span>
    </div>
  );
}

function NavigationButton({ direction, disabled, onClick }) {
  const previous = direction === 'previous';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex min-h-11 items-center justify-center gap-2',
        'rounded-xl border border-[var(--border)]',
        'bg-[var(--surface-soft)] px-4 py-2.5',
        'text-sm font-semibold text-[var(--text-secondary)]',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[var(--border-strong)]',
        'hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
        'disabled:cursor-not-allowed disabled:opacity-35',
        'disabled:hover:translate-y-0',
      ].join(' ')}
    >
      {previous ? <ChevronLeft size={17} /> : null}
      {previous ? 'Previous' : 'Next'}
      {!previous ? <ChevronRight size={17} /> : null}
    </button>
  );
}

function SaveAnswerButton({ loading, onClick }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={[
        'inline-flex min-h-11 items-center justify-center gap-2',
        'rounded-xl border border-emerald-500/20',
        'bg-emerald-500 px-4 py-2.5',
        'text-sm font-bold text-emerald-950',
        'shadow-lg shadow-emerald-500/10',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:bg-emerald-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'disabled:hover:translate-y-0',
      ].join(' ')}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" />
          Saving...
        </>
      ) : (
        <>
          Save answer
          <Check size={16} />
        </>
      )}
    </button>
  );
}

const MAX_VIOLATIONS = 5;

const COMPLETED_STATUSES = ['SUBMITTED', 'AUTO_SUBMITTED'];

const EVENT_MESSAGES = {
  TAB_SWITCH: 'You switched away from the quiz tab.',
  COPY_ATTEMPT: 'Copying is disabled during the quiz.',
  PASTE_ATTEMPT: 'Pasting is disabled during the quiz.',
  RIGHT_CLICK_ATTEMPT: 'Right-click is disabled during the quiz.',
};

function ViolationBanner({ count, max, message, error }) {
  if (!message && !error) return null;

  const isFinal = count >= max;
  const remainingWarnings = Math.max(0, max - count);

  const styles = isFinal
    ? 'border-red-500/25 bg-red-500/10 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200'
    : count >= 3
      ? 'border-orange-500/25 bg-orange-500/10 text-orange-700 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-200'
      : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'mt-5 flex items-start gap-3 rounded-2xl border p-4',
        styles,
      ].join(' ')}
    >
      <AlertTriangle size={20} className="mt-0.5 shrink-0" />

      <div className="min-w-0 flex-1">
        {message ? (
          <>
            <p className="text-sm font-bold">
              {isFinal
                ? `Violation ${count} of ${max} - limit reached`
                : `Violation ${count} of ${max}`}
            </p>

            <p className="mt-1 text-sm leading-6">{message}</p>

            <p className="mt-1 text-xs font-medium opacity-80">
              {isFinal
                ? 'Your attempt is being submitted automatically.'
                : `${remainingWarnings} ${
                    remainingWarnings === 1 ? 'warning' : 'warnings'
                  } left before your attempt is auto-submitted.`}
            </p>
          </>
        ) : null}

        {error ? (
          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// Server answers 409 when the attempt was already finalized by another path
// (manual submit, timer, violation limit, cron).
const isAlreadyFinalized = (error) => error?.response?.status === 409;

export function AttemptPage() {
  const { attemptId } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const {
    data: attemptData,
    isLoading: attemptLoading,
    isError: attemptError,
  } = useAttemptQuery(attemptId);

  const attempt = attemptData?.attempt;

  const quizId = location.state?.quizId || attempt?.quizId;

  const {
    data: questionsData,
    isLoading: questionsLoading,
    isError: questionsError,
  } = useQuizQuestionsQuery(quizId);

  const questions = questionsData?.questions || [];

  const submitAnswer = useSubmitAnswerMutation();

  const submitAttempt = useSubmitAttemptMutation();

  const autoSubmitAttempt = useAutoSubmitAttemptMutation();
  const { mutate: autoSubmit } = autoSubmitAttempt;
  const { mutateAsync: submitAttemptAsync } = submitAttempt;
  const { mutateAsync: logAttemptEvent } = useLogAttemptEvent();

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [textValue, setTextValue] = useState('');

  const [deadline, setDeadline] = useState(null);

  const [now, setNow] = useState(Date.now());
  const autoSubmitStartedRef = useRef(false);
  const nextAutoSubmitRetryRef = useRef(0);

  // Shared lock: manual submit, timer auto-submit and violation auto-submit
  // can never run at the same time.
  const isFinalizingRef = useRef(false);
  const [submitError, setSubmitError] = useState('');

  // Anti-cheat state
  const [violationCount, setViolationCount] = useState(0);
  const [antiCheatNotice, setAntiCheatNotice] = useState('');
  const [antiCheatError, setAntiCheatError] = useState('');
  const violationCountRef = useRef(0);
  const submittingForViolationRef = useRef(false);

  const recordAttemptEvent = useCallback(
    async (eventType, metadata = {}) => {
      if (!attemptId || attempt?.status !== 'IN_PROGRESS') return;
      if (submittingForViolationRef.current || isFinalizingRef.current) return;

      try {
        const response = await logAttemptEvent({
          attemptId,
          eventType,
          ...(metadata && Object.keys(metadata).length > 0
            ? { metadata }
            : {}),
        });

        // Server count is the source of truth; max() keeps it monotonic if
        // two responses arrive out of order.
        const serverCount =
          response?.violationCount ?? response?.data?.violationCount;
        const nextCount =
          typeof serverCount === 'number'
            ? Math.max(serverCount, violationCountRef.current)
            : violationCountRef.current + 1;
        violationCountRef.current = nextCount;
        setViolationCount(nextCount);
        setAntiCheatError('');

        setAntiCheatNotice(
          EVENT_MESSAGES[eventType] || 'Suspicious activity detected.',
        );

        if (nextCount >= MAX_VIOLATIONS) {
          if (isFinalizingRef.current) return;

          submittingForViolationRef.current = true;
          isFinalizingRef.current = true;

          await submitAttemptAsync(attemptId);

          navigate(`/student/attempts/${attemptId}/result`, {
            replace: true,
          });
        }
      } catch (error) {
        if (isAlreadyFinalized(error)) {
          navigate(`/student/attempts/${attemptId}/result`, {
            replace: true,
          });
          return;
        }

        setAntiCheatError(
          error?.message ||
            'Unable to record the violation or submit the attempt.',
        );

        if (submittingForViolationRef.current) {
          submittingForViolationRef.current = false;
          isFinalizingRef.current = false;
        }
      }
    },
    [
      attemptId,
      attempt?.status,
      logAttemptEvent,
      submitAttemptAsync,
      navigate,
    ],
  );

  // The count lives on the server. After a refresh, restore it, and if the
  // limit was already reached, finish the attempt.
  useEffect(() => {
    const serverCount = attempt?.violationCount;

    if (typeof serverCount !== 'number') return;
    if (serverCount <= violationCountRef.current) return;

    violationCountRef.current = serverCount;
    setViolationCount(serverCount);

    if (
      serverCount >= MAX_VIOLATIONS &&
      attempt?.status === 'IN_PROGRESS' &&
      !isFinalizingRef.current
    ) {
      submittingForViolationRef.current = true;
      isFinalizingRef.current = true;

      submitAttemptAsync(attemptId)
        .then(() =>
          navigate(`/student/attempts/${attemptId}/result`, { replace: true }),
        )
        .catch((error) => {
          if (isAlreadyFinalized(error)) {
            navigate(`/student/attempts/${attemptId}/result`, {
              replace: true,
            });
            return;
          }

          submittingForViolationRef.current = false;
          isFinalizingRef.current = false;
          setAntiCheatError(
            'Could not auto-submit. Please press "Submit attempt".',
          );
        });
    }
  }, [
    attempt?.violationCount,
    attempt?.status,
    attemptId,
    submitAttemptAsync,
    navigate,
  ]);

  // Restore answers already saved on the server (after a refresh or reopen).
  // Only answers missing locally are added and local ones are never
  // overwritten, so a background refetch cannot wipe text being typed.
  useEffect(() => {
    if (!Array.isArray(attempt?.answers)) return;

    setAnswers((existing) => {
      let changed = false;
      const next = { ...existing };

      for (const answer of attempt.answers) {
        if (next[answer.questionId]) continue;

        next[answer.questionId] = {
          ...(answer.selectedOptionId
            ? { selectedOptionId: answer.selectedOptionId }
            : {}),
          ...(answer.textResponse != null
            ? { textResponse: answer.textResponse }
            : {}),
        };

        changed = true;
      }

      return changed ? next : existing;
    });
  }, [attempt?.answers]);

  // A finished attempt can never be continued or re-submitted from here.
  useEffect(() => {
    if (attempt && COMPLETED_STATUSES.includes(attempt.status)) {
      navigate(`/student/attempts/${attemptId}/result`, { replace: true });
    }
  }, [attempt, attemptId, navigate]);

  useEffect(() => {
    if (!attemptId || attempt?.status !== 'IN_PROGRESS') return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordAttemptEvent('TAB_SWITCH', { visibilityState: 'hidden' });
      }
    };

    const handleCopy = (event) => {
      event.preventDefault();
      recordAttemptEvent('COPY_ATTEMPT');
    };
    const handlePaste = (event) => {
      event.preventDefault();
      recordAttemptEvent('PASTE_ATTEMPT');
    };
    const handleContextMenu = (event) => {
      event.preventDefault();
      recordAttemptEvent('RIGHT_CLICK_ATTEMPT');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [attemptId, attempt?.status, recordAttemptEvent]);

  useEffect(() => {
    if (attempt?.startedAt && attempt?.quiz?.durationSeconds) {
      const end =
        new Date(attempt.startedAt).getTime() +
        attempt.quiz.durationSeconds * 1000;

      setDeadline(end);
    }
  }, [attempt]);

  useEffect(() => {
    const questionId = questions[currentIndex]?.question?.id;

    if (!questionId) {
      setTextValue('');
      return;
    }

    const saved = answers[questionId];

    setTextValue(saved?.textResponse || '');
  }, [currentIndex, questions, answers]);

  useEffect(() => {
    if (!deadline) return undefined;

    const timer = window.setInterval(() => {
      setNow(Date.now());

      if (
        Date.now() >= deadline &&
        !autoSubmitStartedRef.current &&
        !isFinalizingRef.current &&
        Date.now() >= nextAutoSubmitRetryRef.current
      ) {
        autoSubmitStartedRef.current = true;
        isFinalizingRef.current = true;

        autoSubmit(attemptId, {
          onSuccess: () =>
            navigate(`/student/attempts/${attemptId}/result`, {
              replace: true,
            }),
          onError: (error) => {
            if (isAlreadyFinalized(error)) {
              navigate(`/student/attempts/${attemptId}/result`, {
                replace: true,
              });
              return;
            }

            // Recover: allow a retry in 5s (interval is no longer cleared).
            autoSubmitStartedRef.current = false;
            isFinalizingRef.current = false;
            nextAutoSubmitRetryRef.current = Date.now() + 5000;
            setSubmitError('Time is up. Auto-submit failed, retrying...');
          },
        });
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attemptId, autoSubmit, deadline, navigate]);

  const remaining = useMemo(() => {
    if (!deadline) return null;

    return Math.max(0, Math.ceil((deadline - now) / 1000));
  }, [deadline, now]);

  const current = questions[currentIndex];

  const currentQuestion = current?.question;

  const total = questions.length;

  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const answeredCount = Object.keys(answers).length;

  const handleSaveAnswer = async (payload) => {
    if (!currentQuestion) return;

    try {
      await submitAnswer.mutateAsync({
        attemptId,
        payload: {
          questionId: currentQuestion.id,
          ...payload,
        },
      });

      setSubmitError('');

      setAnswers((existing) => ({
        ...existing,
        [currentQuestion.id]: payload,
      }));
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          'Could not save your answer. Please try again.',
      );
    }
  };

  const handleOptionSelect = async (optionId) => {
    await handleSaveAnswer({
      selectedOptionId: optionId,
    });
  };

  const handleTextSubmit = async () => {
    await handleSaveAnswer({
      textResponse: textValue,
    });
  };

  const handleSubmitAttempt = async () => {
    if (isFinalizingRef.current || submitAttempt.isPending) return;

    isFinalizingRef.current = true;
    setSubmitError('');

    try {
      await submitAttempt.mutateAsync(attemptId);

      navigate(`/student/attempts/${attemptId}/result`, {
        replace: true,
      });
    } catch (error) {
      isFinalizingRef.current = false;
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          'Could not submit. Please try again.',
      );
    }
  };

  if (attemptLoading || questionsLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LoadingSkeleton type="hero" />
      </main>
    );
  }

  if (attemptError || questionsError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Could not load attempt"
          description="The attempt or quiz question payload could not be loaded."
        />
      </main>
    );
  }

  if (!attempt || !currentQuestion) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <EmptyState
          title="No active question"
          description="The quiz attempt does not have a question list available."
        />
      </main>
    );
  }

  const isTextQuestion =
    currentQuestion.type === 'SHORT_ANSWER' ||
    currentQuestion.type === 'FILL_IN_BLANK';

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      {/* =====================================================
          TOP ATTEMPT BAR
          ===================================================== */}

      <header className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                Attempt in progress
              </p>
            </div>

            <h1 className="mt-1 truncate text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
              {attempt.quiz?.title}
            </h1>
          </div>

          <TimerBadge remaining={remaining} />
        </div>

        {/* Progress */}

        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--text-muted)]">
              Question {currentIndex + 1} of {total}
            </span>

            <span className="font-semibold tabular-nums text-[var(--text-secondary)]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* =====================================================
          VIOLATION WARNING BANNER
          ===================================================== */}

      <ViolationBanner
        count={violationCount}
        max={MAX_VIOLATIONS}
        message={antiCheatNotice}
        error={antiCheatError}
      />

      {/* =====================================================
          QUESTION AREA
          ===================================================== */}

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="glass-panel min-w-0 overflow-hidden rounded-2xl">
          {/* Question header */}

          <div className="border-b border-[var(--border)] px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
                Question {currentIndex + 1}
              </span>

              <span className="text-[var(--text-subtle)]">•</span>

              <span className="text-xs font-medium text-[var(--text-muted)]">
                {current.points ?? 1}{' '}
                {current.points === 1 ? 'point' : 'points'}
              </span>
            </div>

            <h2 className="mt-5 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-3xl">
              {getQuestionText(current)}
            </h2>
          </div>

          {/* Answer */}

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            {isTextQuestion ? (
              <div>
                <label
                  htmlFor="answer"
                  className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                >
                  Your answer
                </label>

                <textarea
                  id="answer"
                  className={[
                    'min-h-40 w-full resize-y rounded-2xl',
                    'border border-[var(--border-strong)]',
                    'bg-[var(--input-bg)] px-4 py-4',
                    'text-sm leading-6 text-[var(--text-primary)]',
                    'placeholder:text-[var(--text-subtle)]',
                    'outline-none transition-all duration-200',
                    'focus:border-emerald-500/30',
                    'focus:bg-[var(--input-bg-focus)]',
                    'focus:ring-4 focus:ring-emerald-500/10',
                  ].join(' ')}
                  value={textValue}
                  onChange={(event) => setTextValue(event.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                />

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <NavigationButton
                    direction="previous"
                    disabled={currentIndex === 0}
                    onClick={() =>
                      setCurrentIndex((index) => Math.max(index - 1, 0))
                    }
                  />

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <SaveAnswerButton
                      loading={submitAnswer.isPending}
                      onClick={handleTextSubmit}
                    />

                    <NavigationButton
                      direction="next"
                      disabled={currentIndex >= total - 1}
                      onClick={() =>
                        setCurrentIndex((index) =>
                          Math.min(index + 1, total - 1),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => {
                    const selected =
                      answers[currentQuestion.id]?.selectedOptionId ===
                      option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={submitAnswer.isPending}
                        onClick={() => handleOptionSelect(option.id)}
                        className={[
                          'group flex w-full items-center gap-3',
                          'rounded-2xl border p-3.5 text-left',
                          'transition-all duration-200',
                          selected
                            ? 'border-emerald-500/30 bg-emerald-500/10 shadow-sm shadow-emerald-500/5 dark:border-emerald-400/30 dark:bg-emerald-400/[0.08]'
                            : 'border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
                          'disabled:cursor-not-allowed disabled:opacity-60',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex h-10 w-10 shrink-0 items-center justify-center',
                            'rounded-xl border text-sm font-bold',
                            'transition-colors',
                            selected
                              ? 'border-emerald-500/20 bg-emerald-500 text-emerald-950 dark:border-emerald-400/25 dark:bg-emerald-400'
                              : 'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]',
                          ].join(' ')}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>

                        <span
                          className={[
                            'min-w-0 flex-1 text-sm leading-6',
                            selected
                              ? 'font-semibold text-emerald-700 dark:text-emerald-100'
                              : 'text-[var(--text-secondary)]',
                          ].join(' ')}
                        >
                          {option.text}
                        </span>

                        {selected && (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
                            <Check size={15} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <NavigationButton
                    direction="previous"
                    disabled={currentIndex === 0}
                    onClick={() =>
                      setCurrentIndex((index) => Math.max(index - 1, 0))
                    }
                  />

                  <NavigationButton
                    direction="next"
                    disabled={currentIndex >= total - 1}
                    onClick={() =>
                      setCurrentIndex((index) =>
                        Math.min(index + 1, total - 1),
                      )
                    }
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* =================================================
            PROGRESS SIDEBAR
            ================================================= */}

        <aside className="h-fit lg:sticky lg:top-6">
          <section className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                  Progress
                </p>

                <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  Your attempt
                </h2>
              </div>

              <div className="text-right">
                <strong className="block text-xl font-bold text-[var(--text-primary)]">
                  {answeredCount}
                </strong>

                <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-subtle)]">
                  answered
                </span>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${
                    total > 0 ? (answeredCount / total) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
              {answeredCount} of {total} questions answered.
            </p>

            {/* Violations counter */}

            <p className="mt-2 text-xs font-medium leading-5 text-[var(--text-muted)]">
              Violations: {violationCount} / {MAX_VIOLATIONS}
            </p>

            {/* Question indicators */}

            <div className="mt-5 border-t border-[var(--border)] pt-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                Questions
              </p>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const questionId = question?.question?.id;

                  const answered = questionId && answers[questionId];

                  const active = index === currentIndex;

                  return (
                    <button
                      key={questionId || index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={[
                        'flex h-9 items-center justify-center rounded-lg',
                        'border text-xs font-bold',
                        'transition-all duration-200',
                        active
                          ? 'border-emerald-500/30 bg-emerald-500 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400'
                          : answered
                            ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300'
                            : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
                      ].join(' ')}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* =====================================================
          SUBMIT FOOTER
          ===================================================== */}

      <footer className="glass-panel mt-5 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Ready to finish?
            </p>

            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Your answers are saved as you progress.
            </p>

            {submitError ? (
              <p
                role="alert"
                className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-300"
              >
                {submitError}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            disabled={submitAttempt.isPending || autoSubmitAttempt.isPending}
            onClick={handleSubmitAttempt}
            className={[
              'inline-flex min-h-11 items-center justify-center gap-2',
              'rounded-xl border border-emerald-500/20',
              'bg-emerald-500 px-5 py-2.5',
              'text-sm font-bold text-emerald-950',
              'shadow-lg shadow-emerald-500/10',
              'transition-all duration-200',
              'hover:-translate-y-0.5 hover:bg-emerald-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'disabled:hover:translate-y-0',
            ].join(' ')}
          >
            {submitAttempt.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" />
                Submitting...
              </>
            ) : (
              <>
                Submit attempt
                <Send size={15} />
              </>
            )}
          </button>
        </div>
      </footer>
    </main>
  );
}