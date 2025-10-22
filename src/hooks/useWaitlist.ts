/**
 * TanStack Query hooks for waitlist
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waitlistApi } from '@/lib/api';
import type {
  CreateWaitlistEntryRequest,
  UpdateWaitlistEntryRequest,
  WaitlistMatchRequest,
} from '@/types';

// Query keys
export const waitlistKeys = {
  all: ['waitlist'] as const,
  lists: () => [...waitlistKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...waitlistKeys.lists(), filters] as const,
  details: () => [...waitlistKeys.all, 'detail'] as const,
  detail: (id: string) => [...waitlistKeys.details(), id] as const,
  patient: (patientId: string) => [...waitlistKeys.all, 'patient', patientId] as const,
  stats: (filters?: Record<string, unknown>) => [...waitlistKeys.all, 'stats', filters] as const,
  highPriority: () => [...waitlistKeys.all, 'high-priority'] as const,
};

/**
 * Get waitlist entries with optional filters
 */
export function useWaitlist(filters?: {
  departmentId?: string;
  providerId?: string;
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: waitlistKeys.list(filters),
    queryFn: () => waitlistApi.getWaitlist(filters),
  });
}

/**
 * Get a single waitlist entry by ID
 */
export function useWaitlistEntry(id: string) {
  return useQuery({
    queryKey: waitlistKeys.detail(id),
    queryFn: () => waitlistApi.getWaitlistEntry(id),
    enabled: !!id,
  });
}

/**
 * Get patient's waitlist entries
 */
export function usePatientWaitlist(patientId: string) {
  return useQuery({
    queryKey: waitlistKeys.patient(patientId),
    queryFn: () => waitlistApi.getPatientWaitlist(patientId),
    enabled: !!patientId,
  });
}

/**
 * Get waitlist statistics
 */
export function useWaitlistStats(filters?: {
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: waitlistKeys.stats(filters),
    queryFn: () => waitlistApi.getWaitlistStats(filters),
  });
}

/**
 * Get high priority waitlist entries
 */
export function useHighPriorityWaitlist() {
  return useQuery({
    queryKey: waitlistKeys.highPriority(),
    queryFn: () => waitlistApi.getHighPriorityWaitlist(),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Create a new waitlist entry
 */
export function useCreateWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWaitlistEntryRequest) => waitlistApi.createWaitlistEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.stats() });
    },
  });
}

/**
 * Update a waitlist entry
 */
export function useUpdateWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWaitlistEntryRequest }) =>
      waitlistApi.updateWaitlistEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
    },
  });
}

/**
 * Cancel a waitlist entry
 */
export function useCancelWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      waitlistApi.cancelWaitlistEntry(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.stats() });
    },
  });
}

/**
 * Match a waitlist entry to a slot
 */
export function useMatchWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaitlistMatchRequest) => waitlistApi.matchWaitlistEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.stats() });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Notify waitlist entry about available slot
 */
export function useNotifyWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, timeSlotId }: { id: string; timeSlotId: string }) =>
      waitlistApi.notifyWaitlistEntry(id, timeSlotId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.detail(variables.id) });
    },
  });
}
