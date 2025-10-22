/**
 * Patients API service
 */

import { apiClient, extractData } from './client';
import type {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  SearchPatientsRequest,
  PaginatedResponse,
} from '@/types';

export const patientsApi = {
  /**
   * Search/get patients with filters
   */
  async getPatients(params?: SearchPatientsRequest): Promise<PaginatedResponse<Patient>> {
    return apiClient.get<Patient[]>('/patients', params as Record<string, unknown>);
  },

  /**
   * Get a single patient by ID
   */
  async getPatient(id: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return extractData(response);
  },

  /**
   * Create a new patient
   */
  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    const response = await apiClient.post<Patient, CreatePatientRequest>('/patients', data);
    return extractData(response);
  },

  /**
   * Update a patient
   */
  async updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient> {
    const response = await apiClient.patch<Patient, UpdatePatientRequest>(
      `/patients/${id}`,
      data
    );
    return extractData(response);
  },

  /**
   * Delete a patient
   */
  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },

  /**
   * Get patient appointment history
   */
  async getPatientHistory(id: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShows: number;
    noShowRate: number;
    lastVisit?: Date;
    nextAppointment?: Date;
  }> {
    const response = await apiClient.get<{
      totalAppointments: number;
      completedAppointments: number;
      cancelledAppointments: number;
      noShows: number;
      noShowRate: number;
      lastVisit?: Date;
      nextAppointment?: Date;
    }>(`/patients/${id}/history`);
    return extractData(response);
  },

  /**
   * Update PDPA consent
   */
  async updatePDPAConsent(id: string, consent: boolean): Promise<Patient> {
    const response = await apiClient.patch<Patient>(`/patients/${id}/pdpa-consent`, {
      pdpaConsent: consent,
      pdpaConsentDate: new Date().toISOString(),
    });
    return extractData(response);
  },

  /**
   * Export patient data (PDPA compliance)
   */
  async exportPatientData(id: string): Promise<Blob> {
    const response = await fetch(`/api/patients/${id}/export`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export patient data');
    }

    return response.blob();
  },

  /**
   * Search patients by name, phone, or national ID
   */
  async searchPatients(query: string): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/patients/search', { query });
    return extractData(response);
  },
};
