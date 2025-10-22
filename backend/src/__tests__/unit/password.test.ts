import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/password.js';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('should create different hashes for the same password', async () => {
      const password = 'samePassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should create bcrypt-formatted hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      // Bcrypt hashes start with $2b$ and have specific length
      expect(hash).toMatch(/^\$2[aby]\$/);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle very long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle unicode characters', async () => {
      const password = 'パスワード123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'correctPassword123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'correctPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      const isMatch1 = await comparePassword('testpassword123', hash);
      const isMatch2 = await comparePassword('TESTPASSWORD123', hash);

      expect(isMatch1).toBe(false);
      expect(isMatch2).toBe(false);
    });

    it('should handle empty password comparison', async () => {
      const password = '';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('', hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for empty password against non-empty hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('', hash);

      expect(isMatch).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should handle unicode characters correctly', async () => {
      const password = 'パスワード123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should detect subtle differences in passwords', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);

      const variations = [
        'password124',  // Different number
        'password12',   // Shorter
        'password1233', // Longer
        'Password123',  // Different case
        'password 123', // Extra space
      ];

      for (const variation of variations) {
        const isMatch = await comparePassword(variation, hash);
        expect(isMatch).toBe(false);
      }
    });
  });

  describe('Hash and Compare integration', () => {
    it('should consistently verify correct passwords', async () => {
      const password = 'mySecurePassword123!';
      const hash = await hashPassword(password);

      // Verify multiple times
      for (let i = 0; i < 5; i++) {
        const isMatch = await comparePassword(password, hash);
        expect(isMatch).toBe(true);
      }
    });

    it('should consistently reject incorrect passwords', async () => {
      const password = 'correctPassword123';
      const wrongPassword = 'incorrectPassword456';
      const hash = await hashPassword(password);

      // Verify multiple times
      for (let i = 0; i < 5; i++) {
        const isMatch = await comparePassword(wrongPassword, hash);
        expect(isMatch).toBe(false);
      }
    });

    it('should handle multiple different passwords correctly', async () => {
      const passwords = [
        'password1',
        'password2',
        'password3',
        'strongP@ssw0rd!',
        'testUser123',
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const correctMatch = await comparePassword(password, hash);
        const incorrectMatch = await comparePassword('wrongPassword', hash);

        expect(correctMatch).toBe(true);
        expect(incorrectMatch).toBe(false);
      }
    });
  });
});
