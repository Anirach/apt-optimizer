import { Request, Response } from 'express';
import { SlotsService } from '../services/slots.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const slotsService = new SlotsService();

export class SlotsController {
  async searchAvailableSlots(req: Request, res: Response) {
    try {
      const slots = await slotsService.searchAvailableSlots(req.query as any);
      return res.json(successResponse(slots));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getCalendarView(req: Request, res: Response) {
    try {
      const calendar = await slotsService.getCalendarView(req.query as any);
      return res.json(successResponse(calendar));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async createTimeSlot(req: Request, res: Response) {
    try {
      const slot = await slotsService.createTimeSlot(req.body);
      return res.status(201).json(successResponse(slot));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async getTimeSlotById(req: Request, res: Response) {
    try {
      const slot = await slotsService.getTimeSlotById(req.params.id);
      return res.json(successResponse(slot));
    } catch (error) {
      return res.status(404).json(errorResponse('NOT_FOUND', (error as Error).message));
    }
  }

  async updateTimeSlot(req: Request, res: Response) {
    try {
      const slot = await slotsService.updateTimeSlot(req.params.id, req.body);
      return res.json(successResponse(slot));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async blockTimeSlot(req: Request, res: Response) {
    try {
      const { isBlocked } = req.body;
      const slot = await slotsService.blockTimeSlot(req.params.id, isBlocked);
      return res.json(successResponse(slot));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async deleteTimeSlot(req: Request, res: Response) {
    try {
      const result = await slotsService.deleteTimeSlot(req.params.id);
      return res.json(successResponse(result));
    } catch (error) {
      return res.status(400).json(errorResponse('BAD_REQUEST', (error as Error).message));
    }
  }

  async getProviderSchedule(req: Request, res: Response) {
    try {
      const { providerId } = req.params;
      const { startDate, endDate } = req.query as any;
      const schedule = await slotsService.getProviderSchedule(providerId, startDate, endDate);
      return res.json(successResponse(schedule));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getNextAvailableSlot(req: Request, res: Response) {
    try {
      const { departmentId, providerId } = req.query as any;
      const slot = await slotsService.getNextAvailableSlot(departmentId, providerId);
      return res.json(successResponse(slot));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }
}
