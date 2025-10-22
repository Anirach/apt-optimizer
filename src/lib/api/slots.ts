/**
 * Time Slots & Availability API service
 */

import { apiClient, extractData } from './client';
import type {
  TimeSlot,
  SearchAvailableSlotsRequest,
  AvailableSlotsResponse,
  CalendarViewRequest,
  CalendarResponse,
} from '@/types';

export const slotsApi = {
  /**
   * Search for available time slots
   */
  async searchAvailableSlots(
    params: SearchAvailableSlotsRequest
  ): Promise<AvailableSlotsResponse> {
    const response = await apiClient.get<AvailableSlotsResponse>(
      '/slots/available',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get all time slots (including booked ones)
   */
  async getTimeSlots(params?: {
    providerId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeSlot[]> {
    const response = await apiClient.get<TimeSlot[]>(
      '/slots',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get a specific time slot
   */
  async getTimeSlot(id: string): Promise<TimeSlot> {
    const response = await apiClient.get<TimeSlot>(`/slots/${id}`);
    return extractData(response);
  },

  /**
   * Create a new time slot
   */
  async createTimeSlot(data: {
    providerId: string;
    departmentId: string;
    locationId: string;
    startTime: string;
    endTime: string;
    duration: number;
    capacity?: number;
    isRecurring?: boolean;
    recurringPattern?: unknown;
  }): Promise<TimeSlot> {
    const response = await apiClient.post<TimeSlot>(
      '/slots',
      data
    );
    return extractData(response);
  },

  /**
   * Update a time slot
   */
  async updateTimeSlot(
    id: string,
    data: Partial<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      capacity: number;
    }>
  ): Promise<TimeSlot> {
    const response = await apiClient.patch<TimeSlot>(
      `/slots/${id}`,
      data
    );
    return extractData(response);
  },

  /**
   * Delete a time slot
   */
  async deleteTimeSlot(id: string): Promise<void> {
    await apiClient.delete(`/slots/${id}`);
  },

  /**
   * Block a time slot (make unavailable)
   */
  async blockTimeSlot(id: string, reason?: string): Promise<TimeSlot> {
    const response = await apiClient.post<TimeSlot>(
      `/slots/${id}/block`,
      { reason }
    );
    return extractData(response);
  },

  /**
   * Unblock a time slot
   */
  async unblockTimeSlot(id: string): Promise<TimeSlot> {
    const response = await apiClient.post<TimeSlot>(
      `/slots/${id}/unblock`
    );
    return extractData(response);
  },

  /**
   * Get calendar view with appointments
   */
  async getCalendarView(params: CalendarViewRequest): Promise<CalendarResponse> {
    const response = await apiClient.get<CalendarResponse>(
      '/slots/calendar',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Get next available slot for a provider
   */
  async getNextAvailableSlot(params: {
    providerId?: string;
    departmentId?: string;
    afterDate?: string;
  }): Promise<TimeSlot | null> {
    const response = await apiClient.get<TimeSlot | null>(
      '/slots/next-available',
      params as Record<string, unknown>
    );
    return extractData(response);
  },

  /**
   * Bulk create recurring slots
   */
  async createRecurringSlots(data: {
    providerId: string;
    departmentId: string;
    locationId: string;
    startTime: string; // time of day, e.g., "09:00"
    endTime: string;
    duration: number;
    daysOfWeek: number[];
    startDate: string;
    endDate: string;
    exceptions?: string[];
  }): Promise<TimeSlot[]> {
    const response = await apiClient.post<TimeSlot[]>(
      '/slots/recurring',
      data
    );
    return extractData(response);
  },

  /**
   * Get slot availability statistics
   */
  async getSlotStats(params: {
    startDate: string;
    endDate: string;
    providerId?: string;
    departmentId?: string;
  }): Promise<{
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    utilizationRate: number;
  }> {
    const response = await apiClient.get<{
      totalSlots: number;
      availableSlots: number;
      bookedSlots: number;
      utilizationRate: number;
    }>('/slots/stats', params as Record<string, unknown>);
    return extractData(response);
  },
};
