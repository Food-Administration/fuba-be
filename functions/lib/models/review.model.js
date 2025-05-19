"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, // Vendor is a User
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, // Reviewer is a User
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Review', ReviewSchema);
//# sourceMappingURL=review.model.js.map