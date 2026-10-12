import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  autoSubmitQuizAttempt,
  getAllBadges,
  getAttemptById,
  getGlobalLeaderboard,
  getMyAttempts,
  getMyBadges,
  getNotifications,
  getProfile,
  getPublishedQuizzes,
  getQuizById,
  getQuizQuestions,
  getStudentDashboard,
  logAttemptEvent,
  markNotificationRead,
  reviewAttemptWithAI,
  startQuizAttempt,
  submitAttemptAnswer,
  submitQuizAttempt,
  updateMyProfile,
} from './api';

export const studentQueryKeys = {
  dashboard: ['student', 'dashboard'],
  quizzes: (filters) => ['student', 'quizzes', filters],
  quiz: (quizId) => ['student', 'quiz', quizId],
  quizQuestions: (quizId) => ['student', 'quiz', quizId, 'questions'],
  attempt: (attemptId) => ['student', 'attempt', attemptId],
  attempts: ['student', 'attempts'],
  profile: ['student', 'profile'],
  badges: ['student', 'badges'],
  myBadges: ['student', 'my-badges'],
  notifications: ['student', 'notifications'],
  leaderboard: ['student', 'leaderboard'],
};

export function useStudentDashboardQuery() {
  return useQuery({
    queryKey: studentQueryKeys.dashboard,
    queryFn: getStudentDashboard,
  });
}

export function usePublishedQuizzesQuery(filters = {}) {
  return useQuery({
    queryKey: studentQueryKeys.quizzes(filters),
    queryFn: () => getPublishedQuizzes(filters),
  });
}

export function useQuizQuery(quizId) {
  return useQuery({
    queryKey: studentQueryKeys.quiz(quizId),
    queryFn: () => getQuizById(quizId),
    enabled: Boolean(quizId),
  });
}

export function useQuizQuestionsQuery(quizId) {
  return useQuery({
    queryKey: studentQueryKeys.quizQuestions(quizId),
    queryFn: () => getQuizQuestions(quizId),
    enabled: Boolean(quizId),
  });
}

export function useAttemptQuery(attemptId) {
  return useQuery({
    queryKey: studentQueryKeys.attempt(attemptId),
    queryFn: () => getAttemptById(attemptId),
    enabled: Boolean(attemptId),
  });
}

export function useMyAttemptsQuery() {
  return useQuery({
    queryKey: studentQueryKeys.attempts,
    queryFn: getMyAttempts,
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: studentQueryKeys.profile,
    queryFn: getProfile,
  });
}

export function useAllBadgesQuery() {
  return useQuery({
    queryKey: studentQueryKeys.badges,
    queryFn: getAllBadges,
  });
}

export function useMyBadgesQuery() {
  return useQuery({
    queryKey: studentQueryKeys.myBadges,
    queryFn: getMyBadges,
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: studentQueryKeys.notifications,
    queryFn: getNotifications,
  });
}

export function useGlobalLeaderboardQuery() {
  return useQuery({
    queryKey: studentQueryKeys.leaderboard,
    queryFn: getGlobalLeaderboard,
  });
}

export function useStartAttemptMutation() {
  return useMutation({
    mutationFn: startQuizAttempt,
  });
}

export function useSubmitAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, payload }) =>
      submitAttemptAnswer(attemptId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.attempt(variables.attemptId),
      });
    },
  });
}

// The submit endpoints return a partial attempt (no quiz/answers), so it is
// not cached directly. The full attempt is re-fetched for the result page.
export function useSubmitAttemptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitQuizAttempt,
    onSuccess: (_, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.attempt(attemptId),
      });
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.attempts });
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.profile });
    },
    // 409 = another path (timer, violation limit, cron) already finalized it.
    // Refresh the cached attempt so the result page does not show stale
    // "in progress" data.
    onError: (error, attemptId) => {
      if (error?.response?.status === 409) {
        queryClient.invalidateQueries({
          queryKey: studentQueryKeys.attempt(attemptId),
        });
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.attempts });
      }
    },
  });
}

export function useAutoSubmitAttemptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: autoSubmitQuizAttempt,
    onSuccess: (_, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.attempt(attemptId),
      });
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.attempts });
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.profile });
    },
    onError: (error, attemptId) => {
      if (error?.response?.status === 409) {
        queryClient.invalidateQueries({
          queryKey: studentQueryKeys.attempt(attemptId),
        });
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.attempts });
      }
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentQueryKeys.notifications,
      });
    },
  });
}

export function useLogAttemptEvent() {
  return useMutation({
    mutationFn: ({ attemptId, eventType, metadata }) => {
      if (!attemptId) {
        throw new Error('Attempt ID is required to record an event.');
      }

      return logAttemptEvent(attemptId, {
        eventType,
        ...(metadata ? { metadata } : {}),
      });
    },
  });
}


export function useAIReviewAttemptMutation() {
  return useMutation({
    mutationFn: reviewAttemptWithAI,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentQueryKeys.profile,
        }),
        queryClient.invalidateQueries({
          queryKey: ['auth', 'profile'],
        }),
      ]);
    },
  });
}
