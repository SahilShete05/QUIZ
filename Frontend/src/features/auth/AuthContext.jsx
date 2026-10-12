import { createContext, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordRequest,
} from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  const user = data?.user ?? null;

  // Query keys such as ['teacher', 'quizzes'] do not include the user, and the
  // cache keeps data fresh for 5 minutes. Without this, the next person to log
  // in on the same browser tab would see the previous user's cached data.
  // The ['auth'] query is kept: it is the one being observed right now.
  const clearUserData = () => {
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'auth',
    });
  };

  const login = async (payload) => {
    clearUserData();
    const response = await loginUser(payload);
    queryClient.setQueryData(['auth', 'user'], response);
    await refetch();
    return response;
  };

  const register = async (payload) => {
    clearUserData();
    const response = await registerUser(payload);
    queryClient.setQueryData(['auth', 'user'], response);
    await refetch();
    return response;
  };

  const logout = async () => {
    await logoutUser();
    clearUserData();
    queryClient.setQueryData(['auth', 'user'], null);
    queryClient.removeQueries({ queryKey: ['auth'] });
  };

  const forgotPassword = async (email) => {
    return forgotPasswordRequest(email);
  };

  const resetPassword = async (token, password) => {
    return resetPasswordRequest(token, password);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isError,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      refreshUser: refetch,
    }),
    [user, isLoading, isError, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};