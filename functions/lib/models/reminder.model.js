"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/reminder.model.ts
const mongoose_1 = require("mongoose");
const ReminderSchema = new mongoose_1.Schema({
    event: { type: String, required: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    recipients: [{ type: mongoose_1.Types.ObjectId, ref: 'User', required: true }],
    enabled: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Reminder', ReminderSchema);
//# sourceMappingURL=reminder.model.js.map