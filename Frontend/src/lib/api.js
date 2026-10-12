import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const status = error?.response?.status;

  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource could not be found.';
  if (status >= 500) return 'The server is temporarily unavailable. Please try again.';
  if (error?.code === 'ERR_NETWORK') return 'Unable to reach the server. Please try again.';

  return fallback;
}
