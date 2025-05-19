import { Schema, model, Document, Types } from 'mongoose';
import { UserDocument } from './user.model';

export interface ContractDocument extends Document {
    vendor: Types.ObjectId | UserDocument; // Reference to User (vendor)
    document: string; // Path to the uploaded contract document
    status: 'pending' | 'active' | 'suspended' | 'expired';
    startDate: Date;
    endDate: Date;
    suspensionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContractSchema = new Schema<ContractDocument>(
    {
        vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
        document: { type: String, required: true },
        status: { type: String, enum: ['pending', 'active', 'suspended', 'expired'], default: 'pending' },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        suspensionReason: { type: String },
    },
    { timestamps: true }
);

export default model<ContractDocument>('Contract', ContractSchema);