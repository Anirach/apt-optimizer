import dbInstance, { generateUUID, getCurrentDateTime } from '../db/index.js';
import type Database from 'better-sqlite3';

export interface CreateAppointmentData {
  patientId: string;
  providerId: string;
  departmentId: string;
  timeSlotId: string;
  locationId: string;
  scheduledStart: string;
  scheduledEnd: string;
  appointmentType: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  scheduledStart?: string;
  scheduledEnd?: string;
  reason?: string;
  notes?: string;
  providerNotes?: string;
}

export interface SearchAppointmentsParams {
  patientId?: string;
  providerId?: string;
  departmentId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export class AppointmentsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || dbInstance;
  }

  /**
   * Generate a unique 6-character confirmation code
   */
  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get appointments with filters and pagination
   */
  async getAppointments(params: SearchAppointmentsParams = {}) {
    const {
      patientId,
      providerId,
      departmentId,
      status,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
    } = params;

    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const values: any[] = [];

    if (patientId) {
      conditions.push('a.patientId = ?');
      values.push(patientId);
    }
    if (providerId) {
      conditions.push('a.providerId = ?');
      values.push(providerId);
    }
    if (departmentId) {
      conditions.push('a.departmentId = ?');
      values.push(departmentId);
    }
    if (status) {
      conditions.push('a.status = ?');
      values.push(status);
    }
    if (startDate) {
      conditions.push('a.scheduledStart >= ?');
      values.push(startDate);
    }
    if (endDate) {
      conditions.push('a.scheduledEnd <= ?');
      values.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM Appointment a ${whereClause}
    `);
    const { total } = countStmt.get(...values) as { total: number };

    // Get appointments with related data
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle,
        d.name as departmentName,
        l.name as locationName
      FROM Appointment a
      LEFT JOIN Patient p ON a.patientId = p.id
      LEFT JOIN Provider pr ON a.providerId = pr.id
      LEFT JOIN Department d ON a.departmentId = d.id
      LEFT JOIN Location l ON a.locationId = l.id
      ${whereClause}
      ORDER BY a.scheduledStart DESC
      LIMIT ? OFFSET ?
    `);

    const appointments = stmt.all(...values, pageSize, offset);

    return {
      data: appointments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get a single appointment by ID
   */
  async getAppointmentById(id: string) {
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        p.phone as patientPhone,
        p.email as patientEmail,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle,
        d.name as departmentName,
        d.code as departmentCode,
        l.name as locationName,
        l.building as locationBuilding,
        l.floor as locationFloor,
        l.room as locationRoom
      FROM Appointment a
      LEFT JOIN Patient p ON a.patientId = p.id
      LEFT JOIN Provider pr ON a.providerId = pr.id
      LEFT JOIN Department d ON a.departmentId = d.id
      LEFT JOIN Location l ON a.locationId = l.id
      WHERE a.id = ?
    `);

    const appointment = stmt.get(id);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  /**
   * Create a new appointment
   */
  async createAppointment(data: CreateAppointmentData) {
    const appointmentId = generateUUID();
    const confirmationCode = this.generateConfirmationCode();
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      INSERT INTO Appointment (
        id, confirmationCode, patientId, providerId, departmentId,
        timeSlotId, locationId, scheduledStart, scheduledEnd,
        status, appointmentType, reason, notes, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      appointmentId,
      confirmationCode,
      data.patientId,
      data.providerId,
      data.departmentId,
      data.timeSlotId,
      data.locationId,
      data.scheduledStart,
      data.scheduledEnd,
      'scheduled',
      data.appointmentType,
      data.reason || null,
      data.notes || null,
      now,
      now
    );

    return this.getAppointmentById(appointmentId);
  }

  /**
   * Update an appointment
   */
  async updateAppointment(id: string, data: UpdateAppointmentData) {
    const appointment = await this.getAppointmentById(id);
    const now = getCurrentDateTime();

    const updates: string[] = [];
    const values: any[] = [];

    if (data.scheduledStart !== undefined) {
      updates.push('scheduledStart = ?');
      values.push(data.scheduledStart);
    }
    if (data.scheduledEnd !== undefined) {
      updates.push('scheduledEnd = ?');
      values.push(data.scheduledEnd);
    }
    if (data.reason !== undefined) {
      updates.push('reason = ?');
      values.push(data.reason);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }
    if (data.providerNotes !== undefined) {
      updates.push('providerNotes = ?');
      values.push(data.providerNotes);
    }

    if (updates.length === 0) {
      return appointment;
    }

    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getAppointmentById(id);
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: string, reason?: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET status = ?, cancelledAt = ?, cancellationReason = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run('cancelled', now, reason || null, now, id);

    return this.getAppointmentById(id);
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    id: string,
    newStart: string,
    newEnd: string,
    newTimeSlotId?: string
  ) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET
        scheduledStart = ?,
        scheduledEnd = ?,
        timeSlotId = ?,
        status = 'rescheduled',
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(newStart, newEnd, newTimeSlotId || null, now, id);

    return this.getAppointmentById(id);
  }

  /**
   * Check in a patient for their appointment
   */
  async checkInAppointment(id: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET status = 'checked_in', actualStart = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(now, now, id);

    return this.getAppointmentById(id);
  }

  /**
   * Mark appointment as in progress
   */
  async startAppointment(id: string) {
    const appointment = await this.getAppointmentById(id);
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET
        status = 'in_progress',
        actualStart = ?,
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      (appointment as any).actualStart || now,
      now,
      id
    );

    return this.getAppointmentById(id);
  }

  /**
   * Complete an appointment
   */
  async completeAppointment(id: string, providerNotes?: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET
        status = 'completed',
        actualEnd = ?,
        providerNotes = ?,
        updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(now, providerNotes || null, now, id);

    return this.getAppointmentById(id);
  }

  /**
   * Mark appointment as no-show
   */
  async markNoShow(id: string) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE Appointment
      SET status = 'no_show', updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(now, id);

    return this.getAppointmentById(id);
  }

  /**
   * Get upcoming appointments for a patient
   */
  async getUpcomingAppointments(patientId: string, limit: number = 10) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      SELECT
        a.*,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle,
        d.name as departmentName,
        l.name as locationName
      FROM Appointment a
      LEFT JOIN Provider pr ON a.providerId = pr.id
      LEFT JOIN Department d ON a.departmentId = d.id
      LEFT JOIN Location l ON a.locationId = l.id
      WHERE a.patientId = ?
        AND a.scheduledStart >= ?
        AND a.status NOT IN ('cancelled', 'completed', 'no_show')
      ORDER BY a.scheduledStart ASC
      LIMIT ?
    `);

    return stmt.all(patientId, now, limit);
  }

  /**
   * Get appointment history for a patient
   */
  async getAppointmentHistory(patientId: string, limit: number = 20) {
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        pr.firstName as providerFirstName,
        pr.lastName as providerLastName,
        pr.title as providerTitle,
        d.name as departmentName
      FROM Appointment a
      LEFT JOIN Provider pr ON a.providerId = pr.id
      LEFT JOIN Department d ON a.departmentId = d.id
      WHERE a.patientId = ?
      ORDER BY a.scheduledStart DESC
      LIMIT ?
    `);

    return stmt.all(patientId, limit);
  }
}
