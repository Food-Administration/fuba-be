"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SettingsPreferencesSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        filters: { type: [String], default: [] },
    },
    settings: {
        currency: { type: String, default: 'USD' },
        calendarIntegration: {
            googleCalendar: { type: Boolean, default: false },
            outlookCalendar: { type: Boolean, default: false },
        },
        theme: { type: String, default: 'light' },
    },
});
exports.default = (0, mongoose_1.model)('SettingsPreferences', SettingsPreferencesSchema);
//# sourceMappingURL=settingsPreferences.model.js.map