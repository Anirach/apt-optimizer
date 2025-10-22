import Database from 'better-sqlite3';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use in-memory database for tests
export const testDb = new Database(':memory:', { verbose: undefined });

// Enable foreign keys
testDb.pragma('foreign_keys = ON');

/**
 * Initialize test database schema
 */
export function initTestDatabase() {
  const schemaPath = join(__dirname, '../db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  testDb.exec(schema);
}

/**
 * Clear all tables in the database
 */
export function clearDatabase() {
  // Disable foreign keys temporarily
  testDb.pragma('foreign_keys = OFF');

  // Delete from all tables
  testDb.exec(`
    DELETE FROM WaitlistEntry;
    DELETE FROM Appointment;
    DELETE FROM TimeSlot;
    DELETE FROM Provider;
    DELETE FROM Patient;
    DELETE FROM User;
    DELETE FROM Department;
    DELETE FROM Location;
  `);

  // Re-enable foreign keys
  testDb.pragma('foreign_keys = ON');
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get current ISO datetime string
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

beforeAll(() => {
  // Initialize test database schema
  initTestDatabase();
});

afterAll(() => {
  // Close database connection
  testDb.close();
});

beforeEach(() => {
  // Clear all data before each test
  clearDatabase();
});

afterEach(() => {
  // Clean up after each test
  clearDatabase();
});

export default testDb;
