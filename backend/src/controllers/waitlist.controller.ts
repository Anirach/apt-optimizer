import { Request, Response } from 'express';
import { WaitlistService } from '../services/waitlist.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const waitlistService = new WaitlistService();

export class WaitlistController {
  async getWaitlistEntries(req: Request, res: Response) {
    try {
      const entries = await waitlistService.getWaitlistEntries(req.query);
      return res.json(successResponse(entries));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getWaitlistEntryById(req: Request, res: Response) {
    try {
      const entry = await waitlistService.getWaitlistEntryById(req.params.id);
      return res.json(successResponse(entry));
    } catch (error) {
      return res.status(404).json(errorResponse('NOT_FOUND', (error as Error).message));
    }
  }

  async createWaitlistEntry(req: Request, res: Response) {
    try {
      const entry = await waitlistService.createWaitlistEntry(req.body);
      return res.status(201).json(successResponse(entry));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async updateWaitlistEntry(req: Request, res: Response) {
    try {
      const entry = await waitlistService.updateWaitlistEntry(req.params.id, req.body);
      return res.json(successResponse(entry));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async cancelWaitlistEntry(req: Request, res: Response) {
    try {
      const entry = await waitlistService.cancelWaitlistEntry(req.params.id);
      return res.json(successResponse(entry));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async markAsContacted(req: Request, res: Response) {
    try {
      const entry = await waitlistService.markAsContacted(req.params.id);
      return res.json(successResponse(entry));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async convertToAppointment(req: Request, res: Response) {
    try {
      const { appointmentId } = req.body;
      const entry = await waitlistService.convertToAppointment(req.params.id, appointmentId);
      return res.json(successResponse(entry));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async getWaitlistStats(req: Request, res: Response) {
    try {
      const { departmentId } = req.query;
      const stats = await waitlistService.getWaitlistStats(departmentId as string);
      return res.json(successResponse(stats));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getPatientWaitlistEntries(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const entries = await waitlistService.getPatientWaitlistEntries(patientId);
      return res.json(successResponse(entries));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async findMatchingSlots(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const slots = await waitlistService.findMatchingSlots(id, limit);
      return res.json(successResponse(slots));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }
}
