"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VendorTypeSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
});
exports.default = (0, mongoose_1.model)('VendorType', VendorTypeSchema);
//# sourceMappingURL=vendorType.model.js.map