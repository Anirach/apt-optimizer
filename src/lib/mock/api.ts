/**
 * Mock API service for development
 * This simulates API calls with mock data until the backend is ready
 */

import type {
  Appointment,
  WaitlistEntry,
  DashboardAnalyticsResponse,
  AvailableSlotsResponse,
  CalendarResponse,
  CalendarViewRequest,
  SearchAvailableSlotsRequest,
  NoShowRisk,
} from '@/types';
import {
  mockAppointments,
  mockWaitlist,
  mockTimeSlots,
  mockProviders,
  mockDepartments,
  mockLocations,
  getPatientName,
  getProviderName,
} from './data';

/**
 * Simulate network delay
 */
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock Appointments API
 */
export const mockAppointmentsApi = {
  async getTodayAppointments(): Promise<Appointment[]> {
    await delay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return mockAppointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledStart);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });
  },

  async getUpcomingAppointments(days: number = 7): Promise<Appointment[]> {
    await delay();
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return mockAppointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledStart);
      return aptDate >= now && aptDate <= future;
    });
  },

  async getAppointment(id: string): Promise<Appointment> {
    await delay();
    const appointment = mockAppointments.find((apt) => apt.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  },
};

/**
 * Mock Waitlist API
 */
export const mockWaitlistApi = {
  async getWaitlist(): Promise<WaitlistEntry[]> {
    await delay();
    return mockWaitlist.filter((entry) => entry.status === 'active');
  },

  async getWaitlistEntry(id: string): Promise<WaitlistEntry> {
    await delay();
    const entry = mockWaitlist.find((w) => w.id === id);
    if (!entry) {
      throw new Error('Waitlist entry not found');
    }
    return entry;
  },

  async getWaitlistStats() {
    await delay();
    const activeEntries = mockWaitlist.filter((w) => w.status === 'active');
    const highPriority = activeEntries.filter((w) => w.priority === 'high' || w.priority === 'urgent').length;
    const mediumPriority = activeEntries.filter((w) => w.priority === 'medium').length;
    const lowPriority = activeEntries.filter((w) => w.priority === 'low').length;

    // Calculate average wait days
    const now = new Date();
    const totalWaitDays = activeEntries.reduce((sum, entry) => {
      const daysDiff = Math.floor((now.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);
    const averageWaitDays = activeEntries.length > 0 ? Math.round(totalWaitDays / activeEntries.length) : 0;

    return {
      total: activeEntries.length,
      byPriority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      byDepartment: {},
      averageWaitDays,
      conversionRate: 0.65, // 65% mock conversion rate
    };
  },
};

/**
 * Mock Analytics API
 */
export const mockAnalyticsApi = {
  async getDashboardAnalytics(): Promise<DashboardAnalyticsResponse> {
    await delay();

    const todayAppointments = await mockAppointmentsApi.getTodayAppointments();
    const waitlistStats = await mockWaitlistApi.getWaitlistStats();

    return {
      kpis: {
        noShowRate: 12.3,
        noShowRateChange: -23,
        averageWaitTime: 4.2,
        averageWaitTimeChange: -35,
        utilization: 87,
        utilizationChange: 18,
        activePatients: 1247,
        activePatientsChange: 12,
      },
      upcomingAppointments: todayAppointments.slice(0, 10).map((apt) => ({
        id: apt.id,
        patientName: apt.patient ? getPatientName(apt.patient) : 'Unknown',
        time: apt.scheduledStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: apt.department?.name || 'Unknown',
        department: apt.department?.name || 'Unknown',
        risk: apt.noShowRisk || 'low',
      })),
      waitlistSummary: {
        total: waitlistStats.total,
        high: waitlistStats.byPriority.high,
        medium: waitlistStats.byPriority.medium,
        low: waitlistStats.byPriority.low,
        averageWaitDays: waitlistStats.averageWaitDays,
      },
      recentActivity: [
        {
          id: '1',
          type: 'appointment_created',
          description: 'New appointment booked for Sarah Chen',
          timestamp: new Date().toISOString(),
        },
      ],
    };
  },
};

/**
 * Mock Slots API
 */
export const mockSlotsApi = {
  async searchAvailableSlots(params: SearchAvailableSlotsRequest): Promise<AvailableSlotsResponse> {
    await delay();

    const availableSlots = mockTimeSlots
      .filter((slot) => slot.isAvailable)
      .map((slot) => {
        const provider = mockProviders.find((p) => p.id === slot.providerId);
        const department = mockDepartments.find((d) => d.id === slot.departmentId);
        const location = mockLocations.find((l) => l.id === slot.locationId);

        return {
          timeSlotId: slot.id,
          providerId: slot.providerId,
          providerName: provider ? getProviderName(provider) : 'Unknown',
          providerTitle: provider?.title || 'Dr.',
          departmentId: slot.departmentId,
          departmentName: department?.name || 'Unknown',
          locationId: slot.locationId,
          locationName: location?.name || 'Unknown',
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          duration: slot.duration,
          availableCapacity: slot.capacity,
        };
      });

    return {
      slots: availableSlots,
      totalSlots: availableSlots.length,
    };
  },

  async getCalendarView(params: CalendarViewRequest): Promise<CalendarResponse> {
    await delay();

    const events = mockAppointments.map((apt) => {
      const provider = apt.provider || mockProviders.find((p) => p.id === apt.providerId);

      return {
        id: `event-${apt.id}`,
        appointmentId: apt.id,
        title: apt.patient ? getPatientName(apt.patient) : 'Unknown Patient',
        startTime: apt.scheduledStart.toISOString(),
        endTime: apt.scheduledEnd.toISOString(),
        type: 'appointment' as const,
        status: apt.status,
        patientName: apt.patient ? getPatientName(apt.patient) : undefined,
        providerId: apt.providerId,
        providerName: provider ? getProviderName(provider) : 'Unknown',
        departmentName: apt.department?.name || 'Unknown',
        locationName: apt.location?.name || 'Unknown',
        risk: apt.noShowRisk,
        color: getRiskColor(apt.noShowRisk),
      };
    });

    return {
      events,
      providers: mockProviders.map((p, idx) => ({
        id: p.id,
        name: getProviderName(p),
        color: getProviderColor(idx),
      })),
      summary: {
        totalAppointments: mockAppointments.length,
        availableSlots: mockTimeSlots.filter((s) => s.isAvailable).length,
        utilization: 87,
      },
    };
  },
};

/**
 * Helper functions
 */
function getRiskColor(risk?: NoShowRisk): string {
  switch (risk) {
    case 'high':
      return '#ef4444'; // red
    case 'medium':
      return '#f97316'; // orange
    case 'low':
    default:
      return '#22c55e'; // green
  }
}

function getProviderColor(index: number): string {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];
  return colors[index % colors.length];
}

/**
 * Check if mock API should be used
 */
export function shouldUseMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_BASE_URL;
}

/**
 * Export all mock APIs
 */
export const mockApi = {
  appointments: mockAppointmentsApi,
  waitlist: mockWaitlistApi,
  analytics: mockAnalyticsApi,
  slots: mockSlotsApi,
};
