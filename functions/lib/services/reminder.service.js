"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { EmailService } from '@services/email.service';
// src/services/reminder.service.ts
const reminder_model_1 = __importDefault(require("../models/reminder.model"));
// import User from '../models/user.model';
const customError_1 = __importDefault(require("../utils/customError"));
const email_service_1 = __importDefault(require("./email.service"));
class ReminderService {
    static async createReminder(event, frequency, recipients) {
        const reminder = new reminder_model_1.default({ event, frequency, recipients });
        await reminder.save();
        return reminder;
    }
    static async getReminders() {
        return reminder_model_1.default.find().populate('recipients');
    }
    static async updateReminder(reminderId, updateData) {
        const reminder = await reminder_model_1.default.findByIdAndUpdate(reminderId, updateData, { new: true });
        if (!reminder) {
            throw new customError_1.default('Reminder not found', 404);
        }
        return reminder;
    }
    static async sendReminders() {
        const reminders = await reminder_model_1.default.find({ enabled: true })
            .populate('recipients', 'email')
            .lean();
        for (const reminder of reminders) {
            for (const recipient of reminder.recipients) {
                if (recipient.email) {
                    await email_service_1.default.sendEmail(recipient.email, `Reminder: ${reminder.event}`, `This is a reminder for ${reminder.event}.`);
                }
                else {
                    console.warn(`Skipping recipient without email: ${recipient._id}`);
                }
            }
        }
        // Send in-app notification (pseudo-code)
        // await sendInAppNotification(recipient._id, `Reminder: ${reminder.event}
    }
}
exports.default = ReminderService;
//# sourceMappingURL=reminder.service.js.map