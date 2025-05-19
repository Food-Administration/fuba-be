// src/controllers/reminder.controller.ts
import { Request, Response } from 'express';
import ReminderService from '../services/reminder.service';
import asyncHandler from '../utils/asyncHandler';

class ReminderController {
    static createReminder = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { event, frequency, recipients } = req.body;
            const reminder = await ReminderService.createReminder(event, frequency, recipients);
            res.status(201).json(reminder);
        }
    );

    static getReminders = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const reminders = await ReminderService.getReminders();
            res.status(200).json(reminders);
        }
    );

    static updateReminder = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { reminderId } = req.params;
            const updateData = req.body;
            const reminder = await ReminderService.updateReminder(reminderId, updateData);
            if (!reminder) {
                res.status(404).json({ message: 'Reminder not found' });
                return;
            }
            res.status(200).json(reminder);
        }
    );
}

export default ReminderController;