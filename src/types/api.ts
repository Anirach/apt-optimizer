/**
 * API request and response types for the PAAS platform
 */

import type {
  Appointment,
  Patient,
  Provider,
  Department,
  WaitlistEntry,
  TimeSlot,
  SystemMetrics,
  DepartmentMetrics,
  ProviderMetrics,
  NoShowRisk,
  AppointmentStatus,
  WaitlistPriority,
} from './models';

// ============================================================================
// Generic API Response
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
}

// ============================================================================
// Authentication
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'patient' | 'staff';
}

// ============================================================================
// Appointments
// ============================================================================

export interface CreateAppointmentRequest {
  patientId: string;
  providerId: string;
  departmentId: string;
  timeSlotId: string;
  locationId: string;
  scheduledStart: string; // ISO date string
  scheduledEnd: string;
  appointmentType: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
  timeSlotId?: string;
  reason?: string;
  notes?: string;
  providerNotes?: string;
}

export interface RescheduleAppointmentRequest {
  newTimeSlotId: string;
  newScheduledStart: string;
  newScheduledEnd: string;
  reason?: string;
}

export interface CancelAppointmentRequest {
  reason: string;
  cancelledBy: string; // user id
}

export interface SearchAppointmentsRequest {
  patientId?: string;
  providerId?: string;
  departmentId?: string;
  status?: AppointmentStatus[];
  startDate?: string;
  endDate?: string;
  noShowRisk?: NoShowRisk[];
  page?: number;
  pageSize?: number;
  sortBy?: 'scheduledStart' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  summary: {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

// ============================================================================
// Time Slots & Availability
// ============================================================================

export interface SearchAvailableSlotsRequest {
  providerId?: string;
  departmentId?: string;
  locationId?: string;
  startDate: string;
  endDate: string;
  duration?: number; // minutes
}

export interface AvailableSlot {
  timeSlotId: string;
  providerId: string;
  providerName: string;
  providerTitle: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  startTime: string;
  endTime: string;
  duration: number;
  availableCapacity: number;
}

export interface AvailableSlotsResponse {
  slots: AvailableSlot[];
  totalSlots: number;
}

// ============================================================================
// Waitlist
// ============================================================================

export interface CreateWaitlistEntryRequest {
  patientId: string;
  departmentId: string;
  providerId?: string;
  preferredDates?: string[];
  preferredTimeOfDay?: ('morning' | 'afternoon' | 'evening')[];
  priority: WaitlistPriority;
  medicalUrgency?: string;
  notes?: string;
}

export interface UpdateWaitlistEntryRequest {
  priority?: WaitlistPriority;
  status?: 'active' | 'contacted' | 'converted' | 'expired' | 'cancelled';
  preferredDates?: string[];
  preferredTimeOfDay?: ('morning' | 'afternoon' | 'evening')[];
  notes?: string;
}

export interface WaitlistMatchRequest {
  waitlistEntryId: string;
  timeSlotId: string;
  expiresInHours?: number; // how long the offer is valid
}

// ============================================================================
// Patients
// ============================================================================

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone: string;
  email?: string;
  nationalId?: string;
  address?: {
    street: string;
    subdistrict?: string;
    district?: string;
    province: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  pdpaConsent: boolean;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: CreatePatientRequest['address'];
  emergencyContact?: CreatePatientRequest['emergencyContact'];
}

export interface SearchPatientsRequest {
  query?: string; // search by name, phone, or national ID
  dateOfBirth?: string;
  phone?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Providers
// ============================================================================

export interface SearchProvidersRequest {
  departmentId?: string;
  specialties?: string[];
  isActive?: boolean;
  query?: string; // search by name
  page?: number;
  pageSize?: number;
}

export interface ProviderWithAvailability extends Provider {
  nextAvailableSlot?: Date;
  availableSlotsThisWeek: number;
  averageWaitTime: number; // days
}

// ============================================================================
// Analytics
// ============================================================================

export interface AnalyticsRequest {
  startDate: string;
  endDate: string;
  departmentIds?: string[];
  providerIds?: string[];
  granularity?: 'day' | 'week' | 'month';
}

export interface DashboardAnalyticsResponse {
  kpis: {
    noShowRate: number;
    noShowRateChange: number;
    averageWaitTime: number; // days
    averageWaitTimeChange: number;
    utilization: number; // percentage
    utilizationChange: number;
    activePatients: number;
    activePatientsChange: number;
  };
  upcomingAppointments: Array<{
    id: string;
    patientName: string;
    time: string;
    type: string;
    department: string;
    risk: NoShowRisk;
  }>;
  waitlistSummary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    averageWaitDays: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'appointment_created' | 'appointment_cancelled' | 'patient_checked_in' | 'no_show';
    description: string;
    timestamp: string;
  }>;
}

export interface DetailedAnalyticsResponse {
  systemMetrics: SystemMetrics;
  departmentMetrics: DepartmentMetrics[];
  providerMetrics: ProviderMetrics[];
  trends: {
    appointments: Array<{
      date: string;
      scheduled: number;
      completed: number;
      cancelled: number;
      noShows: number;
    }>;
    noShowRate: Array<{
      date: string;
      rate: number;
    }>;
    utilization: Array<{
      date: string;
      rate: number;
    }>;
    waitTime: Array<{
      date: string;
      days: number;
    }>;
  };
}

// ============================================================================
// Notifications
// ============================================================================

export interface SendNotificationRequest {
  recipientId: string;
  channel: 'sms' | 'email' | 'line';
  type: string;
  appointmentId?: string;
  subject?: string;
  message: string;
  scheduledFor?: string; // ISO date, default: now
}

export interface NotificationPreferencesRequest {
  patientId: string;
  preferences: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    lineEnabled: boolean;
    reminderHoursBefore: number[];
  };
}

// ============================================================================
// Calendar
// ============================================================================

export interface CalendarViewRequest {
  providerId?: string;
  departmentId?: string;
  locationId?: string;
  startDate: string;
  endDate: string;
  view: 'day' | 'week' | 'month';
}

export interface CalendarEvent {
  id: string;
  appointmentId?: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'appointment' | 'blocked' | 'break';
  status?: AppointmentStatus;
  patientName?: string;
  providerId: string;
  providerName: string;
  departmentName: string;
  locationName: string;
  risk?: NoShowRisk;
  color?: string;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  providers: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  summary: {
    totalAppointments: number;
    availableSlots: number;
    utilization: number;
  };
}
