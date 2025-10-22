/**
 * Mock data for development and testing
 */

import type {
  Patient,
  Provider,
  Department,
  Location,
  Appointment,
  WaitlistEntry,
  TimeSlot,
  User,
} from '@/types';

// ============================================================================
// Locations
// ============================================================================

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Main Clinic',
    building: 'Building A',
    floor: '2nd Floor',
    room: '201',
    address: {
      street: '123 Healthcare Road',
      district: 'Watthana',
      province: 'Bangkok',
      postalCode: '10110',
      country: 'Thailand',
    },
  },
  {
    id: '2',
    name: 'East Wing',
    building: 'Building B',
    floor: '1st Floor',
    room: '105',
    address: {
      street: '123 Healthcare Road',
      district: 'Watthana',
      province: 'Bangkok',
      postalCode: '10110',
      country: 'Thailand',
    },
  },
];

// ============================================================================
// Departments
// ============================================================================

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Orthopedics',
    code: 'ORTHO',
    description: 'Bone, joint, and muscle care',
    location: mockLocations[0],
    defaultAppointmentDuration: 30,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Cardiology',
    code: 'CARDIO',
    description: 'Heart and cardiovascular care',
    location: mockLocations[1],
    defaultAppointmentDuration: 45,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'General Medicine',
    code: 'GENERAL',
    description: 'General health and wellness',
    location: mockLocations[0],
    defaultAppointmentDuration: 20,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// Providers
// ============================================================================

export const mockProviders: Provider[] = [
  {
    id: '1',
    userId: 'user-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    title: 'Dr.',
    specialties: ['Orthopedics', 'Sports Medicine'],
    departments: ['1'],
    licenseNumber: 'MD-12345',
    email: 'sarah.chen@hospital.com',
    phone: '+66-2-123-4567',
    bio: 'Specializing in orthopedic surgery with 15 years of experience',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: 'user-2',
    firstName: 'John',
    lastName: 'Smith',
    title: 'Dr.',
    specialties: ['Cardiology'],
    departments: ['2'],
    licenseNumber: 'MD-23456',
    email: 'john.smith@hospital.com',
    phone: '+66-2-123-4568',
    bio: 'Board-certified cardiologist with expertise in interventional cardiology',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    userId: 'user-3',
    firstName: 'Maria',
    lastName: 'Garcia',
    title: 'Dr.',
    specialties: ['General Medicine', 'Internal Medicine'],
    departments: ['3'],
    licenseNumber: 'MD-34567',
    email: 'maria.garcia@hospital.com',
    phone: '+66-2-123-4569',
    bio: 'General practitioner focused on preventive medicine',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// Patients
// ============================================================================

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'female',
    phone: '+66-81-234-5678',
    email: 'sarah.chen.patient@email.com',
    nationalId: '1234567890123',
    pdpaConsent: true,
    pdpaConsentDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1978-07-22'),
    gender: 'male',
    phone: '+66-81-234-5679',
    email: 'john.smith.patient@email.com',
    pdpaConsent: true,
    pdpaConsentDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: new Date('1992-11-30'),
    gender: 'female',
    phone: '+66-81-234-5680',
    email: 'maria.garcia.patient@email.com',
    pdpaConsent: true,
    pdpaConsentDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Park',
    dateOfBirth: new Date('1965-05-10'),
    gender: 'male',
    phone: '+66-81-234-5681',
    email: 'david.park@email.com',
    pdpaConsent: true,
    pdpaConsentDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// Appointments
// ============================================================================

const today = new Date();
today.setHours(0, 0, 0, 0);

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    confirmationCode: 'APT-001',
    patientId: '1',
    patient: mockPatients[0],
    providerId: '1',
    provider: mockProviders[0],
    departmentId: '1',
    department: mockDepartments[0],
    timeSlotId: 'slot-1',
    locationId: '1',
    location: mockLocations[0],
    scheduledStart: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    scheduledEnd: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
    status: 'scheduled',
    appointmentType: 'consultation',
    reason: 'Knee pain evaluation',
    noShowRisk: 'low',
    noShowPredictionScore: 0.15,
    remindersSent: 1,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    confirmationCode: 'APT-002',
    patientId: '2',
    patient: mockPatients[1],
    providerId: '2',
    provider: mockProviders[1],
    departmentId: '2',
    department: mockDepartments[1],
    timeSlotId: 'slot-2',
    locationId: '2',
    location: mockLocations[1],
    scheduledStart: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30),
    scheduledEnd: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 15),
    status: 'confirmed',
    appointmentType: 'follow-up',
    reason: 'Blood pressure check',
    noShowRisk: 'medium',
    noShowPredictionScore: 0.45,
    remindersSent: 1,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '3',
    confirmationCode: 'APT-003',
    patientId: '3',
    patient: mockPatients[2],
    providerId: '3',
    provider: mockProviders[2],
    departmentId: '3',
    department: mockDepartments[2],
    timeSlotId: 'slot-3',
    locationId: '1',
    location: mockLocations[0],
    scheduledStart: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
    scheduledEnd: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 20),
    status: 'scheduled',
    appointmentType: 'consultation',
    reason: 'Annual checkup',
    noShowRisk: 'low',
    noShowPredictionScore: 0.1,
    remindersSent: 1,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '4',
    confirmationCode: 'APT-004',
    patientId: '4',
    patient: mockPatients[3],
    providerId: '1',
    provider: mockProviders[0],
    departmentId: '1',
    department: mockDepartments[0],
    timeSlotId: 'slot-4',
    locationId: '1',
    location: mockLocations[0],
    scheduledStart: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
    scheduledEnd: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
    status: 'scheduled',
    appointmentType: 'follow-up',
    reason: 'Post-surgery checkup',
    noShowRisk: 'high',
    noShowPredictionScore: 0.75,
    remindersSent: 2,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
  },
];

// ============================================================================
// Waitlist
// ============================================================================

export const mockWaitlist: WaitlistEntry[] = [
  {
    id: '1',
    patientId: '4',
    patient: mockPatients[3],
    departmentId: '2',
    department: mockDepartments[1],
    priority: 'high',
    medicalUrgency: 'Chest pain monitoring',
    status: 'active',
    requestedDate: new Date('2024-01-16'),
    notificationsSent: 1,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '2',
    patientId: '2',
    patient: mockPatients[1],
    departmentId: '1',
    department: mockDepartments[0],
    priority: 'medium',
    status: 'active',
    requestedDate: new Date('2024-01-17'),
    notificationsSent: 0,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
  },
];

// ============================================================================
// Time Slots
// ============================================================================

export const mockTimeSlots: TimeSlot[] = [
  {
    id: 'slot-1',
    providerId: '1',
    departmentId: '1',
    locationId: '1',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
    duration: 30,
    capacity: 1,
    isAvailable: false,
    isRecurring: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'slot-5',
    providerId: '1',
    departmentId: '1',
    locationId: '1',
    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 30),
    duration: 30,
    capacity: 1,
    isAvailable: true,
    isRecurring: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Helper function to get full patient name
export function getPatientName(patient: Patient): string {
  return `${patient.firstName} ${patient.lastName}`;
}

// Helper function to get full provider name with title
export function getProviderName(provider: Provider): string {
  return `${provider.title} ${provider.firstName} ${provider.lastName}`;
}
