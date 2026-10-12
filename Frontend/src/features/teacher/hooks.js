import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createQuestion,
  createQuiz,
  deleteQuiz,
  getQuestionAnalytics,
  getQuizAnalytics,
  getTeacherDashboard,
  getTeacherQuestions,
  getTeacherQuiz,
  getTeacherQuizzes,
  linkQuestionToQuiz,
  publishQuiz,
  unlinkQuestionFromQuiz,
  unpublishQuiz,
  updateQuestion,
  updateQuiz,
  generateAIQuiz,
  addAIQuestions,
  getQuizAttempts,
} from './api';


import { updateMyProfile } from '../student/api';

/* =========================================================
   QUERY KEYS
========================================================= */

export const teacherQueryKeys = {
  dashboard: ['teacher', 'dashboard'],

  quizzes: (filters) => [
    'teacher',
    'quizzes',
    filters,
  ],

  quiz: (quizId) => [
    'teacher',
    'quiz',
    quizId,
  ],

  questions: (quizId) => [
    'teacher',
    'quiz',
    quizId,
    'questions',
  ],

  analytics: (quizId) => [
    'teacher',
    'quiz',
    quizId,
    'analytics',
  ],

  questionAnalytics: (quizId) => [
    'teacher',
    'quiz',
    quizId,
    'question-analytics',
  ],

  attempts: (quizId) => [
    'teacher',
    'quiz',
    quizId,
    'attempts',
  ],
};

/* =========================================================
   QUERIES
========================================================= */

export function useTeacherDashboardQuery() {
  return useQuery({
    queryKey: teacherQueryKeys.dashboard,
    queryFn: getTeacherDashboard,
  });
}

export function useTeacherQuizzesQuery(filters = {}) {
  return useQuery({
    queryKey: teacherQueryKeys.quizzes(filters),
    queryFn: () => getTeacherQuizzes(filters),
  });
}

export function useTeacherQuizQuery(quizId) {
  return useQuery({
    queryKey: teacherQueryKeys.quiz(quizId),
    queryFn: () => getTeacherQuiz(quizId),
    enabled: Boolean(quizId),
  });
}

export function useTeacherQuestionsQuery(quizId) {
  return useQuery({
    queryKey: teacherQueryKeys.questions(quizId),
    queryFn: () => getTeacherQuestions(quizId),
    enabled: Boolean(quizId),
  });
}

export function useQuizAnalyticsQuery(quizId) {
  return useQuery({
    queryKey: teacherQueryKeys.analytics(quizId),
    queryFn: () => getQuizAnalytics(quizId),
    enabled: Boolean(quizId),
  });
}

export function useQuestionAnalyticsQuery(quizId) {
  return useQuery({
    queryKey: teacherQueryKeys.questionAnalytics(quizId),
    queryFn: () => getQuestionAnalytics(quizId),
    enabled: Boolean(quizId),
  });
}

export function useQuizAttemptsQuery(quizId) {
  return useQuery({
    queryKey: teacherQueryKeys.attempts(quizId),
    queryFn: () => getQuizAttempts(quizId),
    enabled: Boolean(quizId),
  });
}

/* =========================================================
   GENERIC TEACHER MUTATION
========================================================= */

function useTeacherMutation(mutationFn, invalidate) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: (...args) => {
      invalidate(queryClient, ...args);
    },
  });
}

/* =========================================================
   QUIZ MUTATIONS
========================================================= */

export const useCreateQuizMutation = () =>
  useTeacherMutation(
    createQuiz,
    (client) => {
      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    }
  );

export const useUpdateQuizMutation = () =>
  useTeacherMutation(
    updateQuiz,
    (client, data) => {
      const quizId = data?.quiz?.id;

      if (quizId) {
        client.setQueryData(
          teacherQueryKeys.quiz(quizId),
          data
        );
      }

      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    }
  );

export const useDeleteQuizMutation = () =>
  useTeacherMutation(
    deleteQuiz,
    (client) => {
      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    }
  );

export const usePublishQuizMutation = () =>
  useTeacherMutation(
    publishQuiz,
    (client, data) => {
      if (data?.quiz?.id) {
        client.setQueryData(
          teacherQueryKeys.quiz(data.quiz.id),
          data
        );
      }

      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    }
  );

export const useUnpublishQuizMutation = () =>
  useTeacherMutation(
    unpublishQuiz,
    (client, data) => {
      if (data?.quiz?.id) {
        client.setQueryData(
          teacherQueryKeys.quiz(data.quiz.id),
          data
        );
      }

      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    }
  );

/* =========================================================
   QUESTION MUTATIONS
========================================================= */

export const useCreateQuestionMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: createQuestion,

    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ['teacher', 'quiz'],
      });
    },
  });
};

export const useUpdateQuestionMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: updateQuestion,

    onSuccess: (_, variables) => {
      if (variables?.quizId) {
        client.invalidateQueries({
          queryKey: teacherQueryKeys.questions(
            variables.quizId
          ),
        });

        client.invalidateQueries({
          queryKey: teacherQueryKeys.quiz(
            variables.quizId
          ),
        });
      } else {
        client.invalidateQueries({
          queryKey: ['teacher', 'quiz'],
        });
      }
    },
  });
};

export const useLinkQuestionMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: linkQuestionToQuiz,

    onSuccess: (_, variables) => {
      if (!variables?.quizId) return;

      client.invalidateQueries({
        queryKey: teacherQueryKeys.questions(
          variables.quizId
        ),
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.quiz(
          variables.quizId
        ),
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    },
  });
};

export const useUnlinkQuestionMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: unlinkQuestionFromQuiz,

    onSuccess: (_, variables) => {
      if (!variables?.quizId) return;

      client.invalidateQueries({
        queryKey: teacherQueryKeys.questions(
          variables.quizId
        ),
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.quiz(
          variables.quizId
        ),
      });

      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
    },
  });
};

/* =========================================================
   AI — GENERATE COMPLETE QUIZ
========================================================= */

export const useGenerateAIQuizMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: generateAIQuiz,

    onSuccess: (data) => {
      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });
     
      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });
   
      if (data?.quiz?.id) {
        client.invalidateQueries({
          queryKey: teacherQueryKeys.quiz(
            data.quiz.id
          ),
        });

        client.invalidateQueries({
          queryKey: teacherQueryKeys.questions(
            data.quiz.id
          ),
        });
      }
    },
  });
};

/* =========================================================
   AI — ADD QUESTIONS TO EXISTING QUIZ
========================================================= */

export const useAddAIQuestionsMutation = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: addAIQuestions,

    onSuccess: (_, variables) => {
      const quizId = variables?.quizId;

      if (quizId) {
        client.invalidateQueries({
          queryKey: teacherQueryKeys.questions(
            quizId
          ),
        });

        
        client.invalidateQueries({
          queryKey: teacherQueryKeys.quiz(
            quizId
          ),
        });
      }
      client.invalidateQueries({
        queryKey: teacherQueryKeys.dashboard,
      });

      client.invalidateQueries({
        queryKey: ['teacher', 'quizzes'],
      });
    },
  });
};

export function useUpdateTeacherProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['teacher', 'profile'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['auth', 'profile'],
        }),
      ]);
    },
  });
}