import { Schema, model, Document, Types } from 'mongoose';

export interface VendorInventoryDocument extends Document {
    itemName: string;
    category: string;
    price: number;
    vendor: Types.ObjectId;
    quantity: number;
    status: string;
}

const VendorInventorySchema = new Schema<VendorInventoryDocument>({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['available', 'out-of-stock', 'low-stock', 'discontinued'] },
});

export default model<VendorInventoryDocument>('VendorInventory', VendorInventorySchema);