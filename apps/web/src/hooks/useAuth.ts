'use client';

import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, token, refreshToken, isAuthenticated, setAuth, logout } = useAuthStore();

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    setAuth,
    logout,
    role: user?.role
  };
};
