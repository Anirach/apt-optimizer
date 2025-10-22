import { describe, it, expect } from 'vitest';
import {
  createTestUser,
  createTestLocation,
  createTestDepartment,
  createTestPatient,
  getUserByEmail,
  getUserById,
  countRecords,
} from '../helpers.js';

describe('Database Operations', () => {
  describe('User table', () => {
    it('should create a user with all fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        phone: '0812345678',
      };

      const user = await createTestUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.phone).toBe(userData.phone);
    });

    it('should retrieve user by email', async () => {
      await createTestUser({
        email: 'findme@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Find',
        lastName: 'Me',
        phone: '0812345678',
      });

      const user = getUserByEmail('findme@example.com');

      expect(user).toBeDefined();
      expect((user as any).email).toBe('findme@example.com');
      expect((user as any).firstName).toBe('Find');
    });

    it('should retrieve user by ID', async () => {
      const createdUser = await createTestUser({
        email: 'findbyid@example.com',
        password: 'password123',
        role: 'admin',
        firstName: 'Find',
        lastName: 'ByID',
        phone: '0812345678',
      });

      const user = getUserById(createdUser.id);

      expect(user).toBeDefined();
      expect((user as any).id).toBe(createdUser.id);
      expect((user as any).email).toBe('findbyid@example.com');
    });

    it('should enforce unique email constraint', async () => {
      await createTestUser({
        email: 'unique@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'First',
        lastName: 'User',
        phone: '0812345678',
      });

      await expect(async () => {
        await createTestUser({
          email: 'unique@example.com',
          password: 'different',
          role: 'patient',
          firstName: 'Second',
          lastName: 'User',
          phone: '0899999999',
        });
      }).rejects.toThrow();
    });

    it('should count user records correctly', async () => {
      const initialCount = countRecords('User');

      await createTestUser({
        email: 'user1@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'User',
        lastName: 'One',
        phone: '0812345678',
      });

      await createTestUser({
        email: 'user2@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'User',
        lastName: 'Two',
        phone: '0899999999',
      });

      const finalCount = countRecords('User');
      expect(finalCount).toBe(initialCount + 2);
    });
  });

  describe('Location table', () => {
    it('should create a location', () => {
      const locationData = {
        name: 'Test Clinic',
        addressProvince: 'Bangkok',
        addressPostal: '10110',
        addressCountry: 'Thailand',
      };

      const location = createTestLocation(locationData);

      expect(location).toBeDefined();
      expect(location.id).toBeDefined();
      expect(location.name).toBe(locationData.name);
      expect(location.addressProvince).toBe(locationData.addressProvince);
      expect(location.addressPostal).toBe(locationData.addressPostal);
      expect(location.addressCountry).toBe(locationData.addressCountry);
    });

    it('should count location records correctly', () => {
      const initialCount = countRecords('Location');

      createTestLocation({
        name: 'Location 1',
        addressProvince: 'Bangkok',
        addressPostal: '10110',
        addressCountry: 'Thailand',
      });

      createTestLocation({
        name: 'Location 2',
        addressProvince: 'Chiang Mai',
        addressPostal: '50200',
        addressCountry: 'Thailand',
      });

      const finalCount = countRecords('Location');
      expect(finalCount).toBe(initialCount + 2);
    });
  });

  describe('Department table', () => {
    it('should create a department', () => {
      const location = createTestLocation({
        name: 'Main Hospital',
        addressProvince: 'Bangkok',
        addressPostal: '10110',
        addressCountry: 'Thailand',
      });

      const departmentData = {
        name: 'Cardiology',
        code: 'CARDIO',
        locationId: location.id,
        defaultAppointmentDuration: 45,
      };

      const department = createTestDepartment(departmentData);

      expect(department).toBeDefined();
      expect(department.id).toBeDefined();
      expect(department.name).toBe(departmentData.name);
      expect(department.code).toBe(departmentData.code);
      expect(department.locationId).toBe(location.id);
      expect(department.defaultAppointmentDuration).toBe(45);
    });

    it('should enforce unique code constraint', () => {
      const location = createTestLocation({
        name: 'Main Hospital',
        addressProvince: 'Bangkok',
        addressPostal: '10110',
        addressCountry: 'Thailand',
      });

      createTestDepartment({
        name: 'Department 1',
        code: 'UNIQUE',
        locationId: location.id,
        defaultAppointmentDuration: 30,
      });

      expect(() => {
        createTestDepartment({
          name: 'Department 2',
          code: 'UNIQUE',
          locationId: location.id,
          defaultAppointmentDuration: 30,
        });
      }).toThrow();
    });

    it('should enforce foreign key constraint with location', () => {
      expect(() => {
        createTestDepartment({
          name: 'Invalid Department',
          code: 'INVALID',
          locationId: 'non-existent-location-id',
          defaultAppointmentDuration: 30,
        });
      }).toThrow();
    });
  });

  describe('Patient table', () => {
    it('should create a patient without user ID', () => {
      const patientData = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        phone: '0812345678',
        email: 'john@example.com',
      };

      const patient = createTestPatient(patientData);

      expect(patient).toBeDefined();
      expect(patient.id).toBeDefined();
      expect(patient.firstName).toBe(patientData.firstName);
      expect(patient.lastName).toBe(patientData.lastName);
      expect(patient.dateOfBirth).toBe(patientData.dateOfBirth);
      expect(patient.gender).toBe(patientData.gender);
      expect(patient.phone).toBe(patientData.phone);
    });

    it('should create a patient linked to a user', async () => {
      const user = await createTestUser({
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Patient',
        lastName: 'User',
        phone: '0812345678',
      });

      const patient = createTestPatient({
        userId: user.id,
        firstName: 'Patient',
        lastName: 'User',
        dateOfBirth: '1985-06-20',
        gender: 'female',
        phone: '0812345678',
        email: 'patient@example.com',
      });

      expect(patient).toBeDefined();
      expect(patient.userId).toBe(user.id);
    });

    it('should count patient records correctly', () => {
      const initialCount = countRecords('Patient');

      createTestPatient({
        firstName: 'Patient',
        lastName: 'One',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '0811111111',
      });

      createTestPatient({
        firstName: 'Patient',
        lastName: 'Two',
        dateOfBirth: '1992-02-02',
        gender: 'female',
        phone: '0822222222',
      });

      const finalCount = countRecords('Patient');
      expect(finalCount).toBe(initialCount + 2);
    });
  });

  describe('Database transactions and integrity', () => {
    it('should maintain referential integrity', async () => {
      const user = await createTestUser({
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Patient',
        lastName: 'User',
        phone: '0812345678',
      });

      const patient = createTestPatient({
        userId: user.id,
        firstName: 'Patient',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '0812345678',
      });

      expect(patient.userId).toBe(user.id);

      const retrievedUser = getUserById(user.id);
      expect(retrievedUser).toBeDefined();
    });

    it('should handle multiple table creations', () => {
      const location = createTestLocation({
        name: 'Hospital',
        addressProvince: 'Bangkok',
        addressPostal: '10110',
        addressCountry: 'Thailand',
      });

      const department = createTestDepartment({
        name: 'Emergency',
        code: 'ER',
        locationId: location.id,
        defaultAppointmentDuration: 20,
      });

      expect(countRecords('Location')).toBeGreaterThan(0);
      expect(countRecords('Department')).toBeGreaterThan(0);
      expect(department.locationId).toBe(location.id);
    });
  });

  describe('Table existence', () => {
    it('should have all required tables', () => {
      const tables = [
        'User',
        'Patient',
        'Location',
        'Department',
        'Provider',
        'TimeSlot',
        'Appointment',
        'WaitlistEntry',
      ];

      tables.forEach((tableName) => {
        expect(() => countRecords(tableName)).not.toThrow();
      });
    });
  });
});
