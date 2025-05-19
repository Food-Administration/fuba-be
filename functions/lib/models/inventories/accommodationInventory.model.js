"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AccommodationInventorySchema = new mongoose_1.Schema({
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
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
});
exports.default = (0, mongoose_1.model)('AccommodationInventory', AccommodationInventorySchema);
//# sourceMappingURL=accommodationInventory.model.js.map