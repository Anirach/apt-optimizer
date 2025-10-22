/**
 * TanStack Query hooks for appointments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  RescheduleAppointmentRequest,
  CancelAppointmentRequest,
  SearchAppointmentsRequest,
} from '@/types';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: SearchAppointmentsRequest) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  today: () => [...appointmentKeys.all, 'today'] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
  patient: (patientId: string) => [...appointmentKeys.all, 'patient', patientId] as const,
  provider: (providerId: string) => [...appointmentKeys.all, 'provider', providerId] as const,
  stats: (filters?: Record<string, unknown>) => [...appointmentKeys.all, 'stats', filters] as const,
};

/**
 * Get appointments with optional filters
 */
export function useAppointments(filters?: SearchAppointmentsRequest) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentsApi.getAppointments(filters),
  });
}

/**
 * Get a single appointment by ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsApi.getAppointment(id),
    enabled: !!id,
  });
}

/**
 * Get today's appointments
 */
export function useTodayAppointments() {
  return useQuery({
    queryKey: appointmentKeys.today(),
    queryFn: () => appointmentsApi.getTodayAppointments(),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get upcoming appointments
 */
export function useUpcomingAppointments(days: number = 7) {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: () => appointmentsApi.getUpcomingAppointments(days),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Get patient's appointments
 */
export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: appointmentKeys.patient(patientId),
    queryFn: () => appointmentsApi.getPatientAppointments(patientId),
    enabled: !!patientId,
  });
}

/**
 * Get provider's appointments
 */
export function useProviderAppointments(providerId: string) {
  return useQuery({
    queryKey: appointmentKeys.provider(providerId),
    queryFn: () => appointmentsApi.getProviderAppointments(providerId),
    enabled: !!providerId,
  });
}

/**
 * Get appointment statistics
 */
export function useAppointmentStats(filters?: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  providerId?: string;
}) {
  return useQuery({
    queryKey: appointmentKeys.stats(filters),
    queryFn: () => appointmentsApi.getAppointmentStats(filters),
  });
}

/**
 * Create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsApi.createAppointment(data),
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.today() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
  });
}

/**
 * Update an appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsApi.updateAppointment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific appointment and lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Reschedule an appointment
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleAppointmentRequest }) =>
      appointmentsApi.rescheduleAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelAppointmentRequest }) =>
      appointmentsApi.cancelAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Delete an appointment
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Check in a patient
 */
export function useCheckInAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.checkIn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Complete an appointment
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, providerNotes }: { id: string; providerNotes?: string }) =>
      appointmentsApi.complete(id, providerNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Mark appointment as no-show
 */
export function useMarkNoShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.markNoShow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats() });
    },
  });
}
