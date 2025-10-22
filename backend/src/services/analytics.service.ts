import dbInstance, { getCurrentDateTime } from '../db/index.js';
import type Database from 'better-sqlite3';

export interface DashboardKPIs {
  noShowRate: number;
  averageWaitTime: number;
  providerUtilization: number;
  activePatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  activeWaitlist: number;
  completedToday: number;
}

export class AnalyticsService {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || dbInstance;
  }

  /**
   * Get dashboard KPIs
   */
  async getDashboardKPIs(params: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  } = {}): Promise<DashboardKPIs> {
    const now = getCurrentDateTime();
    const today = now.split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { startDate, endDate, departmentId } = params;
    const dateCondition = departmentId ? `AND a.departmentId = '${departmentId}'` : '';

    // No-show rate
    const noShowStmt = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as noShows
      FROM Appointment a
      WHERE a.scheduledStart >= date('now', '-30 days')
        ${dateCondition}
    `);
    const noShowData = noShowStmt.get() as any;
    const noShowRate = noShowData.total > 0
      ? (noShowData.noShows / noShowData.total) * 100
      : 0;

    // Average wait time (from waitlist request to appointment)
    const waitTimeStmt = this.db.prepare(`
      SELECT AVG(
        CAST((julianday(w.updatedAt) - julianday(w.createdAt)) AS REAL)
      ) as avgWaitDays
      FROM WaitlistEntry w
      WHERE w.status = 'converted'
        AND w.createdAt >= date('now', '-30 days')
        ${departmentId ? `AND w.departmentId = '${departmentId}'` : ''}
    `);
    const waitTimeData = waitTimeStmt.get() as any;
    const averageWaitTime = waitTimeData.avgWaitDays || 0;

    // Provider utilization
    const utilizationStmt = this.db.prepare(`
      SELECT
        COUNT(DISTINCT ts.id) as totalSlots,
        COUNT(DISTINCT a.timeSlotId) as bookedSlots
      FROM TimeSlot ts
      LEFT JOIN Appointment a ON ts.id = a.timeSlotId
        AND a.status NOT IN ('cancelled', 'no_show')
      WHERE ts.startTime >= date('now', '-7 days')
        AND ts.startTime < date('now')
        ${departmentId ? `AND ts.departmentId = '${departmentId}'` : ''}
    `);
    const utilizationData = utilizationStmt.get() as any;
    const providerUtilization = utilizationData.totalSlots > 0
      ? (utilizationData.bookedSlots / utilizationData.totalSlots) * 100
      : 0;

    // Active patients (patients with appointments in last 6 months)
    const activePatientsStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT patientId) as count
      FROM Appointment
      WHERE scheduledStart >= date('now', '-180 days')
        ${dateCondition}
    `);
    const activePatientsData = activePatientsStmt.get() as any;
    const activePatients = activePatientsData.count || 0;

    // Today's appointments
    const todayStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM Appointment
      WHERE date(scheduledStart) = date('now')
        AND status NOT IN ('cancelled', 'no_show')
        ${dateCondition}
    `);
    const todayData = todayStmt.get() as any;
    const todayAppointments = todayData.count || 0;

    // Upcoming appointments (next 7 days)
    const upcomingStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM Appointment
      WHERE scheduledStart > datetime('now')
        AND scheduledStart < datetime('now', '+7 days')
        AND status NOT IN ('cancelled', 'no_show')
        ${dateCondition}
    `);
    const upcomingData = upcomingStmt.get() as any;
    const upcomingAppointments = upcomingData.count || 0;

    // Active waitlist
    const waitlistStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM WaitlistEntry
      WHERE status IN ('active', 'contacted')
        ${departmentId ? `AND departmentId = '${departmentId}'` : ''}
    `);
    const waitlistData = waitlistStmt.get() as any;
    const activeWaitlist = waitlistData.count || 0;

    // Completed today
    const completedStmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM Appointment
      WHERE date(scheduledStart) = date('now')
        AND status = 'completed'
        ${dateCondition}
    `);
    const completedData = completedStmt.get() as any;
    const completedToday = completedData.count || 0;

    return {
      noShowRate: Math.round(noShowRate * 10) / 10,
      averageWaitTime: Math.round(averageWaitTime * 10) / 10,
      providerUtilization: Math.round(providerUtilization * 10) / 10,
      activePatients,
      todayAppointments,
      upcomingAppointments,
      activeWaitlist,
      completedToday,
    };
  }

  /**
   * Get today's appointments with details
   */
  async getTodayAppointments(departmentId?: string) {
    const conditions = ["date(a.scheduledStart) = date('now')"];
    const values: any[] = [];

    if (departmentId) {
      conditions.push('a.departmentId = ?');
      values.push(departmentId);
    }

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
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.scheduledStart ASC
    `);

    return stmt.all(...values);
  }

  /**
   * Get appointment trends over time
   */
  async getAppointmentTrends(days: number = 30, departmentId?: string) {
    const conditions: string[] = [];
    const values: any[] = [days];

    if (departmentId) {
      conditions.push('AND departmentId = ?');
      values.push(departmentId);
    }

    const stmt = this.db.prepare(`
      SELECT
        date(scheduledStart) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as noShows,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM Appointment
      WHERE scheduledStart >= date('now', '-' || ? || ' days')
        ${conditions.join(' ')}
      GROUP BY date(scheduledStart)
      ORDER BY date ASC
    `);

    return stmt.all(...values);
  }

  /**
   * Get provider performance metrics
   */
  async getProviderMetrics(providerId: string, days: number = 30) {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as totalAppointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedAppointments,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as noShows,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        AVG(
          CASE WHEN actualEnd IS NOT NULL AND actualStart IS NOT NULL
          THEN CAST((julianday(actualEnd) - julianday(actualStart)) * 24 * 60 AS REAL)
          ELSE NULL END
        ) as averageDurationMinutes,
        COUNT(DISTINCT patientId) as uniquePatients
      FROM Appointment
      WHERE providerId = ?
        AND scheduledStart >= date('now', '-' || ? || ' days')
    `);

    return stmt.get(providerId, days);
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(departmentId: string, days: number = 30) {
    const appointmentsStmt = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as noShows,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COUNT(DISTINCT patientId) as uniquePatients,
        COUNT(DISTINCT providerId) as activeProviders
      FROM Appointment
      WHERE departmentId = ?
        AND scheduledStart >= date('now', '-' || ? || ' days')
    `);

    const appointmentStats = appointmentsStmt.get(departmentId, days);

    const waitlistStmt = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
      FROM WaitlistEntry
      WHERE departmentId = ?
    `);

    const waitlistStats = waitlistStmt.get(departmentId);

    return {
      appointments: appointmentStats,
      waitlist: waitlistStats,
    };
  }

  /**
   * Get peak hours analysis
   */
  async getPeakHours(departmentId?: string, days: number = 30) {
    const conditions: string[] = [`scheduledStart >= date('now', '-' || ? || ' days')`];
    const values: any[] = [days];

    if (departmentId) {
      conditions.push('departmentId = ?');
      values.push(departmentId);
    }

    const stmt = this.db.prepare(`
      SELECT
        CAST(strftime('%H', scheduledStart) AS INTEGER) as hour,
        COUNT(*) as appointmentCount
      FROM Appointment
      WHERE ${conditions.join(' AND ')}
        AND status NOT IN ('cancelled', 'no_show')
      GROUP BY hour
      ORDER BY hour ASC
    `);

    return stmt.all(...values);
  }

  /**
   * Get patient demographics summary
   */
  async getPatientDemographics(departmentId?: string) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (departmentId) {
      conditions.push(`
        p.id IN (
          SELECT DISTINCT patientId
          FROM Appointment
          WHERE departmentId = ?
        )
      `);
      values.push(departmentId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const stmt = this.db.prepare(`
      SELECT
        gender,
        COUNT(*) as count,
        AVG(CAST((julianday('now') - julianday(dateOfBirth)) / 365.25 AS REAL)) as avgAge
      FROM Patient p
      ${whereClause}
      GROUP BY gender
    `);

    return stmt.all(...values);
  }

  /**
   * Get real-time dashboard data
   */
  async getRealtimeDashboard(departmentId?: string) {
    const kpis = await this.getDashboardKPIs({ departmentId });
    const todayAppointments = await this.getTodayAppointments(departmentId);

    const waitlistStmt = this.db.prepare(`
      SELECT
        w.*,
        p.firstName as patientFirstName,
        p.lastName as patientLastName,
        d.name as departmentName
      FROM WaitlistEntry w
      LEFT JOIN Patient p ON w.patientId = p.id
      LEFT JOIN Department d ON w.departmentId = d.id
      WHERE w.status IN ('active', 'contacted')
        ${departmentId ? `AND w.departmentId = '${departmentId}'` : ''}
      ORDER BY
        CASE w.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        w.requestedDate ASC
      LIMIT 10
    `);

    const activeWaitlist = waitlistStmt.all();

    return {
      kpis,
      todayAppointments,
      activeWaitlist,
    };
  }
}
