import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getDashboardKPIs(req: Request, res: Response) {
    try {
      const kpis = await analyticsService.getDashboardKPIs(req.query);
      return res.json(successResponse(kpis));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getTodayAppointments(req: Request, res: Response) {
    try {
      const { departmentId } = req.query;
      const appointments = await analyticsService.getTodayAppointments(departmentId as string);
      return res.json(successResponse(appointments));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getAppointmentTrends(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const { departmentId } = req.query;
      const trends = await analyticsService.getAppointmentTrends(days, departmentId as string);
      return res.json(successResponse(trends));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getProviderMetrics(req: Request, res: Response) {
    try {
      const { providerId } = req.params;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const metrics = await analyticsService.getProviderMetrics(providerId, days);
      return res.json(successResponse(metrics));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getDepartmentStats(req: Request, res: Response) {
    try {
      const { departmentId } = req.params;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const stats = await analyticsService.getDepartmentStats(departmentId, days);
      return res.json(successResponse(stats));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getPeakHours(req: Request, res: Response) {
    try {
      const { departmentId } = req.query;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const peakHours = await analyticsService.getPeakHours(departmentId as string, days);
      return res.json(successResponse(peakHours));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getPatientDemographics(req: Request, res: Response) {
    try {
      const { departmentId } = req.query;
      const demographics = await analyticsService.getPatientDemographics(departmentId as string);
      return res.json(successResponse(demographics));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }

  async getRealtimeDashboard(req: Request, res: Response) {
    try {
      const { departmentId } = req.query;
      const dashboard = await analyticsService.getRealtimeDashboard(departmentId as string);
      return res.json(successResponse(dashboard));
    } catch (error) {
      return res.status(500).json(errorResponse('INTERNAL_ERROR', (error as Error).message));
    }
  }
}
