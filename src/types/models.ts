/**
 * Core data models for the Patient Appointment Access System (PAAS)
 */

// ============================================================================
// User & Authentication
// ============================================================================

export type UserRole = 'admin' | 'staff' | 'provider' | 'patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Patient
// ============================================================================

export interface Patient {
  id: string;
  userId?: string; // Optional link to user account
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone: string;
  email?: string;
  nationalId?: string; // For Thailand: National ID card number
  address?: Address;
  emergencyContact?: EmergencyContact;
  pdpaConsent: boolean;
  pdpaConsentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  subdistrict?: string; // Tambon
  district?: string; // Amphoe
  province: string; // Changwat
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// ============================================================================
// Provider (Doctor/Specialist)
// ============================================================================

export interface Provider {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string; // Dr., Prof., etc.
  specialties: string[];
  departments: string[];
  licenseNumber: string;
  email: string;
  phone: string;
  bio?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Department
// ============================================================================

export interface Department {
  id: string;
  name: string;
  description?: string;
  code: string; // e.g., "ORTHO", "CARDIO"
  location: Location;
  defaultAppointmentDuration: number; // minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  building?: string;
  floor?: string;
  room?: string;
  address?: Address;
}

// ============================================================================
// Time Slots & Availability
// ============================================================================

export interface TimeSlot {
  id: string;
  providerId: string;
  departmentId: string;
  locationId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  capacity: number; // for overbooking
  isAvailable: boolean;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  startDate: Date;
  endDate?: Date;
  exceptions?: Date[]; // holidays, time off
}

// ============================================================================
// Appointment
// ============================================================================

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type NoShowRisk = 'low' | 'medium' | 'high';

export interface Appointment {
  id: string;
  confirmationCode: string;
  patientId: string;
  patient?: Patient; // Populated in joins
  providerId: string;
  provider?: Provider; // Populated in joins
  departmentId: string;
  department?: Department; // Populated in joins
  timeSlotId: string;
  locationId: string;
  location?: Location; // Populated in joins
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: AppointmentStatus;
  appointmentType: string; // "consultation", "follow-up", "procedure", etc.
  reason?: string;
  notes?: string;
  providerNotes?: string;
  noShowRisk?: NoShowRisk;
  noShowPredictionScore?: number; // 0-1, from ML model
  remindersSent: number;
  lastReminderSent?: Date;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

// ============================================================================
// Waitlist
// ============================================================================

export type WaitlistPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WaitlistStatus = 'active' | 'contacted' | 'converted' | 'expired' | 'cancelled';

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patient?: Patient;
  departmentId: string;
  department?: Department;
  providerId?: string; // Optional: specific provider preference
  provider?: Provider;
  preferredDates?: Date[];
  preferredTimeOfDay?: ('morning' | 'afternoon' | 'evening')[];
  priority: WaitlistPriority;
  medicalUrgency?: string;
  status: WaitlistStatus;
  requestedDate: Date;
  expiresAt?: Date;
  notificationsSent: number;
  lastNotificationSent?: Date;
  convertedToAppointmentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Notifications
// ============================================================================

export type NotificationChannel = 'sms' | 'email' | 'line' | 'push';
export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancellation'
  | 'waitlist_slot_available'
  | 'appointment_rescheduled';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface Notification {
  id: string;
  recipientId: string; // patient or user id
  appointmentId?: string;
  waitlistId?: string;
  channel: NotificationChannel;
  type: NotificationType;
  status: NotificationStatus;
  subject?: string;
  message: string;
  scheduledFor: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Analytics & KPIs
// ============================================================================

export interface DashboardKPI {
  title: string;
  value: string | number;
  change: string; // e.g., "-23%", "+12%"
  trend: 'up' | 'down' | 'neutral';
  period: string; // e.g., "week", "month"
}

export interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShows: number;
  noShowRate: number; // percentage
  averageWaitTime: number; // days
  utilization: number; // percentage
  period: {
    start: Date;
    end: Date;
  };
}

export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  totalAppointments: number;
  completedAppointments: number;
  noShows: number;
  noShowRate: number;
  averageAppointmentDuration: number; // minutes
  utilizationRate: number; // percentage
  patientSatisfaction?: number; // 0-5 rating
  period: {
    start: Date;
    end: Date;
  };
}

export interface SystemMetrics {
  totalPatients: number;
  activePatients: number; // patients with appointments in last 6 months
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  noShowRate: number;
  cancellationRate: number;
  averageWaitTime: number; // days
  averageUtilization: number; // percentage
  waitlistSize: number;
  waitlistConversionRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// Appointment History & Audit
// ============================================================================

export type AppointmentEventType =
  | 'created'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'checked_in'
  | 'completed'
  | 'no_show';

export interface AppointmentHistory {
  id: string;
  appointmentId: string;
  eventType: AppointmentEventType;
  performedBy: string; // user id
  previousStatus?: AppointmentStatus;
  newStatus: AppointmentStatus;
  previousScheduledStart?: Date;
  newScheduledStart?: Date;
  reason?: string;
  notes?: string;
  createdAt: Date;
}
