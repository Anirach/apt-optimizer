/**
 * Waitlist API service
 */

import { apiClient, extractData } from './client';
import { shouldUseMockApi, mockWaitlistApi } from '@/lib/mock/api';
import type {
  WaitlistEntry,
  CreateWaitlistEntryRequest,
  UpdateWaitlistEntryRequest,
  WaitlistMatchRequest,
  Appointment,
  PaginatedResponse,
} from '@/types';

export const waitlistApi = {
  /**
   * Get all waitlist entries with optional filters
   */
  async getWaitlist(params?: {
    departmentId?: string;
    providerId?: string;
    status?: string;
    priority?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<WaitlistEntry>> {
    if (shouldUseMockApi()) {
      // Mock API returns flat array, wrap in pagination structure
      const entries = await mockWaitlistApi.getWaitlist();
      return {
        data: entries,
        success: true,
        timestamp: new Date().toISOString(),
      } as PaginatedResponse<WaitlistEntry>;
    }
    return apiClient.get<WaitlistEntry[]>('/waitlist', params as Record<string, unknown>);
  },

  /**
   * Get a single waitlist entry by ID
   */
  async getWaitlistEntry(id: string): Promise<WaitlistEntry> {
    const response = await apiClient.get<WaitlistEntry>(`/waitlist/${id}`);
    return extractData(response);
  },

  /**
   * Create a new waitlist entry
   */
  async createWaitlistEntry(data: CreateWaitlistEntryRequest): Promise<WaitlistEntry> {
    const response = await apiClient.post<WaitlistEntry, CreateWaitlistEntryRequest>(
      '/waitlist',
      data
    );
    return extractData(response);
  },

  /**
   * Update a waitlist entry
   */
  async updateWaitlistEntry(
    id: string,
    data: UpdateWaitlistEntryRequest
  ): Promise<WaitlistEntry> {
    const response = await apiClient.patch<WaitlistEntry, UpdateWaitlistEntryRequest>(
      `/waitlist/${id}`,
      data
    );
    return extractData(response);
  },

  /**
   * Cancel/remove a waitlist entry
   */
  async cancelWaitlistEntry(id: string, reason?: string): Promise<void> {
    await apiClient.post(`/waitlist/${id}/cancel`, { reason });
  },

  /**
   * Match a waitlist entry to an available slot
   */
  async matchWaitlistEntry(data: WaitlistMatchRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment, WaitlistMatchRequest>(
      '/waitlist/match',
      data
    );
    return extractData(response);
  },

  /**
   * Get waitlist entries for a specific patient
   */
  async getPatientWaitlist(patientId: string): Promise<WaitlistEntry[]> {
    const response = await apiClient.get<WaitlistEntry[]>('/waitlist', {
      patientId,
      status: 'active',
    });
    return extractData(response);
  },

  /**
   * Get waitlist statistics
   */
  async getWaitlistStats(params?: {
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    byPriority: Record<string, number>;
    byDepartment: Record<string, number>;
    averageWaitDays: number;
    conversionRate: number;
  }> {
    const response = await apiClient.get<{
      total: number;
      byPriority: Record<string, number>;
      byDepartment: Record<string, number>;
      averageWaitDays: number;
      conversionRate: number;
    }>('/waitlist/stats', params as Record<string, unknown>);
    return extractData(response);
  },

  /**
   * Notify waitlist entry about available slot
   */
  async notifyWaitlistEntry(id: string, timeSlotId: string): Promise<void> {
    await apiClient.post(`/waitlist/${id}/notify`, { timeSlotId });
  },

  /**
   * Get high priority waitlist entries
   */
  async getHighPriorityWaitlist(): Promise<WaitlistEntry[]> {
    const response = await apiClient.get<WaitlistEntry[]>('/waitlist', {
      priority: ['high', 'urgent'],
      status: 'active',
    });
    return extractData(response);
  },
};
