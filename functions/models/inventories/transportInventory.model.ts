import { Schema, model, Document, Types } from 'mongoose';

export interface TransportInventoryDocument extends Document {
    transportType: string;
    departureLocation: string;
    arrivalLocation: string;
    departureTime: Date;
    arrivalTime: Date;
    price: number;
    seatsAvailable: number;
    status: string;
    vendor: Types.ObjectId;
}

const TransportInventorySchema = new Schema<TransportInventoryDocument>({
    transportType: { type: String, required: true, enum: ['flight', 'bus', 'car', 'train', 'ferry', 'other'] },
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    seatsAvailable: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['available', 'limited', 'fully-booked', 'cancelled'] },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model<TransportInventoryDocument>('TransportInventory', TransportInventorySchema);