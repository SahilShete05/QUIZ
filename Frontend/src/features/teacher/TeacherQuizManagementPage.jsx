import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  EmptyState,
  ErrorState,
  PageIntro,
  SectionTitle,
  LoadingSkeleton,
} from '../student/ui';

import {
  useAddAIQuestionsMutation,
  useCreateQuestionMutation,
  useLinkQuestionMutation,
  useQuestionAnalyticsQuery,
  useQuizAnalyticsQuery,
  useTeacherQuestionsQuery,
  useTeacherQuizQuery,
  useUnlinkQuestionMutation,
  useUpdateQuestionMutation,
} from './hooks';

import { AttemptIntegritySection } from './AttemptIntegritySection';

import { getApiErrorMessage } from '../../lib/api';

const emptyForm = {
  text: '',
  type: 'MCQ',
  difficulty: 'EASY',
  answerKey: '',
  options: [
    {
      text: '',
      isCorrect: false,
    },
    {
      text: '',
      isCorrect: false,
    },
  ],
};

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[var(--text-primary)]"
    >
      {children}
    </label>
  );
}

function QuestionForm({
  quizId,
  question,
  nextOrder,
  onDone,
}) {
  const isEditing = Boolean(question);

  const create = useCreateQuestionMutation();
  const update = useUpdateQuestionMutation();
  const link = useLinkQuestionMutation();

  const [form, setForm] = useState(() =>
    question
      ? {
          text: question.question.text,
          type: question.question.type,
          difficulty:
            question.question.difficulty || 'EASY',
          answerKey:
            question.question.answerKey || '',
          options:
            question.question.options?.map(
              ({ text, isCorrect }) => ({
                text,
                isCorrect,
              })
            ) || [],
        }
      : emptyForm
  );

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateOption = (index, patch) => {
    set(
      'options',
      form.options.map((option, item) =>
        item === index
          ? {
              ...option,
              ...patch,
            }
          : option
      )
    );
  };

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      options: ['MCQ', 'TRUE_FALSE'].includes(form.type)
        ? form.options.filter((option) => option.text.trim())
        : undefined,
    };

    try {
      let result;

      if (isEditing) {
        result = await update.mutateAsync({
          questionId: question.question.id,
          quizId,
          payload,
        });
      } else {
        result = await create.mutateAsync(payload);

        await link.mutateAsync({
          quizId,
          questionId: result.question.id,
          order: nextOrder,
          points: 1,
        });
      }

      toast.success(
        isEditing
          ? 'Question updated.'
          : 'Question added.'
      );

      onDone();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          getApiErrorMessage(
            error,
            'The question could not be saved.'
          )
      );
    }
  };

  const isSaving =
    create.isPending ||
    update.isPending ||
    link.isPending;

  const isOptionQuestion = ['MCQ', 'TRUE_FALSE'].includes(
    form.type
  );

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
            {isEditing ? 'EDIT QUESTION' : 'NEW QUESTION'}
          </p>

          <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            {isEditing
              ? 'Update question'
              : 'Add a question'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-slate-200"
          aria-label="Close question form"
        >
          <X size={16} />
        </button>
      </div>

      <form
        className="space-y-6 p-5 sm:p-6"
        onSubmit={submit}
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="question-text">
            Question text
          </FieldLabel>

          <textarea
            id="question-text"
            required
            minLength={3}
            rows={5}
            value={form.text}
            onChange={(event) =>
              set('text', event.target.value)
            }
            placeholder="Write the question..."
            className="input-base min-h-32 resize-y"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="question-type">
              Type
            </FieldLabel>

            <select
              id="question-type"
              value={form.type}
              onChange={(event) =>
                set('type', event.target.value)
              }
              className="input-base"
            >
              <option value="MCQ">MCQ</option>
              <option value="TRUE_FALSE">
                TRUE_FALSE
              </option>
              <option value="FILL_IN_BLANK">
                FILL_IN_BLANK
              </option>
              <option value="SHORT_ANSWER">
                SHORT_ANSWER
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="question-difficulty">
              Difficulty
            </FieldLabel>

            <select
              id="question-difficulty"
              value={form.difficulty}
              onChange={(event) =>
                set('difficulty', event.target.value)
              }
              className="input-base"
            >
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
        </div>

        {isOptionQuestion ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Options
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Mark the correct answer for each option.
                </p>
              </div>

              <button
                type="button"
                className="button button-ghost self-start"
                onClick={() =>
                  set('options', [
                    ...form.options,
                    {
                      text: '',
                      isCorrect: false,
                    },
                  ])
                }
              >
                <Plus size={14} />
                Add option
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {form.options.map((option, index) => (
                <div
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:border-emerald-400/30 sm:flex-row sm:items-center"
                  key={index}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-xs font-semibold text-[var(--text-secondary)]">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <input
                      required
                      value={option.text}
                      placeholder={`Option ${index + 1}`}
                      onChange={(event) =>
                        updateOption(index, {
                          text: event.target.value,
                        })
                      }
                      className="input-base"
                    />
                  </div>

                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 px-1 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(event) =>
                        updateOption(index, {
                          isCorrect:
                            event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-emerald-400"
                    />

                    <span
                      className={
                        option.isCorrect
                          ? 'font-medium text-emerald-400'
                          : ''
                      }
                    >
                      Correct
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <FieldLabel htmlFor="answer-key">
              Answer key
            </FieldLabel>

            <input
              id="answer-key"
              required
              value={form.answerKey}
              onChange={(event) =>
                set(
                  'answerKey',
                  event.target.value
                )
              }
              placeholder="Expected answer"
              className="input-base"
            />

            <p className="text-xs text-slate-600">
              Student answers are graded automatically. Capital letters and
              extra spaces are ignored. Separate several accepted answers with
              |, for example: Paris | Paris France
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="button button-ghost"
            onClick={onDone}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSaving}
          >
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Save question'
                : 'Add question'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AIQuestionsForm({
  quizId,
  onDone,
}) {
  const addAI = useAddAIQuestionsMutation();

  const [form, setForm] = useState({
    topic: '',
    difficulty: 'MEDIUM',
    questionCount: 5,
  });

  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();

    setError('');

    const topic = form.topic.trim();

    const questionCount = Number(
      form.questionCount
    );

    if (topic.length < 2) {
      setError(
        'Topic must be at least 2 characters.'
      );
      return;
    }

    if (topic.length > 100) {
      setError(
        'Topic cannot exceed 100 characters.'
      );
      return;
    }

    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 20
    ) {
      setError(
        'Question count must be between 1 and 20.'
      );
      return;
    }

    try {
      const result = await addAI.mutateAsync({
        quizId,
        topic,
        difficulty: form.difficulty,
        questionCount,
      });

      toast.success(
        result?.message ||
          'AI questions added successfully.'
      );

      onDone();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'AI questions could not be generated.'
      );

      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-violet-400/30 bg-[var(--surface)] shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-violet-400/10 px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
              <Sparkles size={16} />
            </div>

            <h3 className="text-base font-semibold text-slate-100">
              Generate questions with AI
            </h3>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Gemini will generate MCQ questions and add them
            directly to this quiz.
          </p>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
          aria-label="Close AI generator"
        >
          <X size={16} />
        </button>
      </div>

      <form
        className="space-y-5 p-5 sm:p-6"
        onSubmit={submit}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="ai-topic">
              Topic
            </FieldLabel>

            <input
              id="ai-topic"
              required
              minLength={2}
              maxLength={100}
              value={form.topic}
              placeholder="e.g. JavaScript"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  topic: event.target.value,
                }))
              }
              className="input-base"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="ai-difficulty">
              Difficulty
            </FieldLabel>

            <select
              id="ai-difficulty"
              value={form.difficulty}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  difficulty:
                    event.target.value,
                }))
              }
              className="input-base"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div className="max-w-sm space-y-2">
          <FieldLabel htmlFor="ai-question-count">
            Number of questions
          </FieldLabel>

          <input
            id="ai-question-count"
            required
            type="number"
            min="1"
            max="20"
            step="1"
            value={form.questionCount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                questionCount:
                  event.target.value,
              }))
            }
            className="input-base"
          />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3.5 py-3 text-sm text-red-300">
            <CircleAlert
              size={16}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-violet-400/10 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="button button-ghost"
            onClick={onDone}
            disabled={addAI.isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-400/15 px-4 py-2.5 text-sm font-semibold text-violet-200 shadow-sm transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={addAI.isPending}
          >
            <Sparkles size={15} />

            {addAI.isPending
              ? 'Generating...'
              : 'Generate questions'}
          </button>
        </div>
      </form>
    </div>
  );
}

