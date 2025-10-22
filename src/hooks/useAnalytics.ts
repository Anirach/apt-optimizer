/**
 * TanStack Query hooks for analytics
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import type { AnalyticsRequest } from '@/types';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (filters?: Record<string, unknown>) => [...analyticsKeys.all, 'dashboard', filters] as const,
  detailed: (params: AnalyticsRequest) => [...analyticsKeys.all, 'detailed', params] as const,
  system: (filters?: Record<string, unknown>) => [...analyticsKeys.all, 'system', filters] as const,
  departments: (filters?: Record<string, unknown>) => [...analyticsKeys.all, 'departments', filters] as const,
  providers: (filters?: Record<string, unknown>) => [...analyticsKeys.all, 'providers', filters] as const,
  noShowTrends: (params: Record<string, unknown>) => [...analyticsKeys.all, 'no-show-trends', params] as const,
  utilizationTrends: (params: Record<string, unknown>) => [...analyticsKeys.all, 'utilization-trends', params] as const,
  waitTimeTrends: (params: Record<string, unknown>) => [...analyticsKeys.all, 'wait-time-trends', params] as const,
  realtime: () => [...analyticsKeys.all, 'realtime'] as const,
};

/**
 * Get dashboard analytics (KPIs, upcoming appointments, waitlist summary)
 */
export function useDashboardAnalytics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(params),
    queryFn: () => analyticsApi.getDashboardAnalytics(params),
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Get detailed analytics with trends
 */
export function useDetailedAnalytics(params: AnalyticsRequest) {
  return useQuery({
    queryKey: analyticsKeys.detailed(params),
    queryFn: () => analyticsApi.getDetailedAnalytics(params),
    staleTime: 300000, // Cache for 5 minutes
  });
}

/**
 * Get system-wide metrics
 */
export function useSystemMetrics(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.system(params),
    queryFn: () => analyticsApi.getSystemMetrics(params),
    staleTime: 60000,
  });
}

/**
 * Get department-specific metrics
 */
export function useDepartmentMetrics(params?: {
  departmentIds?: string[];
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.departments(params),
    queryFn: () => analyticsApi.getDepartmentMetrics(params),
    staleTime: 300000,
  });
}

/**
 * Get provider-specific metrics
 */
export function useProviderMetrics(params?: {
  providerIds?: string[];
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.providers(params),
    queryFn: () => analyticsApi.getProviderMetrics(params),
    staleTime: 300000,
  });
}

/**
 * Get no-show trends
 */
export function useNoShowTrends(params: {
  startDate: string;
  endDate: string;
  departmentId?: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: analyticsKeys.noShowTrends(params),
    queryFn: () => analyticsApi.getNoShowTrends(params),
    staleTime: 300000,
  });
}

/**
 * Get utilization trends
 */
export function useUtilizationTrends(params: {
  startDate: string;
  endDate: string;
  providerId?: string;
  departmentId?: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: analyticsKeys.utilizationTrends(params),
    queryFn: () => analyticsApi.getUtilizationTrends(params),
    staleTime: 300000,
  });
}

/**
 * Get wait time trends
 */
export function useWaitTimeTrends(params: {
  startDate: string;
  endDate: string;
  departmentId?: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: analyticsKeys.waitTimeTrends(params),
    queryFn: () => analyticsApi.getWaitTimeTrends(params),
    staleTime: 300000,
  });
}

/**
 * Get real-time dashboard updates
 */
export function useRealTimeUpdates() {
  return useQuery({
    queryKey: analyticsKeys.realtime(),
    queryFn: () => analyticsApi.getRealTimeUpdates(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
}
