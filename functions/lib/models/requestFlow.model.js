"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RequestFlowSchema = new mongoose_1.Schema({
    workflowItem: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    approvals: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            dept: { type: String },
            rank: { type: String, required: true },
        },
    ],
    // requiresMultipleApprovals: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('RequestFlow', RequestFlowSchema);
//# sourceMappingURL=requestFlow.model.js.map