
import { useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Target,
  Users,
} from 'lucide-react';

import {
  useAnalyticsOverviewQuery,
  useAnalyticsComparisonQuery,
  useAnalyticsTrendsQuery,
  useAnalyticsTeachersQuery,
} from './hooks';

import AnalyticsMetricCard from './components/AnalyticsMetricCard';
import AnalyticsChart from './components/AnalyticsChart';
import AnalyticsFilters from './components/AnalyticsFilters';
import AnalyticsLoading from './components/AnalyticsLoading';
import AnalyticsError from './components/AnalyticsError';

/* ----------------------------- Helpers ----------------------------- */

function formatNumber(value, digits = 0) {
  if (value == null || value === '') return '—';

  const number = Number(value);

  if (!Number.isFinite(number)) return '—';

  return number.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to load analytics. Please try again.'
  );
}

function formatDate(date) {
  if (!date) return '—';

  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? String(date)
    : parsed.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
}

/* ------------------------- Analytics Page ------------------------- */

export function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);

  const overviewQuery = useAnalyticsOverviewQuery();
  const comparisonQuery = useAnalyticsComparisonQuery();
  const trendsQuery = useAnalyticsTrendsQuery(days);
  const teachersQuery = useAnalyticsTeachersQuery();

  // Normalize API responses.
  const overviewResponse =
    overviewQuery.data?.data ?? overviewQuery.data ?? {};

  const summary = overviewResponse.summary ?? overviewResponse;

  const comparisonResponse =
    comparisonQuery.data?.data ?? comparisonQuery.data ?? {};

  const comparisons = Array.isArray(comparisonResponse)
    ? comparisonResponse
    : comparisonResponse.quizzes ?? [];

  const trendsResponse =
    trendsQuery.data?.data ?? trendsQuery.data ?? {};

  const trends = Array.isArray(trendsResponse)
    ? trendsResponse
    : trendsResponse.trends ?? [];

  const teacherResponse =
    teachersQuery.data?.data ?? teachersQuery.data ?? {};

  const teachers = Array.isArray(teacherResponse)
    ? teacherResponse
    : teacherResponse.teachers ??
      teacherResponse.items ??
      [];

  const scoreDistribution = summary.scoreDistribution ?? {};

  // Initial loading state.
  const isInitialLoading =
    (overviewQuery.isLoading && !overviewQuery.data) ||
    (comparisonQuery.isLoading && !comparisonQuery.data) ||
    (trendsQuery.isLoading && !trendsQuery.data);

  // Refresh every analytics query.
  const refresh = () => {
    overviewQuery.refetch();
    comparisonQuery.refetch();
    trendsQuery.refetch();
    teachersQuery.refetch();
  };

  if (isInitialLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Platform analytics
          </h1>

          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Monitor platform activity and quiz outcomes.
          </p>
        </div>

        <AnalyticsLoading />
      </main>
    );
  }

  // Critical overview error.
  if (overviewQuery.isError && !overviewQuery.data) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Platform analytics
        </h1>

        <AnalyticsError
          message={getErrorMessage(overviewQuery.error)}
          onRetry={refresh}
        />
      </main>
    );
  }

  // Chart data.
  const trendChartData = trends.map((item) => ({
    date: formatDate(item.date),
    completedAttempts: Number(item.completedAttempts ?? 0),
    averageScorePercentage: Number(
      item.averageScorePercentage ?? 0
    ),
  }));

  const comparisonChartData = comparisons.map((quiz) => ({
    title: quiz.title ?? 'Untitled quiz',
    averageScorePercentage: Number(
      quiz.averageScorePercentage ?? 0
    ),
    passRate: Number(quiz.passRate ?? 0),
  }));

  const scoreDistributionData = [
    {
      name: 'Excellent',
      value: Number(scoreDistribution.excellent ?? 0),
    },
    {
      name: 'Good',
      value: Number(scoreDistribution.good ?? 0),
    },
    {
      name: 'Average',
      value: Number(scoreDistribution.average ?? 0),
    },
    {
      name: 'Needs improvement',
      value: Number(scoreDistribution.poor ?? 0),
    },
  ];

  // Summary metric cards.
  const metrics = [
    {
      label: 'Published quizzes',
      value: formatNumber(summary.totalPublishedQuizzes),
      description: 'Published quizzes included in analytics.',
      icon: ClipboardList,
    },
    {
      label: 'Completed attempts',
      value: formatNumber(summary.totalCompletedAttempts),
      description:
        'Submitted and automatically submitted attempts.',
      icon: Activity,
    },
    {
      label: 'Students reached',
      value: formatNumber(summary.totalStudents),
      description:
        'Students represented in completed attempts.',
      icon: Users,
    },
    {
      label: 'Average score',
      value:
        summary.averageScorePercentage == null
          ? '—'
          : `${formatNumber(
              summary.averageScorePercentage,
              1
            )}%`,
      description: 'Average score across completed attempts.',
      icon: Target,
    },
    {
      label: 'Pass rate',
      value:
        summary.passRate == null
          ? '—'
          : `${formatNumber(summary.passRate, 1)}%`,
      description: 'Pass rate calculated by the backend.',
      icon: CheckCircle2,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading and filters */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Platform overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Platform analytics
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
            Review quiz activity, student outcomes, performance
            trends, and teacher statistics.
          </p>
        </div>

        <AnalyticsFilters
          days={days}
          onDaysChange={setDays}
          onRefresh={refresh}
          isRefreshing={
            overviewQuery.isFetching ||
            comparisonQuery.isFetching ||
            trendsQuery.isFetching ||
            teachersQuery.isFetching
          }
        />
      </header>

      {/* Partial analytics errors */}
      {(comparisonQuery.isError ||
        trendsQuery.isError ||
        teachersQuery.isError) && (
        <AnalyticsError
          message="Some platform analytics could not be loaded. Other available results remain visible."
          onRetry={refresh}
        />
      )}

      {/* Summary metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <AnalyticsMetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </section>

      {/* Trends and score distribution */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AnalyticsChart
          title="Platform activity and score trends"
          description={`Daily completed attempts and average score over ${days} days.`}
          data={trendChartData}
          type="line"
          xKey="date"
          series={[
            {
              dataKey: 'completedAttempts',
              label: 'Completed attempts',
            },
            {
              dataKey: 'averageScorePercentage',
              label: 'Average score (%)',
            },
          ]}
          emptyMessage="No trend data is available for this period."
        />

        <AnalyticsChart
          title="Score distribution"
          description="Completed attempts grouped by score category."
          data={scoreDistributionData}
          type="pie"
          nameKey="name"
          valueKey="value"
          emptyMessage="No score-distribution data is available."
        />
      </section>

      {/* Quiz comparison */}
      <AnalyticsChart
        title="Quiz performance comparison"
        description="Compare average score and pass rate across published quizzes."
        data={comparisonChartData}
        type="bar"
        xKey="title"
        series={[
          {
            dataKey: 'averageScorePercentage',
            label: 'Average score (%)',
          },
          {
            dataKey: 'passRate',
            label: 'Pass rate (%)',
          },
        ]}
        height={340}
        emptyMessage="No quiz comparison data is available."
      />

      {/* Teacher statistics */}
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--border)] p-5 sm:p-6">
          <GraduationCap
            size={22}
            className="text-emerald-500"
            aria-hidden="true"
          />

          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              Teacher statistics
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Data returned by the admin-only teacher analytics
              endpoint.
            </p>
          </div>
        </div>

        {teachersQuery.isLoading && !teachersQuery.data ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            Loading teacher statistics…
          </p>
        ) : teachersQuery.isError ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            Teacher statistics could not be loaded. Check the
            endpoint response and your admin permissions.
          </p>
        ) : teachers.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            No teacher statistics were returned by the API.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Teacher
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Quizzes
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Attempts
                  </th>
                  <th className="px-5 py-3 font-medium">
                    Average score
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {teachers.map((teacher, index) => (
                  <tr
                    key={teacher.teacherId ?? index}
                    className="transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--text-primary)]">
                        {teacher.teacherName ?? 'Teacher'}
                      </p>

                      {teacher.email && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {teacher.email}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {formatNumber(
                        teacher.totalPublishedQuizzes
                      )}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {formatNumber(
                        teacher.totalCompletedAttempts
                      )}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {teacher.averageScorePercentage == null
                        ? '—'
                        : `${formatNumber(
                            teacher.averageScorePercentage,
                            1
                          )}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <BarChart3 size={15} aria-hidden="true" />
        Analytics are based on the data returned by your backend.
      </div>
    </main>
  );
}

export default AdminAnalyticsPage;
