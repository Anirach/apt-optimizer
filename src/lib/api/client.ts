/**
 * API Client configuration and base fetch wrapper
 */

import type { ApiResponse, ApiError } from '@/types';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Set authentication token in storage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Clear authentication token from storage
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Base fetch wrapper with error handling and authentication
 */
async function fetchWithConfig<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set up headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authentication token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const error = data as ApiError;
      throw new ApiClientError(
        error.error?.message || 'An error occurred',
        response.status,
        error.error?.code,
        error.error?.details
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError('Request timeout', 408, 'TIMEOUT');
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiClientError('Network error', 0, 'NETWORK_ERROR');
    }

    // Re-throw ApiClientError
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle unknown errors
    throw new ApiClientError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
  }
}

/**
 * API Client with HTTP methods
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';

    return fetchWithConfig<ApiResponse<T>>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  async post<T, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return fetchWithConfig<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  async put<T, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return fetchWithConfig<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  async patch<T, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    return fetchWithConfig<ApiResponse<T>>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return fetchWithConfig<ApiResponse<T>>(endpoint, {
      method: 'DELETE',
    });
  },
};

/**
 * Helper to extract data from API response
 */
export function extractData<T>(response: ApiResponse<T>): T {
  return response.data;
}
