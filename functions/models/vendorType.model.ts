import { Schema, model, Document } from 'mongoose';

export interface VendorTypeDocument extends Document {
    name: string;
    description?: string;
}

const VendorTypeSchema = new Schema<VendorTypeDocument>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
});

export default model<VendorTypeDocument>('VendorType', VendorTypeSchema);