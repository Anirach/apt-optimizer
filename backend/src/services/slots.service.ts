import dbInstance, { generateUUID, getCurrentDateTime } from '../db/index.js';
import type Database from 'better-sqlite3';

export interface CreateTimeSlotData {
  providerId: string;
  departmentId: string;
  locationId: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface SearchSlotsParams {
  departmentId?: string;
  providerId?: string;
  locationId?: string;
  startDate: string;
  endDate: string;
  isAvailable?: boolean;
}

export interface AvailableSlot {
  id: string;
  providerId: string;
  providerName: string;
  providerTitle: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  bookedCount: number;
  capacity: number;
}

export class SlotsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || dbInstance;
  }

  /**
   * Search for available time slots
   */
  async searchAvailableSlots(params: SearchSlotsParams) {
    const {
      departmentId,
      providerId,
      locationId,
      startDate,
      endDate,
      isAvailable = true,
    } = params;

    const conditions: string[] = ['ts.startTime >= ?', 'ts.endTime <= ?'];
    const values: any[] = [startDate, endDate];

    if (departmentId) {
      conditions.push('ts.departmentId = ?');
      values.push(departmentId);
    }
    if (providerId) {
      conditions.push('ts.providerId = ?');
      values.push(providerId);
    }
    if (locationId) {
      conditions.push('ts.locationId = ?');
      values.push(locationId);
    }
    if (isAvailable !== undefined) {
      conditions.push('ts.isAvailable = ?');
      values.push(isAvailable ? 1 : 0);
    }

    const stmt = this.db.prepare(`
      SELECT
        ts.*,
        p.firstName as providerFirstName,
        p.lastName as providerLastName,
        p.title as providerTitle,
        d.name as departmentName,
        d.code as departmentCode,
        l.name as locationName,
        l.building as locationBuilding,
        l.floor as locationFloor,
        l.room as locationRoom,
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
    `);

    const slots = stmt.all(...values);

    // Filter out fully booked slots
    return slots.filter((slot: any) => {
      if (!isAvailable) return true;
      return slot.bookedCount < slot.capacity;
    });
  }

  /**
   * Get calendar view of time slots
   */
  async getCalendarView(params: SearchSlotsParams) {
    const slots = await this.searchAvailableSlots({
      ...params,
      isAvailable: undefined, // Get all slots
    });

    // Group slots by day
    const calendar: { [key: string]: any[] } = {};

    slots.forEach((slot: any) => {
      const date = slot.startTime.split('T')[0];
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push({
        ...slot,
        availableCapacity: slot.capacity - slot.bookedCount,
      });
    });

    return calendar;
  }

  /**
   * Create a new time slot
   */
  async createTimeSlot(data: CreateTimeSlotData) {
    const slotId = generateUUID();
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      INSERT INTO TimeSlot (
        id, providerId, departmentId, locationId,
        startTime, endTime, duration, capacity,
        isAvailable, isRecurring, recurringPattern,
        createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      slotId,
      data.providerId,
      data.departmentId,
      data.locationId,
      data.startTime,
      data.endTime,
      data.duration,
      data.capacity || 1,
      1, // isAvailable
      data.isRecurring ? 1 : 0,
      data.recurringPattern || null,
      now,
      now
    );

    return this.getTimeSlotById(slotId);
  }

  /**
   * Get time slot by ID
   */
  async getTimeSlotById(id: string) {
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
      WHERE ts.id = ?
    `);

    const slot = stmt.get(id);

    if (!slot) {
      throw new Error('Time slot not found');
    }

    return slot;
  }

  /**
   * Update time slot
   */
  async updateTimeSlot(id: string, updates: Partial<CreateTimeSlotData>) {
    await this.getTimeSlotById(id); // Verify it exists
    const now = getCurrentDateTime();

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.startTime !== undefined) {
      updateFields.push('startTime = ?');
      values.push(updates.startTime);
    }
    if (updates.endTime !== undefined) {
      updateFields.push('endTime = ?');
      values.push(updates.endTime);
    }
    if (updates.duration !== undefined) {
      updateFields.push('duration = ?');
      values.push(updates.duration);
    }
    if (updates.capacity !== undefined) {
      updateFields.push('capacity = ?');
      values.push(updates.capacity);
    }

    if (updateFields.length === 0) {
      return this.getTimeSlotById(id);
    }

    updateFields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE TimeSlot
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getTimeSlotById(id);
  }

  /**
   * Block/unblock a time slot
   */
  async blockTimeSlot(id: string, isBlocked: boolean) {
    const now = getCurrentDateTime();

    const stmt = this.db.prepare(`
      UPDATE TimeSlot
      SET isAvailable = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(isBlocked ? 0 : 1, now, id);

    return this.getTimeSlotById(id);
  }

  /**
   * Delete a time slot
   */
  async deleteTimeSlot(id: string) {
    // Check if slot has any appointments
    const appointmentCheck = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM Appointment
      WHERE timeSlotId = ?
        AND status NOT IN ('cancelled', 'no_show')
    `);

    const { count } = appointmentCheck.get(id) as { count: number };

    if (count > 0) {
      throw new Error('Cannot delete time slot with active appointments');
    }

    const stmt = this.db.prepare('DELETE FROM TimeSlot WHERE id = ?');
    stmt.run(id);

    return { success: true };
  }

  /**
   * Get provider schedule for a date range
   */
  async getProviderSchedule(providerId: string, startDate: string, endDate: string) {
    const stmt = this.db.prepare(`
      SELECT
        ts.*,
        d.name as departmentName,
        l.name as locationName,
        (
          SELECT COUNT(*)
          FROM Appointment a
          WHERE a.timeSlotId = ts.id
            AND a.status NOT IN ('cancelled', 'no_show')
        ) as bookedCount
      FROM TimeSlot ts
      LEFT JOIN Department d ON ts.departmentId = d.id
      LEFT JOIN Location l ON ts.locationId = l.id
      WHERE ts.providerId = ?
        AND ts.startTime >= ?
        AND ts.endTime <= ?
      ORDER BY ts.startTime ASC
    `);

    return stmt.all(providerId, startDate, endDate);
  }

  /**
   * Get next available slot for a department/provider
   */
  async getNextAvailableSlot(departmentId: string, providerId?: string) {
    const now = getCurrentDateTime();

    const conditions = [
      'ts.startTime > ?',
      'ts.isAvailable = 1',
      'ts.departmentId = ?',
    ];
    const values: any[] = [now, departmentId];

    if (providerId) {
      conditions.push('ts.providerId = ?');
      values.push(providerId);
    }

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
      LIMIT 1
    `);

    const slot = stmt.get(...values);

    if (!slot) {
      return null;
    }

    // Check if slot has available capacity
    if ((slot as any).bookedCount >= (slot as any).capacity) {
      return null;
    }

    return slot;
  }

  /**
   * Create recurring time slots
   */
  async createRecurringSlots(
    baseData: CreateTimeSlotData,
    recurrenceCount: number
  ) {
    const slots = [];

    for (let i = 0; i < recurrenceCount; i++) {
      const slot = await this.createTimeSlot({
        ...baseData,
        isRecurring: true,
      });
      slots.push(slot);
    }

    return slots;
  }
}
