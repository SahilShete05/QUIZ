import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { usePublishedQuizzesQuery } from './hooks';
import {
  EmptyState,
  ErrorState,
  PageIntro,
  QuizCard,
  SkeletonGrid,
} from './ui';

export function QuizzesPage() {
  const [search, setSearch] = useState('');

  const filters = useMemo(
    () => ({ search, page: 1, limit: 12 }),
    [search]
  );

  const { data, isLoading, isError, refetch } =
    usePublishedQuizzesQuery(filters);

  const quizzes = data?.quizzes || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="EXPLORE QUIZZES"
        title="Published quizzes."
        description="Browse the real published quiz list from the backend."
      />

      {/* Search */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xl">
          <Search
            size={17}
            strokeWidth={2}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search published quizzes"
            aria-label="Search published quizzes"
            className={[
              'h-12 w-full rounded-2xl border border-white/[0.08]',
              'bg-white/[0.035] pl-11 pr-4 text-sm text-slate-100',
              'placeholder:text-slate-500',
              'outline-none backdrop-blur-md',
              'transition-all duration-200',
              'focus:border-emerald-400/30',
              'focus:bg-white/[0.05]',
              'focus:ring-4 focus:ring-emerald-400/10',
            ].join(' ')}
          />
        </div>

        <div className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 text-xs font-medium text-slate-400 sm:self-auto">
          <SlidersHorizontal size={14} />
          <span>{isLoading ? 'Loading' : `${quizzes.length} quizzes`}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-7">
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : isError ? (
          <ErrorState
            title="Could not load quizzes"
            description="The quiz listing endpoint returned an error."
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
        ) : quizzes.length === 0 ? (
          <EmptyState
            title="No published quizzes"
            description="The backend currently has no published quizzes that match your search."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}