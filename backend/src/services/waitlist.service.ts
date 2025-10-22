import dbInstance, { generateUUID, getCurrentDateTime } from '../db/index.js';
import type Database from 'better-sqlite3';

export interface CreateWaitlistEntryData {
  patientId: string;
  departmentId: string;
  providerId?: string;
  preferredDates?: string[];
  preferredTimeOfDay?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  medicalUrgency?: string;
  notes?: string;
}

export interface UpdateWaitlistEntryData {
  preferredDates?: string[];
  preferredTimeOfDay?: string[];
  priority?: string;
  medicalUrgency?: string;
  notes?: string;
}

export class WaitlistService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || dbInstance;
  }

  /**
   * Get all waitlist entries with optional filters
   */
  async getWaitlistEntries(params: {
    departmentId?: string;
    providerId?: string;
    status?: string;
    priority?: string;
  } = {}) {
    const { departmentId, providerId, status, priority } = params;

    const conditions: string[] = [];
    const values: any[] = [];

    if (departmentId) {
      conditions.push('w.departmentId = ?');
      values.push(departmentId);
    }
    if (providerId) {
      conditions.push('w.providerId = ?');
      values.push(providerId);
    }
    if (status) {
      conditions.push('w.status = ?');
      values.push(status);
    }
    if (priority) {
      conditions.push('w.priority = ?');
      values.push(priority);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const stmt = this.db.prepare(`
      SELECT
        w.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        p.email as patientEmail,
        d.name as departmentName,
        d.code as departmentCode,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle
      FROM WaitlistEntry w
      LEFT JOIN Patient p ON w.patientId = p.id
      LEFT JOIN Department d ON w.departmentId = d.id
      LEFT JOIN Provider pr ON w.providerId = pr.id
      ${whereClause}
      ORDER BY
        CASE w.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        w.requestedDate ASC
    `);

    return stmt.all(...values);
  }

  /**
   * Get a single waitlist entry by ID
   */
  async getWaitlistEntryById(id: string) {
    const stmt = this.db.prepare(`
      SELECT
        w.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        p.email as patientEmail,
        p.dateOfBirth as patientDateOfBirth,
        d.name as departmentName,
        d.code as departmentCode,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle
      FROM WaitlistEntry w
      LEFT JOIN Patient p ON w.patientId = p.id
      LEFT JOIN Department d ON w.departmentId = d.id
      LEFT JOIN Provider pr ON w.providerId = pr.id
      WHERE w.id = ?
    `);

    const entry = stmt.get(id);

    if (!entry) {
      throw new Error('Waitlist entry not found');
    }

    return entry;
  }

  /**
   * Create a new waitlist entry
   */
  async createWaitlistEntry(data: CreateWaitlistEntryData) {
    const entryId = generateUUID();
    const now = getCurrentDateTime();

    // Calculate expiration date (e.g., 30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO WaitlistEntry (
        id, patientId, departmentId, providerId,
        preferredDates, preferredTimeOfDay, priority,
        medicalUrgency, status, requestedDate, expiresAt,
        notes, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      entryId,
      data.patientId,
      data.departmentId,
      data.providerId || null,
      data.preferredDates ? JSON.stringify(data.preferredDates) : null,
      data.preferredTimeOfDay ? JSON.stringify(data.preferredTimeOfDay) : null,
      data.priority,
      data.medicalUrgency || null,
      'active',
      now,
      expiresAt,
      data.notes || null,
      now,
      now
    );

    return this.getWaitlistEntryById(entryId);
  }

  /**
   * Update a waitlist entry
   */
  async updateWaitlistEntry(id: string, data: UpdateWaitlistEntryData) {
    await this.getWaitlistEntryById(id); // Verify it exists
    const now = getCurrentDateTime();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.preferredDates !== undefined) {
      updates.push('preferredDates = ?');
      values.push(JSON.stringify(data.preferredDates));
    }
    if (data.preferredTimeOfDay !== undefined) {
      updates.push('preferredTimeOfDay = ?');
      values.push(JSON.stringify(data.preferredTimeOfDay));
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }
    if (data.medicalUrgency !== undefined) {
      updates.push('medicalUrgency = ?');
      values.push(data.medicalUrgency);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (updates.length === 0) {
      return this.getWaitlistEntryById(id);
    }

    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE WaitlistEntry
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getWaitlistEntryById(id);
  }

  /**
   * Cancel a waitlist entry
   */
  async cancelWaitlistEntry(id: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE WaitlistEntry
      SET status = 'cancelled', updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(now, id);

    return this.getWaitlistEntryById(id);
  }

  /**
   * Mark waitlist entry as contacted
   */
  async markAsContacted(id: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE WaitlistEntry
      SET
        status = 'contacted',
        lastNotificationSent = ?,
        notificationsSent = notificationsSent + 1,
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(now, now, id);

    return this.getWaitlistEntryById(id);
  }

  /**
   * Convert waitlist entry to appointment
   */
  async convertToAppointment(id: string, appointmentId: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE WaitlistEntry
      SET
        status = 'converted',
        convertedToAppointmentId = ?,
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(appointmentId, now, id);

    return this.getWaitlistEntryById(id);
  }

  /**
   * Get waitlist statistics for a department
   */
  async getWaitlistStats(departmentId?: string) {
    const whereClause = departmentId ? 'WHERE departmentId = ?' : '';
    const values = departmentId ? [departmentId] : [];

    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as totalEntries,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeEntries,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contactedEntries,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as convertedEntries,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgentEntries,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as highPriorityEntries,
        AVG(
          CASE WHEN status = 'converted'
          THEN CAST((julianday(updatedAt) - julianday(createdAt)) AS REAL)
          ELSE NULL END
        ) as averageWaitTimeDays
      FROM WaitlistEntry
      ${whereClause}
    `);

    return stmt.get(...values);
  }

  /**
   * Get active waitlist for a patient
   */
  async getPatientWaitlistEntries(patientId: string) {
    const stmt = this.db.prepare(`
      SELECT
        w.*,
        d.name as departmentName,
        d.code as departmentCode,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle
      FROM WaitlistEntry w
      LEFT JOIN Department d ON w.departmentId = d.id
      LEFT JOIN Provider pr ON w.providerId = pr.id
      WHERE w.patientId = ?
        AND w.status IN ('active', 'contacted')
      ORDER BY w.priority ASC, w.requestedDate ASC
    `);

    return stmt.all(patientId);
  }

  /**
   * Find matching slots for waitlist entries
   */
  async findMatchingSlots(entryId: string, limit: number = 10) {
    const entry = await this.getWaitlistEntryById(entryId) as any;
    const now = getCurrentDateTime();

    const conditions = [
      'ts.startTime > ?',
      'ts.isAvailable = 1',
      'ts.departmentId = ?',
    ];
    const values: any[] = [now, entry.departmentId];

    if (entry.providerId) {
      conditions.push('ts.providerId = ?');
      values.push(entry.providerId);
    }

    values.push(limit);

    const stmt = this.db.prepare(`
      SELECT
        ts.*,
        p.firstName as providerFirstName,
        p.lastName as providerLastName,
        p.title as providerTitle,
        d.name as departmentName,
        l.name as locationName,
        (
          SELECT COUNT(*)
          FROM Appointment a
          WHERE a.timeSlotId = ts.id
            AND a.status NOT IN ('cancelled', 'no_show')
        ) as bookedCount
      FROM TimeSlot ts
      LEFT JOIN Provider p ON ts.providerId = p.id
      LEFT JOIN Department d ON ts.departmentId = d.id
      LEFT JOIN Location l ON ts.locationId = l.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ts.startTime ASC
      LIMIT ?
    `);

    const slots = stmt.all(...values);

    // Filter out fully booked slots
    return slots.filter((slot: any) => slot.bookedCount < slot.capacity);
  }

  /**
   * Expire old waitlist entries
   */
  async expireOldEntries() {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE WaitlistEntry
      SET status = 'expired', updatedAt = ?
      WHERE status IN ('active', 'contacted')
        AND expiresAt < ?
    `);

    const result = stmt.run(now, now);

    return {
      expiredCount: result.changes,
    };
  }
}
