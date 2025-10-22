import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';

// Create database instance
const db = new Database(DB_PATH, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
export function initializeDatabase() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Execute schema
  db.exec(schema);

  console.log('✅ Database schema initialized');
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

/**
 * Close database connection
 */
export function closeDatabase() {
  db.close();
  console.log('✅ Database connection closed');
}

export default db;
