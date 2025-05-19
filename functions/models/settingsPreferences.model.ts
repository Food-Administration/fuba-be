import { Schema, model, Document, Types } from 'mongoose';

export interface SettingsPreferencesDocument extends Document {
    userId: Types.ObjectId;
    notificationPreferences: {
        email: boolean;
        push: boolean;
        filters: string[];
    };
    settings: {
        currency: string;
        calendarIntegration: {
            googleCalendar: boolean;
            outlookCalendar: boolean;
        };
        theme: string;
    };
}

const SettingsPreferencesSchema = new Schema<SettingsPreferencesDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
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

export default model<SettingsPreferencesDocument>('SettingsPreferences', SettingsPreferencesSchema);