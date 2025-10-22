import dbInstance, { generateUUID, getCurrentDateTime } from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import type Database from 'better-sqlite3';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'patient' | 'staff';
}

export class AuthService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || dbInstance;
  }

  async login(data: LoginRequest) {
    const stmt = this.db.prepare('SELECT * FROM User WHERE email = ?');
    const user = stmt.get(data.email) as any;

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async register(data: RegisterRequest) {
    const checkStmt = this.db.prepare('SELECT id FROM User WHERE email = ?');
    const existingUser = checkStmt.get(data.email);

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const userId = generateUUID();
    const now = getCurrentDateTime();

    const insertStmt = this.db.prepare(`
      INSERT INTO User (id, email, password, firstName, lastName, phone, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      userId,
      data.email,
      hashedPassword,
      data.firstName,
      data.lastName,
      data.phone,
      data.role || 'patient',
      now,
      now
    );

    const user = {
      id: userId,
      email: data.email,
      role: data.role || 'patient',
      firstName: data.firstName,
      lastName: data.lastName,
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      token,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async getCurrentUser(userId: string) {
    const stmt = this.db.prepare(`
      SELECT id, email, role, firstName, lastName, phone
      FROM User
      WHERE id = ?
    `);
    const user = stmt.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
