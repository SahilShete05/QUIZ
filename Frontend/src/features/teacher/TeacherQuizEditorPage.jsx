import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Save,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  ErrorState,
  LoadingSkeleton,
  PageIntro,
} from '../student/ui';

import {
  useCreateQuizMutation,
  useTeacherQuizQuery,
  useUpdateQuizMutation,
} from './hooks';

import { getApiErrorMessage } from '../../lib/api';

export function TeacherQuizEditorPage() {
  const { quizId } = useParams();

  const isEditing = Boolean(quizId);

  const navigate = useNavigate();

  const query = useTeacherQuizQuery(quizId);

  const create = useCreateQuizMutation();

  const update = useUpdateQuizMutation();

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationSeconds: 600,
  });

  useEffect(() => {
    if (query.data?.quiz) {
      const {
        title,
        description,
        durationSeconds,
      } = query.data.quiz;

      setForm({
        title: title || '',
        description: description || '',
        durationSeconds: durationSeconds || 600,
      });
    }
  }, [query.data]);

  if (isEditing && query.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LoadingSkeleton type="hero" />
      </div>
    );
  }

  if (isEditing && query.isError) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Could not load quiz"
          description="The quiz details could not be retrieved from the backend."
        />
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      durationSeconds: Number(form.durationSeconds),
    };

    try {
      const result = isEditing
        ? await update.mutateAsync({
            quizId,
            payload,
          })
        : await create.mutateAsync(payload);

      toast.success(
        isEditing ? 'Quiz updated.' : 'Quiz created.'
      );

      navigate(`/teacher/quizzes/${result.quiz.id}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'The quiz could not be saved.'
        )
      );
    }
  };

  const isSaving = create.isPending || update.isPending;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow={isEditing ? 'EDIT QUIZ' : 'CREATE QUIZ'}
        title={
          isEditing
            ? 'Refine your quiz.'
            : 'Create a new quiz.'
        }
        description="These fields map directly to the backend quiz schema."
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

      {/* Context header */}
      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-400">
              <BookOpen size={17} />
            </div>

            <h2 className="text-lg font-semibold text-slate-100">
              {isEditing ? 'Quiz details' : 'Quiz setup'}
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isEditing
              ? 'Update the quiz metadata below.'
              : 'Configure the quiz manually or generate a complete quiz using AI.'}
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => navigate('/teacher/ai-generator')}
            className={[
              'inline-flex h-11 items-center justify-center gap-2',
              'rounded-xl border border-violet-400/20',
              'bg-violet-400/10 px-4',
              'text-sm font-semibold text-violet-300',
              'transition-all duration-200',
              'hover:-translate-y-0.5',
              'hover:border-violet-300/35',
              'hover:bg-violet-400/15',
              'active:translate-y-0',
            ].join(' ')}
          >
            <Sparkles size={16} />
            Generate with AI
          </button>
        ) : null}
      </div>

      {/* Form */}
      <form
        className="glass-panel mt-6 overflow-hidden rounded-2xl"
        onSubmit={submit}
      >
        <div className="border-b border-white/[0.06] bg-white/[0.015] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <BookOpen size={14} className="text-emerald-400" />
            Quiz information
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="quiz-title"
              className="block text-sm font-medium text-slate-200"
            >
              Title
            </label>

            <input
              id="quiz-title"
              required
              minLength={3}
              maxLength={100}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Enter quiz title"
              className="input-base"
            />

            <p className="text-xs text-slate-600">
              Use a clear title that helps students understand the
              quiz topic.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="quiz-description"
              className="block text-sm font-medium text-slate-200"
            >
              Description
            </label>

            <textarea
              id="quiz-description"
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Describe what this quiz covers..."
              className="input-base min-h-32 resize-y"
            />

            <p className="text-xs text-slate-600">
              Give students a short overview of what they can expect.
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label
              htmlFor="quiz-duration"
              className="block text-sm font-medium text-slate-200"
            >
              Duration in seconds
            </label>

            <div className="relative max-w-sm">
              <Clock3
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="quiz-duration"
                required
                type="number"
                min="1"
                step="1"
                value={form.durationSeconds}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationSeconds: event.target.value,
                  }))
                }
                className="input-base pl-10"
              />
            </div>

            <p className="text-xs text-slate-600">
              Example: 600 seconds equals 10 minutes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] bg-white/[0.015] p-5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Link
            className="button button-ghost"
            to="/teacher/quizzes"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSaving}
          >
            <Save
              size={16}
              className={isSaving ? 'animate-pulse' : ''}
            />

            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Save changes'
                : 'Create quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}