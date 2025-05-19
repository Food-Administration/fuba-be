// import { EmailService } from '@services/email.service';
// src/services/reminder.service.ts
import Reminder, { ReminderDocument } from '../models/reminder.model';
// import User from '../models/user.model';
import CustomError from '../utils/customError';
import EmailService from './email.service';
import { Types } from 'mongoose';

class ReminderService {
    static async createReminder(
        event: string,
        frequency: 'daily' | 'weekly' | 'monthly',
        recipients: string[]
    ): Promise<ReminderDocument> {
        const reminder = new Reminder({ event, frequency, recipients });
        await reminder.save();
        return reminder;
    }

    static async getReminders(): Promise<ReminderDocument[]> {
        return Reminder.find().populate('recipients');
    }

    static async updateReminder(
        reminderId: string,
        updateData: Partial<ReminderDocument>
    ): Promise<ReminderDocument | null> {
        const reminder = await Reminder.findByIdAndUpdate(reminderId, updateData, { new: true });
        if (!reminder) {
            throw new CustomError('Reminder not found', 404);
        }
        return reminder;
    }

    static async sendReminders(): Promise<void> {
        const reminders = await Reminder.find({ enabled: true })
            .populate<{ recipients: { _id: Types.ObjectId; email: string }[] }>('recipients', 'email')
            .lean();
    
        for (const reminder of reminders) {
            for (const recipient of reminder.recipients) {
                if (recipient.email) {
                    await EmailService.sendEmail(
                        recipient.email, 
                        `Reminder: ${reminder.event}`, 
                        `This is a reminder for ${reminder.event}.`
                    );
                } else {
                    console.warn(`Skipping recipient without email: ${recipient._id}`);
                }
            }
        }

        // Send in-app notification (pseudo-code)
        // await sendInAppNotification(recipient._id, `Reminder: ${reminder.event}
    }
    
}

export default ReminderService;