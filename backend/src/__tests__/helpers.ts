import { testDb, generateUUID, getCurrentDateTime } from './setup.js';
import { hashPassword } from '../utils/password.js';

/**
 * Create a test user in the database
 */
export async function createTestUser(data: {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const userId = generateUUID();
  const hashedPassword = await hashPassword(data.password);
  const now = getCurrentDateTime();

  const stmt = testDb.prepare(`
    INSERT INTO User (id, email, password, role, firstName, lastName, phone, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    userId,
    data.email,
    hashedPassword,
    data.role,
    data.firstName,
    data.lastName,
    data.phone || null,
    now,
    now
  );

  return {
    id: userId,
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
  };
}

/**
 * Create a test location
 */
export function createTestLocation(data: {
  name: string;
  addressProvince: string;
  addressPostal: string;
  addressCountry: string;
}) {
  const locationId = generateUUID();
  const now = getCurrentDateTime();

  const stmt = testDb.prepare(`
    INSERT INTO Location (id, name, addressProvince, addressPostal, addressCountry, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    locationId,
    data.name,
    data.addressProvince,
    data.addressPostal,
    data.addressCountry,
    now,
    now
  );

  return {
    id: locationId,
    ...data,
  };
}

/**
 * Create a test department
 */
export function createTestDepartment(data: {
  name: string;
  code: string;
  locationId: string;
  defaultAppointmentDuration: number;
}) {
  const departmentId = generateUUID();
  const now = getCurrentDateTime();

  const stmt = testDb.prepare(`
    INSERT INTO Department (id, name, code, locationId, defaultAppointmentDuration, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    departmentId,
    data.name,
    data.code,
    data.locationId,
    data.defaultAppointmentDuration,
    1,
    now,
    now
  );

  return {
    id: departmentId,
    ...data,
  };
}

/**
 * Create a test patient
 */
export function createTestPatient(data: {
  userId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
}) {
  const patientId = generateUUID();
  const now = getCurrentDateTime();

  const stmt = testDb.prepare(`
    INSERT INTO Patient (id, userId, firstName, lastName, dateOfBirth, gender, phone, email, pdpaConsent, pdpaConsentDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    patientId,
    data.userId || null,
    data.firstName,
    data.lastName,
    data.dateOfBirth,
    data.gender,
    data.phone,
    data.email || null,
    1,
    now,
    now,
    now
  );

  return {
    id: patientId,
    ...data,
  };
}

/**
 * Get user by email from test database
 */
export function getUserByEmail(email: string) {
  const stmt = testDb.prepare('SELECT * FROM User WHERE email = ?');
  return stmt.get(email);
}

/**
 * Get user by ID from test database
 */
export function getUserById(id: string) {
  const stmt = testDb.prepare('SELECT * FROM User WHERE id = ?');
  return stmt.get(id);
}

/**
 * Count records in a table
 */
export function countRecords(tableName: string): number {
  const stmt = testDb.prepare(`SELECT COUNT(*) as count FROM ${tableName}`);
  const result = stmt.get() as { count: number };
  return result.count;
}
