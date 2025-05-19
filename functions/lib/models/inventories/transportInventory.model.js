"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TransportInventorySchema = new mongoose_1.Schema({
    transportType: { type: String, required: true, enum: ['flight', 'bus', 'car', 'train', 'ferry', 'other'] },
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    seatsAvailable: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['available', 'limited', 'fully-booked', 'cancelled'] },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
});
exports.default = (0, mongoose_1.model)('TransportInventory', TransportInventorySchema);
//# sourceMappingURL=transportInventory.model.js.map