import { Schema, model, Document, Types } from 'mongoose';

export interface AccommodationInventoryDocument extends Document {
    roomName: string;
    roomType: string;
    address: string;
    location: string;
    capacity: number;
    checkInTime: Date;
    checkOutTime: Date;
    price: number;
    roomsAvailable: number;
    services: string[];
    utilities: string[];
    status: string;
    vendor: Types.ObjectId;
}

const AccommodationInventorySchema = new Schema<AccommodationInventoryDocument>({
    roomName: { type: String, required: true, trim: true },
    roomType: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    checkInTime: { type: Date },
    checkOutTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    roomsAvailable: { type: Number, required: true, min: 0 },
    services: { type: [String] },
    utilities: { type: [String] },
    status: { 
        type: String, 
        required: true, 
        enum: ['fully-booked', 'available', 'limited', 'maintenance'] 
    },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model<AccommodationInventoryDocument>('AccommodationInventory', AccommodationInventorySchema);