import { api } from '../../lib/api';

export const getAdminDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const getAdminQuizzes = async ({ search = '', page = 1, limit = 50 } = {}) => {
  const { data } = await api.get('/quizzes', { params: { search, page, limit } });
  return data;
};

export const getAdminQuiz = async (quizId) => {
  const { data } = await api.get(`/quizzes/${quizId}`);
  return data;
};

export const publishAdminQuiz = async (quizId) => {
  const { data } = await api.patch(`/quizzes/${quizId}/publish`);
  return data;
};

export const unpublishAdminQuiz = async (quizId) => {
  const { data } = await api.patch(`/quizzes/${quizId}/unpublish`);
  return data;
};

export const deleteAdminQuiz = async (quizId) => {
  const { data } = await api.delete(`/quizzes/${quizId}`);
  return data;
};

export const getAdminQuizAnalytics = async (quizId) => {
  const { data } = await api.get(`/analytics/quiz/${quizId}`);
  return data;
};

export const getAdminQuestionAnalytics = async (quizId) => {
  const { data } = await api.get(`/analytics/${quizId}/questions`);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data;
};

export const updateCategory = async ({ categoryId, payload }) => {
  const { data } = await api.patch(`/categories/${categoryId}`, payload);
  return data;
};

export const deleteCategory = async (categoryId) => {
  const { data } = await api.delete(`/categories/${categoryId}`);
  return data;
};

export const getBadges = async () => {
  const { data } = await api.get('/badges');
  return data;
};

export const createBadge = async (payload) => {
  const { data } = await api.post('/badges', payload);
  return data;
};

export const getAdminUsers = async ({
  page = 1,
  limit = 10,
  search = '',
  role = '',
} = {}) => {
  const { data } = await api.get('/users', {
    params: {
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(role ? { role } : {}),
    },
  });

  return data;
};

export const getAdminUserById = async (userId) => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};

export const updateAdminUserRole = async ({ userId, role }) => {
  const { data } = await api.patch(`/users/${userId}/role`, {
    role,
  });

  return data;
};