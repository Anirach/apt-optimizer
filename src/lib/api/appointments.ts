/**
 * Appointments API service
 */

import { apiClient, extractData } from './client';
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  RescheduleAppointmentRequest,
  CancelAppointmentRequest,
  SearchAppointmentsRequest,
  AppointmentListResponse,
  PaginatedResponse,
} from '@/types';

export const appointmentsApi = {
  /**
   * Get all appointments with optional filters
   */
  async getAppointments(
    params?: SearchAppointmentsRequest
  ): Promise<PaginatedResponse<Appointment>> {
    return apiClient.get<Appointment[]>('/appointments', params as Record<string, unknown>);
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return extractData(response);
  },

  /**
   * Create a new appointment
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment, CreateAppointmentRequest>(
      '/appointments',
      data
    );
    return extractData(response);
  },

  /**
   * Update an appointment
   */
  async updateAppointment(
    id: string,
    data: UpdateAppointmentRequest
  ): Promise<Appointment> {
    const response = await apiClient.patch<Appointment, UpdateAppointmentRequest>(
      `/appointments/${id}`,
      data
    );
    return extractData(response);
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    id: string,
    data: RescheduleAppointmentRequest
  ): Promise<Appointment> {
    const response = await apiClient.post<Appointment, RescheduleAppointmentRequest>(
      `/appointments/${id}/reschedule`,
      data
    );
    return extractData(response);
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: string, data: CancelAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment, CancelAppointmentRequest>(
      `/appointments/${id}/cancel`,
      data
    );
    return extractData(response);
  },

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },

  /**
   * Get appointments for a specific patient
   */
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/appointments', {
      patientId,
    });
    return extractData(response);
  },

  /**
   * Get appointments for a specific provider
   */
  async getProviderAppointments(providerId: string): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/appointments', {
      providerId,
    });
    return extractData(response);
  },

  /**
   * Get today's appointments
   */
  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<Appointment[]>('/appointments', {
      startDate: today,
      endDate: today,
    });
    return extractData(response);
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(days: number = 7): Promise<Appointment[]> {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + days);

    const response = await apiClient.get<Appointment[]>('/appointments', {
      startDate: today.toISOString(),
      endDate: future.toISOString(),
      status: ['scheduled', 'confirmed'],
    });
    return extractData(response);
  },

  /**
   * Check in a patient for their appointment
   */
  async checkIn(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/check-in`);
    return extractData(response);
  },

  /**
   * Mark appointment as completed
   */
  async complete(id: string, providerNotes?: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment, { providerNotes?: string }>(
      `/appointments/${id}/complete`,
      { providerNotes }
    );
    return extractData(response);
  },

  /**
   * Mark appointment as no-show
   */
  async markNoShow(id: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${id}/no-show`);
    return extractData(response);
  },

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    providerId?: string;
  }): Promise<AppointmentListResponse> {
    const response = await apiClient.get<AppointmentListResponse>(
      '/appointments/stats',
      params as Record<string, unknown>
    );
    return extractData(response);
  },
};
