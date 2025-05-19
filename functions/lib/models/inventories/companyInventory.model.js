"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CompanyInventorySchema = new mongoose_1.Schema({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['available', 'out-of-stock', 'in-stock', 'low-stock', 'discontinued'] },
});
exports.default = (0, mongoose_1.model)('CompanyInventory', CompanyInventorySchema);
//# sourceMappingURL=companyInventory.model.js.map