function QuestionManagementRow({
  item,
  onEdit,
  onRemove,
}) {
  const question = item.question;

  return (
    <div className="group flex flex-col gap-4 border-b border-[var(--border)] py-5 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {question.type}
          </span>

          <span className="text-xs text-slate-600">
            ·
          </span>

          <span className="text-xs font-medium text-slate-500">
            {item.points}{' '}
            {item.points === 1 ? 'point' : 'points'}
          </span>
        </div>

        <strong className="block max-w-3xl text-sm font-semibold leading-6 text-[var(--text-primary)]">
          {question.text}
        </strong>

        <span className="mt-1.5 block text-xs text-slate-500">
          {question.options?.length
            ? `${question.options.length} options`
            : question.answerKey
              ? 'Answer key configured'
              : 'Open response'}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className="button button-ghost"
          type="button"
          onClick={onEdit}
        >
          Edit
        </button>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400 transition hover:border-red-400/20 hover:bg-red-400/10"
          type="button"
          aria-label="Remove question"
          onClick={onRemove}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function MetricList({ analyticsData }) {
  const metrics = [
    {
      label: 'Attempts',
      value: analyticsData.totalAttempts,
    },
    {
      label: 'Students',
      value: analyticsData.totalStudents,
    },
    {
      label: 'Average score',
      value: analyticsData.averageScore,
    },
    {
      label: 'Pass rate',
      value: `${analyticsData.passRate}%`,
    },
    {
      label: 'Completion rate',
      value: `${analyticsData.completionRate}%`,
    },
  ];

  return (
    <div className="mt-5 divide-y divide-white/[0.06]">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <span className="text-sm text-slate-400">
            {metric.label}
          </span>

          <strong className="text-xl font-semibold tracking-tight text-slate-100">
            {metric.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

function QuestionPerformanceRow({ item }) {
  return (
    <div className="border-b border-white/[0.06] py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <strong className="block text-sm font-medium leading-6 text-slate-200">
            {item.question}
          </strong>

          <span className="mt-1 block text-xs text-slate-500">
            {item.totalAnswers} answers ·{' '}
            {item.accuracy}% accuracy
          </span>
        </div>

        <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {item.difficulty}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-500"
          style={{
            width: `${Math.min(
              Math.max(Number(item.accuracy) || 0,
              0),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

export function TeacherQuizManagementPage() {
  const { quizId } = useParams();

  const quiz = useTeacherQuizQuery(quizId);

  const questions =
    useTeacherQuestionsQuery(quizId);

  const analytics =
    useQuizAnalyticsQuery(quizId);

  const questionAnalytics =
    useQuestionAnalyticsQuery(quizId);

  const unlink =
    useUnlinkQuestionMutation();

  const [showForm, setShowForm] =
    useState(false);

  const [showAIForm, setShowAIForm] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  if (
    quiz.isLoading ||
    questions.isLoading
  ) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LoadingSkeleton type="hero" />

        <div className="mt-5">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (
    quiz.isError ||
    questions.isError
  ) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState title="Could not load quiz management" />
      </div>
    );
  }

  const data = quiz.data?.quiz;

  const links =
    questions.data?.questions || [];

  const remove = async (
    questionId
  ) => {
    if (
      !window.confirm(
        'Remove this question from the quiz?'
      )
    ) {
      return;
    }

    try {
      await unlink.mutateAsync({
        quizId,
        questionId,
      });

      toast.success(
        'Question removed from quiz.'
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Question could not be removed.'
        )
      );
    }
  };

  const edit = (item) => {
    setEditing(item);
    setShowAIForm(false);
    setShowForm(true);
  };

  const analyticsData =
    analytics.data?.analytics;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="QUIZ MANAGEMENT"
        title={data.title}
        description={
          data.description ||
          'Manage questions, publishing, and real performance data.'
        }
        action={
          <Link
            className="button button-ghost"
            to="/teacher/quizzes"
          >
            <ArrowLeft size={15} />
            Back to quizzes
          </Link>
        }
      />

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        {/* Questions */}
        <section className="glass-panel overflow-hidden rounded-2xl p-5 sm:p-6">
          <SectionTitle
            title="Questions"
            description={`${links.length} questions linked to this quiz.`}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(false);
                    setShowAIForm(
                      (current) => !current
                    );
                  }}
                >
                  <Sparkles size={15} />
                  Add with AI
                </button>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setEditing(null);
                    setShowAIForm(false);
                    setShowForm(true);
                  }}
                >
                  <Plus size={15} />
                  Add question
                </button>
              </div>
            }
          />

          {showAIForm ? (
            <AIQuestionsForm
              quizId={quizId}
              onDone={() =>
                setShowAIForm(false)
              }
            />
          ) : null}

          {showForm ? (
            <QuestionForm
              quizId={quizId}
              question={editing}
              nextOrder={links.length + 1}
              onDone={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          ) : null}

          <div className="mt-5">
            {links.length ? (
              links.map((item) => (
                <QuestionManagementRow
                  key={item.id}
                  item={item}
                  onEdit={() => edit(item)}
                  onRemove={() =>
                    remove(item.questionId)
                  }
                />
              ))
            ) : (
              <EmptyState
                title="No questions yet"
                description="Add a question before publishing this quiz."
              />
            )}
          </div>
        </section>

        {/* Analytics */}
        <aside className="space-y-5">
          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <SectionTitle
              title="Analytics"
              description="Real submitted and auto-submitted attempt data."
            />

            {analytics.isLoading ? (
              <div className="mt-5">
                <LoadingSkeleton />
              </div>
            ) : analyticsData ? (
              <MetricList
                analyticsData={analyticsData}
              />
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="No analytics yet"
                  description="Analytics will appear after students submit attempts."
                />
              </div>
            )}
          </section>

          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <SectionTitle
              title="Question performance"
              description="Accuracy based on submitted answers."
            />

            <div className="mt-4">
              {questionAnalytics.data?.analytics
                ?.length ? (
                questionAnalytics.data.analytics.map(
                  (item) => (
                    <QuestionPerformanceRow
                      key={item.questionId}
                      item={item}
                    />
                  )
                )
              ) : (
                <EmptyState
                  title="No question data yet"
                  description="Question analytics will appear after answers are submitted."
                />
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-5">
        <AttemptIntegritySection quizId={quizId} />
      </div>
    </div>
  );
}