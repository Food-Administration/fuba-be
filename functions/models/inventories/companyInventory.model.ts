import { Schema, model, Document, Types } from 'mongoose';

export interface CompanyInventoryDocument extends Document {
    itemName: string;
    category: string;
    createdBy: Types.ObjectId;
    quantity: number;
    status: string;
}

const CompanyInventorySchema = new Schema<CompanyInventoryDocument>({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['available', 'out-of-stock', 'in-stock', 'low-stock', 'discontinued'] },
});

export default model<CompanyInventoryDocument>('CompanyInventory', CompanyInventorySchema);