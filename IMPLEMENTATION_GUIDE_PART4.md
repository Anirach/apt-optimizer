# PAAS Platform - Implementation Guide Part 4

## Phase 4: Appointments API Implementation

### Step 4.1: Create Appointments Service

**backend/src/services/appointments.service.ts:**
```typescript
import { PrismaClient, Appointment } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAppointmentData {
  patientId: string;
  providerId: string;
  departmentId: string;
  timeSlotId: string;
  locationId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  appointmentType: string;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  status?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  reason?: string;
  notes?: string;
  providerNotes?: string;
}

export interface SearchAppointmentsParams {
  patientId?: string;
  providerId?: string;
  departmentId?: string;
  status?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export class AppointmentsService {
  /**
   * Get appointments with filters and pagination
   */
  async getAppointments(params: SearchAppointmentsParams) {
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

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (providerId) where.providerId = providerId;
    if (departmentId) where.departmentId = departmentId;
    if (status?.length) where.status = { in: status };
    if (startDate) where.scheduledStart = { gte: startDate };
    if (endDate) where.scheduledEnd = { lte: endDate };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: true,
          provider: true,
          department: true,
          location: true,
          timeSlot: true,
        },
        orderBy: { scheduledStart: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get single appointment by ID
   */
  async getAppointment(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
        timeSlot: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  /**
   * Create new appointment
   */
  async createAppointment(data: CreateAppointmentData) {
    // Check if time slot is available
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
    });

    if (!timeSlot || !timeSlot.isAvailable) {
      throw new Error('Time slot not available');
    }

    // Check for double booking
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        timeSlotId: data.timeSlotId,
        status: { in: ['scheduled', 'confirmed', 'checked_in'] },
      },
    });

    if (existingAppointment) {
      throw new Error('Time slot already booked');
    }

    // Generate confirmation code
    const confirmationCode = this.generateConfirmationCode();

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        confirmationCode,
        status: 'scheduled',
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });

    // Mark time slot as unavailable
    await prisma.timeSlot.update({
      where: { id: data.timeSlotId },
      data: { isAvailable: false },
    });

    return appointment;
  }

  /**
   * Update appointment
   */
  async updateAppointment(id: string, data: UpdateAppointmentData) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });

    return appointment;
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(
    id: string,
    newTimeSlotId: string,
    newScheduledStart: Date,
    newScheduledEnd: Date,
    reason?: string
  ) {
    const appointment = await this.getAppointment(id);

    // Check if new time slot is available
    const newTimeSlot = await prisma.timeSlot.findUnique({
      where: { id: newTimeSlotId },
    });

    if (!newTimeSlot || !newTimeSlot.isAvailable) {
      throw new Error('New time slot not available');
    }

    // Update appointment
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        timeSlotId: newTimeSlotId,
        scheduledStart: newScheduledStart,
        scheduledEnd: newScheduledEnd,
        status: 'rescheduled',
        notes: reason ? `Rescheduled: ${reason}` : appointment.notes,
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });

    // Free up old time slot
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { isAvailable: true },
    });

    // Mark new time slot as unavailable
    await prisma.timeSlot.update({
      where: { id: newTimeSlotId },
      data: { isAvailable: false },
    });

    return updated;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string, reason: string, cancelledBy: string) {
    const appointment = await this.getAppointment(id);

    const cancelled = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });

    // Free up the time slot
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { isAvailable: true },
    });

    return cancelled;
  }

  /**
   * Check in patient
   */
  async checkIn(id: string) {
    return await prisma.appointment.update({
      where: { id },
      data: {
        status: 'checked_in',
        actualStart: new Date(),
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });
  }

  /**
   * Complete appointment
   */
  async complete(id: string, providerNotes?: string) {
    return await prisma.appointment.update({
      where: { id },
      data: {
        status: 'completed',
        actualEnd: new Date(),
        providerNotes,
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });
  }

  /**
   * Mark as no-show
   */
  async markNoShow(id: string) {
    const appointment = await this.getAppointment(id);

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'no_show' },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
    });

    // Free up the time slot
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { isAvailable: true },
    });

    return updated;
  }

  /**
   * Get today's appointments
   */
  async getTodayAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.appointment.findMany({
      where: {
        scheduledStart: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
      orderBy: { scheduledStart: 'asc' },
    });
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(days: number = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return await prisma.appointment.findMany({
      where: {
        scheduledStart: {
          gte: now,
          lte: future,
        },
        status: { in: ['scheduled', 'confirmed'] },
      },
      include: {
        patient: true,
        provider: true,
        department: true,
        location: true,
      },
      orderBy: { scheduledStart: 'asc' },
    });
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(params: {
    startDate?: Date;
    endDate?: Date;
    departmentId?: string;
    providerId?: string;
  }) {
    const where: any = {};

    if (params.startDate) where.scheduledStart = { gte: params.startDate };
    if (params.endDate) where.scheduledEnd = { lte: params.endDate };
    if (params.departmentId) where.departmentId = params.departmentId;
    if (params.providerId) where.providerId = params.providerId;

    const [total, scheduled, confirmed, completed, cancelled, noShow] =
      await Promise.all([
        prisma.appointment.count({ where }),
        prisma.appointment.count({ where: { ...where, status: 'scheduled' } }),
        prisma.appointment.count({ where: { ...where, status: 'confirmed' } }),
        prisma.appointment.count({ where: { ...where, status: 'completed' } }),
        prisma.appointment.count({ where: { ...where, status: 'cancelled' } }),
        prisma.appointment.count({ where: { ...where, status: 'no_show' } }),
      ]);

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShow,
    };
  }

  /**
   * Generate confirmation code
   */
  private generateConfirmationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'APT-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
```

