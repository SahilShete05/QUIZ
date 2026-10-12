
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Brain,
  BookOpen,
  Hash,
  Gauge,
} from 'lucide-react';

import { useGenerateAIQuizMutation } from './hooks';

const initialForm = {
  title: '',
  topic: '',
  difficulty: 'MEDIUM',
  questionCount: 10,
};

const difficultyOptions = [
  {
    value: 'EASY',
    label: 'Easy',
    description: 'Basic concepts',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Balanced difficulty',
  },
  {
    value: 'HARD',
    label: 'Hard',
    description: 'Advanced concepts',
  },
];

const inputBase =
  'h-12 w-full rounded-xl border bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-[var(--text-secondary)]/70 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60';

const fieldLabel =
  'block text-sm font-medium text-[var(--text-primary)]';

const helperText =
  'text-xs leading-5 text-[var(--text-secondary)]';

export function TeacherAIGeneratorPage() {
  const navigate = useNavigate();
  const generateAIQuizMutation = useGenerateAIQuizMutation();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    const title = form.title.trim();
    const topic = form.topic.trim();
    const questionCount = Number(form.questionCount);

    if (title.length < 3) {
      nextErrors.title = 'Title must be at least 3 characters.';
    } else if (title.length > 100) {
      nextErrors.title = 'Title cannot exceed 100 characters.';
    }

    if (topic.length < 2) {
      nextErrors.topic = 'Topic must be at least 2 characters.';
    } else if (topic.length > 100) {
      nextErrors.topic = 'Topic cannot exceed 100 characters.';
    }

    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 20
    ) {
      nextErrors.questionCount =
        'Question count must be between 1 and 20.';
    }

    if (!['EASY', 'MEDIUM', 'HARD'].includes(form.difficulty)) {
      nextErrors.difficulty = 'Select a valid difficulty.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data = await generateAIQuizMutation.mutateAsync({
        title: form.title.trim(),
        topic: form.topic.trim(),
        difficulty: form.difficulty,
        questionCount: Number(form.questionCount),
      });

      if (data?.quiz?.id) {
        navigate(`/teacher/quizzes/${data.quiz.id}`);
      }
    } catch (error) {
      // Error is handled by the mutation state.
      console.error('AI quiz generation failed:', error);
    }
  };

  const isGenerating = generateAIQuizMutation.isPending;

  const mutationError =
    generateAIQuizMutation.error?.response?.data?.message ||
    'Unable to generate the AI quiz. Please try again.';

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI POWERED
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                AI Quiz Generator
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                Create a multiple-choice quiz in seconds. Choose a topic,
                set the difficulty, and let AI do the first draft.
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)] sm:inline-flex">
              <Hash className="h-4 w-4 text-emerald-500" />
              1–20 questions
            </div>
          </div>
        </motion.header>

        {/* Main form card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
        >
          {/* Card heading */}
          <div className="flex items-start gap-3 border-b border-[var(--border)] bg-emerald-400/[0.045] px-5 py-5 sm:px-7">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
              <Brain className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                Create your quiz
              </h2>

              <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                Generated quizzes are saved as drafts so you can review
                them before publishing.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7">
            <div className="space-y-6">
              {/* Quiz title */}
              <div className="space-y-2">
                <label htmlFor="ai-quiz-title" className={fieldLabel}>
                  Quiz title
                </label>

                <div className="relative">
                  <BookOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

                  <input
                    id="ai-quiz-title"
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      updateField('title', event.target.value)
                    }
                    placeholder="e.g. JavaScript Fundamentals"
                    disabled={isGenerating}
                    maxLength={100}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby="ai-title-help"
                    className={[
                      inputBase,
                      'pl-10 pr-4',
                      errors.title
                        ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/10'
                        : '',
                    ].join(' ')}
                  />
                </div>

                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p
                    id="ai-title-help"
                    className={
                      errors.title
                        ? 'text-sm text-red-500'
                        : helperText
                    }
                  >
                    {errors.title ||
                      'Give your quiz a clear, descriptive title.'}
                  </p>

                  <span className="shrink-0 text-xs tabular-nums text-[var(--text-secondary)]">
                    {form.title.length}/100
                  </span>
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label htmlFor="ai-quiz-topic" className={fieldLabel}>
                  Topic
                </label>

                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

                  <input
                    id="ai-quiz-topic"
                    type="text"
                    value={form.topic}
                    onChange={(event) =>
                      updateField('topic', event.target.value)
                    }
                    placeholder="e.g. JavaScript, Operating Systems, DBMS"
                    disabled={isGenerating}
                    maxLength={100}
                    aria-invalid={Boolean(errors.topic)}
                    aria-describedby="ai-topic-help"
                    className={[
                      inputBase,
                      'pl-10 pr-4',
                      errors.topic
                        ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/10'
                        : '',
                    ].join(' ')}
                  />
                </div>

                <p
                  id="ai-topic-help"
                  className={
                    errors.topic
                      ? 'text-sm text-red-500'
                      : helperText
                  }
                >
                  {errors.topic ||
                    'AI will generate questions specifically around this topic.'}
                </p>
              </div>

              {/* Difficulty */}
              <fieldset className="space-y-3">
                <legend className={fieldLabel}>Difficulty</legend>

                <p className={helperText}>
                  Choose the challenge level for your questions.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {difficultyOptions.map((option) => {
                    const selected = form.difficulty === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isGenerating}
                        aria-pressed={selected}
                        onClick={() =>
                          updateField('difficulty', option.value)
                        }
                        className={[
                          'rounded-xl border p-4 text-left transition duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60',
                          'disabled:cursor-not-allowed disabled:opacity-60',
                          selected
                            ? 'border-emerald-400/60 bg-emerald-400/10 ring-1 ring-emerald-400/20'
                            : 'border-[var(--border)] bg-[var(--surface)] hover:border-emerald-400/40 hover:bg-emerald-400/[0.035]',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={[
                              'text-sm font-semibold',
                              selected
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-[var(--text-primary)]',
                            ].join(' ')}
                          >
                            {option.label}
                          </span>

                          {selected ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                          ) : (
                            <span className="h-5 w-5 shrink-0 rounded-full border border-[var(--border)]" />
                          )}
                        </div>

                        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {errors.difficulty ? (
                  <p className="text-sm text-red-500">
                    {errors.difficulty}
                  </p>
                ) : null}
              </fieldset>

              {/* Number of questions */}
              <div className="space-y-2">
                <label
                  htmlFor="ai-question-count"
                  className={fieldLabel}
                >
                  Number of questions
                </label>

                <div className="relative max-w-xs">
                  <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />

                  <input
                    id="ai-question-count"
                    type="number"
                    min="1"
                    max="20"
                    step="1"
                    value={form.questionCount}
                    onChange={(event) =>
                      updateField('questionCount', event.target.value)
                    }
                    disabled={isGenerating}
                    aria-invalid={Boolean(errors.questionCount)}
                    aria-describedby="ai-count-help"
                    className={[
                      inputBase,
                      'pl-10 pr-4',
                      errors.questionCount
                        ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/10'
                        : '',
                    ].join(' ')}
                  />
                </div>

                <p
                  id="ai-count-help"
                  className={
                    errors.questionCount
                      ? 'text-sm text-red-500'
                      : helperText
                  }
                >
                  {errors.questionCount ||
                    'Choose between 1 and 20 questions.'}
                </p>
              </div>

              {/* Generation summary */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
                    <Gauge className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Generation summary
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Review your selections
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Topic
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">
                      {form.topic.trim() || 'Not selected'}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Difficulty
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      {difficultyOptions.find(
                        (option) => option.value === form.difficulty
                      )?.label || form.difficulty}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Questions
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      {form.questionCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generation error */}
              {generateAIQuizMutation.isError ? (
                <div
                  role="alert"
                  className="flex gap-3 rounded-xl border border-red-400/25 bg-red-400/[0.06] p-4"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-500">
                      Quiz generation failed
                    </p>

                    <p className="mt-1 break-words text-sm leading-6 text-[var(--text-secondary)]">
                      {mutationError}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Submit */}
              <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className={helperText}>
                  Your AI-generated quiz will be saved as a draft for review.
                </p>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className={[
                    'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 py-3',
                    'bg-emerald-400 text-sm font-semibold text-slate-950',
                    'shadow-sm transition duration-200',
                    'hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-[var(--surface)]',
                    'active:translate-y-0',
                    'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
                    'sm:w-auto',
                  ].join(' ')}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.section>

        {/* Feature cards */}
        <section
          aria-label="AI quiz generator features"
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              icon: Sparkles,
              title: 'AI generated',
              text: 'Questions and answer options are generated automatically.',
            },
            {
              icon: BookOpen,
              title: 'Review first',
              text: 'Review and edit the generated quiz before publishing.',
            },
            {
              icon: Brain,
              title: 'Three difficulty levels',
              text: 'Choose easy, medium, or hard for your quiz.',
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: 0.08 + index * 0.04,
                }}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-200 hover:border-emerald-400/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
