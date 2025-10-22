-- PAAS Platform - SQLite Schema
-- Generated from Prisma schema for better-sqlite3

-- ============================================================================
-- User & Authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  phone TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Patient
-- ============================================================================

CREATE TABLE IF NOT EXISTS Patient (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  dateOfBirth TEXT NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  nationalId TEXT,
  addressStreet TEXT,
  addressDistrict TEXT,
  addressProvince TEXT,
  addressPostal TEXT,
  addressCountry TEXT,
  emergencyName TEXT,
  emergencyRelation TEXT,
  emergencyPhone TEXT,
  pdpaConsent INTEGER NOT NULL DEFAULT 0,
  pdpaConsentDate TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- ============================================================================
-- Location
-- ============================================================================

CREATE TABLE IF NOT EXISTS Location (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  building TEXT,
  floor TEXT,
  room TEXT,
  addressStreet TEXT,
  addressDistrict TEXT,
  addressProvince TEXT NOT NULL,
  addressPostal TEXT NOT NULL,
  addressCountry TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Department
-- ============================================================================

CREATE TABLE IF NOT EXISTS Department (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  locationId TEXT NOT NULL,
  defaultAppointmentDuration INTEGER NOT NULL,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (locationId) REFERENCES Location(id)
);

-- ============================================================================
-- Provider
-- ============================================================================

CREATE TABLE IF NOT EXISTS Provider (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  title TEXT NOT NULL,
  specialties TEXT NOT NULL,
  departments TEXT NOT NULL,
  licenseNumber TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  bio TEXT,
  photoUrl TEXT,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- ============================================================================
-- TimeSlot
-- ============================================================================

CREATE TABLE IF NOT EXISTS TimeSlot (
  id TEXT PRIMARY KEY,
  providerId TEXT NOT NULL,
  departmentId TEXT NOT NULL,
  locationId TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  duration INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  isRecurring INTEGER NOT NULL DEFAULT 0,
  recurringPattern TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (providerId) REFERENCES Provider(id),
  FOREIGN KEY (departmentId) REFERENCES Department(id),
  FOREIGN KEY (locationId) REFERENCES Location(id)
);

-- ============================================================================
-- Appointment
-- ============================================================================

CREATE TABLE IF NOT EXISTS Appointment (
  id TEXT PRIMARY KEY,
  confirmationCode TEXT UNIQUE NOT NULL,
  patientId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  departmentId TEXT NOT NULL,
  timeSlotId TEXT NOT NULL,
  locationId TEXT NOT NULL,
  scheduledStart TEXT NOT NULL,
  scheduledEnd TEXT NOT NULL,
  actualStart TEXT,
  actualEnd TEXT,
  status TEXT NOT NULL,
  appointmentType TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  providerNotes TEXT,
  noShowRisk TEXT,
  noShowPredictionScore REAL,
  remindersSent INTEGER NOT NULL DEFAULT 0,
  lastReminderSent TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  cancelledAt TEXT,
  cancellationReason TEXT,
  FOREIGN KEY (patientId) REFERENCES Patient(id),
  FOREIGN KEY (providerId) REFERENCES Provider(id),
  FOREIGN KEY (departmentId) REFERENCES Department(id),
  FOREIGN KEY (timeSlotId) REFERENCES TimeSlot(id),
  FOREIGN KEY (locationId) REFERENCES Location(id)
);

-- ============================================================================
-- Waitlist
-- ============================================================================

CREATE TABLE IF NOT EXISTS WaitlistEntry (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  departmentId TEXT NOT NULL,
  providerId TEXT,
  preferredDates TEXT,
  preferredTimeOfDay TEXT,
  priority TEXT NOT NULL,
  medicalUrgency TEXT,
  status TEXT NOT NULL,
  requestedDate TEXT NOT NULL,
  expiresAt TEXT,
  notificationsSent INTEGER NOT NULL DEFAULT 0,
  lastNotificationSent TEXT,
  convertedToAppointmentId TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (patientId) REFERENCES Patient(id),
  FOREIGN KEY (departmentId) REFERENCES Department(id),
  FOREIGN KEY (providerId) REFERENCES Provider(id)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_appointment_patient ON Appointment(patientId);
CREATE INDEX IF NOT EXISTS idx_appointment_provider ON Appointment(providerId);
CREATE INDEX IF NOT EXISTS idx_appointment_department ON Appointment(departmentId);
CREATE INDEX IF NOT EXISTS idx_appointment_scheduled ON Appointment(scheduledStart);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON Appointment(status);

CREATE INDEX IF NOT EXISTS idx_waitlist_patient ON WaitlistEntry(patientId);
CREATE INDEX IF NOT EXISTS idx_waitlist_department ON WaitlistEntry(departmentId);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON WaitlistEntry(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON WaitlistEntry(priority);
