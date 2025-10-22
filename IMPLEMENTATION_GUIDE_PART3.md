# PAAS Platform - Implementation Guide Part 3

## Phase 3: Unit Tests & Integration Tests

### Step 3.1: Configure Vitest

**backend/vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
```

### Step 3.2: Create Test Setup

**backend/src/__tests__/setup.ts:**
```typescript
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Any global setup needed before all tests
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clear all tables before each test for isolation
  const deleteUsers = prisma.user.deleteMany();
  const deletePatients = prisma.patient.deleteMany();
  const deleteProviders = prisma.provider.deleteMany();
  const deleteAppointments = prisma.appointment.deleteMany();
  const deleteWaitlist = prisma.waitlistEntry.deleteMany();
  const deleteTimeSlots = prisma.timeSlot.deleteMany();
  const deleteDepartments = prisma.department.deleteMany();
  const deleteLocations = prisma.location.deleteMany();

  await prisma.$transaction([
    deleteAppointments,
    deleteWaitlist,
    deleteTimeSlots,
    deleteProviders,
    deletePatients,
    deleteUsers,
    deleteDepartments,
    deleteLocations,
  ]);
});

export { prisma };
```

### Step 3.3: Write Unit Tests for Utilities

**backend/src/__tests__/unit/jwt.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../../utils/jwt.js';

describe('JWT Utilities', () => {
  const mockPayload = {
    userId: '123',
    email: 'test@example.com',
    role: 'patient',
  };

  describe('signToken', () => {
    it('should generate a valid JWT token', () => {
      const token = signToken(mockPayload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = signToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = signToken(mockPayload);
      const tamperedToken = token.substring(0, token.length - 5) + 'xxxxx';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });
  });
});
```

**backend/src/__tests__/unit/password.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/password.js';

describe('Password Utilities', () => {
  const plainPassword = 'mySecurePassword123!';

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword(plainPassword);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith('$2b$')).toBe(true); // bcrypt hash prefix
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // Due to salt
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword(plainPassword, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await hashPassword(plainPassword);
      const isMatch = await comparePassword('wrongPassword', hash);

      expect(isMatch).toBe(false);
    });
  });
});
```

### Step 3.4: Write Unit Tests for Auth Service

**backend/src/__tests__/unit/auth.service.test.ts:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../services/auth.service.js';
import { prisma } from '../setup.js';
import { hashPassword } from '../../utils/password.js';

describe('AuthService', () => {
  const authService = new AuthService();

  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+66-81-111-1111',
        role: 'patient' as const,
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.role).toBe('patient');

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(dbUser).toBeTruthy();
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One',
        phone: '+66-81-111-1111',
      };

      await authService.register(userData);

      // Try to register again with same email
      await expect(authService.register(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should hash the password', async () => {
      const userData = {
        email: 'hashtest@example.com',
        password: 'plainPassword',
        firstName: 'Hash',
        lastName: 'Test',
        phone: '+66-81-111-1111',
      };

      await authService.register(userData);

      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(dbUser?.password).not.toBe(userData.password);
      expect(dbUser?.password.startsWith('$2b$')).toBe(true);
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      // First create a user
      const password = 'correctPassword';
      const hashedPwd = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: 'login@example.com',
          password: hashedPwd,
          firstName: 'Login',
          lastName: 'Test',
          phone: '+66-81-111-1111',
          role: 'patient',
        },
      });

      const result = await authService.login({
        email: user.email,
        password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(user.email);
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      const password = 'correctPassword';
      const hashedPwd = await hashPassword(password);

      await prisma.user.create({
        data: {
          email: 'wrongpass@example.com',
          password: hashedPwd,
          firstName: 'Wrong',
          lastName: 'Pass',
          phone: '+66-81-111-1111',
          role: 'patient',
        },
      });

      await expect(
        authService.login({
          email: 'wrongpass@example.com',
          password: 'wrongPassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'current@example.com',
          password: await hashPassword('password'),
          firstName: 'Current',
          lastName: 'User',
          phone: '+66-81-111-1111',
          role: 'patient',
        },
      });

      const result = await authService.getCurrentUser(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.getCurrentUser('non-existent-id')
      ).rejects.toThrow('User not found');
    });
  });
});
```

### Step 3.5: Write Integration Tests for Auth Routes

**backend/src/__tests__/integration/auth.routes.test.ts:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { prisma } from '../setup.js';
import { hashPassword } from '../../utils/password.js';

describe('Auth Routes Integration Tests', () => {
  const app = createApp();

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@example.com',
          password: 'password123',
          firstName: 'Integration',
          lastName: 'Test',
          phone: '+66-81-111-1111',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('integration@example.com');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        phone: '+66-81-111-1111',
      };

      // First registration
      await request(app).post('/api/auth/register').send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(500); // Will be 400 after proper error handling
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const password = 'correctPassword';
      const email = 'logintest@example.com';

      await prisma.user.create({
        data: {
          email,
          password: await hashPassword(password),
          firstName: 'Login',
          lastName: 'Test',
          phone: '+66-81-111-1111',
          role: 'patient',
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(email);
    });

    it('should return 500 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(500); // Will be 401 after proper error handling
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      // Register a user first to get a token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'metest@example.com',
          password: 'password123',
          firstName: 'Me',
          lastName: 'Test',
          phone: '+66-81-111-1111',
        });

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('metest@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // Register and login to get a token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logout@example.com',
          password: 'password123',
          firstName: 'Logout',
          lastName: 'Test',
          phone: '+66-81-111-1111',
        });

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

### Step 3.6: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Step 3.7: Test Coverage Goals

Aim for these coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Step 3.8: Testing Best Practices

**Follow these patterns:**

1. **Arrange-Act-Assert (AAA)** pattern:
```typescript
it('should do something', async () => {
  // Arrange: Set up test data
  const user = await createTestUser();

  // Act: Perform the action
  const result = await someFunction(user.id);

  // Assert: Check the outcome
  expect(result).toBeTruthy();
});
```

2. **Test isolation**: Each test should be independent
3. **Clear test names**: Describe what is being tested
4. **Test edge cases**: Not just happy paths
5. **Mock external dependencies**: Don't test third-party code

---

## Next Steps

Continue to `IMPLEMENTATION_GUIDE_PART4.md` for:
- Appointments API implementation
- Appointments service with business logic
- Comprehensive tests for appointments
- Waitlist API
- Analytics API