### Step 4.2: Create Appointments Controller

**backend/src/controllers/appointments.controller.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppointmentsService } from '../services/appointments.service.js';
import { successResponse } from '../utils/apiResponse.js';

const appointmentsService = new AppointmentsService();

export class AppointmentsController {
  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        patientId,
        providerId,
        departmentId,
        status,
        startDate,
        endDate,
        page,
        pageSize,
      } = req.query;

      const result = await appointmentsService.getAppointments({
        patientId: patientId as string,
        providerId: providerId as string,
        departmentId: departmentId as string,
        status: status ? (status as string).split(',') : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
      });

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentsService.getAppointment(
        req.params.id
      );
      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentsService.createAppointment(req.body);
      res.status(201).json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentsService.updateAppointment(
        req.params.id,
        req.body
      );
      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async rescheduleAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { newTimeSlotId, newScheduledStart, newScheduledEnd, reason } =
        req.body;

      const appointment = await appointmentsService.rescheduleAppointment(
        req.params.id,
        newTimeSlotId,
        new Date(newScheduledStart),
        new Date(newScheduledEnd),
        reason
      );

      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason, cancelledBy } = req.body;

      const appointment = await appointmentsService.cancelAppointment(
        req.params.id,
        reason,
        cancelledBy
      );

      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentsService.checkIn(req.params.id);
      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const { providerNotes } = req.body;
      const appointment = await appointmentsService.complete(
        req.params.id,
        providerNotes
      );
      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async markNoShow(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentsService.markNoShow(req.params.id);
      res.json(successResponse(appointment));
    } catch (error) {
      next(error);
    }
  }

  async getTodayAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentsService.getTodayAppointments();
      res.json(successResponse(appointments));
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, departmentId, providerId } = req.query;

      const stats = await appointmentsService.getAppointmentStats({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        departmentId: departmentId as string,
        providerId: providerId as string,
      });

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}
```

### Step 4.3: Create Appointments Routes

**backend/src/routes/appointments.routes.ts:**
```typescript
import { Router } from 'express';
import { AppointmentsController } from '../controllers/appointments.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
const appointmentsController = new AppointmentsController();

// All routes require authentication
router.use(authMiddleware);

// GET routes
router.get('/', (req, res, next) =>
  appointmentsController.getAppointments(req, res, next)
);
router.get('/today', (req, res, next) =>
  appointmentsController.getTodayAppointments(req, res, next)
);
router.get('/stats', (req, res, next) =>
  appointmentsController.getStats(req, res, next)
);
router.get('/:id', (req, res, next) =>
  appointmentsController.getAppointment(req, res, next)
);

// POST routes
router.post('/', (req, res, next) =>
  appointmentsController.createAppointment(req, res, next)
);
router.post('/:id/reschedule', (req, res, next) =>
  appointmentsController.rescheduleAppointment(req, res, next)
);
router.post('/:id/cancel', (req, res, next) =>
  appointmentsController.cancelAppointment(req, res, next)
);
router.post('/:id/check-in', (req, res, next) =>
  appointmentsController.checkIn(req, res, next)
);
router.post('/:id/complete', requireRole('provider', 'admin'), (req, res, next) =>
  appointmentsController.complete(req, res, next)
);
router.post('/:id/no-show', requireRole('staff', 'admin'), (req, res, next) =>
  appointmentsController.markNoShow(req, res, next)
);

// PATCH routes
router.patch('/:id', (req, res, next) =>
  appointmentsController.updateAppointment(req, res, next)
);

export default router;
```

### Step 4.4: Update App.ts

Add the appointments routes to `backend/src/app.ts`:

```typescript
import appointmentsRoutes from './routes/appointments.routes.js';

// ... existing code ...

app.use('/api/appointments', appointmentsRoutes);
```

---

## Continue to Part 5 for Frontend Integration and E2E Tests
