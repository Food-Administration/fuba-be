import { Schema, model, Document, Types } from 'mongoose';

export interface WaitlistDocument extends Document {
    _id: Types.ObjectId;
    email: string;
    phone_number?: string;
    service_type: string;
    state: string;
    brand_address?: string;
    notified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const WaitlistSchema = new Schema<WaitlistDocument>(
    {
        email: { type: String, required: true },
        phone_number: { type: String },
        service_type: { type: String, required: true },
        state: { type: String, required: true },
        brand_address: { type: String },
        notified: { type: Boolean, default: false }
    },
    { timestamps: true }
);

WaitlistSchema.index({ email: 1, service_type: 1 }, { unique: true });

export default model<WaitlistDocument>('Waitlist', WaitlistSchema);
