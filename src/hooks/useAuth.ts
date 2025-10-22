/**
 * TanStack Query hooks for authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import type { LoginRequest, RegisterRequest } from '@/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
};

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: Infinity, // Don't refetch unless invalidated
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // Set current user in cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      // Navigate to dashboard
      navigate('/dashboard');
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      // Set current user in cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);
      // Navigate to appropriate page based on role
      navigate(data.user.role === 'patient' ? '/booking' : '/dashboard');
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Navigate to home
      navigate('/');
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.changePassword(currentPassword, newPassword),
  });
}

/**
 * Request password reset mutation
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      // Navigate to login after successful reset
      navigate('/login');
    },
  });
}

/**
 * Verify email mutation
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

/**
 * Resend verification email mutation
 */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: () => authApi.resendVerificationEmail(),
  });
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}
