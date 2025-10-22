/**
 * Authentication API service
 */

import { apiClient, extractData, setAuthToken, clearAuthToken } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/types';

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse, LoginRequest>(
      '/auth/login',
      credentials
    );
    const data = extractData(response);

    // Store token
    setAuthToken(data.token);

    return data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse, RegisterRequest>(
      '/auth/register',
      data
    );
    const loginData = extractData(response);

    // Store token
    setAuthToken(loginData.token);

    return loginData;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear token even if API call fails
      clearAuthToken();
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    const response = await apiClient.post<{ token: string; expiresIn: number }>(
      '/auth/refresh',
      { refreshToken }
    );
    const data = extractData(response);

    // Update stored token
    setAuthToken(data.token);

    return data;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<LoginResponse['user']> {
    const response = await apiClient.get<LoginResponse['user']>('/auth/me');
    return extractData(response);
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password-reset/request', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', { token, newPassword });
  },

  /**
   * Change password (for authenticated users)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification');
  },
};
