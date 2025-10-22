import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new AnalyticsController();

// All analytics routes require authentication
router.use(authMiddleware);

// Get dashboard KPIs
router.get('/dashboard/kpis', controller.getDashboardKPIs.bind(controller));

// Get real-time dashboard data
router.get('/dashboard/realtime', controller.getRealtimeDashboard.bind(controller));

// Get today's appointments
router.get('/today', controller.getTodayAppointments.bind(controller));

// Get appointment trends
router.get('/trends', controller.getAppointmentTrends.bind(controller));

// Get provider metrics
router.get('/provider/:providerId/metrics', controller.getProviderMetrics.bind(controller));

// Get department statistics
router.get('/department/:departmentId/stats', controller.getDepartmentStats.bind(controller));

// Get peak hours
router.get('/peak-hours', controller.getPeakHours.bind(controller));

// Get patient demographics
router.get('/demographics', controller.getPatientDemographics.bind(controller));

export default router;
