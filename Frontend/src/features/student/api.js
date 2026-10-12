
import { api } from '../../lib/api';

export const getStudentDashboard = async () => {
  const { data } = await api.get('/dashboard');
  return data;
};

export const getPublishedQuizzes = async ({
  search = '',
  page = 1,
  limit = 12,
} = {}) => {
  const { data } = await api.get('/quizzes/published', {
    params: { search, page, limit },
  });

  return data;
};

export const getQuizById = async (quizId) => {
  const { data } = await api.get(`/quizzes/${quizId}`);
  return data;
};

export const getQuizQuestions = async (quizId) => {
  const { data } = await api.get(`/quizzes/${quizId}/questions`);
  return data;
};

export const startQuizAttempt = async (quizId) => {
  const { data } = await api.post(`/attempts/${quizId}/start`);
  return data;
};

export const submitAttemptAnswer = async (attemptId, payload) => {
  const { data } = await api.post(
    `/attempts/${attemptId}/answers`,
    payload,
  );

  return data;
};

export const submitQuizAttempt = async (attemptId) => {
  const { data } = await api.post(`/attempts/${attemptId}/submit`);
  return data;
};

export const autoSubmitQuizAttempt = async (attemptId) => {
  const { data } = await api.post(
    `/attempts/${attemptId}/auto-submit`,
  );

  return data;
};

export const logAttemptEvent = async (attemptId, payload) => {
  const { data } = await api.post(
    `/attempts/${attemptId}/events`,
    payload,
  );

  return data;
};

export const getAttemptById = async (attemptId) => {
  const { data } = await api.get(`/attempts/${attemptId}`);
  return data;
};

export const getMyAttempts = async () => {
  const { data } = await api.get('/attempts/my');
  return data;
};

export const reviewAttemptWithAI = async (attemptId) => {
  const { data } = await api.post('/ai/review-attempt', {
    attemptId,
  });

  return data;
};

// Profile APIs
export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateMyProfile = async ({ name }) => {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    throw new Error('Name cannot be empty.');
  }

  const { data } = await api.patch('/users/profile', {
    name: trimmedName,
  });

  return data;
};

export const changeMyPassword = async (payload) => {
  const { data } = await api.patch('/users/change-password', payload);
  return data;
};

// Badges
export const getAllBadges = async () => {
  const { data } = await api.get('/badges');
  return data;
};

export const getMyBadges = async () => {
  const { data } = await api.get('/badges/my-badges');
  return data;
};

// Notifications
export const getNotifications = async () => {
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await api.patch(
    `/notifications/${notificationId}/read`,
  );

  return data;
};

// Leaderboard
export const getGlobalLeaderboard = async () => {
  const { data } = await api.get('/leaderboard/global');
  return data;
};
