import { api } from '../../lib/api';

export const getTeacherDashboard = async () => {
  const { data } = await api.get('/teacher-dashboard');
  return data;
};

export const getTeacherQuizzes = async ({ search = '', page = 1, limit = 12 } = {}) => {
  const { data } = await api.get('/quizzes', { params: { search, page, limit } });
  return data;
};

export const createQuiz = async (payload) => {
  const { data } = await api.post('/quizzes', payload);
  return data;
};

export const updateQuiz = async ({ quizId, payload }) => {
  const { data } = await api.patch(`/quizzes/${quizId}`, payload);
  return data;
};

export const deleteQuiz = async (quizId) => {
  const { data } = await api.delete(`/quizzes/${quizId}`);
  return data;
};

export const publishQuiz = async (quizId) => {
  const { data } = await api.patch(`/quizzes/${quizId}/publish`);
  return data;
};

export const unpublishQuiz = async (quizId) => {
  const { data } = await api.patch(`/quizzes/${quizId}/unpublish`);
  return data;
};

export const getTeacherQuiz = async (quizId) => {
  const { data } = await api.get(`/quizzes/${quizId}`);
  return data;
};

export const getTeacherQuestions = async (quizId) => {
  const { data } = await api.get(`/quizzes/${quizId}/admin-questions`);
  return data;
};

export const createQuestion = async (payload) => {
  const { data } = await api.post('/questions', payload);
  return data;
};

export const updateQuestion = async ({ questionId, payload }) => {
  const { data } = await api.patch(`/questions/${questionId}`, payload);
  return data;
};

export const linkQuestionToQuiz = async ({ quizId, questionId, order, points }) => {
  const { data } = await api.post(`/quizzes/${quizId}/questions`, {
    questionId,
    order,
    points,
  });
  return data;
};

export const unlinkQuestionFromQuiz = async ({ quizId, questionId }) => {
  const { data } = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
  return data;
};

export const getQuizAnalytics = async (quizId) => {
  const { data } = await api.get(`/analytics/quiz/${quizId}`);
  return data;
};

export const getQuestionAnalytics = async (quizId) => {
  const { data } = await api.get(`/analytics/${quizId}/questions`);
  return data;
};

// Attempts of one quiz with anti-cheat counts and risk level (owner/admin only).
export const getQuizAttempts = async (quizId) => {
  const { data } = await api.get(`/analytics/quiz/${quizId}/attempts`, {
    params: { limit: 100 },
  });
  return data;
};

export async function generateAIQuiz(payload) {
  const { data } = await api.post('/ai/generate-quiz', payload);
  return data;
}

export async function addAIQuestions(payload) {
  const { data } = await api.post('/ai/add-questions', payload);
  return data;
}