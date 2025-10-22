/**
 * TanStack Query hooks for time slots and availability
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slotsApi } from '@/lib/api';
import type { SearchAvailableSlotsRequest, CalendarViewRequest } from '@/types';

// Query keys
export const slotsKeys = {
  all: ['slots'] as const,
  available: (params: SearchAvailableSlotsRequest) => [...slotsKeys.all, 'available', params] as const,
  calendar: (params: CalendarViewRequest) => [...slotsKeys.all, 'calendar', params] as const,
  detail: (id: string) => [...slotsKeys.all, 'detail', id] as const,
  nextAvailable: (params: Record<string, unknown>) => [...slotsKeys.all, 'next-available', params] as const,
  stats: (params: Record<string, unknown>) => [...slotsKeys.all, 'stats', params] as const,
};

/**
 * Search for available time slots
 */
export function useAvailableSlots(params: SearchAvailableSlotsRequest) {
  return useQuery({
    queryKey: slotsKeys.available(params),
    queryFn: () => slotsApi.searchAvailableSlots(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Get calendar view with appointments
 */
export function useCalendarView(params: CalendarViewRequest) {
  return useQuery({
    queryKey: slotsKeys.calendar(params),
    queryFn: () => slotsApi.getCalendarView(params),
    enabled: !!params.startDate && !!params.endDate,
    refetchInterval: 60000, // Refetch every minute for live updates
  });
}

/**
 * Get a specific time slot
 */
export function useTimeSlot(id: string) {
  return useQuery({
    queryKey: slotsKeys.detail(id),
    queryFn: () => slotsApi.getTimeSlot(id),
    enabled: !!id,
  });
}

/**
 * Get next available slot for a provider/department
 */
export function useNextAvailableSlot(params: {
  providerId?: string;
  departmentId?: string;
  afterDate?: string;
}) {
  return useQuery({
    queryKey: slotsKeys.nextAvailable(params),
    queryFn: () => slotsApi.getNextAvailableSlot(params),
    enabled: !!(params.providerId || params.departmentId),
  });
}

/**
 * Get slot availability statistics
 */
export function useSlotStats(params: {
  startDate: string;
  endDate: string;
  providerId?: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: slotsKeys.stats(params),
    queryFn: () => slotsApi.getSlotStats(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}

/**
 * Create a new time slot
 */
export function useCreateTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      providerId: string;
      departmentId: string;
      locationId: string;
      startTime: string;
      endTime: string;
      duration: number;
      capacity?: number;
      isRecurring?: boolean;
      recurringPattern?: unknown;
    }) => slotsApi.createTimeSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotsKeys.all });
    },
  });
}

/**
 * Update a time slot
 */
export function useUpdateTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: Partial<{
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        capacity: number;
      }>;
    }) => slotsApi.updateTimeSlot(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: slotsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: slotsKeys.all });
    },
  });
}

/**
 * Delete a time slot
 */
export function useDeleteTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slotsApi.deleteTimeSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotsKeys.all });
    },
  });
}

/**
 * Block a time slot
 */
export function useBlockTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      slotsApi.blockTimeSlot(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: slotsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: slotsKeys.all });
    },
  });
}

/**
 * Unblock a time slot
 */
export function useUnblockTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slotsApi.unblockTimeSlot(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: slotsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: slotsKeys.all });
    },
  });
}

/**
 * Bulk create recurring slots
 */
export function useCreateRecurringSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      providerId: string;
      departmentId: string;
      locationId: string;
      startTime: string;
      endTime: string;
      duration: number;
      daysOfWeek: number[];
      startDate: string;
      endDate: string;
      exceptions?: string[];
    }) => slotsApi.createRecurringSlots(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotsKeys.all });
    },
  });
}
