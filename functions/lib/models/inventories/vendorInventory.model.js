"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VendorInventorySchema = new mongoose_1.Schema({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['available', 'out-of-stock', 'low-stock', 'discontinued'] },
});
exports.default = (0, mongoose_1.model)('VendorInventory', VendorInventorySchema);
//# sourceMappingURL=vendorInventory.model.js.map