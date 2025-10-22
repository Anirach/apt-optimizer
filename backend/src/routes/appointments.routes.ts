import { Router } from 'express';
import { AppointmentsController } from '../controllers/appointments.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new AppointmentsController();

// All appointment routes require authentication
router.use(authMiddleware);

// Search and list appointments
router.get('/', controller.getAppointments.bind(controller));

// Get single appointment
router.get('/:id', controller.getAppointmentById.bind(controller));

// Create new appointment
router.post('/', controller.createAppointment.bind(controller));

// Update appointment
router.put('/:id', controller.updateAppointment.bind(controller));

// Cancel appointment
router.post('/:id/cancel', controller.cancelAppointment.bind(controller));

// Reschedule appointment
router.post('/:id/reschedule', controller.rescheduleAppointment.bind(controller));

// Check-in appointment
router.post('/:id/check-in', controller.checkInAppointment.bind(controller));

// Start appointment
router.post('/:id/start', controller.startAppointment.bind(controller));

// Complete appointment
router.post('/:id/complete', controller.completeAppointment.bind(controller));

// Mark as no-show
router.post('/:id/no-show', controller.markNoShow.bind(controller));

// Get upcoming appointments for a patient
router.get('/patient/:patientId/upcoming', controller.getUpcomingAppointments.bind(controller));

// Get appointment history for a patient
router.get('/patient/:patientId/history', controller.getAppointmentHistory.bind(controller));

export default router;
