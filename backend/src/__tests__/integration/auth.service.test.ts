import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../services/auth.service.js';
import { createTestUser, getUserByEmail, countRecords } from '../helpers.js';
import { verifyToken } from '../../utils/jwt.js';
import { testDb } from '../setup.js';

describe('AuthService Integration Tests', () => {
  const authService = new AuthService(testDb);

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await createTestUser({
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        phone: '0812345678',
      });
    });

    it('should successfully login with correct credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('Test');
      expect(result.user.lastName).toBe('User');
      expect(result.user.role).toBe('patient');
      expect(result.token).toBeDefined();
      expect(result.expiresIn).toBe(604800); // 7 days
    });

    it('should return valid JWT token on login', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      const decoded = verifyToken(result.token);
      expect(decoded.userId).toBe(result.user.id);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('patient');
    });

    it('should fail with incorrect password', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should fail with empty email', async () => {
      await expect(
        authService.login({
          email: '',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should be case-sensitive for email', async () => {
      await expect(
        authService.login({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle different user roles correctly', async () => {
      const roles = ['admin', 'provider', 'staff'];

      for (const role of roles) {
        await createTestUser({
          email: `${role}@example.com`,
          password: 'password123',
          role,
          firstName: 'Test',
          lastName: role,
          phone: '0812345678',
        });

        const result = await authService.login({
          email: `${role}@example.com`,
          password: 'password123',
        });

        expect(result.user.role).toBe(role);
      }
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const initialCount = countRecords('User');

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '0812345678',
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.firstName).toBe('New');
      expect(result.user.lastName).toBe('User');
      expect(result.user.role).toBe('patient'); // Default role
      expect(result.token).toBeDefined();
      expect(result.expiresIn).toBe(604800);

      // Verify user was created in database
      const finalCount = countRecords('User');
      expect(finalCount).toBe(initialCount + 1);
    });

    it('should hash password when registering', async () => {
      await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '0812345678',
      });

      const user = getUserByEmail('newuser@example.com') as any;
      expect(user).toBeDefined();
      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
    });

    it('should return valid JWT token on registration', async () => {
      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '0812345678',
      });

      const decoded = verifyToken(result.token);
      expect(decoded.userId).toBe(result.user.id);
      expect(decoded.email).toBe('newuser@example.com');
      expect(decoded.role).toBe('patient');
    });

    it('should fail when email already exists', async () => {
      await createTestUser({
        email: 'existing@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Existing',
        lastName: 'User',
        phone: '0812345678',
      });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'newpassword',
          firstName: 'New',
          lastName: 'User',
          phone: '0899999999',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should register with custom role', async () => {
      const result = await authService.register({
        email: 'staff@example.com',
        password: 'password123',
        firstName: 'Staff',
        lastName: 'User',
        phone: '0812345678',
        role: 'staff',
      });

      expect(result.user.role).toBe('staff');
    });

    it('should allow registration without phone number', async () => {
      const result = await authService.register({
        email: 'nophone@example.com',
        password: 'password123',
        firstName: 'No',
        lastName: 'Phone',
        phone: '',
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('nophone@example.com');
    });

    it('should create user with all required fields', async () => {
      await authService.register({
        email: 'complete@example.com',
        password: 'password123',
        firstName: 'Complete',
        lastName: 'User',
        phone: '0812345678',
      });

      const user = getUserByEmail('complete@example.com') as any;
      expect(user.id).toBeDefined();
      expect(user.email).toBe('complete@example.com');
      expect(user.firstName).toBe('Complete');
      expect(user.lastName).toBe('User');
      expect(user.phone).toBe('0812345678');
      expect(user.role).toBe('patient');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data for valid user ID', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        phone: '0812345678',
      });

      const user = await authService.getCurrentUser(testUser.id);

      expect(user).toBeDefined();
      expect((user as any).id).toBe(testUser.id);
      expect((user as any).email).toBe('test@example.com');
      expect((user as any).firstName).toBe('Test');
      expect((user as any).lastName).toBe('User');
      expect((user as any).role).toBe('patient');
      expect((user as any).phone).toBe('0812345678');
    });

    it('should not return password field', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Test',
        lastName: 'User',
        phone: '0812345678',
      });

      const user = await authService.getCurrentUser(testUser.id);

      expect((user as any).password).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.getCurrentUser('non-existent-id')
      ).rejects.toThrow('User not found');
    });

    it('should throw error for empty user ID', async () => {
      await expect(
        authService.getCurrentUser('')
      ).rejects.toThrow('User not found');
    });
  });

  describe('End-to-End Flow', () => {
    it('should allow register -> login -> getCurrentUser flow', async () => {
      // Register
      const registerResult = await authService.register({
        email: 'e2e@example.com',
        password: 'password123',
        firstName: 'E2E',
        lastName: 'Test',
        phone: '0812345678',
      });

      expect(registerResult.user.email).toBe('e2e@example.com');
      const userId = registerResult.user.id;

      // Login
      const loginResult = await authService.login({
        email: 'e2e@example.com',
        password: 'password123',
      });

      expect(loginResult.user.id).toBe(userId);
      expect(loginResult.user.email).toBe('e2e@example.com');

      // Get current user
      const currentUser = await authService.getCurrentUser(userId);

      expect((currentUser as any).id).toBe(userId);
      expect((currentUser as any).email).toBe('e2e@example.com');
      expect((currentUser as any).firstName).toBe('E2E');
      expect((currentUser as any).lastName).toBe('Test');
    });

    it('should generate different tokens on multiple logins', async () => {
      await createTestUser({
        email: 'multilogin@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Multi',
        lastName: 'Login',
        phone: '0812345678',
      });

      const result1 = await authService.login({
        email: 'multilogin@example.com',
        password: 'password123',
      });

      // Wait a bit to ensure different iat
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result2 = await authService.login({
        email: 'multilogin@example.com',
        password: 'password123',
      });

      expect(result1.token).not.toBe(result2.token);
    });
  });
});
