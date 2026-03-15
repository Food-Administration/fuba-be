import { Schema, model, Document, Types } from 'mongoose';

export enum NafdacStatus {
    NotRequested = 'not_requested',
    Pending = 'pending',
    Paid = 'paid',
    Uploaded = 'uploaded',
    Approved = 'approved',
    Rejected = 'rejected'
}

export enum VendorStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
}

export interface VendorProfileDocument extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    brand_name: string;
    brand_description?: string;
    brand_image?: string;
    brand_cover_image?: string;
    business_email?: string;
    business_phone?: string;
    brand_address?: string;
    state?: string;
    nafdac_status: NafdacStatus;
    nafdac_seal_file?: string;
    nafdac_brand_name?: string;
    nafdac_business_email?: string;
    nafdac_brand_address?: string;
    nafdac_brand_phone?: string;
    nafdac_payment_reference?: string;
    status: VendorStatus;
    createdAt: Date;
    updatedAt: Date;
}

const VendorProfileSchema = new Schema<VendorProfileDocument>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        brand_name: { type: String, required: true },
        brand_description: { type: String },
        brand_image: { type: String },
        brand_cover_image: { type: String },
        business_email: { type: String },
        business_phone: { type: String },
        brand_address: { type: String },
        state: { type: String },
        nafdac_status: {
            type: String,
            enum: Object.values(NafdacStatus),
            default: NafdacStatus.NotRequested
        },
        nafdac_seal_file: { type: String },
        nafdac_brand_name: { type: String },
        nafdac_business_email: { type: String },
        nafdac_brand_address: { type: String },
        nafdac_brand_phone: { type: String },
        nafdac_payment_reference: { type: String },
        status: {
            type: String,
            enum: Object.values(VendorStatus),
            default: VendorStatus.Pending
        }
    },
    { timestamps: true }
);

export default model<VendorProfileDocument>('VendorProfile', VendorProfileSchema);
