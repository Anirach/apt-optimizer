/**
 * Analytics API service
 */

import { apiClient, extractData } from './client';
import type {
  DashboardAnalyticsResponse,
  DetailedAnalyticsResponse,
  AnalyticsRequest,
  SystemMetrics,
  DepartmentMetrics,
  ProviderMetrics,
} from '@/types';

export const analyticsApi = {
  /**
   * Get dashboard analytics (KPIs, upcoming appointments, waitlist summary)
   */
  async getDashboardAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardAnalyticsResponse> {
    const response = await apiClient.get<DashboardAnalyticsResponse>(
      '/analytics/dashboard',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get detailed analytics with trends
   */
  async getDetailedAnalytics(params: AnalyticsRequest): Promise<DetailedAnalyticsResponse> {
    const response = await apiClient.get<DetailedAnalyticsResponse>(
      '/analytics/detailed',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get system-wide metrics
   */
  async getSystemMetrics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<SystemMetrics> {
    const response = await apiClient.get<SystemMetrics>(
      '/analytics/system',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get department-specific metrics
   */
  async getDepartmentMetrics(params?: {
    departmentIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<DepartmentMetrics[]> {
    const response = await apiClient.get<DepartmentMetrics[]>(
      '/analytics/departments',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get provider-specific metrics
   */
  async getProviderMetrics(params?: {
    providerIds?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<ProviderMetrics[]> {
    const response = await apiClient.get<ProviderMetrics[]>(
      '/analytics/providers',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get no-show trends
   */
  async getNoShowTrends(params: {
    startDate: string;
    endDate: string;
    departmentId?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<Array<{ date: string; rate: number; count: number }>> {
    const response = await apiClient.get<Array<{ date: string; rate: number; count: number }>>(
      '/analytics/no-show-trends',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get utilization trends
   */
  async getUtilizationTrends(params: {
    startDate: string;
    endDate: string;
    providerId?: string;
    departmentId?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<Array<{ date: string; rate: number }>> {
    const response = await apiClient.get<Array<{ date: string; rate: number }>>(
      '/analytics/utilization-trends',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get wait time trends
   */
  async getWaitTimeTrends(params: {
    startDate: string;
    endDate: string;
    departmentId?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<Array<{ date: string; days: number }>> {
    const response = await apiClient.get<Array<{ date: string; days: number }>>(
      '/analytics/wait-time-trends',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Export analytics report
   */
  async exportReport(params: {
    startDate: string;
    endDate: string;
    format: 'csv' | 'pdf' | 'xlsx';
    includeCharts?: boolean;
  }): Promise<Blob> {
    // Note: This returns a Blob, not JSON
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const response = await fetch(`/analytics/export?${queryString}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    return response.blob();
  },

  /**
   * Get real-time dashboard updates
   */
  async getRealTimeUpdates(): Promise<{
    activeAppointments: number;
    patientsWaiting: number;
    providersAvailable: number;
    urgentWaitlist: number;
  }> {
    const response = await apiClient.get<{
      activeAppointments: number;
      patientsWaiting: number;
      providersAvailable: number;
      urgentWaitlist: number;
    }>('/analytics/realtime');
    return extractData(response);
  },
};
