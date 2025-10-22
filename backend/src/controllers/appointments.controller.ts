import { Request, Response } from 'express';
import { AppointmentsService } from '../services/appointments.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const appointmentsService = new AppointmentsService();

export class AppointmentsController {
  async getAppointments(req: Request, res: Response) {
    try {
      const result = await appointmentsService.getAppointments(req.query);
      return res.json(successResponse(result));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getAppointmentById(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.getAppointmentById(req.params.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(404).json(errorResponse('NOT_FOUND', (error as Error).message));
    }
  }

  async createAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.createAppointment(req.body);
      return res.status(201).json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async updateAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.updateAppointment(req.params.id, req.body);
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async cancelAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.cancelAppointment(
        req.params.id,
        req.body.reason
      );
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async rescheduleAppointment(req: Request, res: Response) {
    try {
      const { newStart, newEnd, newTimeSlotId } = req.body;
      const appointment = await appointmentsService.rescheduleAppointment(
        req.params.id,
        newStart,
        newEnd,
        newTimeSlotId
      );
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async checkInAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.checkInAppointment(req.params.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async startAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.startAppointment(req.params.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async completeAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.completeAppointment(
        req.params.id,
        req.body.providerNotes
      );
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async markNoShow(req: Request, res: Response) {
    try {
      const appointment = await appointmentsService.markNoShow(req.params.id);
      return res.json(successResponse(appointment));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async getUpcomingAppointments(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const appointments = await appointmentsService.getUpcomingAppointments(patientId, limit);
      return res.json(successResponse(appointments));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getAppointmentHistory(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const appointments = await appointmentsService.getAppointmentHistory(patientId, limit);
      return res.json(successResponse(appointments));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }
}
