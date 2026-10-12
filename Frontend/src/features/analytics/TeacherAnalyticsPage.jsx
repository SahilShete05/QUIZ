import { useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Target,
  Users,
} from 'lucide-react';

import {
  useAnalyticsOverviewQuery,
  useAnalyticsComparisonQuery,
  useAnalyticsTrendsQuery,
} from './hooks';

import AnalyticsMetricCard from './components/AnalyticsMetricCard';
import AnalyticsChart from './components/AnalyticsChart';
import AnalyticsFilters from './components/AnalyticsFilters';
import AnalyticsLoading from './components/AnalyticsLoading';
import AnalyticsError from './components/AnalyticsError';

function formatNumber(value, digits = 0) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString(undefined, {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      })
    : '—';
}

function formatDuration(seconds) {
  const number = Number(seconds);

  if (!Number.isFinite(number) || number < 0) return '—';

  if (number < 60) return `${Math.round(number)} sec`;

  const minutes = Math.floor(number / 60);
  const remainingSeconds = Math.round(number % 60);

  return remainingSeconds
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes} min`;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to load analytics. Please try again.'
  );
}

export function TeacherAnalyticsPage() {
  const [days, setDays] = useState(30);

  const overviewQuery = useAnalyticsOverviewQuery();
  const comparisonQuery = useAnalyticsComparisonQuery();
  const trendsQuery = useAnalyticsTrendsQuery(days);

  const overview = overviewQuery.data?.data ?? overviewQuery.data ?? {};
  const summary = overview.summary ?? overview;
  const quizPerformance = Array.isArray(overview.quizPerformance)
    ? overview.quizPerformance
    : Array.isArray(summary.quizPerformance)
      ? summary.quizPerformance
      : [];

  const comparisonResponse =
    comparisonQuery.data?.data ?? comparisonQuery.data ?? {};

  const comparisonQuizzes = Array.isArray(comparisonResponse)
    ? comparisonResponse
    : comparisonResponse.quizzes ?? [];

  const trendsResponse =
    trendsQuery.data?.data ?? trendsQuery.data ?? {};

  const trends = Array.isArray(trendsResponse)
    ? trendsResponse
    : trendsResponse.trends ?? [];

  const scoreDistribution = summary.scoreDistribution ?? {};

  const hasError =
    overviewQuery.isError ||
    comparisonQuery.isError ||
    trendsQuery.isError;

  const isInitialLoading =
    (overviewQuery.isLoading && !overviewQuery.data) ||
    (comparisonQuery.isLoading && !comparisonQuery.data) ||
    (trendsQuery.isLoading && !trendsQuery.data);

  const refresh = () => {
    overviewQuery.refetch();
    comparisonQuery.refetch();
    trendsQuery.refetch();
  };

  if (isInitialLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Teaching analytics
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Understand quiz performance and student outcomes.
          </p>
        </div>
        <AnalyticsLoading />
      </main>
    );
  }

  if (hasError && !overviewQuery.data) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Teaching analytics
        </h1>
        <AnalyticsError
          message={getErrorMessage(overviewQuery.error)}
          onRetry={refresh}
        />
      </main>
    );
  }

  const scoreDistributionData = [
    { name: 'Excellent', value: Number(scoreDistribution.excellent ?? 0) },
    { name: 'Good', value: Number(scoreDistribution.good ?? 0) },
    { name: 'Average', value: Number(scoreDistribution.average ?? 0) },
    { name: 'Needs improvement', value: Number(scoreDistribution.poor ?? 0) },
  ];

  const trendChartData = trends.map((item) => ({
    date: item.date
      ? new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      : '—',
    completedAttempts: Number(item.completedAttempts ?? 0),
    averageScorePercentage: Number(item.averageScorePercentage ?? 0),
  }));

  const quizChartData = comparisonQuizzes.map((quiz) => ({
    title: quiz.title ?? 'Untitled quiz',
    averageScorePercentage: Number(quiz.averageScorePercentage ?? 0),
    passRate: Number(quiz.passRate ?? 0),
    totalAttempts: Number(quiz.totalAttempts ?? 0),
  }));

  const publishedQuizzes = summary.totalPublishedQuizzes;
  const completedAttempts = summary.totalCompletedAttempts;
  const totalStudents = summary.totalStudents;
  const averageScore = summary.averageScorePercentage;
  const passRate = summary.passRate;
  const averageTime = summary.averageCompletionTimeSeconds;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Performance overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Teaching analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
            Track student outcomes, quiz performance, and completion trends
            across your published quizzes.
          </p>
        </div>

        <AnalyticsFilters
          days={days}
          onDaysChange={setDays}
          onRefresh={refresh}
          isRefreshing={
            overviewQuery.isFetching ||
            comparisonQuery.isFetching ||
            trendsQuery.isFetching
          }
        />
      </header>

      {hasError && (
        <AnalyticsError
          message="Some analytics data could not be refreshed. Available results are still shown."
          onRetry={refresh}
        />
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard
          label="Published quizzes"
          value={formatNumber(publishedQuizzes)}
          description="Your published quizzes included in analytics."
          icon={ClipboardList}
        />
        <AnalyticsMetricCard
          label="Completed attempts"
          value={formatNumber(completedAttempts)}
          description="Submitted and automatically submitted attempts."
          icon={Activity}
        />
        <AnalyticsMetricCard
          label="Average score"
          value={
            averageScore == null
              ? '—'
              : `${formatNumber(averageScore, 1)}%`
          }
          description="Average score across completed attempts."
          icon={Target}
        />
        <AnalyticsMetricCard
          label="Pass rate"
          value={passRate == null ? '—' : `${formatNumber(passRate, 1)}%`}
          description="Pass threshold configured by the backend."
          icon={CheckCircle2}
        />
        <AnalyticsMetricCard
          label="Students reached"
          value={formatNumber(totalStudents)}
          description="Students represented in completed attempts."
          icon={Users}
        />
        <AnalyticsMetricCard
          label="Average completion time"
          value={formatDuration(averageTime)}
          description="Average duration of completed attempts."
          icon={Award}
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AnalyticsChart
          title="Completion and score trends"
          description={`Daily activity over the selected ${days}-day period.`}
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
          emptyMessage="No completed attempts were recorded in this period."
        />

        <AnalyticsChart
          title="Score distribution"
          description="Completed attempts grouped by the backend's score categories."
          data={scoreDistributionData}
          type="pie"
          nameKey="name"
          valueKey="value"
          emptyMessage="No score-distribution data is available."
        />
      </section>

      <AnalyticsChart
        title="Quiz performance comparison"
        description="Compare average scores and pass rates across your published quizzes."
        data={quizChartData}
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
        emptyMessage="No quiz comparison data is available yet."
      />

      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--border)] p-5 sm:p-6">
          <BarChart3
            size={21}
            className="text-emerald-500"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              Quiz performance details
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Results for published quizzes included in your analytics.
            </p>
          </div>
        </div>

        {quizPerformance.length === 0 ? (
          <p className="p-6 text-sm text-[var(--text-muted)]">
            No published quiz performance data is available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Quiz</th>
                  <th className="px-5 py-3 font-medium">Attempts</th>
                  <th className="px-5 py-3 font-medium">Students</th>
                  <th className="px-5 py-3 font-medium">Average score</th>
                  <th className="px-5 py-3 font-medium">Pass rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {quizPerformance.map((quiz, index) => (
                  <tr
                    key={quiz.quizId ?? `${quiz.title}-${index}`}
                    className="transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="max-w-[300px] truncate px-5 py-4 font-medium text-[var(--text-primary)]">
                      {quiz.title ?? 'Untitled quiz'}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {formatNumber(quiz.totalAttempts)}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {formatNumber(quiz.totalStudents)}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {quiz.averageScorePercentage == null
                        ? '—'
                        : `${formatNumber(quiz.averageScorePercentage, 1)}%`}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {quiz.passRate == null
                        ? '—'
                        : `${formatNumber(quiz.passRate, 1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}