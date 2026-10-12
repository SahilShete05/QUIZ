import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBadge,
  createCategory,
  deleteAdminQuiz,
  deleteCategory,
  getAdminDashboard,
  getAdminQuestionAnalytics,
  getAdminQuiz,
  getAdminQuizAnalytics,
  getAdminQuizzes,
  getBadges,
  getCategories,
  publishAdminQuiz,
  unpublishAdminQuiz,
  updateCategory,
 
} from './api';


import { updateMyProfile } from '../student/api';

export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'],
  quizzes: (filters) => ['admin', 'quizzes', filters],
  quiz: (quizId) => ['admin', 'quiz', quizId],
  analytics: (quizId) => ['admin', 'quiz', quizId, 'analytics'],
  questionAnalytics: (quizId) => ['admin', 'quiz', quizId, 'question-analytics'],
  categories: ['admin', 'categories'],
  badges: ['admin', 'badges'],
};

export const useAdminDashboardQuery = () => useQuery({
  queryKey: adminQueryKeys.dashboard,
  queryFn: getAdminDashboard,
});

export const useAdminQuizzesQuery = (filters = {}) => useQuery({
  queryKey: adminQueryKeys.quizzes(filters),
  queryFn: () => getAdminQuizzes(filters),
});

export const useAdminQuizQuery = (quizId) => useQuery({
  queryKey: adminQueryKeys.quiz(quizId),
  queryFn: () => getAdminQuiz(quizId),
  enabled: Boolean(quizId),
});

export const useAdminQuizAnalyticsQuery = (quizId) => useQuery({
  queryKey: adminQueryKeys.analytics(quizId),
  queryFn: () => getAdminQuizAnalytics(quizId),
  enabled: Boolean(quizId),
});

export const useAdminQuestionAnalyticsQuery = (quizId) => useQuery({
  queryKey: adminQueryKeys.questionAnalytics(quizId),
  queryFn: () => getAdminQuestionAnalytics(quizId),
  enabled: Boolean(quizId),
});

export const useAdminCategoriesQuery = () => useQuery({
  queryKey: adminQueryKeys.categories,
  queryFn: getCategories,
});

export const useAdminBadgesQuery = () => useQuery({
  queryKey: adminQueryKeys.badges,
  queryFn: getBadges,
});

function useAdminMutation(mutationFn, onSuccess) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => onSuccess(queryClient, data, variables),
  });
}

export const usePublishAdminQuizMutation = () => useAdminMutation(publishAdminQuiz, (client, data) => {
  client.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
  client.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
  if (data?.quiz?.id) client.setQueryData(adminQueryKeys.quiz(data.quiz.id), data);
});

export const useUnpublishAdminQuizMutation = () => useAdminMutation(unpublishAdminQuiz, (client, data) => {
  client.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
  client.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
  if (data?.quiz?.id) client.setQueryData(adminQueryKeys.quiz(data.quiz.id), data);
});

export const useDeleteAdminQuizMutation = () => useAdminMutation(deleteAdminQuiz, (client) => {
  client.invalidateQueries({ queryKey: ['admin', 'quizzes'] });
  client.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
});

export const useCreateCategoryMutation = () => useAdminMutation(createCategory, (client) => {
  client.invalidateQueries({ queryKey: adminQueryKeys.categories });
});

export const useUpdateCategoryMutation = () => useAdminMutation(updateCategory, (client) => {
  client.invalidateQueries({ queryKey: adminQueryKeys.categories });
});

export const useDeleteCategoryMutation = () => useAdminMutation(deleteCategory, (client) => {
  client.invalidateQueries({ queryKey: adminQueryKeys.categories });
});

export const useCreateBadgeMutation = () => useAdminMutation(createBadge, (client) => {
  client.invalidateQueries({ queryKey: adminQueryKeys.badges });
});

export function useUpdateAdminProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['admin', 'profile'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['auth', 'profile'],
        }),
      ]);
    },
  });
}