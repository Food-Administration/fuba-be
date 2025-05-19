"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const reminder_service_1 = __importDefault(require("../services/reminder.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class ReminderController {
}
_a = ReminderController;
ReminderController.createReminder = (0, asyncHandler_1.default)(async (req, res) => {
    const { event, frequency, recipients } = req.body;
    const reminder = await reminder_service_1.default.createReminder(event, frequency, recipients);
    res.status(201).json(reminder);
});
ReminderController.getReminders = (0, asyncHandler_1.default)(async (req, res) => {
    const reminders = await reminder_service_1.default.getReminders();
    res.status(200).json(reminders);
});
ReminderController.updateReminder = (0, asyncHandler_1.default)(async (req, res) => {
    const { reminderId } = req.params;
    const updateData = req.body;
    const reminder = await reminder_service_1.default.updateReminder(reminderId, updateData);
    if (!reminder) {
        res.status(404).json({ message: 'Reminder not found' });
        return;
    }
    res.status(200).json(reminder);
});
exports.default = ReminderController;
//# sourceMappingURL=reminder.controller.js.map