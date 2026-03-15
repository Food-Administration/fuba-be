import { Schema, model, Document, Types } from 'mongoose';

export enum RestaurantApplicationStatus {
    PendingReview = 'pending_review',
    Approved = 'approved',
    Rejected = 'rejected'
}

export interface OperatingHours {
    day: string;
    open_time: string;
    close_time: string;
}

export interface RestaurantApplicationDocument extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    brand_name: string;
    brand_category: string;
    brand_address: string;
    operating_hours: OperatingHours[];
    delivery_type: 'pickup' | 'delivery' | 'both';
    brand_logo?: string;
    cover_image?: string;
    brand_registration_number: string;
    cac_certificate?: string;
    status: RestaurantApplicationStatus;
    review_notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OperatingHoursSchema = new Schema<OperatingHours>(
    {
        day: { type: String, required: true },
        open_time: { type: String, required: true },
        close_time: { type: String, required: true }
    },
    { _id: false }
);

const RestaurantApplicationSchema = new Schema<RestaurantApplicationDocument>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        brand_name: { type: String, required: true },
        brand_category: { type: String, required: true },
        brand_address: { type: String, required: true },
        operating_hours: { type: [OperatingHoursSchema], required: true },
        delivery_type: {
            type: String,
            enum: ['pickup', 'delivery', 'both'],
            required: true
        },
        brand_logo: { type: String },
        cover_image: { type: String },
        brand_registration_number: { type: String, required: true },
        cac_certificate: { type: String },
        status: {
            type: String,
            enum: Object.values(RestaurantApplicationStatus),
            default: RestaurantApplicationStatus.PendingReview
        },
        review_notes: { type: String }
    },
    { timestamps: true }
);

export default model<RestaurantApplicationDocument>(
    'RestaurantApplication',
    RestaurantApplicationSchema
);
