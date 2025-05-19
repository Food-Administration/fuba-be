// src/routes/reminder.route.ts
import * as express from 'express';
import ReminderController from '../controllers/reminder.controller';
// import jwtAuth from '../middleware/jwtAuth';

const router = express.Router();

// Create a new reminder
router.post('/', ReminderController.createReminder);

// Get all reminders
router.get('/', ReminderController.getReminders);

// Update a reminder
router.put('/:reminderId', ReminderController.updateReminder);

export default router;