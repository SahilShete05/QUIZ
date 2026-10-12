import { api } from '../../lib/api';

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/get-user');
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const forgotPasswordRequest = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPasswordRequest = async (token, password) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};
