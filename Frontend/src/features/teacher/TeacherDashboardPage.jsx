import {
  Activity,
  BookOpen,
  CheckCircle2,
  Users,
} from 'lucide-react';
import {
  PageIntro,
  StatCard,
  SectionTitle,
  ErrorState,
  EmptyState,
  LoadingSkeleton,
} from '../student/ui';
import { useTeacherDashboardQuery } from './hooks';

export function TeacherDashboardPage() {
  const { data, isLoading, isError, refetch } =
    useTeacherDashboardQuery();

  const dashboard = data?.dashboard;
  const stats = dashboard?.stats;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="TEACHER OVERVIEW"
          title="Your teaching workspace."
          description="Loading live teaching metrics."
        />

        <div className="mt-7">
          <LoadingSkeleton type="hero" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <LoadingSkeleton key={item} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Could not load teacher dashboard"
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
        eyebrow="TEACHER OVERVIEW"
        title="Your teaching workspace."
        description="A live view of the quizzes and attempts owned by you."
      />

      {/* Overview metrics */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BookOpen size={17} />}
          label="Total quizzes"
          value={stats?.totalQuizzes ?? 0}
        />

        <StatCard
          icon={<CheckCircle2 size={17} />}
          label="Published"
          value={stats?.publishedQuizzes ?? 0}
          tone="text-emerald-400"
        />

        <StatCard
          icon={<Users size={17} />}
          label="Students reached"
          value={stats?.totalStudents ?? 0}
          tone="text-violet-400"
        />

        <StatCard
          icon={<Activity size={17} />}
          label="Attempts"
          value={stats?.totalAttempts ?? 0}
          tone="text-amber-400"
        />
      </div>

      {/* Dashboard columns */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        {/* Teaching pulse */}
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <SectionTitle
            title="Teaching pulse"
            description="Metrics returned by the teacher dashboard endpoint."
          />

          <div className="mt-6 divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <span className="text-sm text-slate-400">
                Total questions
              </span>

              <strong className="text-xl font-semibold tracking-tight text-slate-100">
                {stats?.totalQuestions ?? 0}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4">
              <span className="text-sm text-slate-400">
                Average score
              </span>

              <strong className="text-xl font-semibold tracking-tight text-emerald-400">
                {stats?.averageScore ?? 0}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
              <span className="text-sm text-slate-400">
                Auto-submitted attempts
              </span>

              <strong className="text-xl font-semibold tracking-tight text-slate-100">
                {stats?.autoSubmittedAttempts ?? 0}
              </strong>
            </div>
          </div>
        </section>

        {/* Recent quizzes */}
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <SectionTitle title="Recent quizzes" />

          <div className="mt-5">
            {dashboard?.recentQuizzes?.length ? (
              <div className="divide-y divide-white/[0.06]">
                {dashboard.recentQuizzes.map((quiz) => (
                  <div
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    key={quiz.id}
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-slate-200">
                        {quiz.title}
                      </strong>

                      <span className="mt-1 block text-xs text-slate-500">
                        {new Date(
                          quiz.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={[
                        'shrink-0 rounded-full border px-2.5 py-1',
                        'text-[11px] font-semibold',
                        quiz.isPublished
                          ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-400'
                          : 'border-white/[0.08] bg-white/[0.04] text-slate-400',
                      ].join(' ')}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No quizzes yet"
                description="Create your first quiz to start building your teaching workspace."
              />
            )}
          </div>
        </section>
      </div>

      {/* Recent attempts */}
      <section className="glass-panel mt-5 rounded-2xl p-5 sm:p-6">
        <SectionTitle
          title="Recent attempts"
          description="Student attempts returned by the backend."
        />

        <div className="mt-5">
          {dashboard?.recentAttempts?.length ? (
            <div className="divide-y divide-white/[0.06]">
              {dashboard.recentAttempts.map((attempt) => (
                <div
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  key={attempt.id}
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-semibold text-slate-200">
                      {attempt.quiz?.title || 'Quiz'}
                    </strong>

                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {attempt.user?.name ||
                        attempt.user?.email ||
                        'Student'}
                    </span>
                  </div>

                  <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {attempt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No attempts yet"
              description="Attempts will appear here when students take your quizzes."
            />
          )}
        </div>
      </section>
    </div>
  );
}