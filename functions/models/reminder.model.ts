// src/models/reminder.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ReminderDocument extends Document {
    event: string; // e.g., "contract_expiration"
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: Types.ObjectId[]; // Reference to User (admins, vendors, etc.)
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema = new Schema<ReminderDocument>(
    {
        event: { type: String, required: true },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
        recipients: [{ type: Types.ObjectId, ref: 'User', required: true }],
        enabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default model<ReminderDocument>('Reminder', ReminderSchema);