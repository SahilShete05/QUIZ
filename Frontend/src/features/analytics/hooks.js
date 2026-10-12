import { useQuery } from '@tanstack/react-query';

import {
  getAnalyticsOverview,
  getAnalyticsComparison,
  getAnalyticsTrends,
  getAnalyticsTeachers,
} from "./api";

export const analyticsQueryKeys = {
  all: ['analytics'],

  overview: () => [
    ...analyticsQueryKeys.all,
    'overview',
  ],

  comparison: () => [
    ...analyticsQueryKeys.all,
    'comparison',
  ],

  trends: (days = 30) => [
    ...analyticsQueryKeys.all,
    'trends',
    days,
  ],

  teachers: () => [
    ...analyticsQueryKeys.all,
    'teachers',
  ],
};

export function useAnalyticsOverviewQuery() {
  return useQuery({
    queryKey: analyticsQueryKeys.overview(),
    queryFn: getAnalyticsOverview,
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsComparisonQuery() {
  return useQuery({
    queryKey: analyticsQueryKeys.comparison(),
    queryFn: getAnalyticsComparison,
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsTrendsQuery(days = 30) {
  return useQuery({
    queryKey: analyticsQueryKeys.trends(days),
    queryFn: () => getAnalyticsTrends(days),
    staleTime: 60 * 1000,
  });
}

/**
 * Only render/use this query on the Admin analytics page.
 * Server-side authorization must still be enforced.
 */
export function useAnalyticsTeachersQuery() {
  return useQuery({
    queryKey: analyticsQueryKeys.teachers(),
    queryFn: getAnalyticsTeachers,
    staleTime: 60 * 1000,
  });
}
