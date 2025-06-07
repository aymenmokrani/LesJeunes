import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { unwrapResult } from '@reduxjs/toolkit';
import { useRouter } from 'next/navigation';
import { checkAuth, clearError, login, logout } from '@/stores/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  // Check auth on app boot
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Handle routing based on auth state
  useEffect(() => {
    if (!isLoading) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register'].includes(currentPath);
      const isProtectedPage = ['/dashboard', '/files', '/settings'].some(
        (route) => currentPath.startsWith(route)
      );

      if (isAuthenticated && isAuthPage) {
        router.push('/'); // Redirect authed users away from login
      } else if (!isAuthenticated && isProtectedPage) {
        router.push('/login'); // Redirect unauthed users to login
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(login({ email, password }));
      unwrapResult(result); // Throws if rejected
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: clearAuthError,
  };
};
