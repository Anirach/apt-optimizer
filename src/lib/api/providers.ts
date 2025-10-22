/**
 * Providers API service
 */

import { apiClient, extractData } from './client';
import type {
  Provider,
  SearchProvidersRequest,
  ProviderWithAvailability,
  PaginatedResponse,
} from '@/types';

export const providersApi = {
  /**
   * Get all providers with filters
   */
  async getProviders(params?: SearchProvidersRequest): Promise<PaginatedResponse<Provider>> {
    return apiClient.get<Provider[]>('/providers', params as Record<string, unknown>);
  },

  /**
   * Get a single provider by ID
   */
  async getProvider(id: string): Promise<Provider> {
    const response = await apiClient.get<Provider>(`/providers/${id}`);
    return extractData(response);
  },

  /**
   * Get provider with availability information
   */
  async getProviderWithAvailability(id: string): Promise<ProviderWithAvailability> {
    const response = await apiClient.get<ProviderWithAvailability>(
      `/providers/${id}/availability`
    );
    return extractData(response);
  },

  /**
   * Get providers by department
   */
  async getProvidersByDepartment(departmentId: string): Promise<Provider[]> {
    const response = await apiClient.get<Provider[]>('/providers', {
      departmentId,
      isActive: true,
    });
    return extractData(response);
  },

  /**
   * Get providers by specialty
   */
  async getProvidersBySpecialty(specialty: string): Promise<Provider[]> {
    const response = await apiClient.get<Provider[]>('/providers', {
      specialties: [specialty],
      isActive: true,
    });
    return extractData(response);
  },

  /**
   * Get provider schedule for a date range
   */
  async getProviderSchedule(
    id: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    date: string;
    slots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      appointmentId?: string;
    }>;
  }>> {
    const response = await apiClient.get<Array<{
      date: string;
      slots: Array<{
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        appointmentId?: string;
      }>;
    }>>(`/providers/${id}/schedule`, { startDate, endDate });
    return extractData(response);
  },

  /**
   * Update provider availability
   */
  async updateProviderAvailability(
    id: string,
    data: {
      isActive: boolean;
      reason?: string;
    }
  ): Promise<Provider> {
    const response = await apiClient.patch<Provider>(`/providers/${id}/availability`, data);
    return extractData(response);
  },

  /**
   * Get provider performance metrics
   */
  async getProviderPerformance(
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    noShows: number;
    averageDuration: number;
    utilizationRate: number;
    patientSatisfaction?: number;
  }> {
    const response = await apiClient.get<{
      totalAppointments: number;
      completedAppointments: number;
      noShows: number;
      averageDuration: number;
      utilizationRate: number;
      patientSatisfaction?: number;
    }>(`/providers/${id}/performance`, { startDate, endDate } as Record<string, unknown>);
    return extractData(response);
  },
};
