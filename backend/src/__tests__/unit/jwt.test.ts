import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../../utils/jwt.js';

describe('JWT Utils', () => {
  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient',
      };

      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include all payload data in token', () => {
      const payload = {
        userId: 'user-456',
        email: 'admin@example.com',
        role: 'admin',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include iat and exp claims', () => {
      const payload = {
        userId: 'user-789',
        email: 'provider@example.com',
        role: 'provider',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyToken(malformedToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow();
    });

    it('should verify tokens with different roles', () => {
      const roles = ['patient', 'provider', 'staff', 'admin'];

      roles.forEach((role) => {
        const payload = {
          userId: `user-${role}`,
          email: `${role}@example.com`,
          role,
        };

        const token = signToken(payload);
        const decoded = verifyToken(token);

        expect(decoded.role).toBe(role);
      });
    });
  });

  describe('Token expiration', () => {
    it('should set expiration time in the future', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient',
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);
      const now = Math.floor(Date.now() / 1000);

      expect(decoded.exp).toBeGreaterThan(now);
      // Should expire in approximately 7 days (604800 seconds)
      expect(decoded.exp - now).toBeGreaterThan(604000);
      expect(decoded.exp - now).toBeLessThan(605000);
    });
  });

  describe('Token integrity', () => {
    it('should fail verification if token is tampered', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'patient',
      };

      const token = signToken(payload);
      // Tamper with the token
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      expect(() => verifyToken(tamperedToken)).toThrow();
    });

    it('should create different tokens for different payloads', () => {
      const payload1 = {
        userId: 'user-1',
        email: 'user1@example.com',
        role: 'patient',
      };

      const payload2 = {
        userId: 'user-2',
        email: 'user2@example.com',
        role: 'admin',
      };

      const token1 = signToken(payload1);
      const token2 = signToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });
});
