import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlist.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new WaitlistController();

// All waitlist routes require authentication
router.use(authMiddleware);

// Get waitlist entries (with optional filters)
router.get('/', controller.getWaitlistEntries.bind(controller));

// Get waitlist statistics
router.get('/stats', controller.getWaitlistStats.bind(controller));

// Get single waitlist entry
router.get('/:id', controller.getWaitlistEntryById.bind(controller));

// Create waitlist entry
router.post('/', controller.createWaitlistEntry.bind(controller));

// Update waitlist entry
router.put('/:id', controller.updateWaitlistEntry.bind(controller));

// Cancel waitlist entry
router.post('/:id/cancel', controller.cancelWaitlistEntry.bind(controller));

// Mark as contacted
router.post('/:id/contacted', controller.markAsContacted.bind(controller));

// Convert to appointment
router.post('/:id/convert', controller.convertToAppointment.bind(controller));

// Get patient's waitlist entries
router.get('/patient/:patientId', controller.getPatientWaitlistEntries.bind(controller));

// Find matching slots for waitlist entry
router.get('/:id/matching-slots', controller.findMatchingSlots.bind(controller));

export default router;
