"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ContractSchema = new mongoose_1.Schema({
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    document: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'suspended', 'expired'], default: 'pending' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    suspensionReason: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Contract', ContractSchema);
//# sourceMappingURL=contract.model.js.map