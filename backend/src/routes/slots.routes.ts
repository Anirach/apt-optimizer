import { Router } from 'express';
import { SlotsController } from '../controllers/slots.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new SlotsController();

// All slot routes require authentication
router.use(authMiddleware);

// Search available slots
router.get('/available', controller.searchAvailableSlots.bind(controller));

// Get calendar view
router.get('/calendar', controller.getCalendarView.bind(controller));

// Get next available slot
router.get('/next-available', controller.getNextAvailableSlot.bind(controller));

// Get provider schedule
router.get('/provider/:providerId/schedule', controller.getProviderSchedule.bind(controller));

// Create time slot
router.post('/', controller.createTimeSlot.bind(controller));

// Get time slot by ID
router.get('/:id', controller.getTimeSlotById.bind(controller));

// Update time slot
router.put('/:id', controller.updateTimeSlot.bind(controller));

// Block/unblock time slot
router.post('/:id/block', controller.blockTimeSlot.bind(controller));

// Delete time slot
router.delete('/:id', controller.deleteTimeSlot.bind(controller));

export default router;
